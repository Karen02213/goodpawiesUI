#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SYSTEMD_DIR=/etc/systemd/system
ENABLE_TARGET=dev
START_NOW=yes
RUN_AS_USER=${SUDO_USER:-${USER:-}}
RUN_AS_GROUP=

usage() {
  cat <<EOF
Usage:
  sudo ./scripts/install-systemd-services.sh [--enable dev|prod|none] [--user USER] [--group GROUP] [--no-start]

Options:
  --enable dev|prod|none  Enable the chosen target at boot. Default: dev.
  --user USER             Run services as this user. Default: invoking sudo user.
  --group GROUP           Run services as this group. Default: primary group of USER.
  --no-start              Install and enable services without starting them now.
EOF
}

require_root() {
  if [[ ${EUID} -ne 0 ]]; then
    echo "Run this script with sudo." >&2
    exit 1
  fi
}

escape_sed() {
  printf '%s' "$1" | sed 's/[\/&]/\\&/g'
}

discover_user_home() {
  getent passwd "$1" | cut -d: -f6
}

discover_group() {
  id -gn "$1"
}

discover_npm_bin() {
  if [[ -n ${NPM_BIN:-} ]]; then
    printf '%s\n' "$NPM_BIN"
    return
  fi

  sudo -u "$RUN_AS_USER" bash -lc 'command -v npm'
}

render_unit() {
  local template=$1
  local destination=$2

  sed \
    -e "s/__APP_ROOT__/$(escape_sed "$ROOT_DIR")/g" \
    -e "s/__RUN_AS_USER__/$(escape_sed "$RUN_AS_USER")/g" \
    -e "s/__RUN_AS_GROUP__/$(escape_sed "$RUN_AS_GROUP")/g" \
    -e "s/__RUN_AS_HOME__/$(escape_sed "$RUN_AS_HOME")/g" \
    -e "s/__NPM_BIN__/$(escape_sed "$NPM_BIN")/g" \
    -e "s/__NODE_PATH__/$(escape_sed "$NODE_PATH")/g" \
    "$template" > "$destination"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --enable)
      ENABLE_TARGET=${2:-}
      shift 2
      ;;
    --user)
      RUN_AS_USER=${2:-}
      shift 2
      ;;
    --group)
      RUN_AS_GROUP=${2:-}
      shift 2
      ;;
    --no-start)
      START_NOW=no
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

require_root

if [[ -z "$RUN_AS_USER" ]]; then
  echo "Unable to determine the runtime user. Pass --user explicitly." >&2
  exit 1
fi

if [[ ! -d "$ROOT_DIR/client" || ! -d "$ROOT_DIR/server" ]]; then
  echo "Client or server directory is missing under $ROOT_DIR." >&2
  exit 1
fi

if [[ ! -f "$ROOT_DIR/client/package.json" || ! -f "$ROOT_DIR/server/package.json" ]]; then
  echo "package.json is missing in client or server." >&2
  exit 1
fi

case "$ENABLE_TARGET" in
  dev|prod|none)
    ;;
  *)
    echo "Invalid --enable value: $ENABLE_TARGET" >&2
    usage
    exit 1
    ;;
esac

RUN_AS_HOME=$(discover_user_home "$RUN_AS_USER")
if [[ -z "$RUN_AS_HOME" ]]; then
  echo "Unable to determine home directory for user $RUN_AS_USER." >&2
  exit 1
fi

if [[ -z "$RUN_AS_GROUP" ]]; then
  RUN_AS_GROUP=$(discover_group "$RUN_AS_USER")
fi

NPM_BIN=$(discover_npm_bin)
if [[ -z "$NPM_BIN" || ! -x "$NPM_BIN" ]]; then
  echo "Unable to locate npm for user $RUN_AS_USER. Export NPM_BIN or install Node.js system-wide." >&2
  exit 1
fi

NODE_BIN_DIR=$(dirname "$NPM_BIN")
NODE_PATH="$NODE_BIN_DIR:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

install -d "$SYSTEMD_DIR"

render_unit "$ROOT_DIR/deploy/systemd/goodpawies-client-dev.service.template" "$SYSTEMD_DIR/goodpawies-client-dev.service"
render_unit "$ROOT_DIR/deploy/systemd/goodpawies-server-dev.service.template" "$SYSTEMD_DIR/goodpawies-server-dev.service"
render_unit "$ROOT_DIR/deploy/systemd/goodpawies-server.service.template" "$SYSTEMD_DIR/goodpawies-server.service"
install -m 0644 "$ROOT_DIR/deploy/systemd/goodpawies-dev.target" "$SYSTEMD_DIR/goodpawies-dev.target"
install -m 0644 "$ROOT_DIR/deploy/systemd/goodpawies-prod.target" "$SYSTEMD_DIR/goodpawies-prod.target"
install -m 0755 "$ROOT_DIR/scripts/goodpawiesctl.sh" /usr/local/bin/goodpawiesctl

systemctl daemon-reload

systemctl disable goodpawies-dev.target >/dev/null 2>&1 || true
systemctl disable goodpawies-prod.target >/dev/null 2>&1 || true

case "$ENABLE_TARGET" in
  dev)
    systemctl enable goodpawies-dev.target
    if [[ "$START_NOW" == yes ]]; then
      systemctl stop goodpawies-prod.target >/dev/null 2>&1 || true
      systemctl start goodpawies-dev.target
    fi
    ;;
  prod)
    systemctl enable goodpawies-prod.target
    if [[ "$START_NOW" == yes ]]; then
      systemctl stop goodpawies-dev.target >/dev/null 2>&1 || true
      systemctl start goodpawies-prod.target
    fi
    ;;
  none)
    if [[ "$START_NOW" == yes ]]; then
      systemctl stop goodpawies-dev.target >/dev/null 2>&1 || true
      systemctl stop goodpawies-prod.target >/dev/null 2>&1 || true
    fi
    ;;
esac

cat <<EOF
Installed GoodPawies systemd units.

Runtime user: $RUN_AS_USER
Runtime group: $RUN_AS_GROUP
Project root:  $ROOT_DIR
npm binary:    $NPM_BIN

Installed units:
  - goodpawies-client-dev.service
  - goodpawies-server-dev.service
  - goodpawies-server.service
  - goodpawies-dev.target
  - goodpawies-prod.target

Examples:
  sudo goodpawiesctl dev status all
  sudo goodpawiesctl dev restart server
  sudo goodpawiesctl prod restart all
  sudo systemctl status goodpawies-dev.target
EOF