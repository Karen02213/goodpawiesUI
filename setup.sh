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


echo "📦 docker database install"

docker compose up -d

echo "✅ docker mysql installed!"
