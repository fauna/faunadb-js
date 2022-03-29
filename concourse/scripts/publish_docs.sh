#!/bin/sh

set -eou

cd ./fauna-js-repository

PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
npm install
npm run doc

cd ../
mkdir doc
cp -R ./fauna-js-repository/doc/* ./doc/

echo "Current docs version: $PACKAGE_VERSION"

apk add --no-progress --no-cache sed

echo "================================="
echo "Adding google manager tag to head"
echo "================================="

HEAD_GTM=$(cat ./fauna-js-repository/concourse/scripts/head_gtm.dat)
sed -i.bak "0,/<\/title>/{s/<\/title>/<\/title>${HEAD_GTM}/}" ./doc/index.html

echo "================================="
echo "Adding google manager tag to body"
echo "================================="

BODY_GTM=$(cat ./fauna-js-repository/concourse/scripts/body_gtm.dat)
sed -i.bak "0,/<body>/{s/<body>/<body>${BODY_GTM}/}" ./doc/index.html

rm ./doc/index.html.bak

apk add --no-progress --no-cache git
git clone fauna-js-repository-docs fauna-js-repository-updated-docs

cd fauna-js-repository-updated-docs

rm -rf ./*
cp -R ../doc/* ./

git config --global user.email "nobody@concourse-ci.org"
git config --global user.name "Fauna, Inc"

echo "================================="
echo "Updating CircleCI to Ignore Build"
echo "================================="

if [ ! -d ".circleci" ]; then
    mkdir .circleci
fi

cd .circleci
cat > config.yml <<- "EOF"
# No-op workflow for `gh-pages` branch
version: 2.1

jobs:
  no-op:
    docker:
      - image: circleci/gh-pages
    steps:
      - checkout

workflows:
  no-op:
    jobs:
      - no-op:
          filters:
            branches:
              ignore:
                - gh-pages
EOF

git add -A
git commit -m "Update docs to version: $PACKAGE_VERSION"
