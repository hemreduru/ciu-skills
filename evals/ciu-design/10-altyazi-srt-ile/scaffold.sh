#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../scaffold-common.sh"
F="$(dirname "$0")/../files"
cp "$F"/clip.mp4 "$F"/altyazi.srt girdiler/
