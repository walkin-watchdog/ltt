import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, parseISO, isSameDay } from 'date-fns';

interface AvailabilityTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isEdit: boolean;
}

interface Availability {
  id?: string;
  productId: string;
  date: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  available: number;
  booked: number;
}

export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ formData, updateFormData, isEdit }) => {
  const { token } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [editFormData, setEditFormData] = useState({
    status: 'AVAILABLE',
    available: 0
  });
  
  useEffect(() => {
    if (isEdit && formData.id) {
      fetchAvailability();
    } else {
      // For new products, initialize empty availabilities
      setAvailabilities([]);
    }
  }, [formData.id, isEdit]);
  
  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability/product/${formData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailabilities(data);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const dayArray = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDateStatus = (date: Date) => {
    const availability = availabilities.find(a => 
      isSameDay(parseISO(a.date), date)
    );
    
    return availability ? availability.status : null;
  };
  
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SOLD_OUT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NOT_OPERATING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-400 border-gray-200';
    }
  };
  
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'SOLD_OUT':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'NOT_OPERATING':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Plus className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getAvailabilityCount = (date: Date) => {
    const availability = availabilities.find(a => 
      isSameDay(parseISO(a.date), date)
    );
    
    return availability ? `${availability.available}` : '';
  };
  
  const handleDateClick = (date: Date) => {
    const existingAvailability = availabilities.find(a => 
      isSameDay(parseISO(a.date), date)
    );
    
    if (existingAvailability) {
      setEditFormData({
        status: existingAvailability.status,
        available: existingAvailability.available
      });
    } else {
      setEditFormData({
        status: 'AVAILABLE',
        available: formData.capacity || 10
      });
    }
    
    setEditingDate(date);
  };
  
  const handleUpdateAvailability = () => {
    if (!editingDate) return;
    
    const dateString = format(editingDate, 'yyyy-MM-dd');
    
    // Find existing availability
    const existingIndex = availabilities.findIndex(a => 
      isSameDay(parseISO(a.date), editingDate)
    );
    
    let newAvailabilities = [...availabilities];
    
    if (existingIndex !== -1) {
      // Update existing
      newAvailabilities[existingIndex] = {
        ...newAvailabilities[existingIndex],
        status: editFormData.status as 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING',
        available: editFormData.available
      };
    } else {
      // Add new
      newAvailabilities.push({
        productId: formData.id || 'temp-id', // Temp ID for new products
        date: dateString,
        status: editFormData.status as 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING',
        available: editFormData.available,
        booked: 0
      });
    }
    
    setAvailabilities(newAvailabilities);
    
    // If we're editing, we'll save these changes when the form is submitted
    // Add availabilities to the form data so they can be processed on submission
    updateFormData({ availabilities: newAvailabilities });
    
    setEditingDate(null);
  };
  
  const handleAddWeek = () => {
    const today = new Date();
    const dates: Availability[] = [];
    
    // Add availability for next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      dates.push({
        productId: formData.id || 'temp-id',
        date: format(date, 'yyyy-MM-dd'),
        status: 'AVAILABLE',
        available: formData.capacity || 10,
        booked: 0
      });
    }
    
    // Merge with existing, avoiding duplicates
    const merged = [...availabilities];
    
    for (const newAvail of dates) {
      const existingIndex = merged.findIndex(a => 
        a.date === newAvail.date
      );
      
      if (existingIndex === -1) {
        merged.push(newAvail);
      }
    }
    
    setAvailabilities(merged);
    updateFormData({ availabilities: merged });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Availability Calendar</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleAddWeek}
            className="flex items-center text-sm bg-[#ff914d] text-white px-3 py-1 rounded-md hover:bg-[#e8823d]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Next 7 Days
          </button>
          <div className="flex">
            <button
              onClick={prevMonth}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff914d]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-7 gap-1 p-4">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {Array(monthStart.getDay()).fill(null).map((_, index) => (
              <div key={`empty-start-${index}`} className="h-16 border border-transparent p-1"></div>
            ))}
            
            {dayArray.map(date => {
              const status = getDateStatus(date);
              
              return (
                <div
                  key={date.toString()}
                  onClick={() => handleDateClick(date)}
                  className={`h-16 border rounded-lg cursor-pointer relative p-1
                    ${isToday(date) ? 'border-blue-300' : 'border-gray-200'} 
                    ${getStatusColor(status)}`}
                >
                  <div className="absolute top-1 right-1 text-xs font-semibold">
                    {format(date, 'd')}
                  </div>
                  
                  <div className="absolute top-1 left-1">
                    {getStatusIcon(status)}
                  </div>
                  
                  <div className="absolute bottom-1 right-1 text-xs font-medium">
                    {getAvailabilityCount(date)}
                  </div>
                </div>
              );
            })}
            
            {Array(6 - ((dayArray.length + monthStart.getDay()) % 7 || 7)).fill(null).map((_, index) => (
              <div key={`empty-end-${index}`} className="h-16 border border-transparent p-1"></div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full mr-1"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-full mr-1"></div>
                  <span>Sold Out</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded-full mr-1"></div>
                  <span>Not Operating</span>
                </div>
              </div>
              
              <div>
                <span>Click on a date to edit availability</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Availability Modal */}
      {editingDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              Edit Availability for {format(editingDate, 'MMMM d, yyyy')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD_OUT">Sold Out</option>
                  <option value="NOT_OPERATING">Not Operating</option>
                </select>
              </div>
              
              {editFormData.status === 'AVAILABLE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.available}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, available: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingDate(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateAvailability}
                  className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Availability Settings</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Capacity
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity || 10}
                onChange={(e) => updateFormData({ capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used as the default value for new available dates
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Availability changes will be saved when you submit the product form.
                  Remember to set availability dates for your product so customers can make bookings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};