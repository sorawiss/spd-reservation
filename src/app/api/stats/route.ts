import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '../../services/googleSheets';

// GET /api/stats - Get usage statistics
export async function GET() {
  try {
    const stats = await GoogleSheetsService.getUsageStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 