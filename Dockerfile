FROM node:12.9.0 as builder
RUN apt-get -y update && apt-get -y install curl gzip tar unzip
ARG HELM_DOWNLOAD_URL="https://get.helm.sh/helm-v2.14.3-linux-amd64.tar.gz"
RUN curl -s -j -k -L "${HELM_DOWNLOAD_URL}" > /tmp/helm.tar.gz
RUN echo "38614a665859c0f01c9c1d84fa9a5027364f936814d1e47839b05327e400bf55  /tmp/helm.tar.gz" | sha256sum -c
RUN mkdir -p /data
WORKDIR /data
RUN gunzip -c "/tmp/helm.tar.gz" | tar -xf - \
&& mv "/data/linux-amd64/helm" "/data/helm" \
&& rm -f "/tmp/helm.tar.gz" \
&& rm -rf "/tmp/linux-amd64"
COPY . /src
WORKDIR /src
RUN npm -s install && npm -s run build && npm -s test && npm -s pack && mv cathive-concourse-chartmuseum-resource-*.tgz /data/cathive-concourse-chartmuseum-resource.tgz

FROM node:12.9.0-alpine
RUN apk add --no-cache gnupg ca-certificates
COPY --from=builder "/data/helm" "/usr/local/bin/helm"
COPY --from=builder "/data/cathive-concourse-chartmuseum-resource.tgz" "/tmp/cathive-concourse-chartmuseum-resource.tgz"
RUN npm -s install -g /tmp/cathive-concourse-chartmuseum-resource.tgz \
&& rm -f /tmp/cathive-concourse-chartmuseum-resource.tgz \
&& mkdir -p /opt/resource \
&& ln -sf /usr/local/bin/concourse-chartmuseum-resource-check /opt/resource/check \
&& ln -sf /usr/local/bin/concourse-chartmuseum-resource-in /opt/resource/in \
&& ln -sf /usr/local/bin/concourse-chartmuseum-resource-out /opt/resource/out
ENV PATH="/usr/local/bin:/usr/bin:/bin"
RUN helm init --client-only
LABEL maintainer="Benjamin P. Jung <headcr4sh@gmail.com>" \
      version="0.7.0" \
      org.concourse-ci.target-version="5.4.1" \
      org.concourse-ci.resource-id="chartmuseum" \
      org.concourse-ci.resource-name="ChartMuseum package management" \
      org.concourse-ci.resource-homepage="https://github.com/cathive/concourse-chartmuseum-resource"
