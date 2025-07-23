'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Booking, MEETING_ROOMS, TIME_SLOTS } from '../types';

interface MeetingRoomGridProps {
  selectedDate: Date;
  bookings: Booking[];
  onRoomBooking: (roomId: string, timeSlot: {start: string; end: string}) => void;
  loading: boolean;
}

const MeetingRoomGrid: React.FC<MeetingRoomGridProps> = ({
  selectedDate,
  bookings,
  onRoomBooking,
  loading
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:00');

  // Check if a room is available at a specific time
  const isRoomAvailable = (roomId: string, timeSlot: string) => {
    return !bookings.some(booking => 
      booking.roomId === roomId && 
      booking.timeSlot.start === timeSlot &&
      booking.status === 'active'
    );
  };

  // Get booking for a specific room and time
  const getBookingInfo = (roomId: string, timeSlot: string) => {
    return bookings.find(booking => 
      booking.roomId === roomId && 
      booking.timeSlot.start === timeSlot &&
      booking.status === 'active'
    );
  };

  // Generate time slot options for booking (30-minute intervals)
  const generateTimeSlotOptions = (startTime: string) => {
    const startIndex = TIME_SLOTS.indexOf(startTime);
    const options = [];
    
    for (let i = 1; i <= 8 && startIndex + i < TIME_SLOTS.length; i++) { // Max 4 hours (8 slots)
      const endTime = TIME_SLOTS[startIndex + i];
      options.push({
        start: startTime,
        end: endTime,
        duration: `${i * 30} min`
      });
    }
    
    return options;
  };

  const handleRoomClick = (roomId: string) => {
    if (!isRoomAvailable(roomId, selectedTimeSlot)) {
      return; // Room is booked
    }

    // For now, default to 30-minute booking
    const timeSlotIndex = TIME_SLOTS.indexOf(selectedTimeSlot);
    if (timeSlotIndex !== -1 && timeSlotIndex + 1 < TIME_SLOTS.length) {
      const endTime = TIME_SLOTS[timeSlotIndex + 1];
      onRoomBooking(roomId, {
        start: selectedTimeSlot,
        end: endTime
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Slot Selector */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-5 w-5 text-cyan-500" />
          <h3 className="font-semibold text-gray-800">Select Time Slot</h3>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {TIME_SLOTS.slice(0, -1).map((timeSlot) => (
            <button
              key={timeSlot}
              onClick={() => setSelectedTimeSlot(timeSlot)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedTimeSlot === timeSlot
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 border border-gray-200'
              }`}
            >
              {timeSlot}
            </button>
          ))}
        </div>
      </div>

      {/* Meeting Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MEETING_ROOMS.map((room) => {
          const available = isRoomAvailable(room.id, selectedTimeSlot);
          const bookingInfo = getBookingInfo(room.id, selectedTimeSlot);

          return (
            <div
              key={room.id}
              className={`card transition-all duration-300 cursor-pointer ${
                available 
                  ? 'hover:shadow-lg hover:scale-105 border-l-4 border-l-green-500' 
                  : 'border-l-4 border-l-red-500 opacity-75'
              }`}
              onClick={() => available && handleRoomClick(room.id)}
            >
              {/* Room Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${
                    available ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Users className={`h-5 w-5 ${
                      available ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Capacity: {room.capacity} people
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {available ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>Booked</span>
                    </>
                  )}
                </div>
              </div>

              {/* Time and Booking Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {selectedTimeSlot} - {TIME_SLOTS[TIME_SLOTS.indexOf(selectedTimeSlot) + 1] || '17:00'}
                  </span>
                </div>

                {/* Show booking details if room is booked */}
                {bookingInfo && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Booked by: {bookingInfo.userDetails.fullName}
                    </p>
                    <p className="text-xs text-red-600">
                      Purpose: {bookingInfo.userDetails.purpose}
                    </p>
                  </div>
                )}

                {/* Show available message if room is free */}
                {available && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">
                      Click to book this time slot
                    </p>
                    <p className="text-xs text-green-600">
                      For {format(selectedDate, 'EEEE, MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {available && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Book Now</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoomGrid; 