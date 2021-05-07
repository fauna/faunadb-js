#!/bin/sh

DOCS_VERSION=$(cat ./docs_version/version.dat)
echo "Current docs version: $DOCS_VERSION"

git clone fauna-js-repository-docs fauna-js-repository-updated-docs

cd fauna-js-repository-updated-docs || exit 1

rm -rf ./*
cp -R ../doc/* ./

git config --global user.email "nobody@concourse-ci.org"
git config --global user.name "Concourse CI"

git add -A
git commit -m "Update docs to version: $DOCS_VERSION"
