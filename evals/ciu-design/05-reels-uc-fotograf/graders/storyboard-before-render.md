---
type: tool_order
before: { tool: Bash, input_match: 'remotion still src/index\.ts \w+ .*frame-' }
after: { tool: Bash, input_match: 'remotion render src/index\.ts \w+ ' }
---
