#!/bin/bash

# GoodPawies Setup Script
# NOTE: Use 'bash setup.sh' instead of 'sh setup.sh' for proper functionality
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() { echo -e "${BLUE}$1${NC}"; }

show_help() {
    echo "🐾 GoodPawies Setup Script"
    echo "=========================="
    echo ""
    echo "Usage: setup.sh [--npm] [--database] [--update] [--docker] [--test] [--help]"
    echo ""
    echo "Options:"
    echo "  --npm        Install npm dependencies for all components"
    echo "  --database   Fresh database setup (drops all, recreates container & DB)"
    echo "  --update     Update system packages"
    echo "  --docker     Install/upgrade Docker and update images"
    echo "  --test       Test current installation without making changes"
    echo "  --help, -h   Show this help message"
    echo "  (no args)    Run full setup (npm + database)"
    echo ""
}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

run_npm() {
    print_header "📦 Installing Node.js Dependencies"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_status "Node.js version check passed: $(node -v)"
    print_status "npm version: $(npm -v)"
    
    print_status "Installing root dependencies..."
    npm install
    
    print_status "Installing server dependencies..."
    cd server && npm install && cd ..
    
    print_status "Installing client dependencies..."
    cd client && npm install && cd ..
    
    mkdir -p server/temp server/logs
    
    if [ ! -f "server/.env" ]; then
        if [ -f "server/.env.example" ]; then
            print_warning ".env file not found. Creating from .env.example..."
            cp server/.env.example server/.env
            print_status "server/.env file created"
            print_warning "Please edit server/.env with your configuration"
        else
            print_error "No .env.example found in server directory"
            exit 1
        fi
    fi
    
    print_status "✅ All dependencies installed successfully!"
}

run_database() {
    print_header "🗄️  Fresh Database Setup"
    
    DB_CONTAINER_NAME="goodpawies-mariadb"
    DB_VOLUME_NAME="goodpawiesui_mariadb-data"
    DB_USER="goodpawiesuser"
    DB_PASS="goodpawiespass"
    DB_NAME="goodpawiesdb"
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found in current directory"
        exit 1
    fi
    
    if [ ! -f "database/setup.sql" ]; then
        print_error "database/setup.sql not found"
        exit 1
    fi
    print_status "✅ Found: setup.sql"

    print_status "Starting fresh database setup..."

    if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
        print_status "Stopping existing MariaDB container..."
        docker stop $DB_CONTAINER_NAME
    fi

    if [ "$(docker ps -aq -f name=$DB_CONTAINER_NAME)" ]; then
        print_status "Removing existing MariaDB container..."
        docker rm $DB_CONTAINER_NAME
    fi

    if docker volume ls | grep -q $DB_VOLUME_NAME; then
        print_status "Removing existing MariaDB volume..."
        docker volume rm $DB_VOLUME_NAME 2>/dev/null || true
    fi

    print_status "Creating fresh MariaDB container..."
    if ! docker compose up -d; then
        print_error "Failed to start Docker containers"
        exit 1
    fi
    
    sleep 5
    if ! docker ps | grep -q $DB_CONTAINER_NAME; then
        print_error "MariaDB container failed to start"
        exit 1
    fi

    print_status "Waiting for MariaDB to be ready..."
    for i in {1..30}; do
        if docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS -e "SELECT 1;" >/dev/null 2>&1; then
            print_status "MariaDB is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "MariaDB failed to start within 30 seconds"
            exit 1
        fi
        echo -n "."
        sleep 1
    done
    echo ""

    print_status "Running database setup..."
    if docker exec -i $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME < "database/setup.sql"; then
        print_status "✅ Database setup completed successfully!"
    else
        print_error "❌ Failed to execute setup.sql"
        exit 1
    fi

    print_status "Validating database setup..."
    REQUIRED_TABLES=("users" "user_info" "user_sessions" "refresh_tokens" "pets" "pets_types" "pets_breed")
    for table in "${REQUIRED_TABLES[@]}"; do
        if docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES LIKE '$table';" | grep -q "$table"; then
            print_status "✅ Table '$table' exists"
        else
            print_error "❌ Table '$table' missing"
            exit 1
        fi
    done

    REQUIRED_PROCEDURES=("sp_register_user" "sp_authenticate_user" "sp_validate_user")
    for proc in "${REQUIRED_PROCEDURES[@]}"; do
        if docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SHOW PROCEDURE STATUS WHERE Name='$proc';" | grep -q "$proc"; then
            print_status "✅ Stored procedure '$proc' exists"
        else
            print_warning "⚠️  Stored procedure '$proc' missing"
        fi
    done

    print_status "✅ Database setup completed!"
    print_status "Database URL: mariadb://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME"
}

