import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event types for type safety
export interface BookingUpdateEvent {
  type: 'booking_created' | 'booking_cancelled';
  booking: any;
  date: string;
}

export interface SocketEvents {
  booking_update: (data: BookingUpdateEvent) => void;
  connect: () => void;
  disconnect: () => void;
} 