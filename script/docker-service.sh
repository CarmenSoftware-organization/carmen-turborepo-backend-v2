#!/bin/bash
#
# Docker Service Management — Carmen Webservice (43.209.126.252)
# ==============================================================
# จัดการ Docker daemon บน EC2 webservice server
#
# Usage:
#   ./docker-service.sh start|stop|restart|status
#

set -euo pipefail

SERVER="43.209.126.252"
SSH_KEY="$HOME/workspace/ssh/aws/script/ec2-webservice-bkk.pem"
SSH_USER="ec2-user"
SSH_CMD="ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SSH_USER}@${SERVER}"

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
        echo "Starting Docker on ${SERVER}..."
        ${SSH_CMD} "sudo systemctl start docker && echo 'Docker started successfully'"
        echo ""
        echo "Checking containers..."
        ${SSH_CMD} "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
        ;;

    stop)
        echo "Stopping Docker on ${SERVER}..."
        echo "WARNING: containers ทั้งหมดจะถูกหยุด"
        read -rp "ยืนยัน? (y/N): " confirm
        if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
            echo "ยกเลิก"
            exit 0
        fi
        ${SSH_CMD} "sudo systemctl stop docker && echo 'Docker stopped successfully'"
        ;;

    restart)
        echo "Restarting Docker on ${SERVER}..."
        ${SSH_CMD} "sudo systemctl restart docker && echo 'Docker restarted successfully'"
        echo ""
        echo "Waiting for containers to come back up..."
        sleep 5
        ${SSH_CMD} "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
        ;;

    status)
        echo "=== Docker Daemon Status on ${SERVER} ==="
        ${SSH_CMD} "sudo systemctl status docker --no-pager -l | head -15"
        echo ""
        echo "=== Running Containers ==="
        ${SSH_CMD} "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
        echo ""
        echo "=== Docker Disk Usage ==="
        ${SSH_CMD} "docker system df"
        ;;

    *)
        show_usage
        ;;
esac
