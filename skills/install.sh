#!/usr/bin/env bash
#
# Install the Quint agent skills (quint-lang, quint-modeling) into the skills
# directory of any SKILL.md-compatible coding agent.
#
# The skills are written in the open Agent Skills format, so the same folders
# work unchanged across agents — this script just symlinks them into the place
# each agent looks, so a `git pull` keeps the installed skills up to date.
#
# Usage:
#   skills/install.sh <agent> [--user] [--force]
#
#   <agent>   One of: claude | cursor | codex | gemini
#   --user    Install for your user (home dir) instead of the current project
#   --force   Overwrite an existing skill of the same name
#
# Run from a checkout, or straight from the web (clones into a cache dir):
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
info()  { printf '%s\n' "$*"; }
ok()    { printf '%s%s%s\n' "$GREEN" "$*" "$RESET"; }
die()   { printf '%serror:%s %s\n' "$RED" "$RESET" "$*" >&2; exit 1; }

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
    --user)        SCOPE="user" ;;
    --force)       FORCE=1 ;;
    -h|--help)     usage; exit 0 ;;
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

# --- locate the source skills folders ----------------------------------------
# Prefer a checkout next to this script; otherwise clone into a cache dir so
# symlinks have a stable, updatable target (curl | bash case).
SRC=""
if SELF="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd)"; then
  if [ -d "$SELF/quint-lang" ] && [ -d "$SELF/quint-modeling" ]; then
    SRC="$SELF"
  fi
fi
if [ -z "$SRC" ]; then
  command -v git >/dev/null 2>&1 || die "git is required to fetch the skills"
  CACHE="${XDG_DATA_HOME:-$HOME/.local/share}/quint"
  if [ -d "$CACHE/.git" ]; then
    info "${DIM}Updating cached skills in $CACHE${RESET}"
    git -C "$CACHE" pull --quiet --ff-only || info "${DIM}(could not update cache, using existing)${RESET}"
  else
    info "${DIM}Fetching skills into $CACHE${RESET}"
    mkdir -p "$(dirname "$CACHE")"
    git clone --quiet --depth 1 "$REPO_URL" "$CACHE"
  fi
  SRC="$CACHE/skills"
  [ -d "$SRC/quint-lang" ] || die "skills not found after clone ($SRC)"
fi

# --- install -----------------------------------------------------------------
info "Installing Quint skills"
info "  agent:  ${BOLD}$AGENT${RESET}  (${SCOPE} scope)"
info "  source: $SRC"
info "  dest:   $DEST"
info ""

mkdir -p "$DEST"
for skill in "${SKILLS[@]}"; do
  target="$DEST/$skill"
  if [ -e "$target" ] || [ -L "$target" ]; then
    if [ "$FORCE" -eq 1 ]; then
      rm -rf "$target"
    else
      info "  ${DIM}skip${RESET}    $skill (already exists — use --force to overwrite)"
      continue
    fi
  fi
  ln -s "$SRC/$skill" "$target"
  ok "  linked  $skill -> $SRC/$skill"
done

info ""
ok "Done. Restart $AGENT (or reload the workspace) so it picks up the skills."
info "${DIM}Skills can run code — review them before use, as you would any tooling.${RESET}"
