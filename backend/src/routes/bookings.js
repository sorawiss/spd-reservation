const express = require('express');
const GoogleSheetsService = require('../services/googleSheets');

const router = express.Router();

// GET /api/bookings - Get all bookings or filter by date/employeeId
router.get('/', async (req, res) => {
  try {
    const { date, employeeId } = req.query;

    let bookings;
    
    if (date) {
      bookings = await GoogleSheetsService.getBookingsByDate(date);
    } else if (employeeId) {
      bookings = await GoogleSheetsService.getBookingsByUser(employeeId);
    } else {
      bookings = await GoogleSheetsService.getAllBookings();
    }

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
  try {
    const bookingData = req.body;

    // Validate required fields
    if (!bookingData.fullName || !bookingData.employeeId || !bookingData.phoneNumber || 
        !bookingData.purpose || !bookingData.roomId || !bookingData.date ||
        !bookingData.timeSlot?.start || !bookingData.timeSlot?.end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for time conflicts
    const existingBookings = await GoogleSheetsService.getBookingsByDate(bookingData.date);
    const hasConflict = existingBookings.some(booking => 
      booking.roomId === bookingData.roomId &&
      booking.timeSlot.start === bookingData.timeSlot.start &&
      booking.status === 'active'
    );

    if (hasConflict) {
      return res.status(409).json({ error: 'Time slot already booked for this room' });
    }

    const newBooking = await GoogleSheetsService.createBooking(bookingData);
    
    // Emit real-time update
    req.io.to(`date_${bookingData.date}`).emit('booking_update', {
      type: 'booking_created',
      booking: newBooking,
      date: bookingData.date
    });
    
    res.status(201).json({ booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// DELETE /api/bookings/:id - Cancel a booking
router.delete('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const success = await GoogleSheetsService.cancelBooking(bookingId);

    if (!success) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Emit real-time update for cancellation
    req.io.emit('booking_update', {
      type: 'booking_cancelled',
      bookingId: bookingId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router; 