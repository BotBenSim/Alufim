#!/usr/bin/env bash
# Build every open PR into <site-dir>/pr/<number>/ for GitHub Pages staging.
# Failed PR builds are skipped so production deploy still proceeds.
set -euo pipefail

SITE_DIR=${1:?usage: build-pr-previews.sh <site-dir>}
REPO=${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}
BASE_PATH_ROOT=${BASE_PATH_ROOT:-/Alufim}

if ! command -v gh >/dev/null; then
  echo "gh CLI is required" >&2
  exit 1
fi

mkdir -p "${SITE_DIR}/pr"

mapfile -t PRS < <(
  gh pr list --repo "${REPO}" --state open --json number,isCrossRepository \
    --jq '.[] | select(.isCrossRepository|not) | .number' | sort -n
)
if [[ ${#PRS[@]} -eq 0 ]]; then
  echo "No open PRs — skipping preview builds"
  exit 0
fi

WORK=$(mktemp -d)
trap 'rm -rf "${WORK}"' EXIT

for num in "${PRS[@]}"; do
  [[ -n "${num}" ]] || continue
  echo "::group::PR #${num} preview"
  src="${WORK}/pr-${num}"
  mkdir -p "${src}"

  if ! gh api "repos/${REPO}/tarball/refs/pull/${num}/head" \
    | tar -xz -C "${src}" --strip-components=1; then
    echo "::warning::Could not download PR #${num} head — skipping"
    echo "::endgroup::"
    continue
  fi

  if [[ ! -d "${src}/web" ]]; then
    echo "::warning::PR #${num} has no web/ directory — skipping"
    echo "::endgroup::"
    continue
  fi

  base="${BASE_PATH_ROOT}/pr/${num}"
  state_key="alufim_state_v2_pr_${num}"
  echo "Building with NEXT_PUBLIC_BASE_PATH=${base}"

  set +e
  (
    cd "${src}/web"
    npm install --no-audit --no-fund
    NEXT_PUBLIC_BASE_PATH="${base}" \
      NEXT_PUBLIC_STATE_KEY="${state_key}" \
      npm run build
  )
  status=$?
  set -e

  if [[ "${status}" -ne 0 ]]; then
    echo "::warning::PR #${num} preview build failed — skipping"
    echo "::endgroup::"
    continue
  fi

  dest="${SITE_DIR}/pr/${num}"
  rm -rf "${dest}"
  mkdir -p "${dest}"
  cp -a "${src}/web/out/." "${dest}/"
  echo "Staged preview at ${dest}/ (URL path ${base}/)"
  echo "::endgroup::"
done
