#!/usr/bin/env node

import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import * as semver from "semver";

import fetch from "node-fetch";

import { retrieveRequestFromStdin, createFetchHeaders } from "./index";
import { OutRequest, OutResponse } from "./index";

const exec = util.promisify(child_process.exec);
const lstat = util.promisify(fs.lstat);
const readFile = util.promisify(fs.readFile);

export default async function out() {

    // Determine build path and decend into it.
    if (process. argv. length != 3) {
        process.stderr.write(`Expected exactly one argument (root), got ${process.argv.length - 2}.\n`);
        process.exit(102);
    }
    const root = path.resolve(process.argv[2]);
    process.chdir(root);

    const request = await retrieveRequestFromStdin<OutRequest>();

    let headers = createFetchHeaders(request);

    // If either params.version or params.version_file have been specified,
    // we'll read our version information for packaging the Helm Chart from
    // there.
    let version = request.params.version;
    if (request.params.version_file != null) {
        const versionFile = path.resolve(request.params.version_file);
        if ((await lstat(versionFile)).isFile()) {
            // version_file exists. Cool... let's read it's contents.
            version = (await readFile(versionFile)).toString().replace(/\r?\n/, "")
        }
    }
    if (version != null && request.source.version_range != null) {
        const versionRange = request.source.version_range;
        if (!semver.satisfies(version, versionRange)) {
            process.stderr.write(`params.version (${version}) does not satisfy contents or source.version_range (${versionRange}).\n`)
            process.exit(104);
        }
    }

    const chartFile = path.resolve(request.params.chart_file);
    const chartFileStat = await lstat(chartFile);
    if (!chartFileStat.isFile()) {
        process.stderr.write(`Chart file (${chartFile}) not found.\n`)
        process.exit(110);
    }

    try {
        const result = await exec(`helm inspect ${chartFile}`);
        if (result.stderr != null && result.stderr.length > 0) {
            process.stderr.write(`${result.stderr}\n`);
        }
        const inspectionResult = result.stdout;
        const versionLine = inspectionResult.split(/\r?\n/).find(line => line.startsWith("version:"));
        if (versionLine == null) {
            process.stderr.write("Unable to parse version information from Helm Chart inspection result.");
            process.exit(121);
        } else {
            version = versionLine.split(/version:\s*/)[1]
        }
    } catch (e) {
        process.stderr.write(`Unable to "inspect" Helm Chart file: ${chartFile}.\n`);
        process.exit(120);
    }

    headers.append("Content-length", String(chartFileStat.size))
    headers.append("Content-Disposition", `attachment; filename="${path.basename(chartFile)}"`)

    const chart = await readFile(chartFile);
    const postResult = await fetch(`${request.source.server_url}api/charts`, {
        method: "POST",
        headers: headers,
        body: fs.createReadStream(chartFile)
    });

    const postResultJson = await postResult.json();
    if (postResultJson.error != null) {
        process.stderr.write(`An error occured while uploading the chart: "${postResultJson.error}".\n`);
        process.exit(602);
    } else if (postResultJson.saved != true) {
        process.stderr.write(`Helm chart has not been saved. (Return value from server: saved=${postResultJson.saved})\n`)
        process.exit(603)
    }

    process.stderr.write("Helm Chart has been uploaded.\n")
    process.stderr.write(`- Name: ${request.source.chart_name}\n`)
    process.stderr.write(`- Version: ${version}\n\n`);

    // Fetch Chart that has just been uploaded.
    headers = createFetchHeaders(request); // We need new headers. (Content-Length should be "0" again...) 
    const chartInfoUrl = `${request.source.server_url}api/charts/${request.source.chart_name}/${version}`;
    process.stderr.write(`Fetching chart data from "${chartInfoUrl}"...\n`);
    const chartResp = await fetch(`${request.source.server_url}api/charts/${request.source.chart_name}/${version}`);
    if (!chartResp.ok) {
        process.stderr.write("Download of chart information failed.\n")
        process.stderr.write((await chartResp.buffer()).toString());
        process.exit(710);
    }
    const chartJson = await chartResp.json();
    
    if (version != chartJson.version) {
        process.stderr.write(`Version mismatch in uploaded Helm Chart. Got: ${chartJson.version}, expected: ${version}.\n`);
        process.exit(203);
    }

    const response: OutResponse = {
        version: {
            version: chartJson.version,
            digest: chartJson.digest
        },
        metadata: [
            { name: "created", value: chartJson.created },
            { name: "description", value: chartJson.description }, 
            { name: "appVersion", value: chartJson.appVersion },
            { name: "home", value: chartJson.home },
            { name: "tillerVersion", value: chartJson.tillerVersion },
        ]
    };

    process.stdout.write(JSON.stringify(response));
    process.exit(0);
    

}

(async () => {
    try {
        await out();
    } catch (e) {
        process.stderr.write("An unexpected error occured.\n");
        process.stderr.write(e);
        process.exit(1);
    }
})();