#!/usr/bin/env bash
set -o errexit

bundle install
npm ci
NODE_ENV=production npm run build
bin/rails assets:precompile
bin/rails assets:clean
