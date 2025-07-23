'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { X, Calendar, Clock, User, Phone, FileText, Building, Save } from 'lucide-react';
import { MEETING_ROOMS, TIME_SLOTS } from '../types';

interface BookingModalProps {
  roomId: string;
  date: Date;
  timeSlot: { start: string; end: string };
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  roomId,
  date,
  timeSlot,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    phoneNumber: '',
    purpose: '',
  });
  const [duration, setDuration] = useState(1); // Number of 30-minute slots
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const room = MEETING_ROOMS.find(r => r.id === roomId);
  
  // Calculate end time based on duration
  const calculateEndTime = (startTime: string, slots: number) => {
    const startIndex = TIME_SLOTS.indexOf(startTime);
    const endIndex = Math.min(startIndex + slots, TIME_SLOTS.length - 1);
    return TIME_SLOTS[endIndex];
  };

  // Get maximum possible duration (up to 4 hours or 8 slots)
  const getMaxDuration = () => {
    const startIndex = TIME_SLOTS.indexOf(timeSlot.start);
    const maxSlots = Math.min(8, TIME_SLOTS.length - 1 - startIndex); // Max 4 hours
    return maxSlots;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form
    if (!formData.fullName.trim() || !formData.employeeId.trim() || 
        !formData.phoneNumber.trim() || !formData.purpose.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const endTime = calculateEndTime(timeSlot.start, duration);
      
      const bookingData = {
        fullName: formData.fullName.trim(),
        employeeId: formData.employeeId.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        purpose: formData.purpose.trim(),
        roomId,
        date: format(date, 'yyyy-MM-dd'),
        timeSlot: {
          start: timeSlot.start,
          end: endTime
        }
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-cyan-500" />
            <h2 className="text-xl font-bold text-gray-800">Book Meeting Room</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Booking Details */}
        <div className="p-6 bg-cyan-50 border-b border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-cyan-600" />
              <span className="font-semibold text-gray-800">
                {room?.name} (Capacity: {room?.capacity} people)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-cyan-600" />
              <span className="text-gray-700">
                {format(date, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-cyan-600" />
              <span className="text-gray-700">
                {timeSlot.start} - {calculateEndTime(timeSlot.start, duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Duration Selector */}
          <div>
            <label className="form-label">
              Duration (30-minute intervals)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="form-input"
            >
              {Array.from({ length: getMaxDuration() }, (_, i) => i + 1).map(slots => (
                <option key={slots} value={slots}>
                  {slots * 30} minutes ({slots} slot{slots > 1 ? 's' : ''})
                </option>
              ))}
            </select>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="form-label">
              <User className="inline h-4 w-4 mr-1" />
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Employee ID */}
          <div>
            <label htmlFor="employeeId" className="form-label">
              Employee ID *
            </label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your employee ID"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="form-label">
              <Phone className="inline h-4 w-4 mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your phone number"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label htmlFor="purpose" className="form-label">
              <FileText className="inline h-4 w-4 mr-1" />
              Purpose of Use *
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className="form-input resize-none"
              rows={3}
              placeholder="Describe the purpose of your meeting"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 