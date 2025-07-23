import React, { useState } from 'react';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import { CalendarDays, Clock, Users, Wifi } from 'lucide-react';
import { MEETING_ROOMS } from '../types';
import MeetingRoomGrid from '../components/MeetingRoomGrid';
import BookingModal from '../components/BookingModal';
import { useRealTimeBookings } from '../hooks/useRealTimeBookings';
import 'react-calendar/dist/Calendar.css';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Use real-time bookings hook
  const { bookings, loading, error, refetch } = useRealTimeBookings({
    date: selectedDate,
    enabled: true,
    interval: 5000 // Poll every 5 seconds for real-time updates
  });

  // Handle date selection
  const handleDateChange = (date) => {
    if (Array.isArray(date)) return;
    setSelectedDate(date);
  };

  // Handle room booking
  const handleRoomBooking = (roomId, timeSlot) => {
    setSelectedRoom(roomId);
    setSelectedTimeSlot(timeSlot);
    setShowBookingModal(true);
  };

  // Handle successful booking
  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedRoom(null);
    setSelectedTimeSlot(null);
    refetch(); // Immediately refresh bookings after successful booking
  };

  // Disable past dates
  const tileDisabled = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
      {/* Header Section */}
      <div className="bg-white border-b-2 border-cyan-100 shadow-sm mb-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              SSPD Meeting Room Booking
            </h1>
            <p className="text-lg text-gray-600">
              Reserve your meeting space with ease
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <CalendarDays className="h-6 w-6 text-cyan-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Select Date
                </h2>
              </div>
              
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileDisabled={tileDisabled}
                className="react-calendar w-full"
                locale="en-US"
                formatMonthYear={(locale, date) => 
                  format(date, 'MMMM yyyy')
                }
              />
              
              <div className="mt-4 p-3 bg-cyan-50 rounded-lg">
                <div className="flex items-center space-x-2 text-cyan-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Today's Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Bookings:</span>
                  <span className="font-semibold text-cyan-600">
                    {bookings.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available Rooms:</span>
                  <span className="font-semibold text-green-600">
                    {MEETING_ROOMS.length - new Set(bookings.map(b => b.roomId)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Meeting Rooms */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-cyan-500" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Meeting Rooms
                  </h2>
                </div>
                <div className="flex items-center space-x-4">
                  {loading && (
                    <div className="flex items-center space-x-2 text-cyan-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm">Live Updates</span>
                  </div>
                </div>
              </div>

              <MeetingRoomGrid
                selectedDate={selectedDate}
                bookings={bookings}
                onRoomBooking={handleRoomBooking}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && selectedTimeSlot && (
        <BookingModal
          roomId={selectedRoom}
          date={selectedDate}
          timeSlot={selectedTimeSlot}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
} 