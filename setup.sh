
#!/bin/bash

show_help() {
    echo "Usage: $0 [--npm] [--database] [--update] [--docker]"
    echo "  --npm        Install npm dependencies only"
    echo "  --database   Setup database only"
    echo "  --update     Run apt update and upgrade"
    echo "  --docker     Install/upgrade Docker and update images"
    echo "  (no args)    Run full setup"
}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

run_npm() {
    echo "📦 Installing root dependencies..."
    npm install
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
    echo "✅ All dependencies installed!"
}

run_database() {
    echo "📦 Checking Docker database..."
    if [ "$(docker ps -q -f name=goodpawies-mysql)" ]; then
        echo "✅ MySQL container is already running!"
    elif [ "$(docker ps -aq -f status=exited -f name=goodpawies-mysql)" ]; then
        echo "🔄 MySQL container exists but stopped. Starting..."
        docker start goodpawies-mysql
        echo "✅ MySQL container started!"
    else
        echo "📦 Installing MySQL container..."
        docker compose up -d
        echo "✅ MySQL container installed and started!"
    fi
    echo "📦 Checking database setup..."
    if docker exec -i goodpawies-mysql mysql -ugoodpawiesuser -pgoodpawiespass goodpawiesdb -e "SHOW TABLES;" | grep -q "pets"; then
        echo "✅ Database is already set up!"
    else
        echo "📦 Setting up database..."
        docker exec -i goodpawies-mysql mysql -ugoodpawiesuser -pgoodpawiespass goodpawiesdb < database/user_setup.sql
        echo "✅ Database setup complete!"
    fi
}

run_update() {
    echo "🔄 Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    echo "✅ System updated!"
}

run_docker() {
    echo "🔄 Checking Docker installation..."
    if ! command -v docker >/dev/null 2>&1; then
        echo "📦 Installing Docker..."
        curl -fsSL https://get.docker.com | sudo sh
        echo "✅ Docker installed!"
    else
        echo "✅ Docker is already installed ($(docker --version))"
        echo "🔄 Updating Docker images..."
        docker compose pull
        echo "✅ Docker images updated!"
    fi
}

# Prerequisite checks (only for full setup or npm/database/docker)
if [ "$1" = "--npm" ] || [ "$1" = "--database" ] || [ "$1" = "--docker" ] || [ -z "$1" ]; then
    echo "🔍 Checking prerequisites..."
    if ! command -v npm >/dev/null 2>&1; then
        echo "❌ npm is not installed!"
        printf "Do you want to install npm? (y/n): "
        read REPLY
        case "$REPLY" in
            [Yy]*)
                echo "📦 Installing npm..."
                curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
                sudo apt-get install -y nodejs
                echo "✅ npm installed successfully!"
                ;;
            *)
                echo "❌ npm is required for this project. Exiting..."
                exit 1
                ;;
        esac
    else
        echo "✅ npm is installed ($(npm --version))"
    fi

    if ! command -v docker >/dev/null 2>&1; then
        if [ -x "/usr/bin/docker" ]; then
            export PATH=$PATH:/usr/bin
            echo "✅ Docker found at /usr/bin/docker (added to PATH)"
        else
            echo "❌ Docker is not installed or not in PATH!"
            echo "Please install Docker first: https://docs.docker.com/engine/install/"
            exit 1
        fi
    fi
    echo "✅ Docker is installed ($(docker --version))"

    if ! groups $USER | grep -q docker; then
        echo "⚠️  User $USER is not in the docker group!"
        echo "Adding user to docker group..."
        sudo usermod -aG docker $USER
        echo "✅ User added to docker group!"
        echo "⚠️  Please log out and log back in for changes to take effect, then run this script again."
        exit 0
    else
        echo "✅ User is in docker group - can run Docker without sudo"
    fi
fi

# Argument handling
case "$1" in
    --npm)
        run_npm
        ;;
    --database)
        run_database
        ;;
    --update)
        run_update
        ;;
    --docker)
        run_docker
        ;;
    "")
        run_npm
        run_database
        ;;
    *)
        show_help
        exit 1
        ;;
esac
