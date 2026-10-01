#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../scaffold-common.sh"
F="$(dirname "$0")/../files"
cp "$F"/liste.csv "$F"/photo-[123].jpg girdiler/
