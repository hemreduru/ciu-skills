#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../scaffold-common.sh"
cp "$(dirname "$0")/../files/photo-2.jpg" girdiler/
H="node $(dirname "$0")/../../../skills/ciu-design/scripts/hafiza.mjs ${CLAUDE_PLUGIN_DATA:-$HOME/.cache/ciu-design}/ciu-hafiza.md"
$H seri "Kulüp Buluşması" --logo official-ciu-color-3lines-tr --etiketler "#KulüpBuluşması" --numara 2 >/dev/null
$H add begeni "tarz: Sıra dışı — Kulüp Buluşması" >/dev/null
