#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  sudo goodpawiesctl <dev|prod> <start|stop|restart|status|logs> <all|client|server|nginx>

Examples:
  sudo goodpawiesctl dev start all
  sudo goodpawiesctl dev restart server
  sudo goodpawiesctl prod status all
  sudo goodpawiesctl prod logs server
EOF
}

require_root() {
  if [[ ${EUID} -ne 0 ]]; then
    echo "Run this command with sudo." >&2
    exit 1
  fi
}

mode=${1:-}
action=${2:-}
target=${3:-all}

if [[ -z "$mode" || -z "$action" ]]; then
  usage
  exit 1
fi

case "$mode" in
  dev)
    case "$target" in
      all)
        units=(goodpawies-client-dev.service goodpawies-server-dev.service)
        ;;
      client)
        units=(goodpawies-client-dev.service)
        ;;
      server)
        units=(goodpawies-server-dev.service)
        ;;
      *)
        usage
        exit 1
        ;;
    esac
    ;;
  prod)
    case "$target" in
      all)
        units=(goodpawies-client-dev.service goodpawies-server.service nginx.service)
        ;;
      client)
        units=(goodpawies-client-dev.service)
        ;;
      server)
        units=(goodpawies-server.service)
        ;;
      nginx)
        units=(nginx.service)
        ;;
      *)
        usage
        exit 1
        ;;
    esac
    ;;
  *)
    usage
    exit 1
    ;;
esac

require_root

case "$action" in
  start|stop|restart|status)
    systemctl "$action" "${units[@]}"
    ;;
  logs)
    journal_args=()
    for unit in "${units[@]}"; do
      journal_args+=(-u "$unit")
    done
    exec journalctl "${journal_args[@]}" -f
    ;;
  *)
    usage
    exit 1
    ;;
esac