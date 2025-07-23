import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, BookOpen, BarChart3, Home } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
    },
    {
      name: 'My Bookings',
      path: '/my-bookings',
      icon: BookOpen,
    },
    {
      name: 'Statistics',
      path: '/statistics',
      icon: BarChart3,
    },
  ];

  return (
    <nav className="bg-white border-b-2 border-cyan-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-cyan-500" />
            <h1 className="text-xl font-bold text-gray-800">
              SSPD Meeting Room Booking
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-cyan-600 focus:outline-none focus:text-cyan-600"
            >
              <Calendar className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-t border-cyan-100">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 