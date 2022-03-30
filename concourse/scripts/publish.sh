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
  npm publish
  rm .npmrc

  echo "faunadb-js@$PACKAGE_VERSION published to npm" > ../slack-message/publish
else
  npm deprecate faunadb@4.5.3 "4.5.3 is is deprecated as it contains a bug that changed the type returned by query for typescript users"
fi
