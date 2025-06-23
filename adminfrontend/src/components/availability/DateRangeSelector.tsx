import React, { useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { format, addDays, isWithinInterval, startOfDay } from 'date-fns';

interface DateRangeSelectorProps {
  onDateRangeSelect: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  onDateRangeSelect, 
  onClose 
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<'weekdays' | 'weekends' | 'all'>('all');
  const [pattern, setPattern] = useState<'every-day' | 'alternate-days' | 'specific-days'>('every-day');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      alert('Start date cannot be after end date');
      return;
    }
    
    onDateRangeSelect(start, end);
    onClose();
  };

  const handleDaysOfWeekToggle = (day: number) => {
    setSelectedDaysOfWeek(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Date Range</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apply To
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDays('all')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedDays === 'all'
                    ? 'bg-[#ff914d] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Days
              </button>
              <button
                type="button"
                onClick={() => setSelectedDays('weekdays')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedDays === 'weekdays'
                    ? 'bg-[#ff914d] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={() => setSelectedDays('weekends')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedDays === 'weekends'
                    ? 'bg-[#ff914d] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Weekends
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat Pattern
            </label>
            <select
              value={pattern}
              onChange={(e) => setPattern(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            >
              <option value="every-day">Every Day</option>
              <option value="alternate-days">Alternate Days</option>
              <option value="specific-days">Specific Days of Week</option>
            </select>
          </div>

          {pattern === 'specific-days' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Days of Week
              </label>
              <div className="flex flex-wrap gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDaysOfWeekToggle(index)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      selectedDaysOfWeek.includes(index)
                        ? 'bg-[#ff914d] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d]"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};