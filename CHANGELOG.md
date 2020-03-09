# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2020-03-09

### Fixed

- Fix Harbor compatiblity (adjust `server_url` for fetching charts).
  Thanks to [Sam Rees](https://github.com/samrees) for the patch.

### Improved

- Some errors have not been correctly written to stderr but instead lead to uncaught
  exceptions, whereas the original error message was swallowed which made actual
  errors and mis-configurations very hard to debug.
  ([#7](https://github.com/cathive/concourse-chartmuseum-resource/issues/7), [#13](https://github.com/cathive/concourse-chartmuseum-resource/issues/13))

### Updated

- Node.js runtime has been updated to v13.10.1.
- Helm binary has been updated to v2.16.3.

## [0.8.0] - 2019-09-09

### Added

- Introduced the `harbor_api` source value for interacting with the (*quite different*)
  Harbor API (*although it uses ChartmMseum in the backend*).

### Updated

- Node.js runtime has been updated to v12.10.0.

## [0.7.0] - 2019-08-28

### Updated

- Node.js runtime has been updated to v12.9.0.
- Included Helm binary has been updated to v2.14.3.

## [0.6.0] - 2019-06-16

### Updated

- Node.js runtime has been updated to v12.4.0.
- Included Helm binary has been updated to v2.14.1.

## [0.5.0] - 2019-01-29

### Updated

- Node.js runtime has been updated to v11.8.0.
- Included Helm binary has been updated to v2.12.3.

## [0.4.2] - 2018-11-27

### Fixed

- Use HTTP basic auth headers when fetching charts.

### Updated

- Node.js runtime has been updated to v10.13.0.
- Included Helm binary has been updated to v2.11.0.

## [0.4.1] - 2018-10-30

### Added

- Possiblity to force-upload charts even if the version of the chart already
  exists. (Mitigates issue [5](https://github.com/cathive/concourse-chartmuseum-resource/issues/5)).

## [0.4.0] - 2018-09-13

### Added

- Functionality to sign charts with GnuPG has been officially added and documented.

### Changed

- Error outputs have been improved [#4](https://github.com/cathive/concourse-chartmuseum-resource/issues/4).

## [0.3.0] - 2018-09-04

### Fixed

- `helm init` is now called prior to packaging [#1](https://github.com/cathive/concourse-chartmuseum-resource/issues/1).

### Added

- Support for signing packages using a GPG key has been added.

### Updated

- Node.js runtime has been updated to v10.9.0.
- Included Helm binary has been updated to v2.10.0.
- All NPM (dev/runtime) dependencies have been updated to their respective latest
  versions.

### Changed

- The parameter `chart_file` has been renamed to just `chart`.
  It can now either point to a packaged chart (.tgz file) or a directory
  that contains an unpackaged chart.

## [0.2.0] - 2018-01-16

### Added

- `out` resource has been implemented and can be used to directly deploy packaged
  helm charts in .tgz format to a ChartMuseum.

### Fixed

- Chart re-deployments are now handled correctly and the `check` action is being
  triggered if only the digest of a chart (and not it's version) has been changed.

## [0.1.1] - 2018-01-15

### Fixed

- Updated and enhanced documentation.

## [0.1.0] - 2018-01-14

### Added

- First public version. Implementation of the `check` and `in` actions have been
  done so far.
