# Pre-seeds the sandboxed HOME with an installed Remotion project, as after a first setup.
# Why: the eval sandbox cannot download Chrome Headless Shell (Node ignores the proxy there).
SKILL_DIR="$(cd "$(dirname "$0")/../../.." && pwd)/skills/ciu-design"
WORK_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.cache/ciu-design}/remotion"
mkdir -p "$WORK_DIR" girdiler
cp -a "$SKILL_DIR/remotion/node_modules" "$WORK_DIR/node_modules"
cp "$SKILL_DIR/remotion/package-lock.json" "$WORK_DIR/node_modules/.ciu-lock"
