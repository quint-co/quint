#!/usr/bin/env bash
#
# Install the Quint agent skills (quint-lang, quint-modeling) into the skills
# directory of a SKILL.md-compatible coding agent.
#
# Usage:
#   skills/install.sh <agent> [--user] [--force]
#
#   <agent>   One of: claude | cursor | codex | gemini
#   --user    Install for your user (home dir) instead of the current project
#   --force   Overwrite an existing skill of the same name
#
# Example:
#   curl -fsSL https://raw.githubusercontent.com/quint-co/quint/main/skills/install.sh | bash -s -- cursor
set -euo pipefail

REPO_URL="https://github.com/quint-co/quint.git"
SKILLS=(quint-lang quint-modeling)

# --- pretty output -----------------------------------------------------------
if [ -t 1 ]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[31m'; GREEN=$'\033[32m'; RESET=$'\033[0m'
else
  BOLD=''; DIM=''; RED=''; GREEN=''; RESET=''
fi
info() { printf '%s\n' "$*"; }
ok()   { printf '%s%s%s\n' "$GREEN" "$*" "$RESET"; }
die()  { printf '%serror:%s %s\n' "$RED" "$RESET" "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Usage: skills/install.sh <agent> [--user] [--force]
  <agent>   claude | cursor | codex | gemini
  --user    install into your home dir instead of the current project
  --force   overwrite an existing skill of the same name
EOF
}

# --- parse args --------------------------------------------------------------
AGENT=""; SCOPE="project"; FORCE=0
for arg in "$@"; do
  case "$arg" in
    --user)    SCOPE="user" ;;
    --force)   FORCE=1 ;;
    -h|--help) usage; exit 0 ;;
    claude|cursor|codex|gemini) AGENT="$arg" ;;
    *) die "unknown argument: $arg (run with --help)" ;;
  esac
done
[ -n "$AGENT" ] || { usage; die "missing <agent>"; }

# --- resolve the target skills directory -------------------------------------
case "$AGENT" in
  claude) sub=".claude/skills" ;;
  cursor) sub=".cursor/skills" ;;
  codex)  sub=".codex/skills"  ;;
  gemini) sub=".gemini/skills" ;;
esac
if [ "$SCOPE" = "user" ]; then
  DEST="$HOME/$sub"   # e.g. ~/.claude/skills
else
  DEST="$PWD/$sub"
fi

# --- fetch the skill folders -------------------------------------------------
# Clone a temporary copy of the repo and remove it once the skills are copied.
command -v git >/dev/null 2>&1 || die "git is required to install the skills"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
info "${DIM}Fetching skills...${RESET}"
git clone --quiet --depth 1 "$REPO_URL" "$TMP/quint"
SRC="$TMP/quint/skills"
[ -d "$SRC/quint-lang" ] || die "skills not found in clone"

# --- install -----------------------------------------------------------------
info "Installing Quint skills into ${BOLD}$DEST${RESET} (${SCOPE} scope)"
mkdir -p "$DEST"
for skill in "${SKILLS[@]}"; do
  target="$DEST/$skill"
  if [ -e "$target" ] && [ "$FORCE" -ne 1 ]; then
    info "  ${DIM}skip${RESET}       $skill (already exists — use --force to overwrite)"
    continue
  fi
  rm -rf "$target"
  cp -R "$SRC/$skill" "$target"
  ok "  installed  $skill"
done

info ""
ok "Done. Restart $AGENT (or reload the workspace) so it picks up the skills."
info "${DIM}Skills can run code — review them before use, as you would any tooling.${RESET}"
