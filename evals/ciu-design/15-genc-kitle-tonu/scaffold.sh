#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../scaffold-common.sh"
F="$(dirname "$0")/../files"
cp "$F"/photo-3.jpg girdiler/
