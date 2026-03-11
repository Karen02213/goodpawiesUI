
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
    echo "Usage: setup.sh [--npm] [--database] [--pets] [--update] [--docker] [--test] [--help]"
    echo ""
    echo "Options:"
    echo "  --npm        Install npm dependencies for all components"
    echo "  --database   Fresh database setup (drops volume, recreates container & DB)"
    echo "  --pets       Enhanced pet tables setup (pets, breeds, types, genders, sizes)"
    echo "  --update     Update system packages"
    echo "  --docker     Install/upgrade Docker and update images"
    echo "  --test       Test current installation without making changes"
    echo "  --help, -h   Show this help message"
    echo "  (no args)    Run full setup (npm + database + pets)"
    echo ""
    echo "Database setup includes:"
    echo "  - Removes existing volume and container"
    echo "  - Creates fresh MariaDB container"
    echo "  - Runs all SQL scripts"
    echo "  - Validates tables and stored procedures"
    echo ""
    echo "Enhanced pets setup includes:"
    echo "  - Creates enhanced pet tables with all fields"
    echo "  - Adds pet types, breeds, genders, and sizes"
    echo "  - Includes sample data for testing"
    echo ""
    echo "Test option checks:"
    echo "  - Prerequisites (Node.js, npm, Docker)"
    echo "  - File structure and SQL files"
    echo "  - Database connectivity (if running)"
    echo "  - Configuration files"
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
            print_warning "IMPORTANT: Change default secrets (JWT_SECRET, ENCRYPTION_KEY) for production!"
        else
            print_error "No .env.example found in server directory"
            print_error "Please create server/.env file manually with database configuration"
            exit 1
        fi
    else
        print_status "server/.env file already exists"
    fi
    
    print_status "✅ All dependencies installed successfully!"
}

run_database() {
    print_header "�️  Fresh Database Setup"
    # Database configuration
    DB_CONTAINER_NAME="goodpawies-mariadb"
    DB_VOLUME_NAME="goodpawiesui_mariadb-data"
    DB_USER="goodpawiesuser"
    DB_PASS="goodpawiespass"
    DB_NAME="goodpawiesdb"
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found in current directory"
        print_error "Please ensure you are running this script from the project root"
        exit 1
    fi

    print_status "Starting fresh database setup..."

    # Stop and remove existing container
    if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
        print_status "Stopping existing MariaDB container..."
        docker stop $DB_CONTAINER_NAME
    fi

    if [ "$(docker ps -aq -f name=$DB_CONTAINER_NAME)" ]; then
        print_status "Removing existing MariaDB container..."
        docker rm $DB_CONTAINER_NAME
    fi

    # Remove existing volume
    if docker volume ls | grep -q $DB_VOLUME_NAME; then
        print_status "Removing existing MariaDB volume..."
        docker volume rm $DB_VOLUME_NAME 2>/dev/null || true
    fi

    # Create fresh container
    print_status "Creating fresh MariaDB container..."
    if ! docker compose up -d; then
        print_error "Failed to start Docker containers"
        print_error "Please check docker-compose.yml and try again"
        exit 1
    fi
    
    # Verify container is running
    sleep 5
    if ! docker ps | grep -q $DB_CONTAINER_NAME; then
        print_error "MariaDB container failed to start"
        print_error "Please check Docker logs: docker logs $DB_CONTAINER_NAME"
        exit 1
    fi

    # Wait for MariaDB to be ready
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

    # Run SQL scripts
    print_status "Running SQL setup scripts..."

    # Array of SQL files in order
    SQL_FILES=(
        "database/user_setup.sql"
        "database/enhanced_auth_setup.sql"
        "database/access_setup.sql"
        "database/social_media_setup.sql"
    )

    for sql_file in "${SQL_FILES[@]}"; do
        print_status "Running $(basename $sql_file)..."
        if docker exec -i $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME < "$sql_file"; then
            print_status "✅ $(basename $sql_file) executed successfully"
        else
            print_error "❌ Failed to execute $(basename $sql_file)"
            print_error "Please check the SQL file for syntax errors"
            exit 1
        fi
    done

    # Validate database setup
    print_status "Validating database setup..."

    # Check required tables
    REQUIRED_TABLES=("users" "user_info" "user_sessions" "refresh_tokens" "cookies" "tokens")
    for table in "${REQUIRED_TABLES[@]}"; do
        if docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES LIKE '$table';" | grep -q "$table"; then
            print_status "✅ Table '$table' exists"
        else
            print_error "❌ Table '$table' missing"
            exit 1
        fi
    done

    # Check required stored procedures
    REQUIRED_PROCEDURES=("sp_register_user" "sp_login_user" "sp_get_user_profile")
    for proc in "${REQUIRED_PROCEDURES[@]}"; do
        if docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SHOW PROCEDURE STATUS WHERE Name='$proc';" | grep -q "$proc"; then
            print_status "✅ Stored procedure '$proc' exists"
        else
            print_warning "⚠️  Stored procedure '$proc' missing (may be optional)"
        fi
    done

    print_status "✅ Database setup completed successfully!"
    print_status "Database URL: mariadb://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME"
}

