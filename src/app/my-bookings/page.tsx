'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Building, 
  User, 
  Phone, 
  FileText, 
  Trash2, 
  Filter,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Booking, MEETING_ROOMS } from '../types';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState('');
  const [filters, setFilters] = useState({
    room: '',
    date: '',
    status: 'all'
  });
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Fetch user bookings
  const fetchBookings = async (empId: string) => {
    if (!empId.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/bookings?employeeId=${encodeURIComponent(empId)}`);
      const data = await response.json();
      setBookings(data.bookings || []);
      setFilteredBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...bookings];

    if (filters.room) {
      filtered = filtered.filter(booking => booking.roomId === filters.room);
    }

    if (filters.date) {
      filtered = filtered.filter(booking => booking.date === filters.date);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    setFilteredBookings(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    setCancelling(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Refresh bookings
      await fetchBookings(employeeId);
      setShowCancelModal(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  // Effect to apply filters
  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-cyan-100 shadow-sm mb-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              My Bookings
            </h1>
            <p className="text-lg text-gray-600">
              Manage your meeting room reservations
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Employee ID Input */}
        {!employeeId && (
          <div className="card mb-8 max-w-md mx-auto">
            <div className="text-center">
              <User className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Enter Your Employee ID
              </h2>
              <p className="text-gray-600 mb-4">
                Please enter your employee ID to view your bookings
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Employee ID"
                  className="form-input flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value;
                      setEmployeeId(value);
                      fetchBookings(value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Employee ID"]') as HTMLInputElement;
                    if (input?.value) {
                      setEmployeeId(input.value);
                      fetchBookings(input.value);
                    }
                  }}
                  className="btn-primary"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {employeeId && (
          <>
            {/* Filters */}
            <div className="card mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-cyan-500" />
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">Room</label>
                  <select
                    value={filters.room}
                    onChange={(e) => handleFilterChange('room', e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Rooms</option>
                    {MEETING_ROOMS.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="form-input"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ room: '', date: '', status: 'all' })}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {loading ? (
                <div className="card text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="card text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No Bookings Found
                  </h3>
                  <p className="text-gray-600">
                    {bookings.length === 0 
                      ? "You haven't made any bookings yet." 
                      : "No bookings match your current filters."}
                  </p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`card transition-all duration-300 ${
                      booking.status === 'active' 
                        ? 'border-l-4 border-l-green-500' 
                        : 'border-l-4 border-l-red-500 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Room and Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Building className="h-5 w-5 text-cyan-500" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              {booking.roomName}
                            </h3>
                          </div>
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status === 'active' ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                <span>Cancelled</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {format(new Date(booking.date), 'EEEE, MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {booking.timeSlot.start} - {booking.timeSlot.end}
                            </span>
                          </div>
                        </div>

                        {/* Contact and Purpose */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {booking.userDetails.phoneNumber}
                            </span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                            <span className="text-gray-700 text-sm">
                              {booking.userDetails.purpose}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {booking.status === 'active' && (
                        <div className="ml-4">
                          <button
                            onClick={() => setShowCancelModal(booking.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Cancel Booking"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Trash2 className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-bold text-gray-800">Cancel Booking</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(null)}
                  className="btn-secondary flex-1"
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => handleCancelBooking(showCancelModal)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex-1 flex items-center justify-center space-x-2"
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Cancel Booking</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 