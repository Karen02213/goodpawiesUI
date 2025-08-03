#!/bin/bash

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo "✅ All dependencies installed!"


echo "📦 Checking Docker database..."

# Check if container exists and is running
if [ "$(docker ps -q -f name=goodpawies-mysql)" ]; then
    echo "✅ MySQL container is already running!"
elif [ "$(docker ps -aq -f status=exited -f name=goodpawies-mysql)" ]; then
    echo "🔄 MySQL container exists but stopped. Starting..."
    docker start goodpawies-mysql
    echo "✅ MySQL container started!"
else
    echo "📦 Installing MySQL container..."
    sudo docker compose up -d
    echo "✅ MySQL container installed and started!"
fi
