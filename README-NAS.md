# SSPD Reservation System - NAS Deployment Guide

This guide is specifically optimized for deploying the SSPD Reservation System on NAS devices like Synology, QNAP, and similar network storage devices.

## 🏠 NAS Compatibility

### Supported NAS Devices:
- **Synology DSM** (DS220+, DS920+, DS1621+, etc.)
- **QNAP QTS** (TS-251+, TS-453A, TS-873A, etc.)
- **Asustor ADM** (AS6602T, AS5304T, etc.)
- **Terramaster TOS** (F2-210, F4-210, etc.)
- **Other Linux-based NAS devices**

## 📋 Prerequisites

### 1. NAS Requirements
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: At least 5GB free space
- **Network**: Stable internet connection for Google API access
- **Docker Support**: Your NAS must support Docker containers

### 2. Install Docker on Your NAS

#### For Synology NAS:
1. Open **Package Center**
2. Search for "Docker"
3. Install "Docker" package
4. Enable SSH access in **Control Panel > Terminal & SNMP**

#### For QNAP NAS:
1. Open **App Center**
2. Search for "Container Station"
3. Install "Container Station"
4. Enable SSH access in **Control Panel > Network & File Services > Telnet/SSH**

#### For Other NAS:
- Check your NAS manufacturer's documentation for Docker installation

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# 1. SSH into your NAS
ssh admin@your-nas-ip

# 2. Navigate to your project directory
cd /volume1/docker/spd-reservation

# 3. Make the deployment script executable
chmod +x deploy-nas.sh

# 4. Run the NAS deployment script
./deploy-nas.sh
```

### Option 2: Manual Deployment

```bash
# 1. Create NAS directory structure
mkdir -p /volume1/docker/spd-reservation/{logs,backups,config,ssl,nginx/logs}

# 2. Deploy with NAS configuration
docker-compose -f docker-compose.nas.yml up --build -d

# 3. Check status
docker-compose -f docker-compose.nas.yml ps
```

## 🔧 NAS-Specific Configuration

### Storage Paths
The NAS deployment uses these persistent storage paths:

```
/volume1/docker/spd-reservation/
├── logs/          # Application logs
├── backups/       # Database backups
├── config/        # Configuration files
├── ssl/           # SSL certificates
└── nginx/
    └── logs/      # Nginx logs
```

### Resource Limits
NAS deployment includes optimized resource limits:
- **Memory**: 1GB limit, 512MB reserved
- **CPU**: 1 core limit, 0.5 core reserved
- **Log Rotation**: 10MB max file size, 3 files max

## 📊 Monitoring Your NAS Deployment

### 1. Check Application Status
```bash
# View container status
docker-compose -f docker-compose.nas.yml ps

# View logs
docker-compose -f docker-compose.nas.yml logs -f

# Check resource usage
docker stats
```

### 2. Use the Monitoring Script
```bash
# Run the NAS monitoring script
./monitor-nas.sh
```

### 3. Access the Application
Once deployed, access your application at:
- **Frontend**: `http://your-nas-ip:3000`
- **Backend API**: `http://your-nas-ip:5000`
- **Health Check**: `http://your-nas-ip:5000/api/health`
- **Nginx Proxy**: `http://your-nas-ip:80` (if enabled)

## 🔒 NAS Security Considerations

### 1. Firewall Configuration
Configure your NAS firewall to allow these ports:
- **Port 3000**: Frontend application
- **Port 5000**: Backend API
- **Port 80**: HTTP (if using nginx)
- **Port 443**: HTTPS (if using SSL)

### 2. SSL Certificate Setup (Optional)
For HTTPS access:

```bash
# 1. Create SSL directory
mkdir -p /volume1/docker/spd-reservation/ssl

# 2. Copy your SSL certificates
cp your-certificate.crt /volume1/docker/spd-reservation/ssl/
cp your-private-key.key /volume1/docker/spd-reservation/ssl/

# 3. Update nginx.conf for SSL
# (Edit nginx.conf to include SSL configuration)
```

### 3. Network Security
- Use your NAS's built-in firewall
- Consider using a reverse proxy
- Enable HTTPS for secure access
- Regularly update your NAS firmware

## 🛠️ Troubleshooting

### Common NAS Issues

#### 1. Permission Denied
```bash
# Fix NAS permissions
sudo chown -R admin:users /volume1/docker/spd-reservation
chmod 755 /volume1/docker/spd-reservation
```

#### 2. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :5000

# Stop conflicting services
sudo systemctl stop <service-name>
```

#### 3. Storage Space Issues
```bash
# Check available space
df -h

# Clean up Docker images
docker system prune -a

