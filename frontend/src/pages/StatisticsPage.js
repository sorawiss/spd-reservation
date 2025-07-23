import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  Building,
  Award,
  Activity
} from 'lucide-react';
import { statsAPI } from '../services/api';

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch statistics
  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await statsAPI.getStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Colors for charts
  const colors = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  // Prepare data for charts
  const roomUtilizationChartData = stats?.roomUtilization.map((room, index) => ({
    ...room,
    fill: colors[index % colors.length]
  })) || [];

  const peakHoursChartData = stats?.peakHours.map((hour, index) => ({
    ...hour,
    fill: colors[index % colors.length]
  })) || [];

  // Stat cards data
  const statCards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'bg-cyan-500',
      trend: '+12% from last month'
    },
    {
      title: 'Most Used Room',
      value: stats?.mostUsedRoom.name || 'N/A',
      icon: Award,
      color: 'bg-green-500',
      trend: `${stats?.mostUsedRoom.bookingCount || 0} bookings`
    },
    {
      title: 'Peak Hour',
      value: stats?.peakHours[0]?.hour || 'N/A',
      icon: Clock,
      color: 'bg-amber-500',
      trend: `${stats?.peakHours[0]?.bookingCount || 0} bookings`
    },
    {
      title: 'Active Rooms',
      value: stats?.roomUtilization.length || 0,
      icon: Building,
      color: 'bg-blue-500',
      trend: 'All rooms available'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="card text-center">
            <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Error Loading Statistics
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchStats}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
      {/* Header */}
      <div className="bg-white border-b-2 border-cyan-100 shadow-sm mb-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Usage Statistics
            </h1>
            <p className="text-lg text-gray-600">
              Analytics and insights for meeting room usage
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    {card.trend && (
                      <p className="text-xs text-gray-500 mt-1">{card.trend}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${card.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Room Utilization Chart */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Building className="h-6 w-6 text-cyan-500" />
              <h2 className="text-xl font-semibold text-gray-800">Room Utilization</h2>
            </div>
            
            {roomUtilizationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roomUtilizationChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="roomName" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Utilization']}
                    labelFormatter={(label) => `Room: ${label}`}
                  />
                  <Bar dataKey="utilizationPercentage" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No utilization data available</p>
              </div>
            )}
          </div>

          {/* Peak Hours Chart */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="h-6 w-6 text-cyan-500" />
              <h2 className="text-xl font-semibold text-gray-800">Peak Hours</h2>
            </div>
            
            {peakHoursChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHoursChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'Bookings']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Bar dataKey="bookingCount" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No peak hours data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Room Utilization Pie Chart and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-6 w-6 text-cyan-500" />
              <h2 className="text-xl font-semibold text-gray-800">Room Distribution</h2>
            </div>
            
            {roomUtilizationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roomUtilizationChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="utilizationPercentage"
                    label={({ roomName, utilizationPercentage }) => 
                      `${roomName}: ${utilizationPercentage}%`
                    }
                  >
                    {roomUtilizationChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No distribution data available</p>
              </div>
            )}
          </div>

          {/* Summary Info */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="h-6 w-6 text-cyan-500" />
              <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-cyan-50 p-4 rounded-lg">
                <h3 className="font-semibold text-cyan-800 mb-2">Top Performing Room</h3>
                <p className="text-cyan-700">
                  <strong>{stats?.mostUsedRoom.name || 'N/A'}</strong> with{' '}
                  {stats?.mostUsedRoom.bookingCount || 0} bookings
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Busiest Time</h3>
                <p className="text-green-700">
                  <strong>{stats?.peakHours[0]?.hour || 'N/A'}</strong> with{' '}
                  {stats?.peakHours[0]?.bookingCount || 0} bookings
                </p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-800 mb-2">Total Activity</h3>
                <p className="text-amber-700">
                  <strong>{stats?.totalBookings || 0}</strong> total bookings across all rooms
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Recommendations</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Monitor peak hours for capacity planning</li>
                  <li>• Consider expanding popular room capacity</li>
                  <li>• Encourage off-peak bookings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchStats}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Statistics
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 