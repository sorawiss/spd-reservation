import { google } from 'googleapis';
import { Booking, BookingFormData, UsageStats } from '../types';

const SPREADSHEET_ID = '1d-Aa9mZ3FGtIp43o3K4ljcwyQMwaaonaGO3abP5Pc-M';
const SHEET_NAME = 'Bookings';

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: './google-api-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export class GoogleSheetsService {
  // Initialize the sheet with headers if it doesn't exist
  static async initializeSheet() {
    try {
      const headers = [
        'ID',
        'Room ID',
        'Room Name',
        'Date',
        'Start Time',
        'End Time',
        'Full Name',
        'Employee ID',
        'Phone Number',
        'Purpose',
        'Status',
        'Created At',
        'Updated At'
      ];

      // Check if sheet exists
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const sheetExists = spreadsheet.data.sheets?.some(
        sheet => sheet.properties?.title === SHEET_NAME
      );

      if (!sheetExists) {
        // Create the sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: SHEET_NAME,
                }
              }
            }]
          }
        });
      }

      // Add headers if the sheet is empty
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:M1`,
      });

      if (!response.data.values || response.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A1:M1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });
      }

      return true;
    } catch (error) {
      console.error('Error initializing sheet:', error);
      throw error;
    }
  }

  // Create a new booking
  static async createBooking(bookingData: BookingFormData): Promise<Booking> {
    try {
      await this.initializeSheet();

      const id = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const booking: Booking = {
        id,
        roomId: bookingData.roomId,
        roomName: bookingData.roomId.toUpperCase(),
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        userDetails: {
          fullName: bookingData.fullName,
          employeeId: bookingData.employeeId,
          phoneNumber: bookingData.phoneNumber,
          purpose: bookingData.purpose,
        },
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      const values = [
        booking.id,
        booking.roomId,
        booking.roomName,
        booking.date,
        booking.timeSlot.start,
        booking.timeSlot.end,
        booking.userDetails.fullName,
        booking.userDetails.employeeId,
        booking.userDetails.phoneNumber,
        booking.userDetails.purpose,
        booking.status,
        booking.createdAt,
        booking.updatedAt,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:M`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [values],
        },
      });

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Get all bookings
  static async getAllBookings(): Promise<Booking[]> {
    try {
      await this.initializeSheet();

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:M`,
      });

      if (!response.data.values) {
        return [];
      }

      return response.data.values.map((row: any[]) => ({
        id: row[0] || '',
        roomId: row[1] || '',
        roomName: row[2] || '',
        date: row[3] || '',
        timeSlot: {
          start: row[4] || '',
          end: row[5] || '',
        },
        userDetails: {
          fullName: row[6] || '',
          employeeId: row[7] || '',
          phoneNumber: row[8] || '',
          purpose: row[9] || '',
        },
        status: (row[10] || 'active') as 'active' | 'cancelled',
        createdAt: row[11] || '',
        updatedAt: row[12] || '',
      }));
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw error;
    }
  }

  // Get bookings for a specific date
  static async getBookingsByDate(date: string): Promise<Booking[]> {
    try {
      const allBookings = await this.getAllBookings();
      return allBookings.filter(booking => 
        booking.date === date && booking.status === 'active'
      );
    } catch (error) {
      console.error('Error getting bookings by date:', error);
      throw error;
    }
  }

  // Get bookings for a specific user (by employee ID)
  static async getBookingsByUser(employeeId: string): Promise<Booking[]> {
    try {
      const allBookings = await this.getAllBookings();
      return allBookings.filter(booking => 
        booking.userDetails.employeeId === employeeId
      );
    } catch (error) {
      console.error('Error getting bookings by user:', error);
      throw error;
    }
  }

  // Cancel a booking
  static async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      await this.initializeSheet();

      // Get all data to find the row
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:M`,
      });

      if (!response.data.values) {
        return false;
      }

      const rowIndex = response.data.values.findIndex((row: any[]) => row[0] === bookingId);
      
      if (rowIndex === -1) {
        return false;
      }

      // Update the status to cancelled
      const now = new Date().toISOString();
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!K${rowIndex + 1}:M${rowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['cancelled', response.data.values[rowIndex][11], now]],
        },
      });

      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Get usage statistics
  static async getUsageStats(): Promise<UsageStats> {
    try {
      const allBookings = await this.getAllBookings();
      const activeBookings = allBookings.filter(booking => booking.status === 'active');

      // Total bookings
      const totalBookings = activeBookings.length;

      // Most used room
      const roomCounts = activeBookings.reduce((acc, booking) => {
        acc[booking.roomName] = (acc[booking.roomName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostUsedRoom = Object.entries(roomCounts).reduce(
        (max, [room, count]) => count > max.bookingCount ? { name: room, bookingCount: count } : max,
        { name: '', bookingCount: 0 }
      );

      // Peak hours
      const hourCounts = activeBookings.reduce((acc, booking) => {
        const hour = booking.timeSlot.start;
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour, bookingCount: count }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5);

      // Room utilization (simplified calculation)
      const roomUtilization = Object.entries(roomCounts).map(([roomName, count]) => ({
        roomName,
        utilizationPercentage: Math.round((count / totalBookings) * 100) || 0,
      }));

      return {
        totalBookings,
        mostUsedRoom,
        peakHours,
        roomUtilization,
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }
} 