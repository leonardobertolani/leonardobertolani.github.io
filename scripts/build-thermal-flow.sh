#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../_thermal-flow-lab"
npm ci
npm run build
mkdir -p ../thermal-flow-lab
cp -a dist/. ../thermal-flow-lab/
