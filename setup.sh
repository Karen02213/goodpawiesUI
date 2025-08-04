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
if [ "$(sudo docker ps -q -f name=goodpawies-mysql)" ]; then
    echo "✅ MySQL container is already running!"
elif [ "$(sudo docker ps -aq -f status=exited -f name=goodpawies-mysql)" ]; then
    echo "🔄 MySQL container exists but stopped. Starting..."
    sudo docker start goodpawies-mysql
    echo "✅ MySQL container started!"
else
    echo "📦 Installing MySQL container..."
    sudo docker compose up -d
    echo "✅ MySQL container installed and started!"
fi


# docker exec -i goodpawies-mysql mysql -ugoodpawiesuser -pgoodpawiespass goodpawiesdb < /home/karen/documents/goodpawiesUI/database/setup.sql
echo "📦 Checking database setup..."
if sudo docker exec -i goodpawies-mysql mysql -ugoodpawiesuser -pgoodpawiespass goodpawiesdb -e "SHOW TABLES;" | grep -q "pets"; then
    echo "✅ Database is already set up!"
else
    echo "📦 Setting up database..."
    sudo docker exec -i goodpawies-mysql mysql -ugoodpawiesuser -pgoodpawiespass goodpawiesdb < database/user_setup.sql
    echo "✅ Database setup complete!"
fi
