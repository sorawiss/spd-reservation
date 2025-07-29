#!/bin/bash

# SSPD Reservation System Docker Deployment Script
# This script builds and deploys the application using Docker

set -e

echo "🚀 Starting SSPD Reservation System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
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
docker-compose down --remove-orphans

# Remove old images
print_status "Cleaning up old images..."
docker system prune -f

# Build and start containers
print_status "Building and starting containers..."
docker-compose up --build -d

# Wait for containers to be healthy
print_status "Waiting for application to be ready..."
sleep 30

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Application deployed successfully!"
    print_status "🌐 Frontend: http://localhost:3000"
    print_status "🔧 Backend API: http://localhost:5000"
    print_status "📊 Health Check: http://localhost:5000/api/health"
    
    # Show container logs
    print_status "📋 Container logs:"
    docker-compose logs --tail=20
else
    print_error "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi

print_status "🎉 Deployment complete! The SSPD Reservation System is now running."
print_status "Use 'docker-compose logs -f' to monitor logs"
print_status "Use 'docker-compose down' to stop the application" 