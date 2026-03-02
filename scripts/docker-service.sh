#!/bin/bash
#
# Docker Service Management — Carmen Webservice EC2
# ===================================================
# จัดการ Docker daemon บน EC2 โดยตรง
#
# Usage:
#   ./docker-service.sh start|stop|restart|status
#

set -euo pipefail

ACTION="${1:-status}"

show_usage() {
    echo "Usage: $0 {start|stop|restart|status}"
    echo ""
    echo "  start    — Start Docker daemon"
    echo "  stop     — Stop Docker daemon (หยุด containers ทั้งหมด)"
    echo "  restart  — Restart Docker daemon"
    echo "  status   — แสดงสถานะ Docker daemon และ containers"
    exit 1
}

case "${ACTION}" in
    start)
        echo "Starting Docker..."
        sudo systemctl start docker && echo "Docker started successfully"
        echo ""
        echo "Checking containers..."
        docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
        ;;

    stop)
        echo "Stopping Docker..."
        echo "WARNING: containers ทั้งหมดจะถูกหยุด"
        read -rp "ยืนยัน? (y/N): " confirm
        if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
            echo "ยกเลิก"
            exit 0
        fi
        sudo systemctl stop docker && echo "Docker stopped successfully"
        ;;

    restart)
        echo "Restarting Docker..."
        sudo systemctl restart docker && echo "Docker restarted successfully"
        echo ""
        echo "Waiting for containers to come back up..."
        sleep 5
        docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
        ;;

    status)
        echo "=== Docker Daemon Status ==="
        sudo systemctl status docker --no-pager -l | head -15
        echo ""
        echo "=== Running Containers ==="
        docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
        echo ""
        echo "=== Docker Disk Usage ==="
        docker system df
        ;;

    *)
        show_usage
        ;;
esac
