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
  npm run build:package
  echo "Publishing a new version..."
  echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
  npm publish --tag beta
  rm .npmrc
  echo "faunadb-js@$PACKAGE_VERSION published to npm" > ../slack-message/publish
else
  echo "faunadb-js@${NPM_LATEST_VERSION} package has been already published" > ../slack-message/publish
  echo "faunadb-js@${NPM_LATEST_VERSION} package has been already published" 1>&2
  exit 1
fi
