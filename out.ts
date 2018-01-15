#!/usr/bin/env node

import * as path from "path";

import fetch from "node-fetch";

import { retrieveRequestFromStdin, createFetchHeaders } from "./index";
import { OutRequest, OutResponse } from "./index";

(async () => {

    // Determine build path and decend into it.
    if (process. argv. length != 3) {
        process.stderr.write(`Expected exactly one argument (build_dir), got ${process.argv.length - 2}.`);
        process.exit(2);
    }
    const buildDir = path.resolve(process.argv[2]);
    process.chdir(buildDir);

    const request = await retrieveRequestFromStdin<OutRequest>();

    const headers = createFetchHeaders(request);

    // TODO Implement me.

})();