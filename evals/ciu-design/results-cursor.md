# Step 5b: Cursor CLI smoke test (Claude-independent agent)

Date: 2026-10-01. Machine: Emre's Linux box. Agent: `cursor-agent` 2026.05.05-84a231c (`~/.local/bin/cursor-agent`).

## Result: install and discovery verified, scenario 1 NOT run (cursor-agent is not logged in)

| Step | Command (run in a throwaway dir, project scope, no `-g`) | Outcome |
|---|---|---|
| Discovery | `npx -y skills add /home/emre/ciu-skills --list` | OK: "Found 1 skill", `ciu-design`, description shown in full. |
| Install | `npx -y skills add /home/emre/ciu-skills --skill ciu-design -a cursor -y` | OK: copied to `./.agents/skills/ciu-design` (Cursor reads project `.agents/skills/`), plus `skills-lock.json`. Installed copy is byte-identical to `skills/ciu-design` (`diff -rq` empty). |
| Auth check | `cursor-agent status` | `Not logged in`. |
| Scenario 1 | `cursor-agent -p --trust --force "<scenario 1 prompt>"` | `Error: Authentication required. Please run 'agent login' first, or set CURSOR_API_KEY environment variable.` Exit 1. |

Per the controller ruling no login was attempted and no API key was used, so the headless run was skipped.

## Observations useful for the human who finishes this step

- `skills add <local path>` copies the whole directory, including the dev `remotion/node_modules` (about 670 MB, took 3 s on this machine). That only happens when installing from a local working copy; a clone from GitHub has no `node_modules` (gitignored). Not a skill defect, but a local-path install is much bigger than a GitHub install.
- Agent-independence of SKILL.md (static check): the text contains no Claude-specific tool names (no Skill/Bash/WebFetch references); the only Claude-specific strings are the `ENV=claudeai` branch and `CLAUDE_PLUGIN_DATA` in `scripts/setup.mjs`, both optional and with fallbacks (`~/.cache/ciu-design`, `$PWD/girdiler`, `$PWD/ciktilar`).
- To finish: run `cursor-agent login` yourself (or export `CURSOR_API_KEY`), then in the scratch project (`/tmp/claude-1000/-home-emre/e5c94c88-3640-481a-89eb-dde2e40200a2/scratchpad/cursor-test`, which already holds `girdiler/photo-1.jpg` and the installed skill) run:
  `cursor-agent -p --trust --force "Bu fotoğrafla 4:5 bir etkinlik duyurusu yap: 'Kariyer Günleri', 15 Ekim 2026 saat 14:00, Kongre Merkezi. Fotoğraf: girdiler/photo-1.jpg"`
  and check that `ciktilar/*/final.png` is a 1080x1350 PNG. Expect the first run to take a few minutes (npm install + Chrome Headless Shell download into `~/.cache/ciu-design`).
