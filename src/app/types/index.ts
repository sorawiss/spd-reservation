export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'booked';
}

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
  booking?: Booking;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  userDetails: {
    fullName: string;
    employeeId: string;
    phoneNumber: string;
    purpose: string;
  };
  status: 'active' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormData {
  fullName: string;
  employeeId: string;
  phoneNumber: string;
  purpose: string;
  roomId: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
}

export interface UsageStats {
  totalBookings: number;
  mostUsedRoom: {
    name: string;
    bookingCount: number;
  };
  peakHours: {
    hour: string;
    bookingCount: number;
  }[];
  roomUtilization: {
    roomName: string;
    utilizationPercentage: number;
  }[];
}

export const MEETING_ROOMS: MeetingRoom[] = [
  {
    id: 'southern',
    name: 'SOUTHERN',
    capacity: 4,
    status: 'available'
  },
  {
    id: 'arctic',
    name: 'ARCTIC',
    capacity: 4,
    status: 'available'
  },
  {
    id: 'atlantic',
    name: 'ATLANTIC',
    capacity: 4,
    status: 'available'
  },
  {
    id: 'pacific',
    name: 'PACIFIC',
    capacity: 20,
    status: 'available'
  }
];

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

export const BUSINESS_HOURS = {
  start: '09:00',
  end: '17:00',
  intervalMinutes: 30,
  maxBookingHours: 4
}; 