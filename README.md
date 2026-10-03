# ciu-skills

[Türkçe](README.tr.md) | English

Agent Skills for Cyprus International University (CIU / UKÜ). They follow the open [Agent Skills](https://agentskills.io) standard and work in Claude (claude.ai, Claude Code, the Claude desktop app) and in other compatible agents such as Codex, Cursor, Gemini CLI and GitHub Copilot.

The skills are written for university designers and staff, not developers: you describe what you need in plain language, and the skill replies in yours (usually Turkish).

| Skill | What it does | Example prompt |
|---|---|---|
| [`ciu-design`](skills/ciu-design/SKILL.md) | On-brand images and videos: Instagram/Facebook/LinkedIn posts, stories, reels, banners, motion graphics, and branded versions of your own video clips (intro/outro, logo, name bars, subtitles). | `UKÜ için bu fotoğrafla bir duyuru postu yap` |
| [`ciu-slides`](skills/ciu-slides/SKILL.md) | PowerPoint (`.pptx`) decks on the official UKÜ presentation template, or on your own template. | `UKÜ şablonuyla fakülte tanıtım sunumu hazırla` |

Current version: **0.4.1** ([release](https://github.com/hemreduru/ciu-skills/releases/tag/v0.4.1)).

## Quick start

1. Download `ciu-design.zip` and/or `ciu-slides.zip` from the [latest release](https://github.com/hemreduru/ciu-skills/releases/tag/v0.4.1).
2. In claude.ai open [Customize → Skills](https://claude.ai/customize/skills) and upload the zip. Make sure **Code execution and file creation** is turned on.
3. Start a new chat and ask, for example: `UKÜ için bu fotoğrafla bir duyuru postu yap` (attach the photo).

The first run installs what the skill needs and takes 1–3 minutes; later chats are fast.

## Installation

### claude.ai (web and desktop chat)

1. Turn on **Code execution and file creation** (Settings → Capabilities).
2. Open [Customize → Skills](https://claude.ai/customize/skills), choose to upload a skill and select the zip: `ciu-design.zip` or `ciu-slides.zip` from the [release](https://github.com/hemreduru/ciu-skills/releases/tag/v0.4.1). To build the zips yourself, see [Maintainers](#contributing-and-maintainers).
3. Start a new chat and describe what you need.

On Team and Enterprise plans an admin can make a skill available to everyone; in that case step 2 is not needed.

If you sign in to Claude Code with the same account, your claude.ai skills sync there too (`/skills` → "claude.ai sync").

### Claude Code and the Claude desktop app (Code tab)

In the desktop app, pick a folder (for example `Belgeler/CIU-Tasarim`) and open it in the Code tab, then:

1. Customize → Plugins → **Add marketplace** → `hemreduru/ciu-skills`.
2. Install `ciu-design` (design only), `ciu-slides` (presentations only) or `ciu-skills` (both). Turn on **auto-update** in the marketplace settings.
3. Put photos and videos in the `girdiler/` folder; results are written to `ciktilar/`.

In the Claude Code CLI the equivalent commands are:

```text
/plugin marketplace add hemreduru/ciu-skills
/plugin install ciu-skills@ciu-skills
```

### Other agents (Codex, Cursor, Gemini CLI, Copilot, …)

Requires Node.js. Installed agents are detected automatically:

```bash
npx skills add hemreduru/ciu-skills                      # pick skills from the set interactively
npx skills add hemreduru/ciu-skills --skill ciu-design   # a single skill
npx skills add hemreduru/ciu-skills --all                # everything, for all agents
npx skills update                                        # update
```

`ciu-design` needs an agent that can run commands and read images.

## Updating

| Where you installed | How to update |
|---|---|
| claude.ai | There is no in-place update. Delete the old skill in [Customize → Skills](https://claude.ai/customize/skills), upload the new zip from the [latest release](https://github.com/hemreduru/ciu-skills/releases), then try it in a **new chat**. |
| Claude Code / desktop app | Marketplace with auto-update on: nothing to do. Otherwise refresh the marketplace and update the plugin from Customize → Plugins. Updates are published when `metadata.version` in `.claude-plugin/marketplace.json` increases. |
| Other agents | `npx skills update` |

## Requirements and network

- **Node.js 22.18 or later** ([nodejs.org](https://nodejs.org), LTS). It is already available in claude.ai's code execution environment.
- **Python 3** for `ciu-slides`. python-pptx is preinstalled in claude.ai; locally the skill installs version 1.0.2 itself.
- **Network access.** On first run `ciu-design` downloads the Remotion packages and a browser (1–3 minutes). You do not need to install Remotion yourself.
- **claude.ai:** *Code execution and file creation* must be on. If the network is restricted, your admin must allow these hosts in the code execution network settings:
  - `ciu-design`: `registry.npmjs.org`, `remotion.media`, `storage.googleapis.com`
  - `ciu-slides`: `share.ciu.edu.tr` (template download)
- **LibreOffice** (`soffice`) is optional; `ciu-slides` uses it for slide previews (PDF + PNG) and skips them if it is missing.

## ciu-design

Creates images and videos that follow the official corporate identity guide and UKÜ's social media style.

- **Post**: stills such as posts, stories, banners and carousels, in the sizes you ask for. By default you get two variants with different layouts to choose from.
- Starts by asking how the design should feel: **Kurumsal** (corporate: plain, formal, trustworthy), **Canlı** (lively: young and energetic but tidy) or **Sıra dışı** (unconventional: like a magazine cover or festival poster). It does not ask for condolences, formal statements, rector messages and formal academic/administrative announcements (always Kurumsal), when you already named the tone, when a style is saved for the series or unit, in batch runs, or when you say "direkt yap". Your choice is saved to `ciu-hafiza.md`.
- **Motion**: reels and animations from photos, optionally with music from the built-in pack or your own file.
- **Branded**: your own video clip with intro and outro cards, logo, name bars and subtitles. Subtitles come from an SRT/text you provide, or are transcribed when you ask for them.
- Takes a prompt plus optional photos, clips, fonts, music, a `ciu.edu.tr` news/event link, or a CSV/Excel list for **batch** production (one image per row).
- Every delivery includes `paylasim.md`: Turkish and English captions, hashtags, alt text and a posting-time suggestion.
- Remembers your unit, usual sizes and post series in `ciu-hafiza.md`, for example "weekly event series, issue 5".
- Refuses to recolor, outline, stretch or retype the logo, and says why. Off-palette colors and non-brand fonts get one warning, then it proceeds.
- **Layered export**: offers Photoshop (PSD) and Illustrator (AI) files after final still delivery. In PSD, each object is a separate, named transparent layer; in AI, text stays live and editable.
- Everything is rendered with Remotion; nothing is drawn with other image tools.

Brand and art-direction rules live in [`skills/ciu-design/brand/`](skills/ciu-design/brand).

## ciu-slides

Prepares a branded `.pptx` on UKÜ's official presentation template ([ciu.edu.tr/tr/uku-sablonu](https://ciu.edu.tr/tr/uku-sablonu)). Give it a topic, an outline or a document.

- Plans the slides (one idea per slide, short titles and bullets, speaker notes), then builds the deck from the template.
- Downloads the template **fresh on every run**. Choose among the three official templates (formal, promotional, academic), or use your own `.pptx` as is.
- Logo, colors and fonts come from the template and are never altered.
- Checks before delivery: empty boxes, leftover sample text, overflow, too many bullets, long titles, missing speaker notes.
- Never invents rankings, accreditation or statistics; it uses only what you provide.
- Template structure: [`skills/ciu-slides/templates.md`](skills/ciu-slides/templates.md).

Network notes:

- `share.ciu.edu.tr` hosts the template; locally the first setup also needs `pypi.org`. If your admin must allow hosts, ask for `share.ciu.edu.tr`. If the download fails, the last cached copy or a template you upload is used.
- TLS: the server does not send its intermediate certificate, so the public GlobalSign GCC R46 OV TLS CA 2025 certificate is bundled with the skill ([`globalsign-gcc-r46-ov-tls-ca-2025.pem`](skills/ciu-slides/globalsign-gcc-r46-ov-tls-ca-2025.pem)) and used together with the system roots. Verification is never turned off. The certificate expires in 2029; if the server changes its intermediate, put the new one in this file.
- Tests: `pip install -r skills/ciu-slides/requirements.txt && python -m unittest discover -s skills/ciu-slides/scripts -p 'test_*.py'`. CI: [`.github/workflows/slides.yml`](.github/workflows/slides.yml).

## Evals

`evals/` contains skill behavior tests. Each case has `prompt.md`, `scaffold.sh` and `graders/*.md`. Runs use headless Claude Code; transcripts are written to `/tmp/w4-runs/<run>/` and are not committed.

```bash
node evals/run.mjs run ciu-design/01-etkinlik-post-tr ciu-slides/04-kullanici-sablonu --run 3 --parallel 2
node evals/run.mjs run ciu-design/01-etkinlik-post-tr --run 3 --grade-only   # re-grade only
node evals/run.mjs report --run 3             # table; LLM graders need verdicts.json
```

For the slides cases, `CIU_PYTHON` must point to a Python with python-pptx. Latest baseline (claude 2.1.286, `claude-sonnet-5-5`, 2026-10-01): run 1 scored 11/19; after fixes, run 2 scored 19/19. Details and root causes: [`evals/results-claude-code-sonnet.md`](evals/results-claude-code-sonnet.md). Grader tests: `node --test evals/run.test.mjs` (runs in CI; the evals themselves do not).

## Contributing and maintainers

- Tests: `cd skills/ciu-design/remotion && npm ci && npm test && npm run typecheck`. Scripts: `node --test skills/ciu-design/scripts/scripts.test.mjs`.
- CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (tests, a setup and render smoke test in a clean directory, packaging). Release: pushing a `v<version>` tag (it must equal `metadata.version` in `.claude-plugin/marketplace.json`) runs [`release.yml`](.github/workflows/release.yml), which attaches `dist/*.zip` to the GitHub Release.
- Remotion rules (`remotion-dev/skills`) are pinned to one commit in `skills/ciu-design/scripts/remotion-rules.mjs` (setup and build use the same file). Change the SHA to update them.
- The validator is `scripts/check.mjs` and the logo picker is `scripts/logo.mjs`, both under `skills/ciu-design/`; the rule logic is in `remotion/src/lib/rules.ts`.
- Design quality: [`brand/art-direction.md`](skills/ciu-design/brand/art-direction.md) (concept and skeleton catalog), [`brand/slop.md`](skills/ciu-design/brand/slop.md) (the don't list), [`brand/motion.md`](skills/ciu-design/brand/motion.md) (video motion rules). Custom compositions live in `remotion/src/custom/`; every export is registered automatically.
- Logos changed: put the new files under `raw/`, then run `python3 tools/make_logos.py`.
- claude.ai packages: `node tools/build.mjs` writes `dist/<skill>.zip` for each skill.
- Versioning: bump `metadata.version` in `.claude-plugin/marketplace.json` to ship updates to Claude Code. `npx skills update` pulls straight from the repo.
- Adding a skill: create `skills/<name>/SKILL.md`, add a `<name>` entry to `marketplace.json`, add `./skills/<name>` to the `skills` array of the `ciu-skills` entry, and update the table in both READMEs. `build.mjs` and `npx skills` find the new skill automatically.
- Design notes: [spec](docs/superpowers/specs/2026-10-01-ciu-design.md) and [plan](docs/superpowers/plans/2026-10-01-ciu-design.md) for `ciu-design`.

## License

The repository does not ship its own license file. Third-party components: [Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) (its own license), and the Source Sans 3 and Poppins fonts ([SIL OFL 1.1](skills/ciu-design/remotion/public/brand/fonts/OFL.txt)).
