#!/bin/bash

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process using a port
kill_port_process() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process $pid using port $port"
        kill -9 $pid
        sleep 1  # Wait for process to fully terminate
    fi
}

# Function to gracefully stop containers
stop_containers() {
    echo "Stopping containers..."
    docker compose down
    echo "Containers stopped"
}

# Function to start containers with port management
start_containers() {
    local port=$1
    if check_port $port; then
        echo "Port $port is in use. Attempting to free it..."
        kill_port_process $port
    fi
    
    echo "Starting containers..."
    docker compose up --build
}

# Main execution
case "$1" in
    "start")
        start_containers 3000
        ;;
    "stop")
        stop_containers
        ;;
    "restart")
        stop_containers
        start_containers 3000
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac 