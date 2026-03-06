#!/bin/bash
#
# Docker Service Management — Carmen Backend V2
# ================================================
# จัดการ Docker containers ทั้ง local และ remote server (EC2)
#
# Usage:
#   ./docker-service.sh <command> [target] [--remote]
#
# Commands:
#   status                          แสดงสถานะ Docker daemon และ containers
#   build   [core|all|SERVICE]      Build Docker images
#   up      [core|all|SERVICE]      Start containers (docker compose up -d)
#   down    [core|all|SERVICE]      Stop containers (docker compose down)
#   restart [core|all|SERVICE]      Restart containers
#   logs    [SERVICE|all]           ดู logs
#   health                          เช็ค health endpoints
#   ps                              แสดง containers ที่รัน
#   clean                           ลบ images/containers ที่ไม่ใช้
#
# Targets:
#   core           gateway, business, cluster, keycloak (default)
#   all            ทุก services
#   SERVICE name   gateway | business | cluster | keycloak | file | notification | cronjob
#
# Options:
#   --remote             รันคำสั่งบน remote server (EC2) ผ่าน SSH
#   --dev                ใช้ docker-compose.dev.yml (default: docker-compose.yml)
#   --ssh-key <path>     ระบุ path ของ SSH key
#
# ตัวอย่าง:
#   ./docker-service.sh status                    สถานะ local
#   ./docker-service.sh status --remote           สถานะบน server
#   ./docker-service.sh build core --dev          Build core services (dev)
#   ./docker-service.sh up all --remote           Start ทุก service บน server
#   ./docker-service.sh down business --remote    Stop business บน server
#   ./docker-service.sh logs gateway --remote     ดู logs gateway บน server

set -euo pipefail

# ───────────────────────────────────────────────────────────
# Config
# ───────────────────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# SSH config สำหรับ remote server
SSH_KEY="${SSH_KEY:-$HOME/workspace/ssh/aws/script/ec2-webservice-bkk.pem}"
SSH_USER="${SSH_USER:-ec2-user}"  # Amazon Linux 2023 ใช้ ec2-user, Amazon Linux 2 ใช้ ubuntu (ปรับตามที่ใช้จริง)
SSH_HOST="${SSH_HOST:-ec2-43-209-126-252.ap-southeast-7.compute.amazonaws.com}"
REMOTE_PROJECT_DIR="${REMOTE_PROJECT_DIR:-/home/ec2-user/carmen-turborepo-backend-v2}"

# Docker compose file
COMPOSE_FILE="docker-compose.yml"

# Service name mapping: short name -> docker compose service name
declare -A SERVICE_MAP=(
    [gateway]="api-backend-gateway"
    [business]="api-micro-business"
    [cluster]="api-micro-cluster"
    [keycloak]="api-micro-keycloak-api"
    [file]="api-micro-file"
    [notification]="api-micro-notification"
    [cronjob]="api-micro-cronjob"
)

CORE_LIST="gateway business cluster keycloak"
ALL_LIST="gateway business cluster keycloak file notification cronjob"

# ───────────────────────────────────────────────────────────
# Parse arguments
# ───────────────────────────────────────────────────────────

REMOTE=false
DEV=false
ACTION="${1:-status}"
TARGET=""
SSH_KEY_ARG=""

# Parse positional and flag arguments
shift_count=0
for arg in "$@"; do
    case "$arg" in
        --remote)        REMOTE=true ;;
        --dev)           DEV=true ;;
        --ssh-key)       SSH_KEY_ARG="__next__" ;;
        --ssh-key=*)     SSH_KEY_ARG="${arg#--ssh-key=}" ;;
        *)
            if [[ "$SSH_KEY_ARG" == "__next__" ]]; then
                SSH_KEY_ARG="$arg"
            elif [[ -z "$TARGET" && "$arg" != "$ACTION" ]]; then
                TARGET="$arg"
            fi
            ;;
    esac
done

# Override SSH_KEY if provided via flag
if [[ -n "$SSH_KEY_ARG" && "$SSH_KEY_ARG" != "__next__" ]]; then
    SSH_KEY="$SSH_KEY_ARG"
