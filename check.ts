#!/usr/bin/env node

import fetch, { Headers } from "node-fetch";
import * as semver from "semver";

import { CheckRequest, CheckResponse } from "./index";
import { retrieveRequestFromStdin, createFetchHeaders } from "./index";

const stdin = process.stdin;
const stdout = process.stdout;
const stderr = process.stderr;

(async () => {

    // Fetches the JSON object from stdin.
    const request = await retrieveRequestFromStdin<CheckRequest>();

    const headers = createFetchHeaders(request);

    // Requests the charts from the remote endpoint.
    let charts = await (await fetch(`${request.source.server_url}api/charts/${request.source.chart_name}`, { headers: headers })).json() as any[];

    // If a version has been specified in the check request, we'll use it to filter out all results
    // that are "smaller" by using semver's built-in comparison mechanism.
    if (request.version != null) {
        const reqVersion = request.version.version;
        charts = charts.filter(chart => semver.gte(chart.version, reqVersion));
    }

    if (request.source.version_range != null) {
        const versionRange = request.source.version_range;
        charts = charts.filter(chart => semver.satisfies(chart.version, versionRange));
    }

    // Sort all charts by version (ascending).
    charts = charts.sort((chart1, chart2) => semver.compare(chart1.version, chart2.version));

    // If the chart has been re-deployed it might sport the same version number with a changed digest
    // If the digest has been changed, we'll have to add the chart with the OLD digest directly before the
    // chart with the new digest in our list to satisfy the contract that is required by the check action.
    if (request.version != null) {
        const reqVersion = request.version.version;
        const idx = charts.findIndex(chart => chart.version === reqVersion);
        charts.splice(idx + 1, 0, request.version);
    }

    const response: CheckResponse = charts.map(chart => ({
        version: chart.version,
        digest: chart.digest
    }));
    process.stdout.write(JSON.stringify(response, null, 2));
    process.exit(0);

})();