run_enhanced_pets() {
    print_header "🐾 Enhanced Pet Database Setup"
    
    # Database configuration (use Docker container)
    DB_CONTAINER_NAME="goodpawies-mariadb"
    DB_USER="goodpawiesuser"
    DB_PASS="goodpawiespass"
    DB_NAME="goodpawiesdb"

    print_status "Setting up enhanced pet database..."
    
    # Check if enhanced pets SQL file exists
    if [ ! -f "database/enhanced_pets_setup.sql" ]; then
        print_error "❌ Enhanced pets SQL file not found: database/enhanced_pets_setup.sql"
        exit 1
    fi

    # Check if container is running
    if ! docker ps | grep -q $DB_CONTAINER_NAME; then
        print_error "MariaDB container '$DB_CONTAINER_NAME' is not running!"
        print_error "Please run: bash setup.sh --database first"
        exit 1
    fi

    print_status "MariaDB container is running"

    # Test database connection
    print_status "Testing database connection..."
    if ! docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS -e "USE $DB_NAME;" 2>/dev/null; then
        print_error "Cannot connect to database '$DB_NAME' in container"
        print_error "Please ensure the database was set up correctly"
        exit 1
    fi

    print_status "✅ Connected to database successfully"
    
    # Check if basic tables exist (from user_setup.sql)
    print_status "Validating prerequisite tables..."
    PREREQUISITE_TABLES=("users" "user_info")
    for table in "${PREREQUISITE_TABLES[@]}"; do
        if ! docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES LIKE '$table';" | grep -q "$table"; then
            print_error "❌ Prerequisite table '$table' not found"
            print_error "Please run: bash setup.sh --database first"
            exit 1
        fi
        print_status "✅ Prerequisite table '$table' exists"
    done

    # Run the enhanced pets setup
    print_status "Running enhanced pets database setup..."
    if docker exec -i $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME < "database/enhanced_pets_setup.sql"; then
        print_status "✅ Enhanced pets database setup completed successfully!"
        echo ""
        print_status "📋 Created/Updated tables:"
        print_status "  - pets_types (with sample data: Dog, Cat, Bird, Rabbit, Fish, Hamster)"
        print_status "  - pets_breed (with enhanced breed data)"
        print_status "  - pets_gender (Macho, Hembra)"
        print_status "  - pets_size (Pequeño, Mediano, Grande)"
        print_status "  - pets (with enhanced fields: color, age, gender, size, vaccinated, sterilized)"
        print_status "  - pets_images (unchanged)"
        echo ""
        
        # Validate enhanced tables
        print_status "Validating enhanced pet tables..."
        ENHANCED_TABLES=("pets_types" "pets_breed" "pets_gender" "pets_size" "pets")
        for table in "${ENHANCED_TABLES[@]}"; do
            if docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES LIKE '$table';" | grep -q "$table"; then
                print_status "✅ Table '$table' exists"
            else
                print_error "❌ Table '$table' missing"
                exit 1
            fi
        done
        
        # Check sample data
        TYPE_COUNT=$(docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SELECT COUNT(*) FROM pets_types WHERE b_active=1;" -N 2>/dev/null || echo "0")
        BREED_COUNT=$(docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SELECT COUNT(*) FROM pets_breed WHERE b_active=1;" -N 2>/dev/null || echo "0")
        USER_COUNT=$(docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SELECT COUNT(*) FROM users WHERE b_active=1;" -N 2>/dev/null || echo "0")
        PET_COUNT=$(docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SELECT COUNT(*) FROM pets WHERE b_active=1;" -N 2>/dev/null || echo "0")
        
        print_status "✅ Pet types loaded: $TYPE_COUNT"
        print_status "✅ Pet breeds loaded: $BREED_COUNT"
        print_status "✅ Users available: $USER_COUNT"
        print_status "✅ Sample pets created: $PET_COUNT"
        
        print_status "🎉 The enhanced pet registration system is ready!"
    else
        print_error "❌ Failed to run enhanced pets database setup"
        print_error "Please check the SQL file for syntax errors"
        exit 1
    fi
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

run_test() {
    print_header "🧪 Testing Current Installation"
    
    # Test project structure
    print_status "Testing project structure..."
    REQUIRED_FILES=("package.json" "docker-compose.yml" "setup.sh")
    REQUIRED_DIRS=("client" "server" "database" "nginx")
    
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
    
    # Test SQL files
    print_status "Testing SQL files..."
    SQL_FILES=(
        "database/user_setup.sql"
        "database/enhanced_auth_setup.sql"
        "database/access_setup.sql"
        "database/social_media_setup.sql"
        "database/enhanced_pets_setup.sql"
    )
    
    for sql_file in "${SQL_FILES[@]}"; do
        if [ -f "$sql_file" ]; then
            print_status "✅ Found: $(basename $sql_file)"
        else
            print_error "❌ Missing: $sql_file"
        fi
    done
    
    # Test prerequisites
    print_status "Testing prerequisites..."
    
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node -v)
        print_status "✅ Node.js: $NODE_VERSION"
    else
        print_error "❌ Node.js not installed"
    fi
    
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm -v)
        print_status "✅ npm: $NPM_VERSION"
    else
        print_error "❌ npm not installed"
    fi
    
    if command -v docker >/dev/null 2>&1; then
        DOCKER_VERSION=$(docker --version)
        print_status "✅ Docker: $DOCKER_VERSION"
        
        # Test Docker daemon
        if docker info >/dev/null 2>&1; then
            print_status "✅ Docker daemon is running"
            
            # Test if MariaDB container exists
            DB_CONTAINER_NAME="goodpawies-mariadb"
            if docker ps | grep -q $DB_CONTAINER_NAME; then
                print_status "✅ MariaDB container is running"
                
                # Test database connectivity
                DB_USER="goodpawiesuser"
                DB_PASS="goodpawiespass"
                DB_NAME="goodpawiesdb"
                
                if docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS -e "USE $DB_NAME; SELECT 'Database connection successful' as status;" 2>/dev/null; then
                    print_status "✅ Database connection successful"
                    
                    # Test key tables
                    KEY_TABLES=("users" "pets" "pets_types" "pets_breed")
                    for table in "${KEY_TABLES[@]}"; do
                        if docker exec $DB_CONTAINER_NAME mariadb -u$DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES LIKE '$table';" 2>/dev/null | grep -q "$table"; then
                            print_status "✅ Table exists: $table"
                        else
                            print_warning "⚠️  Table missing: $table"
                        fi
                    done
                else
                    print_warning "⚠️  Cannot connect to database"
                fi
            elif docker ps -a | grep -q $DB_CONTAINER_NAME; then
                print_warning "⚠️  MariaDB container exists but is not running"
            else
                print_warning "⚠️  MariaDB container not found"
            fi
        else
            print_error "❌ Docker daemon not running"
        fi
    else
        print_error "❌ Docker not installed"
    fi
    
    # Test configuration files
    print_status "Testing configuration files..."
    
    if [ -f "server/.env" ]; then
        print_status "✅ server/.env exists"
        
        # Check for default secrets
        if grep -q "your-super-secret\|your-encryption-key\|change-me" server/.env 2>/dev/null; then
            print_warning "⚠️  Default secrets detected in server/.env"
        else
            print_status "✅ server/.env appears to be configured"
        fi
    else
        print_warning "⚠️  server/.env not found"
    fi
    
    if [ -f "server/.env.example" ]; then
        print_status "✅ server/.env.example exists"
    else
        print_error "❌ server/.env.example not found"
    fi
    
    # Test package.json files
    print_status "Testing package files..."
    
    if [ -f "server/package.json" ]; then
        print_status "✅ server/package.json exists"
    else
        print_error "❌ server/package.json not found"
    fi
    
    if [ -f "client/package.json" ]; then
        print_status "✅ client/package.json exists"
    else
        print_error "❌ client/package.json not found"
    fi
    
    # Test node_modules
    if [ -d "server/node_modules" ]; then
        print_status "✅ server/node_modules exists"
    else
        print_warning "⚠️  server/node_modules not found - run: bash setup.sh --npm"
    fi
    
    if [ -d "client/node_modules" ]; then
        print_status "✅ client/node_modules exists"
    else
        print_warning "⚠️  client/node_modules not found - run: bash setup.sh --npm"
    fi
    
    print_status "🧪 Test completed!"
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
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ] || [ ! -d "database" ]; then
        print_error "This doesn't appear to be the GoodPawies project root directory"
        print_error "Please run this script from the project root where package.json, client/, server/, and database/ exist"
        exit 1
    fi
    
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
        
        # Check if Docker daemon is running
        if ! docker info >/dev/null 2>&1; then
            print_error "Docker daemon is not running!"
            print_error "Please start Docker service: sudo systemctl start docker"
            exit 1
        fi
        print_status "✅ Docker daemon is running"
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
        --pets)
            run_enhanced_pets
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
            run_enhanced_pets
            run_security_checks
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
    
    # Final success message
    if [ "$1" != "--test" ]; then
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
        echo "   - API Health Check: https://api.goodpawies.dev/api/health"
        echo "   - Client App: https://goodpawies.dev"
        echo "   - Pet Registration: https://goodpawies.dev/agregar-mascota"
        echo "   - Database: mariadb://goodpawiesuser:goodpawiespass@localhost:3306/goodpawiesdb"
        echo "   - phpMyAdmin: http://localhost:8080"
        echo ""
        echo "🐾 Pet API Endpoints:"
        echo "   - GET /api/pets/types - Get all pet types"
        echo "   - GET /api/pets/breeds - Get all breeds"
        echo "   - GET /api/pets/genders - Get all genders"
        echo "   - GET /api/pets/sizes - Get all sizes"
        echo ""
        print_status "Happy coding! 🐾"
        echo ""
        print_status "💡 To test your installation, run: bash setup.sh --test"
    fi
}

# Run main function with all arguments
main "$@"
