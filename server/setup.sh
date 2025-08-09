#!/bin/bash

# setup.sh - GoodPawies Server Setup Script
set -e

echo "🐾 GoodPawies Server Setup Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version check passed: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm version: $(npm -v)"

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install npm dependencies"
    exit 1
fi

print_status "Dependencies installed successfully"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_status ".env file created"
    print_warning "Please edit .env file with your configuration before starting the server"
else
    print_status ".env file already exists"
fi

# Check if MySQL is available
print_status "Checking MySQL connection..."

# Source .env file to get database credentials
if [ -f ".env" ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Set default values if not in .env
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-goodpawiesuser}
DB_PASSWORD=${DB_PASSWORD:-goodpawiespass}
DB_NAME=${DB_NAME:-goodpawiesdb}

# Test MySQL connection
mysql_test() {
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1
}

if mysql_test; then
    print_status "MySQL connection successful"
    
    # Ask if user wants to setup database
    read -p "Do you want to set up the database schema? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Setting up database schema..."
        
        # Create database if it doesn't exist
        mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
        
        # Run setup scripts
        if [ -f "../database/user_setup.sql" ]; then
            mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < ../database/user_setup.sql
            print_status "User setup script executed"
        else
            print_warning "user_setup.sql not found in ../database/"
        fi
        
        if [ -f "../database/access_setup.sql" ]; then
            mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < ../database/access_setup.sql
            print_status "Access setup script executed"
        else
            print_warning "access_setup.sql not found in ../database/"
        fi
        
        if [ -f "../database/enhanced_auth_setup.sql" ]; then
            mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < ../database/enhanced_auth_setup.sql
            print_status "Enhanced auth setup script executed"
        else
            print_warning "enhanced_auth_setup.sql not found in ../database/"
        fi
        
        print_status "Database setup completed"
    fi
else
    print_warning "Could not connect to MySQL with current credentials"
    print_warning "Please ensure MySQL is running and credentials in .env are correct"
    print_warning "You can run the database setup manually later"
fi

# Create temp directory
print_status "Creating temp directory for QR codes..."
mkdir -p temp

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# Security check
print_status "Performing security checks..."

# Check if default secrets are being used
if grep -q "your-super-secret" .env 2>/dev/null; then
    print_warning "Default JWT secrets detected in .env file!"
    print_warning "Please change JWT_SECRET and JWT_REFRESH_SECRET for production use"
fi

if grep -q "your-encryption-key" .env 2>/dev/null; then
    print_warning "Default encryption key detected in .env file!"
    print_warning "Please change ENCRYPTION_KEY for production use"
fi

# Check Node environment
NODE_ENV=$(grep "^NODE_ENV=" .env 2>/dev/null | cut -d'=' -f2 || echo "development")
if [ "$NODE_ENV" = "production" ]; then
    print_warning "Production environment detected"
    print_warning "Ensure all secrets are properly configured"
    print_warning "Enable HTTPS in production"
fi

print_status "Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Review and update .env file with your configuration"
echo "2. Ensure MySQL is running and accessible"
echo "3. Start the development server: npm run dev"
echo "4. Or start production server: npm start"
echo ""
echo "📚 API Documentation: Check README.md for endpoint details"
echo "🔧 Health Check: http://localhost:5000/api/health"
echo ""
print_status "Happy coding! 🐾"
