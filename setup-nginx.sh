#!/bin/bash

# GoodPawies Nginx Setup Script
echo "🚀 Setting up GoodPawies with Nginx and custom domain..."

# Check if running as root for some commands
if [ "$EUID" -ne 0 ]; then
    echo "Note: Some steps require sudo privileges"
fi
echo "apt install nginx -y"
# Add goodpawies.local to hosts file
echo "📝 Adding goodpawies.local to /etc/hosts..."
if ! grep -q "goodpawies.local" /etc/hosts; then
    echo "127.0.0.1  goodpawies.local" | sudo tee -a /etc/hosts
    echo "✅ Added goodpawies.local to hosts file"
else
    echo "✅ goodpawies.local already in hosts file"
fi

# Copy nginx config
echo "📋 Setting up Nginx configuration..."
sudo cp nginx/goodpawies.local.conf /etc/nginx/sites-available/goodpawies.local
sudo ln -sf /etc/nginx/sites-available/goodpawies.local /etc/nginx/sites-enabled/

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

if pgrep -f "react-scripts start" > /dev/null; then
    echo "✅ React app is running"
else
    echo "⚠️  React app not running. Start with: cd client && npm start"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📍 Access your application at:"
echo "   Frontend: http://goodpawies.local"
echo "   API:      http://goodpawies.local/api"
echo "   Health:   http://goodpawies.local/api/health"
echo ""
echo "🔧 To start both services:"
echo "   npm run dev"
echo ""
echo "🧪 Test the setup:"
echo "   curl http://goodpawies.local/api/health"
