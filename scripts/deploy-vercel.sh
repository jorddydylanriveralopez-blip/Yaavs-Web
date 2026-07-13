#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Deploying yaavs-web to Vercel production..."
npx vercel --prod --yes
