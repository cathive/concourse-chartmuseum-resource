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

  // Sort all charts by version (descending).
  charts = charts.sort((chart1, chart2) => semver.compare(chart2.version, chart1.version));

  const response: CheckResponse = charts.map(chart => ({
    version: chart.version,
    digest: chart.digest
  }));
  process.stdout.write(JSON.stringify(response, null, 2));
  process.exit(0);

})();
