
#!/bin/bash

# GoodPawies Setup Script - Merged Version
# NOTE: Use 'bash setup.sh' instead of 'sh setup.sh' for proper functionality
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

show_help() {
    echo "🐾 GoodPawies Setup Script"
    echo "=========================="
    echo ""
    echo "Usage: setup.sh [--npm] [--database] [--update] [--docker] [--help]"
    echo ""
    echo "Options:"
    echo "  --npm        Install npm dependencies for all components"
    echo "  --database   Fresh database setup (drops volume, recreates container & DB)"
    echo "  --update     Update system packages"
    echo "  --docker     Install/upgrade Docker and update images"
    echo "  --help, -h   Show this help message"
    echo "  (no args)    Run full setup (npm + database)"
    echo ""
    echo "Database setup includes:"
    echo "  - Removes existing volume and container"
    echo "  - Creates fresh MySQL container"
    echo "  - Runs all SQL scripts"
    echo "  - Validates tables and stored procedures"
    echo ""
}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

run_npm() {
    print_header "📦 Installing Node.js Dependencies"
    
    # Check Node.js version
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
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install server dependencies
    print_status "Installing server dependencies..."
    cd server && npm install && cd ..
    
    # Install client dependencies
    print_status "Installing client dependencies..."
    cd client && npm install && cd ..
    
    # Create necessary directories
    print_status "Creating necessary directories..."
    mkdir -p server/temp
    mkdir -p server/logs
    
    # Check if .env file exists in server
    if [ ! -f "server/.env" ]; then
        if [ -f "server/.env.example" ]; then
            print_warning ".env file not found in server. Creating from .env.example..."
            cp server/.env.example server/.env
            print_status "server/.env file created"
            print_warning "Please edit server/.env file with your configuration"
        else
            print_warning "No .env.example found in server directory"
        fi
    else
        print_status "server/.env file already exists"
    fi
    
    print_status "✅ All dependencies installed successfully!"
}

run_database() {
    print_header "�️  Fresh Database Setup"
    
    # Database configuration
    DB_CONTAINER_NAME="goodpawies-mysql"
    DB_VOLUME_NAME="goodpawiesui_mysql-data"
    DB_USER="goodpawiesuser"
    DB_PASS="goodpawiespass"
    DB_NAME="goodpawiesdb"
    
    print_status "Starting fresh database setup..."
    
    # Stop and remove existing container
    if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
        print_status "Stopping existing MySQL container..."
        docker stop $DB_CONTAINER_NAME
    fi
    
    if [ "$(docker ps -aq -f name=$DB_CONTAINER_NAME)" ]; then
        print_status "Removing existing MySQL container..."
        docker rm $DB_CONTAINER_NAME
    fi
    
    # Remove existing volume
    if docker volume ls | grep -q $DB_VOLUME_NAME; then
        print_status "Removing existing MySQL volume..."
        docker volume rm $DB_VOLUME_NAME 2>/dev/null || true
    fi
    
    # Create fresh container
    print_status "Creating fresh MySQL container..."
    docker compose up -d
    
    # Wait for MySQL to be ready
    print_status "Waiting for MySQL to be ready..."
    for i in {1..30}; do
        if docker exec $DB_CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS -e "SELECT 1;" >/dev/null 2>&1; then
            print_status "MySQL is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "MySQL failed to start within 30 seconds"
            exit 1
        fi
        echo -n "."
        sleep 1
    done
    echo ""
    
    # Run SQL scripts
    print_status "Running SQL setup scripts..."
    
    # Array of SQL files in order
    SQL_FILES=(
        "database/user_setup.sql"
        "database/enhanced_auth_setup.sql"
        "database/social_media_setup.sql"
        "database/access_setup.sql"
    )
    
    for sql_file in "${SQL_FILES[@]}"; do
        if [ -f "$sql_file" ]; then
            print_status "Running $(basename $sql_file)..."
            if docker exec -i $DB_CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS $DB_NAME < "$sql_file"; then
                print_status "✅ $(basename $sql_file) executed successfully"
            else
                print_error "❌ Failed to execute $(basename $sql_file)"
                exit 1
            fi
        else
            print_warning "⚠️  SQL file not found: $sql_file"
        fi
    done
    
    # Validate database setup
    print_status "Validating database setup..."
    
    # Check required tables
    REQUIRED_TABLES=("users" "user_info" "user_sessions" "refresh_tokens" "cookies" "tokens")
    for table in "${REQUIRED_TABLES[@]}"; do
        if docker exec $DB_CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES LIKE '$table';" | grep -q "$table"; then
            print_status "✅ Table '$table' exists"
        else
            print_error "❌ Table '$table' missing"
            exit 1
        fi
    done
    
    # Check required stored procedures
    REQUIRED_PROCEDURES=("sp_register_user" "sp_login_user" "sp_get_user_profile")
    for proc in "${REQUIRED_PROCEDURES[@]}"; do
        if docker exec $DB_CONTAINER_NAME mysql -u$DB_USER -p$DB_PASS $DB_NAME -e "SHOW PROCEDURE STATUS WHERE Name='$proc';" | grep -q "$proc"; then
            print_status "✅ Stored procedure '$proc' exists"
        else
            print_warning "⚠️  Stored procedure '$proc' missing (may be optional)"
        fi
    done
    
    print_status "✅ Database setup completed successfully!"
    print_status "Database URL: mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME"
}

