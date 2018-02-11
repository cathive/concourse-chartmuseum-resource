# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Updated

- Included Helm binary has been updated to v2.8.1.

### Changed

- The parameter `chart_file` has been renamed to just `chart`.
  It can now either point to a packaged chart (.tgz file) or a directory
  that contains an unpackaged chart.

## [0.2.0] - 2018-01-16

### Added

- `out` resource has been implemented and can be used to directly deploy packaged
  helm charts in .tgz format to a ChartMuseum

### Fixed

- Chart re-deployments are now handled correctly and the `check` action is being triggered
  if only the digest of a chart (and not it's version) has been changed

## [0.1.1] - 2018-01-15

### Fixed

- Updated and enhanced documentation.

## [0.1.0] - 2018-01-14

### Added

- First public version. Implementation of the `check` and `in` actions have been done so far.