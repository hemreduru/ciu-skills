#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../scaffold-common.sh"
# The user's own (empty) template: python-pptx's default master, saved as girdiler/sablonum.pptx
"${CIU_PYTHON:-python3}" -c "from pptx import Presentation; Presentation().save('girdiler/sablonum.pptx')"
