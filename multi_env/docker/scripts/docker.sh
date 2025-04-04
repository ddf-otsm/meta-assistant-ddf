#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/../../.." || exit

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Help function
show_help() {
    echo -e "${GREEN}Docker Management Script${NC}"
    echo
    echo "Usage: $0 COMMAND [OPTIONS]"
    echo
    echo "Commands:"
    echo -e "  ${YELLOW}start${NC}         Start containers"
    echo -e "  ${YELLOW}stop${NC}          Stop containers"
    echo -e "  ${YELLOW}restart${NC}       Restart containers"
    echo -e "  ${YELLOW}logs${NC}          View container logs"
    echo -e "  ${YELLOW}ps${NC}            List containers"
    echo -e "  ${YELLOW}test${NC}          Run container health checks"
    echo -e "  ${YELLOW}clean${NC}         Clean up Docker resources"
    echo -e "  ${YELLOW}status${NC}        Show containers status"
    echo
    echo "Options for 'start':"
    echo "  -d, --detached    Run in detached mode"
    echo "  -b, --build       Build images before starting"
    echo
    echo "Options for 'stop':"
    echo "  -v, --volumes     Remove volumes"
    echo "  -a, --all         Remove all containers (including orphans)"
    echo
    echo "Options for 'logs':"
    echo "  -f, --follow      Follow log output"
    echo "  -t, --tail N      Show last N lines"
    echo "  -s, --service S   Show logs for specific service"
    echo
    echo "Options for 'test':"
    echo "  -s, --service S   Test specific service"
    echo "  -a, --all         Test all services"
    echo
    echo "Examples:"
    echo "  $0 start -d -b    Start containers in detached mode with build"
    echo "  $0 stop -v        Stop containers and remove volumes"
    echo "  $0 logs -f -s app Follow logs for app service"
    echo "  $0 test -a        Run health checks for all services"
    echo "  $0 status         Show status of all containers"
}

# Function to check container health
check_container_health() {
    local service=$1
    local container_id=$(docker-compose -f config/docker/docker-compose.yml ps -q $service)
    
    if [ -z "$container_id" ]; then
        echo -e "${RED}Container for $service is not running${NC}"
        return 1
    fi

    local health_status=$(docker inspect --format='{{.State.Health.Status}}' $container_id 2>/dev/null)
    
    if [ -z "$health_status" ]; then
        echo -e "${YELLOW}No health check defined for $service${NC}"
        return 0
    fi

    case $health_status in
        healthy)
            echo -e "${GREEN}$service is healthy${NC}"
            return 0
            ;;
        unhealthy)
            echo -e "${RED}$service is unhealthy${NC}"
            return 1
            ;;
        starting)
            echo -e "${YELLOW}$service health check is still running${NC}"
            return 0
            ;;
        *)
            echo -e "${YELLOW}Unknown health status for $service: $health_status${NC}"
            return 0
            ;;
    esac
}

# Function to show container status
show_status() {
    echo -e "${GREEN}Container Status:${NC}"
    $BASE_CMD ps
    echo
    echo -e "${GREEN}Resource Usage:${NC}"
    docker stats --no-stream $(docker-compose -f config/docker/docker-compose.yml ps -q)
}

# Check if command is provided
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

# Get the command
COMMAND=$1
shift

# Base docker-compose command
BASE_CMD="docker-compose -f config/docker/docker-compose.yml"

case $COMMAND in
    start)
        # Parse start options
        DETACHED=false
        BUILD=false

        while [[ $# -gt 0 ]]; do
            case $1 in
                -d|--detached)
                    DETACHED=true
                    shift
                    ;;
                -b|--build)
                    BUILD=true
                    shift
                    ;;
                *)
                    echo -e "${RED}Unknown option for start: $1${NC}"
                    show_help
                    exit 1
                    ;;
            esac
        done

        CMD="$BASE_CMD up"
        [ "$DETACHED" = true ] && CMD="$CMD -d"
        [ "$BUILD" = true ] && CMD="$CMD --build"
        ;;

    stop)
        # Parse stop options
        VOLUMES=false
        ALL=false

        while [[ $# -gt 0 ]]; do
            case $1 in
                -v|--volumes)
                    VOLUMES=true
                    shift
                    ;;
                -a|--all)
                    ALL=true
                    shift
                    ;;
                *)
                    echo -e "${RED}Unknown option for stop: $1${NC}"
                    show_help
                    exit 1
                    ;;
            esac
        done

        CMD="$BASE_CMD down"
        [ "$VOLUMES" = true ] && CMD="$CMD -v"
        [ "$ALL" = true ] && CMD="$CMD --remove-orphans"
        ;;

    restart)
        echo -e "${YELLOW}Restarting containers...${NC}"
        $BASE_CMD restart
        exit $?
        ;;

    logs)
        # Parse logs options
        FOLLOW=false
        TAIL="all"
        SERVICE=""

        while [[ $# -gt 0 ]]; do
            case $1 in
                -f|--follow)
                    FOLLOW=true
                    shift
                    ;;
                -t|--tail)
                    TAIL="$2"
                    shift 2
                    ;;
                -s|--service)
                    SERVICE="$2"
                    shift 2
                    ;;
                *)
                    echo -e "${RED}Unknown option for logs: $1${NC}"
                    show_help
                    exit 1
                    ;;
            esac
        done

        CMD="$BASE_CMD logs"
        [ "$FOLLOW" = true ] && CMD="$CMD -f"
        [ "$TAIL" != "all" ] && CMD="$CMD --tail=$TAIL"
        [ -n "$SERVICE" ] && CMD="$CMD $SERVICE"
        ;;

    ps)
        $BASE_CMD ps
        exit $?
        ;;

    test)
        # Parse test options
        SERVICE=""
        ALL=false

        while [[ $# -gt 0 ]]; do
            case $1 in
                -s|--service)
                    SERVICE="$2"
                    shift 2
                    ;;
                -a|--all)
                    ALL=true
                    shift
                    ;;
                *)
                    echo -e "${RED}Unknown option for test: $1${NC}"
                    show_help
                    exit 1
                    ;;
            esac
        done

        if [ "$ALL" = true ]; then
            echo -e "${GREEN}Testing all services...${NC}"
            services=$(docker-compose -f config/docker/docker-compose.yml config --services)
            for service in $services; do
                check_container_health $service
            done
        elif [ -n "$SERVICE" ]; then
            check_container_health $SERVICE
        else
            echo -e "${RED}Please specify a service (-s) or use -a for all services${NC}"
            exit 1
        fi
        exit 0
        ;;

    clean)
        echo -e "${YELLOW}Cleaning up Docker resources...${NC}"
        $BASE_CMD down -v --remove-orphans --rmi all
        exit $?
        ;;

    status)
        show_status
        exit $?
        ;;

    help|-h|--help)
        show_help
        exit 0
        ;;

    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        show_help
        exit 1
        ;;
esac

# Execute the command
echo -e "${GREEN}Running: $CMD${NC}"
$CMD 