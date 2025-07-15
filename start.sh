#!/bin/bash

# MagicUI Startup Script
echo "🚀 Starting MagicUI - Scraper Monitoring Application"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create backend .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/env.example backend/.env
    echo "✅ Environment file created. Please edit backend/.env with your configuration."
fi

# Check if user wants to run in development or production mode
echo ""
echo "Choose deployment mode:"
echo "1) Development (with hot reloading)"
echo "2) Production"
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo "🔧 Starting in DEVELOPMENT mode..."
        echo "📝 Note: This mode includes hot reloading for development"
        echo ""
        
        # Build and start development containers
        docker-compose -f docker-compose.dev.yml up --build
        
        echo ""
        echo "✅ Development environment started!"
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔌 Backend API: http://localhost:3001"
        echo "👤 Default login: admin@magicui.com / admin123"
        ;;
    2)
        echo "🚀 Starting in PRODUCTION mode..."
        echo ""
        
        # Build and start production containers
        docker-compose up --build -d
        
        echo ""
        echo "✅ Production environment started!"
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔌 Backend API: http://localhost:3001"
        echo "👤 Default login: admin@magicui.com / admin123"
        echo ""
        echo "📊 View logs: docker-compose logs -f"
        echo "🛑 Stop services: docker-compose down"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 MagicUI is ready to use!"
echo "📚 For more information, see README.md" 