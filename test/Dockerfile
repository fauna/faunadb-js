# Take in a runtime image to use for the base system
# Expects alpine-based image
ARG RUNTIME_IMAGE

# Use the docker image provided via build arg
FROM $RUNTIME_IMAGE

# Install the libraries we need for dockerize and the build
RUN apk add --no-cache curl make

# Copy in the dockerize utility
ARG DOCKERIZE_VERSION=0.6.0
RUN curl -sL https://github.com/jwilder/dockerize/releases/download/v$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-v$DOCKERIZE_VERSION.tar.gz | tar -xzC /usr/local/bin

# Copy project into the image
COPY . /fauna/faunadb-js

# Shift over to the project and install the dependencies
WORKDIR /fauna/faunadb-js
RUN npm install

# Define the default variables for the tests
ENV FAUNA_ROOT_KEY=secret FAUNA_DOMAIN=db.fauna.com FAUNA_SCHEME=https FAUNA_PORT=443 FAUNA_TIMEOUT=30s

# Run the tests (after target database is up)
CMD ["make", "docker-wait", "test"]
