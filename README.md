# SSPD Meeting Room Booking System

A professional meeting room booking system built with **React + Express** architecture, featuring real-time updates, Google Sheets integration, and comprehensive analytics.

![SSPD Booking System](https://img.shields.io/badge/SSPD-Meeting%20Room%20Booking-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=flat&logo=google-sheets)

## 🚀 Features

### ✨ **Core Functionality**
- **📅 Interactive Calendar** - Select future dates with disabled past dates
- **🏢 4 Meeting Rooms** - SOUTHERN, ARCTIC, ATLANTIC (4 people each), PACIFIC (20 people)
- **⏰ Time Slot Management** - 09:00-17:00, 30-minute intervals, 4-hour max booking
- **📝 Complete Booking Form** - Name, Employee ID, Phone, Purpose validation
- **🔄 Real-time Updates** - Live polling every 5 seconds for instant updates
- **❌ Booking Cancellation** - Cancel your own bookings with confirmation

### 📊 **Advanced Features**
- **📈 Usage Statistics** - Room utilization, peak hours, analytics dashboard
- **🔍 Smart Filtering** - Filter bookings by room, date, status
- **💾 Google Sheets Storage** - All data persisted to Google Sheets
- **📱 Responsive Design** - Works perfectly on mobile and desktop
- **🎨 Modern UI** - Blue/green theme with smooth animations

## 🏗️ **Architecture**

```
spd-reservation/
├── backend/              # Express API Server
│   ├── src/
│   │   ├── server.js    # Main server file
│   │   ├── routes/      # API routes
│   │   └── services/    # Google Sheets integration
│   └── package.json
├── frontend/            # React SPA
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Main pages
│   │   ├── hooks/       # Custom hooks
│   │   └── services/    # API integration
│   └── package.json
├── google-api-key.json  # Google API credentials
└── package.json         # Root package.json
```

## 🛠️ **Setup Instructions**

### **Prerequisites**
- Node.js 16+ and npm
- Google API key (already configured)
- Access to the Google Sheets document

### **1. Install Dependencies**
```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

### **2. Development Mode**
```bash
# Run both frontend and backend simultaneously
npm run dev

# Or run individually:
npm run dev:backend    # Express server on :5000
npm run dev:frontend   # React app on :3000
```

### **3. Production Mode**
```bash
# Build and start production
npm run build
npm start
```

## 🔧 **Configuration**

### **Backend Environment Variables**
Create `backend/.env`:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### **Frontend Environment Variables**
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### **Google Sheets Setup**
- The system uses the existing `google-api-key.json`
- Connected to: [Google Sheets Document](https://docs.google.com/spreadsheets/d/1d-Aa9mZ3FGtIp43o3K4ljcwyQMwaaonaGO3abP5Pc-M)
- Automatically creates "Bookings" sheet with proper headers

## 📱 **Usage Guide**

### **🏠 Home Page**
1. **Select Date** - Use the calendar to choose your booking date
2. **Choose Time** - Pick from 30-minute time slots (09:00-17:00)
3. **Select Room** - Click on any available room to book
4. **Fill Form** - Enter your details and confirm booking

### **📋 My Bookings**
1. **Enter Employee ID** - View your personal bookings
2. **Filter Results** - By room, date, or status
3. **Cancel Bookings** - Cancel active reservations

### **📊 Statistics**
- View total bookings and room utilization
- Analyze peak usage hours
- See room distribution charts
- Get usage recommendations

## 🎨 **Design System**

### **Color Palette**
```css
Primary Blue:     #0891b2
Accent Turquoise: #06b6d4
Light Green:      #f0fdf4
Success Green:    #16a34a
```

### **Meeting Rooms**
| Room     | Capacity | Description    |
|----------|----------|----------------|
| SOUTHERN | 4 people | Small meeting  |
| ARCTIC   | 4 people | Small meeting  |
| ATLANTIC | 4 people | Small meeting  |
| PACIFIC  | 20 people| Large conference|

## 🔄 **Real-time Features**

- **Live Updates**: 5-second polling for immediate booking updates
- **Conflict Prevention**: Real-time availability checking
- **Visual Feedback**: Instant status updates and animations
- **Socket.io Ready**: Backend configured for WebSocket connections

## 🛡️ **Data Management**

### **Google Sheets Schema**
| Column | Description |
|--------|-------------|
| ID | Unique booking identifier |
| Room ID | Room identifier (southern, arctic, etc.) |
| Date | Booking date (YYYY-MM-DD) |
| Start/End Time | Time slot boundaries |
| User Details | Name, Employee ID, Phone, Purpose |
| Status | active/cancelled |
| Timestamps | Created/Updated timestamps |

### **API Endpoints**
```
GET    /api/bookings              # Get all bookings
GET    /api/bookings?date=YYYY-MM-DD  # Get bookings by date
GET    /api/bookings?employeeId=ID    # Get user bookings
POST   /api/bookings              # Create new booking
DELETE /api/bookings/:id          # Cancel booking
GET    /api/stats                 # Get usage statistics
GET    /api/health                # Health check
```

## 🚦 **Development**

### **Available Scripts**
```bash
npm run dev          # Start both frontend and backend
npm run build        # Build frontend for production
npm run start        # Start production servers
npm run test         # Run frontend tests
npm run install:all  # Install all dependencies
```

### **Project Structure**
```
Frontend (React):
- Components: Reusable UI components
- Pages: Main application pages
- Hooks: Custom React hooks for data fetching
- Services: API integration layer

Backend (Express):
- Routes: API endpoint handlers
- Services: Business logic and Google Sheets integration
- Middleware: CORS, JSON parsing, Socket.io setup
```

## 🔍 **Key Differences from Next.js**

### **What Changed:**
- ✅ Separated frontend (React SPA) and backend (Express API)
- ✅ Converted TypeScript to JavaScript
- ✅ Replaced Next.js API routes with Express routes
- ✅ Added React Router for client-side routing
- ✅ Implemented proper CORS handling
- ✅ Added concurrency scripts for development

### **What Stayed the Same:**
- ✅ All functionality and features preserved
- ✅ Google Sheets integration maintained
- ✅ Real-time updates working
- ✅ UI/UX design identical
- ✅ Component architecture preserved

## 🚀 **Deployment**

### **Frontend Deployment**
```bash
cd frontend
npm run build
# Deploy /build folder to static hosting (Netlify, Vercel, etc.)
```

### **Backend Deployment**
```bash
cd backend
npm start
# Deploy to Node.js hosting (Heroku, Railway, DigitalOcean, etc.)
```

## 📞 **Support**

For any issues or questions:
1. Check the browser console for errors
2. Verify Google Sheets API connectivity
3. Ensure backend server is running on port 5000
4. Check frontend is connecting to the correct API URL

---

**Built with ❤️ for SSPD Team**

*Professional meeting room booking made simple and efficient.*