run_update() {
    print_header "🔄 System Update"
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_status "✅ System updated!"
}

run_docker() {
    print_header "🐳 Docker Setup"
    
    if ! command -v docker >/dev/null 2>&1; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com | sudo sh
        sudo usermod -aG docker $USER
        print_warning "Please log out and log back in for docker group changes"
    else
        print_status "✅ Docker is already installed"
    fi
    
    if [ -f "docker-compose.yml" ]; then
        docker compose pull
        print_status "✅ Docker images updated!"
    fi
}

run_test() {
    print_header "🧪 Testing Installation"
    
    REQUIRED_FILES=("package.json" "docker-compose.yml" "database/setup.sql")
    REQUIRED_DIRS=("client" "server" "database")
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            print_status "✅ Found: $file"
        else
            print_error "❌ Missing: $file"
        fi
    done
    
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            print_status "✅ Found directory: $dir"
        else
            print_error "❌ Missing directory: $dir"
        fi
    done
    
    if command -v node >/dev/null 2>&1; then
        print_status "✅ Node.js: $(node -v)"
    else
        print_error "❌ Node.js not installed"
    fi
    
    if command -v docker >/dev/null 2>&1; then
        print_status "✅ Docker installed"
        
        DB_CONTAINER_NAME="goodpawies-mariadb"
        if docker ps | grep -q $DB_CONTAINER_NAME; then
            print_status "✅ MariaDB container is running"
            
            DB_USER="goodpawiesuser"
            DB_PASS="goodpawiespass"
            DB_NAME="goodpawiesdb"
            
            if docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS -e "USE $DB_NAME;" 2>/dev/null; then
                print_status "✅ Database connection successful"
            else
                print_warning "⚠️  Cannot connect to database"
            fi
        else
            print_warning "⚠️  MariaDB container not running"
        fi
    else
        print_error "❌ Docker not installed"
    fi
    
    if [ -f "server/.env" ]; then
        print_status "✅ server/.env exists"
    else
        print_warning "⚠️  server/.env not found"
    fi
    
    print_status "🧪 Test completed!"
}

check_prerequisites() {
    print_header "🔍 Checking Prerequisites"
    
    if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ] || [ ! -d "database" ]; then
        print_error "Please run from project root directory"
        exit 1
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed!"
        exit 1
    fi
    print_status "✅ npm is installed"

    if [ "$1" = "--database" ] || [ "$1" = "--docker" ] || [ -z "$1" ]; then
        if ! command -v docker >/dev/null 2>&1; then
            print_error "Docker is not installed!"
            exit 1
        fi
        print_status "✅ Docker is installed"

        if ! docker info >/dev/null 2>&1; then
            print_error "Docker daemon is not running!"
            exit 1
        fi
        print_status "✅ Docker daemon is running"
    fi
}

main() {
    print_header "🐾 GoodPawies Setup Script"
    print_header "=========================="
    
    case "$1" in
        --npm)
            check_prerequisites "$1"
            run_npm
            ;;
        --database)
            check_prerequisites "$1"
            run_database
            ;;
        --update)
            run_update
            ;;
        --docker)
            check_prerequisites "$1"
            run_docker
            ;;
        --test)
            run_test
            ;;
        "")
            check_prerequisites "$1"
            run_npm
            run_database
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
    
    if [ "$1" != "--test" ]; then
        echo ""
        print_header "🎉 Setup Complete!"
        echo ""
        echo "🚀 Next steps:"
        echo "1. Review server/.env file"
        echo "2. Start development servers:"
        echo "   - Server: cd server && npm run dev"
        echo "   - Client: cd client && npm start"
        echo ""
        echo "📚 URLs:"
        echo "   - API: http://localhost:5000/api/health"
        echo "   - Client: http://localhost:3000"
        echo "   - phpMyAdmin: http://localhost:8080"
        print_status "Happy coding! 🐾"
    fi
}

main "$@"
