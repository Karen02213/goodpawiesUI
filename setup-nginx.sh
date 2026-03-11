#!/bin/bash

# GoodPawies Nginx Setup Script
echo "🚀 Setting up GoodPawies with Nginx and custom domain..."

# Check if running as root for some commands
if [ "$EUID" -ne 0 ]; then
    echo "Note: Some steps require sudo privileges"
fi
echo "apt install nginx -y"
echo "🌐 Verifying deployment targets..."
echo "   Frontend domain: goodpawies.dev"
echo "   API domain:      api.goodpawies.dev"
echo "   Ensure both DNS records point to this server before enabling the site."
echo "   Expected frontend build path on server: /var/www/goodpawiesUI/client/build"

# Copy nginx config
echo "📋 Setting up Nginx configuration..."
sudo cp nginx/goodpawies /etc/nginx/sites-available/goodpawies
sudo ln -sf /etc/nginx/sites-available/goodpawies /etc/nginx/sites-enabled/goodpawies
sudo rm -f /etc/nginx/sites-enabled/goodpawies.local
sudo rm -f /etc/nginx/sites-available/goodpawies.local

if [ ! -d "/var/www/goodpawiesUI/client/build" ]; then
    echo "⚠️  Frontend build directory not found at /var/www/goodpawiesUI/client/build"
    echo "   Build the client and deploy it to that path before reloading Nginx."
fi

# Test nginx config
echo "🔍 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded"
else
    echo "❌ Nginx configuration error"
    exit 1
fi

# Check if services are running
echo "🔍 Checking services..."

if pgrep -f "node.*index.js" > /dev/null; then
    echo "✅ Backend server is running"
else
    echo "⚠️  Backend server not running. Start with: cd server && npm start"
fi

if [ -f "/var/www/goodpawiesUI/client/build/index.html" ]; then
    echo "✅ Frontend build is present"
else
    echo "⚠️  Frontend build missing. Run: cd client && npm run build"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📍 Access your application at:"
echo "   Frontend: https://goodpawies.dev"
echo "   API:      https://api.goodpawies.dev"
echo "   Health:   https://api.goodpawies.dev/api/health"
echo ""
echo "🔧 Frontend deployment step:"
echo "   cd client && npm run build"
echo ""
echo "🧪 Test the setup:"
echo "   curl https://api.goodpawies.dev/api/health"
