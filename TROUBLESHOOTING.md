# Troubleshooting Guide

## Authentication Issues

### Problem: "Access token required" error
**Symptoms:**
- Frontend shows "Error Loading Monitors"
- API calls return 401 Unauthorized
- Postman requests fail with authentication errors

**Solution:**
1. **Clear browser cache and localStorage:**
   ```javascript
   // In browser console
   localStorage.clear();
   ```

2. **Login with correct credentials:**
   - Email: `admin@magicui.com`
   - Password: `admin123`

3. **Check if backend is running:**
   ```bash
   # Check if backend container is running
   docker-compose ps
   
   # Check backend logs
   docker-compose logs backend
   ```

4. **Verify backend health:**
   ```bash
   curl http://localhost:3001/health
   ```

### Problem: Login not working
**Symptoms:**
- Login form submits but doesn't redirect
- No error message shown
- User stays on login page

**Solution:**
1. **Check browser console for errors**
2. **Verify backend is accessible:**
   ```bash
   # Test login endpoint directly
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@magicui.com","password":"admin123"}'
   ```

3. **Check CORS settings in backend**
4. **Verify environment variables are set correctly**

## API Issues

### Problem: Monitors not loading
**Symptoms:**
- Dashboard shows loading spinner indefinitely
- "Failed to load monitors" error
- Empty monitors list

**Solution:**
1. **Check authentication token:**
   ```javascript
   // In browser console
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', localStorage.getItem('user'));
   ```

2. **Test API directly:**
   ```bash
   # Get token first
   TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@magicui.com","password":"admin123"}' | jq -r '.token')
   
   # Test monitors endpoint
   curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/monitors
   ```

3. **Check database:**
   ```bash
   # Access database
   docker-compose exec backend sqlite3 /app/data/magicui.db
   
   # Check users table
   SELECT * FROM users;
   
   # Check monitors table
   SELECT * FROM monitors;
   ```

### Problem: Docker containers not starting
**Symptoms:**
- `docker-compose up` fails
- Port conflicts
- Build errors

**Solution:**
1. **Stop existing containers:**
   ```bash
   docker-compose down
   docker system prune -f
   ```

2. **Check port availability:**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3001
   lsof -i :3000
   ```

3. **Rebuild containers:**
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

## Development Issues

### Problem: Hot reloading not working
**Symptoms:**
- Code changes don't reflect in browser
- Manual refresh required

**Solution:**
1. **Use development mode:**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Check volume mounts:**
   ```bash
   docker-compose -f docker-compose.dev.yml config
   ```

3. **Restart development containers:**
   ```bash
   docker-compose -f docker-compose.dev.yml restart
   ```

### Problem: Database issues
**Symptoms:**
- "Database error" messages
- Data not persisting
- SQL errors

**Solution:**
1. **Reinitialize database:**
   ```bash
   docker-compose exec backend npm run init-db
   ```

2. **Check database file:**
   ```bash
   docker-compose exec backend ls -la /app/data/
   ```

3. **Backup and restore:**
   ```bash
   # Backup
   docker-compose exec backend cp /app/data/magicui.db /app/data/magicui.db.backup
   
   # Restore
   docker-compose exec backend cp /app/data/magicui.db.backup /app/data/magicui.db
   ```

## Environment Issues

### Problem: Environment variables not working
**Symptoms:**
- API calls fail
- Wrong URLs
- Missing configuration

**Solution:**
1. **Check environment file:**
   ```bash
   # Verify .env file exists
   ls -la backend/.env
   
   # Check content
   cat backend/.env
   ```

2. **Set required variables:**
   ```bash
   # Copy example file
   cp backend/env.example backend/.env
   
   # Edit with your values
   nano backend/.env
   ```

3. **Restart containers:**
   ```bash
   docker-compose down
   docker-compose up
   ```

## Testing

### Run API Tests
```bash
# Install node-fetch if needed
npm install node-fetch

# Run test script
node test-api.js
```

### Manual Testing Steps
1. **Health Check:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@magicui.com","password":"admin123"}'
   ```

3. **Get Monitors (with token):**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/monitors
   ```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Access token required" | Missing JWT token | Login first, check localStorage |
| "Invalid token" | Expired or invalid JWT | Re-login, clear localStorage |
| "Database error" | SQLite issues | Reinitialize database |
| "CORS error" | Cross-origin issues | Check CORS settings in backend |
| "Port already in use" | Port conflict | Stop other services, change ports |
| "Build failed" | Docker build issues | Check Dockerfile, rebuild |

## Getting Help

1. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

2. **Verify all services:**
   ```bash
   docker-compose ps
   ```

3. **Test individual components:**
   - Backend: `curl http://localhost:3001/health`
   - Frontend: Open http://localhost:3000

4. **Reset everything:**
   ```bash
   docker-compose down -v
   docker system prune -a
   ./start.bat  # or start.sh
   ``` 