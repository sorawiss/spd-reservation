import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '../../services/googleSheets';
import { BookingFormData } from '../../types';

// GET /api/bookings - Get all bookings or filter by date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const employeeId = searchParams.get('employeeId');

    let bookings;
    
    if (date) {
      bookings = await GoogleSheetsService.getBookingsByDate(date);
    } else if (employeeId) {
      bookings = await GoogleSheetsService.getBookingsByUser(employeeId);
    } else {
      bookings = await GoogleSheetsService.getAllBookings();
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingFormData = await request.json();

    // Validate required fields
    if (!bookingData.fullName || !bookingData.employeeId || !bookingData.phoneNumber || 
        !bookingData.purpose || !bookingData.roomId || !bookingData.date ||
        !bookingData.timeSlot?.start || !bookingData.timeSlot?.end) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for time conflicts
    const existingBookings = await GoogleSheetsService.getBookingsByDate(bookingData.date);
    const hasConflict = existingBookings.some(booking => 
      booking.roomId === bookingData.roomId &&
      booking.timeSlot.start === bookingData.timeSlot.start &&
      booking.status === 'active'
    );

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Time slot already booked for this room' },
        { status: 409 }
      );
    }

    const newBooking = await GoogleSheetsService.createBooking(bookingData);
    
    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 