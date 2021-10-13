#!/bin/sh

set -eou

cd ./fauna-js-repository
mkdir slack-message

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
  cd ..
  echo "faunadb-js@$PACKAGE_VERSION publushed to npm" > slack-message/publish
else
  cd ..
  cat > slack-message/publish <<EOF
faunadb-js@$PACKAGE_VERSION already published to npm
EOF
  # exit 1
fi
