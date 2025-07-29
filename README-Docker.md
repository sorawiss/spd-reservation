# SSPD Reservation System - Docker Deployment Guide

This guide will help you deploy the SSPD Reservation System using Docker in production.

## 🐳 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 1GB of available RAM
- At least 2GB of available disk space

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd spd-reservation
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory with your Google API credentials:

```bash
# Create the .env file
cat > backend/.env << EOF
# Google API Service Account Credentials
GOOGLE_TYPE=service_account
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
GOOGLE_UNIVERSE_DOMAIN=googleapis.com
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SHEET_NAME=Bookings
EOF
```

### 3. Deploy with Docker Compose

#### Option A: Basic Deployment
```bash
# Build and start the application
docker-compose up --build -d

# Check the status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Option B: Production Deployment
```bash
# Deploy with production optimizations
docker-compose -f docker-compose.prod.yml up --build -d

# Check the status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Option C: Using the Deployment Script
```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### 4. Access the Application

Once deployed, you can access the application at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Nginx Proxy**: http://localhost:80 (if enabled)

## 🔧 Configuration Options

### Environment Variables

You can customize the deployment by setting these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Backend port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `GOOGLE_SPREADSHEET_ID` | Google Sheets ID | Your spreadsheet ID |
| `GOOGLE_SHEET_NAME` | Sheet name | `Bookings` |

### Docker Compose Files

- `docker-compose.yml` - Basic deployment
- `docker-compose.prod.yml` - Production deployment with security and performance optimizations

## 📊 Monitoring and Logs

### View Application Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f spd-reservation

# View nginx logs
docker-compose logs -f nginx
```

### Health Checks
```bash
# Check application health
curl http://localhost:5000/api/health

# Check container health
docker-compose ps
```

### Resource Usage
```bash
# View container resource usage
docker stats

# View disk usage
docker system df
```

## 🔒 Security Features

The production deployment includes several security features:

- **Read-only filesystem**: Containers run with read-only root filesystem
- **No new privileges**: Containers cannot gain additional privileges
- **Resource limits**: Memory and CPU limits prevent resource exhaustion
- **Security headers**: Nginx includes security headers
- **Rate limiting**: API endpoints are rate-limited
- **Non-root user**: Application runs as non-root user

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :5000

# Stop conflicting services
sudo systemctl stop <service-name>
```

#### 2. Permission Denied
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Make script executable
chmod +x deploy.sh
```

#### 3. Google API Authentication Error
```bash
# Check environment variables
docker-compose exec spd-reservation env | grep GOOGLE

# Restart with correct credentials
docker-compose down
# Update backend/.env with correct credentials
docker-compose up --build -d
```

#### 4. Container Won't Start
```bash
# Check container logs
docker-compose logs spd-reservation

# Check container status
docker-compose ps

# Restart containers
docker-compose restart
```

### Debug Mode

To run in debug mode with more verbose logging:

```bash
# Run with debug logging
docker-compose up --build

# Or with production config
docker-compose -f docker-compose.prod.yml up --build
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale the application to multiple instances
docker-compose up --scale spd-reservation=3 -d
```

### Load Balancer Setup
For production deployments, consider using a load balancer:

```yaml
# Add to docker-compose.prod.yml
services:
  haproxy:
    image: haproxy:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    depends_on:
      - spd-reservation
```

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

### Backup and Restore
```bash
# Backup logs
docker-compose exec spd-reservation tar -czf logs-backup.tar.gz /app/logs

# Backup environment
cp backend/.env backend/.env.backup
```

### Cleanup
```bash
# Remove unused containers, networks, and images
docker system prune -a

# Remove volumes (WARNING: This will delete data)
docker volume prune
```

## 🚀 Production Deployment Checklist

Before deploying to production, ensure:

- [ ] Google API credentials are properly configured
- [ ] Environment variables are set correctly
- [ ] SSL certificates are configured (if using HTTPS)
- [ ] Firewall rules allow traffic on required ports
- [ ] Monitoring and logging are configured
- [ ] Backup strategy is in place
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] Resource limits are set appropriately

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose exec spd-reservation env`
3. Test the health endpoint: `curl http://localhost:5000/api/health`
4. Check container status: `docker-compose ps`

For additional help, please refer to the main README.md or create an issue in the repository. 