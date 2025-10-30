#!/bin/bash

# Oakleaf PostgreSQL Docker Management Commands

CONTAINER_NAME="oakleaf-postgres"
DB_USER="oakleaf_user"
DB_NAME="oakleaf_funnel_db"

case "$1" in
    start)
        echo "🚀 Starting Oakleaf PostgreSQL..."
        docker start ${CONTAINER_NAME}
        echo "✅ Container started"
        ;;

    stop)
        echo "🛑 Stopping Oakleaf PostgreSQL..."
        docker stop ${CONTAINER_NAME}
        echo "✅ Container stopped"
        ;;

    restart)
        echo "🔄 Restarting Oakleaf PostgreSQL..."
        docker restart ${CONTAINER_NAME}
        echo "✅ Container restarted"
        ;;

    status)
        echo "📊 Container Status:"
        docker ps -a --filter name=${CONTAINER_NAME} --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        ;;

    logs)
        echo "📜 Container Logs (last 50 lines):"
        docker logs --tail 50 ${CONTAINER_NAME}
        ;;

    logs-follow)
        echo "📜 Following Container Logs (Ctrl+C to exit):"
        docker logs -f ${CONTAINER_NAME}
        ;;

    connect)
        echo "🔌 Connecting to PostgreSQL..."
        docker exec -it ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME}
        ;;

    backup)
        BACKUP_FILE="oakleaf_backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "💾 Creating backup: ${BACKUP_FILE}"
        docker exec ${CONTAINER_NAME} pg_dump -U ${DB_USER} ${DB_NAME} > ${BACKUP_FILE}
        echo "✅ Backup created: ${BACKUP_FILE}"
        ;;

    restore)
        if [ -z "$2" ]; then
            echo "❌ Usage: $0 restore <backup_file.sql>"
            exit 1
        fi
        echo "📥 Restoring from: $2"
        cat $2 | docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} ${DB_NAME}
        echo "✅ Restore completed"
        ;;

    clean)
        echo "🗑️  WARNING: This will delete the container and ALL data!"
        read -p "Are you sure? Type 'yes' to continue: " confirm
        if [ "$confirm" = "yes" ]; then
            docker stop ${CONTAINER_NAME} 2>/dev/null || true
            docker rm ${CONTAINER_NAME} 2>/dev/null || true
            docker volume rm oakleaf-postgres-data 2>/dev/null || true
            echo "✅ Container and data removed"
        else
            echo "❌ Cancelled"
        fi
        ;;

    stats)
        echo "📈 Container Stats:"
        docker stats ${CONTAINER_NAME} --no-stream
        ;;

    *)
        echo "Oakleaf PostgreSQL Docker Management"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Commands:"
        echo "  start        - Start the container"
        echo "  stop         - Stop the container"
        echo "  restart      - Restart the container"
        echo "  status       - Show container status"
        echo "  logs         - Show last 50 lines of logs"
        echo "  logs-follow  - Follow logs in real-time"
        echo "  connect      - Connect to PostgreSQL CLI"
        echo "  backup       - Create database backup"
        echo "  restore      - Restore from backup file"
        echo "  stats        - Show container resource usage"
        echo "  clean        - Remove container and data (WARNING!)"
        echo ""
        exit 1
        ;;
esac