fi

if $DEV; then
    COMPOSE_FILE="docker-compose.dev.yml"
fi

# ───────────────────────────────────────────────────────────
# Helpers
# ───────────────────────────────────────────────────────────

resolve_services() {
    case "${1:-core}" in
        core) echo "$CORE_LIST" ;;
        all)  echo "$ALL_LIST" ;;
        *)    echo "$1" ;;
    esac
}

get_compose_names() {
    local services
    services=$(resolve_services "$1")
    local compose_names=""
    for name in $services; do
        compose_names="$compose_names ${SERVICE_MAP[$name]:-$name}"
    done
    echo "$compose_names"
}

run_cmd() {
    if $REMOTE; then
        if [[ -z "$SSH_HOST" ]]; then
            echo "ERROR: SSH_HOST ยังไม่ได้ตั้งค่า"
            echo "ตั้งค่าได้ 2 วิธี:"
            echo "  1. export SSH_HOST=<ip-or-hostname>"
            echo "  2. SSH_HOST=<ip> ./docker-service.sh <command>"
            exit 1
        fi
        if [[ ! -f "$SSH_KEY" ]]; then
            echo "ERROR: SSH key ไม่พบที่ $SSH_KEY"
            exit 1
        fi
        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "${SSH_USER}@${SSH_HOST}" "$1"
    else
        eval "$1"
    fi
}

compose_cmd() {
    local project_dir="$ROOT_DIR"
    if $REMOTE; then
        project_dir="$REMOTE_PROJECT_DIR"
    fi
    echo "cd $project_dir && docker compose -f $COMPOSE_FILE"
}

show_usage() {
    echo "Usage: $0 <command> [target] [--remote] [--dev]"
    echo ""
    echo "Commands:"
    echo "  status                          แสดงสถานะ Docker daemon และ containers"
    echo "  build   [core|all|SERVICE]      Build Docker images"
    echo "  up      [core|all|SERVICE]      Start containers"
    echo "  down    [core|all|SERVICE]      Stop containers"
    echo "  restart [core|all|SERVICE]      Restart containers"
    echo "  logs    [SERVICE|all]           ดู logs (tail -f)"
    echo "  health                          เช็ค health endpoints"
    echo "  ps                              แสดง containers ที่รัน"
    echo "  clean                           ลบ images/containers ที่ไม่ใช้"
    echo ""
    echo "Targets:"
    echo "  core           gateway, business, cluster, keycloak (default)"
    echo "  all            ทุก 7 services"
    echo "  SERVICE name   gateway | business | cluster | keycloak | file | notification | cronjob"
    echo ""
    echo "Options:"
    echo "  --remote             รันบน remote server ผ่าน SSH"
    echo "  --dev                ใช้ docker-compose.dev.yml"
    echo "  --ssh-key <path>     ระบุ path ของ SSH key"
    echo ""
    echo "Environment variables:"
    echo "  SSH_HOST       IP/hostname ของ remote server (required for --remote)"
    echo "  SSH_USER       SSH username (default: ubuntu)"
    echo "  SSH_KEY        Path ไปยัง SSH key (default: ~/workspace/ssh/aws/script/ec2-webservice-bkk.pem)"
    echo "  REMOTE_PROJECT_DIR  Path โปรเจกต์บน server (default: /home/ubuntu/carmen-turborepo-backend-v2)"
    exit 1
}

# ───────────────────────────────────────────────────────────
# Commands
# ───────────────────────────────────────────────────────────

cmd_status() {
    local location="LOCAL"
    $REMOTE && location="REMOTE ($SSH_HOST)"

    echo "=== Docker Status [$location] ==="
    echo ""
    run_cmd "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
    echo ""
    echo "=== Docker Disk Usage ==="
    run_cmd "docker system df"
}

cmd_build() {
    local services
    services=$(get_compose_names "${TARGET:-core}")
    local base
    base=$(compose_cmd)

    echo "=== Building: $services ==="
    run_cmd "$base build $services"
    echo ""
    echo "=== Build complete ==="
}

