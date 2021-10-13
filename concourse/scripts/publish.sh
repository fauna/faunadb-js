#!/bin/sh

set -eou

cd ./fauna-js-repository

PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
NPM_LATEST_VERSION=$(npm view faunadb version)
echo "Current package version: $PACKAGE_VERSION"
echo "Latest version in npm: $NPM_LATEST_VERSION"

if [ "$PACKAGE_VERSION" \> "$NPM_LATEST_VERSION" ]
then
  mkdir dist
  npm install
  npm run browserify
  npm run browserify-min

  echo "Publishing a new version..."
  echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
  # npm publish
  # rm .npmrc
  echo "faunadb-js@$PACKAGE_VERSION publushed to npm" > slack-message
else
  PWD
  echo "NPM package already published on npm with version ${NPM_LATEST_VERSION}. Update version, please" > slack-message
  cat slack-message
  echo "NPM package already published on npm with version ${NPM_LATEST_VERSION}" 1>&2
  exit 1
fi
