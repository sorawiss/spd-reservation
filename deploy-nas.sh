#!/bin/bash

# SSPD Reservation System - NAS Deployment Script
# Optimized for Synology NAS and similar NAS devices

set -e

echo "🏠 Starting SSPD Reservation System NAS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_nas() {
    echo -e "${BLUE}[NAS]${NC} $1"
}

# Check if running on NAS (detect common NAS paths)
NAS_DETECTED=false
if [[ -d "/volume1" ]] || [[ -d "/volume2" ]]; then
    NAS_DETECTED=true
    print_nas "NAS environment detected"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker on your NAS first."
    print_nas "For Synology NAS: Install Docker from Package Center"
    print_nas "For QNAP NAS: Install Container Station from App Center"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed."
    print_nas "For Synology NAS: Install Docker Compose via SSH or Package Center"
    print_nas "For QNAP NAS: Install via Container Station"
    exit 1
fi

# Create NAS directory structure
print_status "Creating NAS directory structure..."
mkdir -p /volume1/docker/spd-reservation/{logs,backups,config,ssl,nginx/logs}

# Set proper permissions for NAS
if [ "$NAS_DETECTED" = true ]; then
    print_nas "Setting NAS-specific permissions..."
    chmod 755 /volume1/docker/spd-reservation
    chmod 755 /volume1/docker/spd-reservation/logs
    chmod 755 /volume1/docker/spd-reservation/backups
    chmod 755 /volume1/docker/spd-reservation/config
    chmod 755 /volume1/docker/spd-reservation/ssl
    chmod 755 /volume1/docker/spd-reservation/nginx
    chmod 755 /volume1/docker/spd-reservation/nginx/logs
fi

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    print_warning "backend/.env file not found. Creating from template..."
    cat > backend/.env << EOF
# Google API Service Account Credentials
GOOGLE_TYPE=service_account
GOOGLE_PROJECT_ID=seraphic-camp-464715-e6
GOOGLE_PRIVATE_KEY_ID=29afca6bcf94a6c21c081995330f5379954b549e
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCriS74i7k5V+/0\nuKWu7rxohj61noRlQEU1PGv4l9K5woUWZFqRRwDem7O6wTZ7ipv3Dim0DHgDWSal\nq976j86wk+sRYSqYZtdFTVlMORcSc69ZQtGvzxSliILqR3vdljDy9I1em42wUzW/\nuxQL/scyEzB5PUqCapzGDlmWjw2vRALO5ojWGfqIi0DY2xm1Yg3xLIwWmOacQu8f\ntvPz/LH7u/4j9jczV2SiCqls8pqghugY8iPznNhVgHKOD7qJYob4vblVeBs/JPgM\nwz6qO6u0XOZ5k/vPgvyAFYBgU7vm0hGcvlNGZ/NXVSgaxPRB6HNl/1noTbUaP60a\n83fyY5KpAgMBAAECggEACatzUXwGPkBh4hSu9FhNbdf+0iau4HVPIXPimJzYZR6H\nzu4WeUDnKzqxlvTG2+UsVcY/iBXkMGN2wq6YZIgK9wMeTyMVhLSsFyJH3HyNu314\nKaA9vqXTYbclvXa3pGi6dtZd33LbOdDLA3VUk+OHekrAzV4s5IKwNphUU7YvPOK7\n4nMVzQ18vdDfddJJTa+IybWwziMbl7CSwTnrQU/MVTcCwxH6zc7xEVitz6fhlEmU\nMDE8DmuVVqaYCoPvjefc1ReY2xzYo/O/rluAuYrXE5Ig1xe9YErr7/xgXvA0mOLc\nTE1UDZth/X5yNfXJQPc6wS/6K4/ZyL5no/Z5lT8hXQKBgQDXEkD2fpUAiEqG7QcR\n4BgZom7Ak+6XpvO/rNDP0mou1JyD9DiOsxpPJXmAF1hgeWmQ1nR3JHek018HzlX3\nBDkoRiikixmkHzPkKbpsXOgQy3CB8Ft8BINs0jNZbJ6UaQeBbx5Dcg4HZtJ/jILN\nAzgYCKlU91qoluBGdv7f2zdG/QKBgQDMLf2HSqDOdqgJILkDw5tsKcBl8Yed5F9x\nwPU5scNdrmsVixISjuOGSdUrCyUAH/pa34KYUPyCAfh8WQW44gzDkzndiBHa54hg\njBk1pKBeW+tmX9LdXzbdZI93PGFEFIrxzUZq1AbMC0YTYmDb1H3ZfaJJdV5KqEgV\n+XBJOv0oHQKBgQCeLG+Ymbnt/U6KcvJ7JAu1dq/rdCDKad/kfS3JWl/7dyRxK4EY\n+gIEaXQ1T3YQ5dpMylw3b5uKnmXKsOaqV/HNe+PSN/cwrD4WtNXFcoK+L1DcT7CI\nwi0CMInRX8A1OBVsDRP92HkW2nk/k1BzhMWRb3VR5uVHDkd9q3CBpJC/5QKBgCWs\nJqcbwefWRNLKUti68qZWXcVxdxBO3r1iWNy4S8+xKtjivAbojlpsrQQwHjeTruGt\nc68e4jgqnOp0knW2X5yGQZr6TDETnzoRH2WiZmSCmUBeVc26j6jxsPbTES86ixhq\nQ5/aVxa2zcstz6k/36iNYbAkE626tvI2/9zDIYqRAoGAcKviekJKMJ85M+qHM3jL\n6kFs7kG5gNT+qp6HIr8dd9uedv3ZIW2po5sObhuQKzUOyANqpF27Duot8M9yPpet\nvD5COGAgxYHerxVJ9IaRlE473sbiUOuZ9QhU67tr5ltySyDFQPvDGNFkIxBNsgFK\ng2ywsvy7iuGdTVJUO6nD1F8=\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=roomreservation@seraphic-camp-464715-e6.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=101756370978612681861
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/roomreservation%40seraphic-camp-464715-e6.iam.gserviceaccount.com
GOOGLE_UNIVERSE_DOMAIN=googleapis.com
GOOGLE_SPREADSHEET_ID=1d-Aa9mZ3FGtIp43o3K4ljcwyQMwaaonaGO3abP5Pc-M
GOOGLE_SHEET_NAME=Bookings
EOF
    print_status "Created backend/.env file with default values. Please update with your actual Google API credentials."
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.nas.yml down --remove-orphans

