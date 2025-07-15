# MagicUI - Scraper Monitoring Application

A full-stack web application for monitoring and managing web scrapers with AI-powered code fixing capabilities.

## Features

- 🔐 **User Authentication** - Secure login/register with JWT
- 📊 **Monitor Management** - Add, edit, delete, and view scrapers
- 🤖 **AI Code Fixing** - OpenAI integration for automatic scraper code analysis and fixes
- 📈 **Real-time Monitoring** - Track scraper status and execution logs
- 🐳 **Docker Support** - Easy deployment with Docker and Docker Compose
- 💾 **SQLite Database** - Lightweight, file-based data storage

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Tailwind CSS
- Modern JavaScript (ES6+)

### Backend
- Node.js 18
- Express.js
- SQLite3
- JWT Authentication
- OpenAI API Integration
- Multer (file uploads)

### Infrastructure
- Docker & Docker Compose
- Nginx (production)
- Health checks
- Rate limiting

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key (optional, for AI features)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd magicui
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp backend/env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_PATH=./data/magicui.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# OpenAI Configuration (optional)
OPENAI_API_KEY=your-openai-api-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Run with Docker

#### Development Mode
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

#### Production Mode
```bash
# Start production environment
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### 4. Default Login

The application creates a default admin user:
- **Email**: `admin@magicui.com`
- **Password**: `admin123`

## Development Setup

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Initialize database
npm run init-db

# Start development server
npm run dev
```

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Monitors
- `GET /monitors` - Get all monitors for user
- `GET /monitors/:id` - Get specific monitor
- `POST /monitors` - Create new monitor
- `PUT /monitors/:id` - Update monitor
- `DELETE /monitors/:id` - Delete monitor
- `POST /monitors/:id/execute` - Execute monitor
- `GET /monitors/:id/logs` - Get monitor logs
- `GET /monitors/status/broken` - Get broken monitors
- `GET /monitors/stats/overview` - Get monitor statistics

### AI Features
- `POST /ai/analyze` - Analyze and fix scraper code
- `GET /ai/fixes/:monitorId` - Get AI fixes for monitor
- `POST /ai/apply-fix/:fixId` - Apply AI fix to monitor
- `POST /ai/test-url` - Test URL accessibility

### Health
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check

## Docker Commands

### Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Production
```bash
# Start production environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop production environment
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

### Database Management
```bash
# Initialize database manually
docker-compose exec backend npm run init-db

# Access database shell
docker-compose exec backend sqlite3 /app/data/magicui.db
```

## Project Structure

```
magicui/
├── backend/                 # Node.js backend
│   ├── database/           # Database initialization and models
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── scripts/            # Utility scripts
│   ├── data/               # SQLite database files
│   ├── uploads/            # Uploaded scraper files
│   ├── Dockerfile          # Production Dockerfile
│   ├── Dockerfile.dev      # Development Dockerfile
│   └── package.json        # Backend dependencies
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/           # API services
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── Dockerfile              # Frontend production Dockerfile
├── Dockerfile.dev          # Frontend development Dockerfile
├── docker-compose.yml      # Production Docker Compose
├── docker-compose.dev.yml  # Development Docker Compose
└── nginx.conf              # Nginx configuration
```

## Features in Detail

### Monitor Management
- Create monitors with target URLs and scraper code
- Upload JavaScript scraper files
- Execute monitors to test functionality
- View execution logs and status history
- Delete monitors when no longer needed

### AI Code Fixing
- Automatic analysis of broken scraper code
- OpenAI-powered code suggestions and fixes
- Side-by-side comparison of original and fixed code
- Apply fixes directly to monitors
- URL accessibility testing

### User Management
- Secure user registration and login
- JWT-based authentication
- User-specific monitor isolation
- Profile management

### Monitoring & Analytics
- Real-time monitor status tracking
- Execution time monitoring
- Success/failure rate statistics
- Detailed execution logs

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- SQL injection prevention
- File upload restrictions

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Reinitialize database
   docker-compose exec backend npm run init-db
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   # or
   netstat -tulpn | grep :3001
   ```

3. **Docker Build Issues**
   ```bash
   # Clean Docker cache
   docker system prune -a
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **OpenAI API Issues**
   - Ensure your API key is valid
   - Check API usage limits
   - Verify the key is set in environment variables

### Logs
```bash
# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs
3. Create an issue in the repository
