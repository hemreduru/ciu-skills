# Optional offline template cache: copies a previously downloaded set (~/.cache/ciu-slides/sablon) into the data dir the skill reads.
# Without a cache the skill downloads the templates itself.
SRC="${CIU_SLIDES_TEMPLATE_CACHE:-$HOME/.cache/ciu-slides/sablon}"
DEST="${CLAUDE_PLUGIN_DATA:-$HOME/.cache/ciu-slides}/sablon"
mkdir -p girdiler
if [ -d "$SRC" ] && [ "$(cd "$SRC" && pwd)" != "$(mkdir -p "$DEST" && cd "$DEST" && pwd)" ]; then cp -a "$SRC/." "$DEST/"; fi
