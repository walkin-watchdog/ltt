import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isSameDay } from 'date-fns';

interface Availability {
  id: string;
  productId: string;
  date: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  available: number;
  booked: number;
  product: {
    id: string;
    title: string;
    productCode: string;
  };
}

interface Product {
  id: string;
  title: string;
  productCode: string;
  type: string;
}

interface AvailabilityCalendarProps {
  availabilities: Availability[];
  products: Product[];
  selectedProduct: string;
  onDateClick: (date: Date) => void;
  onBulkSelect: (dates: Date[]) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availabilities,
  products,
  selectedProduct,
  onDateClick,
  onBulkSelect
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isSelectingMultiple, setIsSelectingMultiple] = useState(false);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const dayArray = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter availabilities for the selected product and current month
  const filteredAvailabilities = availabilities.filter(availability => 
    (!selectedProduct || availability.productId === selectedProduct) &&
    new Date(availability.date).getMonth() === currentMonth.getMonth() &&
    new Date(availability.date).getFullYear() === currentMonth.getFullYear()
  );

  const getDateStatus = (date: Date) => {
    const availability = filteredAvailabilities.find(a => 
      isSameDay(new Date(a.date), date)
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
    const availability = filteredAvailabilities.find(a => 
      isSameDay(new Date(a.date), date)
    );
    
    return availability ? `${availability.available - availability.booked}/${availability.available}` : '';
  };

  const handleDateClick = (date: Date) => {
    if (isSelectingMultiple) {
      if (selectedDates.some(d => isSameDay(d, date))) {
        setSelectedDates(selectedDates.filter(d => !isSameDay(d, date)));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else {
      onDateClick(date);
    }
  };

  const toggleMultipleSelection = () => {
    if (isSelectingMultiple && selectedDates.length > 0) {
      onBulkSelect(selectedDates);
    }
    setIsSelectingMultiple(!isSelectingMultiple);
    setSelectedDates([]);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMultipleSelection}
            className={`px-3 py-1 rounded text-sm font-medium ${
              isSelectingMultiple 
                ? 'bg-[#ff914d] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelectingMultiple ? `Apply (${selectedDates.length})` : 'Bulk Select'}
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

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {Array(monthStart.getDay()).fill(null).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-20 border border-transparent p-1"></div>
        ))}
        
        {dayArray.map(date => {
          const status = getDateStatus(date);
          const isSelected = selectedDates.some(d => isSameDay(d, date));
          
          return (
            <div
              key={date.toString()}
              onClick={() => handleDateClick(date)}
              className={`h-20 border rounded-lg cursor-pointer relative p-1
                ${isToday(date) ? 'border-blue-300' : 'border-gray-200'} 
                ${isSelected ? 'ring-2 ring-[#ff914d]' : ''}
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
          <div key={`empty-end-${index}`} className="h-20 border border-transparent p-1"></div>
        ))}
      </div>

      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
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
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-full mr-1"></div>
          <span>No Data</span>
        </div>
      </div>
    </div>
  );
};