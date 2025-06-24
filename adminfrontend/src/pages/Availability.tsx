import { useState, useEffect } from 'react';
import { Calendar, Search, Clock, CheckCircle, XCircle, AlertCircle, Plus, Grid, List, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AvailabilityModal, type AvailabilityFormData } from '../components/availability/AvailabilityModal';
import { DateRangeSelector } from '../components/availability/DateRangeSelector';
import { format } from 'date-fns';
import { AvailabilityCalendar } from '@/components/availability/AvailabilityCalender';

interface Product {
  id: string;
  title: string;
  productCode: string;
  type: string;
}

interface Availability {
  id: string;
  productId: string;
  date: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING';
  available: number;
  booked: number;
  product: Product;
}

export const Availability = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [filteredAvailabilities, setFilteredAvailabilities] = useState<Availability[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [isRangeSelectorOpen, setIsRangeSelectorOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isBulkEdit, setIsBulkEdit] = useState(false);
  const [initialModalData, setInitialModalData] = useState<{status: string, available: number} | undefined>(undefined);
  const { token } = useAuth();

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    filterAvailabilities();
  }, [searchTerm, selectedProduct, selectedDate, selectedStatus, availabilities]);

  const fetchData = async () => {
    try {
      const [availabilityRes, productsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/products`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (availabilityRes.ok && productsRes.ok) {
        const [availabilityData, productsData] = await Promise.all([
          availabilityRes.json(),
          productsRes.json(),
        ]);
        setAvailabilities(availabilityData);
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAvailabilities = () => {
    let filtered = availabilities.filter(availability => {
      const matchesSearch = 
        availability.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        availability.product.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProduct = !selectedProduct || availability.productId === selectedProduct;
      const matchesDate = !selectedDate || availability.date.startsWith(selectedDate);
      const matchesStatus = !selectedStatus || availability.status === selectedStatus;
      
      return matchesSearch && matchesProduct && matchesDate && matchesStatus;
    });
    
    setFilteredAvailabilities(filtered);
  };

  const updateAvailability = async (formData: AvailabilityFormData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: formData.productId,
          date: formData.date ? format(formData.date, 'yyyy-MM-dd') : '',
          status: formData.status,
          available: formData.available || 0,
        }),
      });

      if (response.ok) {
        fetchData();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleBulkUpdate = async (formData: AvailabilityFormData) => {
    if (!formData.dates || formData.dates.length === 0) return;
    
    try {
      const updates = formData.dates.map(date => ({
        productId: formData.productId,
        date: format(date, 'yyyy-MM-dd'),
        status: formData.status,
        available: formData.available || 0
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ updates }),
      });

      if (response.ok) {
        fetchData(); // Refresh the data
        setIsBulkEdit(false);
        setSelectedDates([]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    // Create array of dates from the range
    const dateArray: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setSelectedDates(dateArray);
    setIsBulkEdit(true);
    setIsModalOpen(true);
    setIsRangeSelectorOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'SOLD_OUT':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'NOT_OPERATING':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'SOLD_OUT':
        return 'bg-red-100 text-red-800';
      case 'NOT_OPERATING':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDateObj(date);
    
    // Find if there's existing data for this date
    const existingData = availabilities.find(a => 
      a.productId === selectedProduct && 
      new Date(a.date).toDateString() === date.toDateString()
    );
    
    if (existingData) {
      setInitialModalData({
        status: existingData.status,
        available: existingData.available
      });
    } else {
      setInitialModalData(undefined);
    }
    
    setIsModalOpen(true);
  };

  const handleBulkSelect = (dates: Date[]) => {
    setSelectedDates(dates);
    setIsBulkEdit(true);
    setIsModalOpen(true);
  };

  const handleModalSave = (formData: AvailabilityFormData) => {
    if (isBulkEdit) {
      handleBulkUpdate(formData);
    } else {
      updateAvailability(formData);
    }
  };

  // Delete availabilities in bulk
  const handleBulkDelete = async () => {
    if (!selectedDates.length || !selectedProduct) return;
    
    if (!window.confirm(`Are you sure you want to delete availability for ${selectedDates.length} dates?`)) {
      return;
    }
    
    try {
      // In a real implementation, we'd have a bulk delete endpoint
      // For now we'll simulate with existing endpoints
      for (const date of selectedDates) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const existingAvailability = availabilities.find(a => 
          a.productId === selectedProduct && 
          a.date.startsWith(formattedDate)
        );
        
        if (existingAvailability) {
          // For now, we'll mark it as not operating with 0 availability
          await updateAvailability({
            productId: selectedProduct,
            date,
            status: 'NOT_OPERATING',
            available: 0
          });
        }
      }
      
      setSelectedDates([]);
      setIsBulkEdit(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting availabilities:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
          <p className="text-gray-600 mt-2">Manage product availability and booking slots</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg border border-gray-200 flex">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-[#ff914d] text-white' : 'text-gray-700'}`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 ${viewMode === 'calendar' ? 'bg-[#ff914d] text-white' : 'text-gray-700'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
          
          <span className="text-sm text-gray-500">
            {filteredAvailabilities.length} availability records
          </span>
          
          <button
            onClick={() => setIsRangeSelectorOpen(true)}
            className="flex items-center px-4 py-2 bg-[#ff914d] text-white rounded-lg hover:bg-[#e8823d] transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Date Range
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
          >
            <option value="">All Products</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
          />
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="SOLD_OUT">Sold Out</option>
            <option value="NOT_OPERATING">Not Operating</option>
          </select>
        </div>
      </div>

      {/* View based on selected mode */}
      {viewMode === 'calendar' ? (
        // Calendar View
        <AvailabilityCalendar
          availabilities={filteredAvailabilities} 
          products={products}
          selectedProduct={selectedProduct}
          onDateClick={handleDateClick}
          onBulkSelect={handleBulkSelect}
        />
      ) : (
        // Table View
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAvailabilities.map((availability) => (
                  <tr key={availability.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {availability.product.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {availability.product.productCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(availability.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(availability.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(availability.status)}`}>
                          {availability.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {availability.available}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {availability.booked}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedDateObj(new Date(availability.date));
                            setInitialModalData({
                              status: availability.status,
                              available: availability.available
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredAvailabilities.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No availability records found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or add availability for your products.</p>
        </div>
      )}

      {/* Modals */}
      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsBulkEdit(false);
          setSelectedDates([]);
        }}
        onSave={handleModalSave}
        date={selectedDateObj}
        products={products}
        selectedProduct={selectedProduct}
        selectedDates={selectedDates}
        isBulkEdit={isBulkEdit}
        initialData={initialModalData}
      />
      
      {isRangeSelectorOpen && (
        <DateRangeSelector
          onDateRangeSelect={handleDateRangeSelect}
          onClose={() => setIsRangeSelectorOpen(false)}
        />
      )}
      
      {/* Bulk Actions - visible when dates are selected */}
      {selectedDates.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-40 flex items-center space-x-4">
          <span className="text-sm font-medium">{selectedDates.length} dates selected</span>
          <button
            onClick={() => {
              setIsBulkEdit(true);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-[#ff914d] text-white text-sm rounded hover:bg-[#e8823d]"
          >
            Edit Selected
          </button>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Selected
          </button>
          <button
            onClick={() => {
              setSelectedDates([]);
              setIsBulkEdit(false);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};