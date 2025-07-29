#!/bin/sh

# Start backend server in background
echo "🚀 Starting SSPD Booking System Backend on port 5000..."
node src/server.js &

# Start frontend server in background
echo "🌐 Starting SSPD Booking System Frontend on port 3000..."
node src/frontend-server.js &

# Wait for both processes
wait 