# Remove old images to save NAS storage
print_status "Cleaning up old images to save NAS storage..."
docker system prune -f

# Build and start containers with NAS configuration
print_status "Building and starting containers with NAS optimization..."
docker-compose -f docker-compose.nas.yml up --build -d

# Wait for containers to be healthy (longer wait for NAS)
print_status "Waiting for application to be ready (NAS optimized timing)..."
sleep 60

# Check if containers are running
if docker-compose -f docker-compose.nas.yml ps | grep -q "Up"; then
    print_status "✅ Application deployed successfully on NAS!"
    
    # Get NAS IP address
    NAS_IP=$(hostname -I | awk '{print $1}')
    print_nas "🌐 Access your application at:"
    print_nas "   Frontend: http://$NAS_IP:3000"
    print_nas "   Backend API: http://$NAS_IP:5000"
    print_nas "   Health Check: http://$NAS_IP:5000/api/health"
    print_nas "   Nginx Proxy: http://$NAS_IP:80 (if enabled)"
    
    # Show NAS storage info
    print_nas "💾 NAS Storage Locations:"
    print_nas "   Logs: /volume1/docker/spd-reservation/logs"
    print_nas "   Backups: /volume1/docker/spd-reservation/backups"
    print_nas "   Config: /volume1/docker/spd-reservation/config"
    print_nas "   SSL: /volume1/docker/spd-reservation/ssl"
    
    # Show container logs
    print_status "📋 Container logs:"
    docker-compose -f docker-compose.nas.yml logs --tail=20
    
    # Show NAS resource usage
    print_nas "📊 Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    
else
    print_error "❌ Deployment failed. Check logs with: docker-compose -f docker-compose.nas.yml logs"
    exit 1
fi

# Create NAS monitoring script
print_nas "Creating NAS monitoring script..."
cat > monitor-nas.sh << 'EOF'
#!/bin/bash
# NAS Monitoring Script for SSPD Reservation System

echo "🏠 SSPD Reservation System - NAS Monitor"
echo "========================================"

# Check container status
echo "📦 Container Status:"
docker-compose -f docker-compose.nas.yml ps

echo ""
echo "📊 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""
echo "💾 Storage Usage:"
du -sh /volume1/docker/spd-reservation/* 2>/dev/null || echo "Storage paths not found"

echo ""
echo "📋 Recent Logs:"
docker-compose -f docker-compose.nas.yml logs --tail=10

echo ""
echo "🔗 Health Check:"
curl -s http://localhost:5000/api/health || echo "Health check failed"
EOF

chmod +x monitor-nas.sh

print_status "🎉 NAS deployment complete! The SSPD Reservation System is now running on your NAS."
print_nas "Use 'docker-compose -f docker-compose.nas.yml logs -f' to monitor logs"
print_nas "Use 'docker-compose -f docker-compose.nas.yml down' to stop the application"
print_nas "Use './monitor-nas.sh' to check system status"
print_nas "Use 'docker system prune -a' to clean up unused images and save storage" 