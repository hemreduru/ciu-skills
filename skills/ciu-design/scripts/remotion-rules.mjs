import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

export const RULES_SHA = "0b5db9daae40f42c73544d1cc0a8c733bd530eaa";
export const RULES_TARBALL = `https://codeload.github.com/remotion-dev/skills/tar.gz/${RULES_SHA}`;

// Extracts remotion-best-practices/ etc. into dest
export const fetchRules = (dest) => {
  mkdirSync(dest, { recursive: true });
  execSync(`curl -fsL ${RULES_TARBALL} | tar -xz -C "${dest}" --strip-components=2 skills-${RULES_SHA}/skills`, { stdio: ["ignore", "pipe", "pipe"], shell: "/bin/bash" });
};
