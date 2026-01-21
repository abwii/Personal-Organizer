#!/bin/bash

echo "🚀 Starting Personal Organizer Application..."
echo ""

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker compose down

# Build and start all services
echo "🔨 Building and starting services..."
docker compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 5

# Check status
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "✅ Application should be running!"
echo ""
echo "📍 URLs:"
echo "   - Frontend: http://localhost:4200"
echo "   - Backend API: http://localhost:3000"
echo "   - MongoDB: localhost:27017"
echo ""
echo "📝 To view logs:"
echo "   - Backend: docker compose logs -f backend"
echo "   - Frontend: docker compose logs -f frontend"
echo "   - MongoDB: docker compose logs -f mongodb"
echo ""
echo "🛑 To stop: docker compose down"
