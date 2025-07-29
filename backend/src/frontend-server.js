const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.listen(FRONTEND_PORT, () => {
  console.log(`🌐 SSPD Booking System Frontend running on port ${FRONTEND_PORT}`);
}); 