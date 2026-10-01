#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../scaffold-common.sh"
F="$(dirname "$0")/../files"
cp "$F"/photo-2.jpg girdiler/
node "$(dirname "$0")/../../../skills/ciu-design/scripts/hafiza.mjs" "${CLAUDE_PLUGIN_DATA:-$HOME/.cache/ciu-design}/ciu-hafiza.md" seri "Haftalık Etkinlik" --layout band --vurgu orange --logo official-ciu-color-3lines-tr --etiketler "#HaftalıkEtkinlik" --numara 4 >/dev/null