run_update() {
    print_header "🔄 System Update"
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_status "✅ System updated successfully!"
}

run_docker() {
    print_header "🐳 Docker Setup"
    print_status "Checking Docker installation..."
    
    if ! command -v docker >/dev/null 2>&1; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com | sudo sh
        print_status "✅ Docker installed!"
        
        # Add user to docker group
        print_status "Adding user to docker group..."
        sudo usermod -aG docker $USER
        print_warning "Please log out and log back in for docker group changes to take effect"
    else
        print_status "✅ Docker is already installed ($(docker --version))"
    fi
    
    # Update docker images
    print_status "Updating Docker images..."
    if [ -f "docker-compose.yml" ]; then
        docker compose pull
        print_status "✅ Docker images updated!"
    else
        print_warning "docker-compose.yml not found"
    fi
}

# Security and validation functions
run_security_checks() {
    print_header "🔒 Security Checks"
    
    # Check if server .env file has default secrets
    if [ -f "server/.env" ]; then
        if grep -q "your-super-secret\|your-encryption-key\|change-me" server/.env 2>/dev/null; then
            print_warning "Default secrets detected in server/.env file!"
            print_warning "Please change JWT_SECRET, JWT_REFRESH_SECRET, and ENCRYPTION_KEY for production use"
        else
            print_status "✅ No default secrets found in server/.env"
        fi
        
        # Check Node environment
        NODE_ENV=$(grep "^NODE_ENV=" server/.env 2>/dev/null | cut -d'=' -f2 || echo "development")
        if [ "$NODE_ENV" = "production" ]; then
            print_warning "Production environment detected"
            print_warning "Ensure all secrets are properly configured and HTTPS is enabled"
        else
            print_status "Development environment detected"
        fi
    else
        print_warning "server/.env file not found"
    fi
}

# Prerequisite checks
check_prerequisites() {
    print_header "🔍 Checking Prerequisites"
    
    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed!"
        printf "Do you want to install npm? (y/n): "
        read REPLY
        case "$REPLY" in
            [Yy]*)
                print_status "Installing npm..."
                curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
                sudo apt-get install -y nodejs
                print_status "✅ npm installed successfully!"
                ;;
            *)
                print_error "npm is required for this project. Exiting..."
                exit 1
                ;;
        esac
    else
        print_status "✅ npm is installed ($(npm --version))"
    fi

    # Check docker (only for database/docker operations)
    if [ "$1" = "--database" ] || [ "$1" = "--docker" ] || [ -z "$1" ]; then
        if ! command -v docker >/dev/null 2>&1; then
            if [ -x "/usr/bin/docker" ]; then
                export PATH=$PATH:/usr/bin
                print_status "✅ Docker found at /usr/bin/docker (added to PATH)"
            else
                print_error "Docker is not installed or not in PATH!"
                print_error "Please install Docker first: https://docs.docker.com/engine/install/"
                exit 1
            fi
        fi
        print_status "✅ Docker is installed ($(docker --version))"

        if ! groups $USER | grep -q docker; then
            print_warning "User $USER is not in the docker group!"
            print_status "Adding user to docker group..."
            sudo usermod -aG docker $USER
            print_status "✅ User added to docker group!"
            print_warning "Please log out and log back in for changes to take effect, then run this script again."
            exit 0
        else
            print_status "✅ User is in docker group - can run Docker without sudo"
        fi
    fi
}

# Main execution
main() {
    print_header "🐾 GoodPawies Setup Script"
    print_header "=========================="
    
    case "$1" in
        --npm)
            check_prerequisites "$1"
            run_npm
            run_security_checks
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
        "")
            check_prerequisites "$1"
            run_npm
            run_database
            run_security_checks
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
    
    # Final success message
    echo ""
    print_header "🎉 Setup Complete!"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Review and update server/.env file with your configuration"
    echo "2. Start the development servers:"
    echo "   - Server: cd server && npm run dev"
    echo "   - Client: cd client && npm start"
    echo "3. Or start production servers:"
    echo "   - Server: cd server && npm start"
    echo "   - Client: cd client && npm run build"
    echo ""
    echo "📚 Useful URLs:"
    echo "   - API Health Check: http://localhost:5000/api/health"
    echo "   - Client App: http://localhost:3000"
    echo "   - Database: mysql://goodpawiesuser:goodpawiespass@localhost:3306/goodpawiesdb"
    echo ""
    print_status "Happy coding! 🐾"
}

# Run main function with all arguments
main "$@"