# Check storage usage
du -sh /volume1/docker/spd-reservation/*
```

#### 4. Container Won't Start
```bash
# Check container logs
docker-compose -f docker-compose.nas.yml logs spd-reservation

# Check container status
docker-compose -f docker-compose.nas.yml ps

# Restart containers
docker-compose -f docker-compose.nas.yml restart
```

### NAS-Specific Debugging

#### 1. Check NAS System Resources
```bash
# Check CPU and memory usage
top

# Check disk I/O
iotop

# Check network usage
iftop
```

#### 2. Check Docker Status
```bash
# Check Docker service
sudo systemctl status docker

# Check Docker daemon logs
sudo journalctl -u docker
```

#### 3. Check Application Health
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Check if ports are listening
netstat -tulpn | grep -E ':(3000|5000)'
```

## 📈 Performance Optimization

### 1. NAS Performance Tips
- **SSD Cache**: Use SSD cache if available
- **RAM**: Ensure adequate RAM for Docker
- **Network**: Use wired connection for better performance
- **Storage**: Use RAID for redundancy

### 2. Docker Optimization
```bash
# Clean up unused Docker resources
docker system prune -a

# Monitor resource usage
docker stats

# Optimize image layers
docker image prune
```

### 3. Application Optimization
- **Log Rotation**: Configured to prevent disk space issues
- **Resource Limits**: Set to prevent resource exhaustion
- **Health Checks**: Monitor application health
- **Auto-restart**: Containers restart automatically

## 🔄 Backup and Recovery

### 1. Backup Strategy
```bash
# Backup configuration
cp backend/.env /volume1/docker/spd-reservation/backups/

# Backup logs
tar -czf /volume1/docker/spd-reservation/backups/logs-$(date +%Y%m%d).tar.gz /volume1/docker/spd-reservation/logs/

# Backup Docker volumes
docker run --rm -v spd-reservation_logs:/data -v /volume1/docker/spd-reservation/backups:/backup alpine tar czf /backup/volumes-$(date +%Y%m%d).tar.gz -C /data .
```

### 2. Recovery Process
```bash
# Restore from backup
docker-compose -f docker-compose.nas.yml down
# Restore your backup files
docker-compose -f docker-compose.nas.yml up -d
```

## 📱 Remote Access

### 1. Port Forwarding
Configure your router to forward ports to your NAS:
- **Port 3000**: Frontend application
- **Port 5000**: Backend API

### 2. Dynamic DNS
Set up dynamic DNS for remote access:
- **No-IP**: Free dynamic DNS service
- **DuckDNS**: Free dynamic DNS service
- **Your router's DDNS**: Check router settings

### 3. VPN Access
For secure remote access:
- **Synology VPN Server**: Built-in VPN server
- **QNAP VPN Server**: Built-in VPN server
- **OpenVPN**: Third-party VPN solution

## 🔧 Maintenance

### 1. Regular Updates
```bash
# Update application
git pull origin main
docker-compose -f docker-compose.nas.yml down
docker-compose -f docker-compose.nas.yml up --build -d

# Update Docker images
docker-compose -f docker-compose.nas.yml pull
docker-compose -f docker-compose.nas.yml up -d
```

### 2. System Maintenance
```bash
# Clean up Docker
docker system prune -a

# Check disk space
df -h

# Monitor resource usage
docker stats
```

### 3. Log Management
```bash
# View application logs
docker-compose -f docker-compose.nas.yml logs -f

# Rotate logs manually
docker-compose -f docker-compose.nas.yml exec spd-reservation logrotate /etc/logrotate.conf
```

## 📞 Support

### Getting Help
1. **Check logs**: `docker-compose -f docker-compose.nas.yml logs`
2. **Check status**: `docker-compose -f docker-compose.nas.yml ps`
3. **Test health**: `curl http://localhost:5000/api/health`
4. **Monitor resources**: `docker stats`

### NAS-Specific Resources
- **Synology**: [Docker Package Documentation](https://www.synology.com/en-us/dsm/packages/Docker)
- **QNAP**: [Container Station Documentation](https://www.qnap.com/en/how-to/tutorial/article/container-station)
- **Docker**: [Official Documentation](https://docs.docker.com/)

### Common Commands Reference
```bash
# Start application
docker-compose -f docker-compose.nas.yml up -d

# Stop application
docker-compose -f docker-compose.nas.yml down

# View logs
docker-compose -f docker-compose.nas.yml logs -f

# Restart application
docker-compose -f docker-compose.nas.yml restart

# Check status
docker-compose -f docker-compose.nas.yml ps

# Monitor resources
docker stats

# Clean up
docker system prune -a
```

Your SSPD Reservation System is now optimized for NAS deployment with persistent storage, resource management, and NAS-specific monitoring! 