cmd_up() {
    local services
    services=$(get_compose_names "${TARGET:-core}")
    local base
    base=$(compose_cmd)

    echo "=== Starting: $services ==="
    run_cmd "$base up -d $services"
    echo ""
    echo "=== Containers ==="
    run_cmd "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
}

cmd_down() {
    local services
    services=$(get_compose_names "${TARGET:-core}")
    local base
    base=$(compose_cmd)

    if [[ "${TARGET:-}" == "all" || -z "${TARGET:-}" ]]; then
        echo "=== Stopping all containers ==="
        run_cmd "$base down"
    else
        echo "=== Stopping: $services ==="
        run_cmd "$base stop $services"
        run_cmd "$base rm -f $services"
    fi
    echo ""
    echo "=== Done ==="
}

cmd_restart() {
    local services
    services=$(get_compose_names "${TARGET:-core}")
    local base
    base=$(compose_cmd)

    echo "=== Restarting: $services ==="
    run_cmd "$base restart $services"
    echo ""
    echo "=== Containers ==="
    run_cmd "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
}

cmd_logs() {
    local services
    if [[ -z "${TARGET:-}" || "${TARGET:-}" == "all" ]]; then
        services=""
    else
        services=$(get_compose_names "$TARGET")
    fi
    local base
    base=$(compose_cmd)

    run_cmd "$base logs -f --tail=100 $services"
}

cmd_ps() {
    local base
    base=$(compose_cmd)
    run_cmd "$base ps"
}

cmd_health() {
    local location="LOCAL"
    local host="localhost"
    $REMOTE && location="REMOTE ($SSH_HOST)"

    echo "=== Health Check [$location] ==="
    echo ""

    # Port mapping ต่างกันระหว่าง local กับ production (docker-compose.yml)
    # Production: gateway 4010->4000, 4011->4001
    # Local/Dev:  gateway 4000, 4001
    local gw_port="4000"
    if $REMOTE; then
        gw_port="4010"
    fi

    if $REMOTE; then
        run_cmd "
            check_health() {
                printf '  %-25s ' \"\$1:\"
                if curl -sf --max-time 3 \"\$2\" > /dev/null 2>&1; then
                    echo 'OK'
                else
                    echo 'UNREACHABLE'
                fi
            }
            check_health 'Gateway ($gw_port)'   'http://localhost:$gw_port/health'
            check_health 'Business (6020)'      'http://localhost:6020/health'
            check_health 'Cluster (6014)'       'http://localhost:6014/health'
            check_health 'Keycloak API (6013)'  'http://localhost:6013/health'
            check_health 'File (6007)'          'http://localhost:6007/health'
            check_health 'Notification (6006)'  'http://localhost:6006/health'
            check_health 'Cronjob (5012)'       'http://localhost:5012/health'
        "
    else
        check_health() {
            printf "  %-25s " "$1:"
            if curl -sf --max-time 3 "$2" > /dev/null 2>&1; then
                echo "OK"
            else
                echo "UNREACHABLE"
            fi
        }
        check_health "Gateway ($gw_port)"   "http://localhost:$gw_port/health"
        check_health "Business (6020)"      "http://localhost:6020/health"
        check_health "Cluster (6014)"       "http://localhost:6014/health"
        check_health "Keycloak API (6013)"  "http://localhost:6013/health"
        check_health "File (6007)"          "http://localhost:6007/health"
        check_health "Notification (6006)"  "http://localhost:6006/health"
        check_health "Cronjob (5012)"       "http://localhost:5012/health"
    fi
}

cmd_clean() {
    echo "=== Cleaning unused Docker resources ==="
    run_cmd "docker system prune -f"
    echo ""
    echo "=== Done ==="
}

# ───────────────────────────────────────────────────────────
# Main
# ───────────────────────────────────────────────────────────

case "${ACTION}" in
    status)     cmd_status ;;
    build)      cmd_build ;;
    up)         cmd_up ;;
    down)       cmd_down ;;
    restart)    cmd_restart ;;
    logs)       cmd_logs ;;
    ps)         cmd_ps ;;
    health)     cmd_health ;;
    clean)      cmd_clean ;;
    help|*)     show_usage ;;
esac
