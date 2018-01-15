# [ChartMuseum](https://github.com/kubernetes-helm/chartmuseum/) Resource for [Concourse CI](https://concourse.ci/)

Fetches, verifies and publishes Helm Charts from a running ChartMuseum instance.

## Requirements

* A running ChartMuseum instance (this resource has been tested with v0.2.7)

## Installation

Add a new resource type to your Concourse CI pipeline:

```yaml
 resource_types:
 - name: chartmuseum
  type: docker-image
  source:
    repository: cathive/concourse-chartmuseum-resource
    tag: latest # For reproducible builds use a specific tag and don't rely on "latest".
```

## Source Configuration

* `server_url`: *Required.* The address of the Chartmuseum instance. Must end with a slash.

* `chart_name`: *Required* The name of the chart to operate upon.

* `version_range`: Optional parameter that can be used to specify a (SemVer) version range
  that must match when checking for new charts, e.g. `=1.2.0`, `^2.0.0` or `~0.2.3`.

* `basic_auth_username`: Optional username to be used if your ChartMuseum is username/password protected.
  If provided, the paramter `basic_auth_password` must also be specified.

* `basic_auth_username`: Optional password to be used if your ChartMuseum is username/password protected.
  If provided, the paramter `basic_auth_username` must also be specified.

## Behavior

The resource implements all three actions (check, in and out).

### check: Check for new versions of the Helm chart

Checks for new versions of the specified Helm chart.
If a semver version range has been specified in the `source`configuration it will be
honored when checking new versions.

### in: Fetches the chart and (optionally) verifies it's provenance

Places the JSON object that describes the Helm chart into the destination directory
along with the package and it's provenance file.

The basename of these three files will be in the format `${chart_name}-${chart_version}`
unless overwritten by the parameter `target_basename`.

#### "in" Parameters

* `target_basename`: Optional parameter that can be used to change the name of the
  input files that will be written.

### out: Push an updated version of the Helm chart

Not (yet) implemented.