@echo off
echo 🚀 Starting MagicUI - Scraper Monitoring Application
echo ==================================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create backend .env file if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating backend environment file...
    copy backend\env.example backend\.env
    echo ✅ Environment file created. Please edit backend\.env with your configuration.
)

echo.
echo Choose deployment mode:
echo 1) Development (with hot reloading)
echo 2) Production
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo 🔧 Starting in DEVELOPMENT mode...
    echo 📝 Note: This mode includes hot reloading for development
    echo.
    
    REM Build and start development containers
    docker-compose -f docker-compose.dev.yml up --build
    
    echo.
    echo ✅ Development environment started!
    echo 🌐 Frontend: http://localhost:3000
    echo 🔌 Backend API: http://localhost:3001
    echo 👤 Default login: admin@magicui.com / admin123
) else if "%choice%"=="2" (
    echo 🚀 Starting in PRODUCTION mode...
    echo.
    
    REM Build and start production containers
    docker-compose up --build -d
    
    echo.
    echo ✅ Production environment started!
    echo 🌐 Frontend: http://localhost:3000
    echo 🔌 Backend API: http://localhost:3001
    echo 👤 Default login: admin@magicui.com / admin123
    echo.
    echo 📊 View logs: docker-compose logs -f
    echo 🛑 Stop services: docker-compose down
) else (
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo 🎉 MagicUI is ready to use!
echo 📚 For more information, see README.md
pause 