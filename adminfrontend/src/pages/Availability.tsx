import { useState, useEffect } from 'react';
import { Calendar, Search, Edit, Trash2, Ban, Eye} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { AvailabilityProp, BlockedDate, Product } from '@/types.ts';
import { BlockDates } from '@/components/availability/BlockDates';
import { formatDateRange, getStatusColor, getStatusIcon } from '@/components/availability/BasicFunctions';
import { EditModel } from '@/components/availability/EditModel';

export const Availability = () => {
  const [availabilities, setAvailabilities] = useState<AvailabilityProp[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<AvailabilityProp | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isViewBlockedModalOpen, setIsViewBlockedModalOpen] = useState(false);
  const [blockDates, setBlockDates] = useState({
    selectedDates: [] as string[],
    reason: '' as string
  });
  const [modalData, setModalData] = useState({
    productId: '',
    startDate: '',
    endDate: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING'
  });
  const [saveError, setSaveError] = useState('');
  const { token, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [token]);

const fetchData = async () => {
    try {
      const [availabilityRes, productsRes, blockedRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/products`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability/blocked`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);
  
      if (availabilityRes.ok && productsRes.ok && blockedRes.ok) {
        const [availabilityData, productsData, blockedData] = await Promise.all([
          availabilityRes.json(),
          productsRes.json(),
          blockedRes.json(),
        ]);
        console.log('Fetched availability data:', availabilityData);
        console.log('Fetched blocked data:', blockedData);
        setAvailabilities(availabilityData || []);
        setProducts(productsData);
        setBlockedDates(blockedData.blockedDates || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get blocked dates count for a product
  const getBlockedDatesCount = (productId: string) => {
    return blockedDates.filter(bd => bd.productId === productId && bd.isActive === false).length;
  };

  // Check if a date is already blocked for a product
  const isDateAlreadyBlocked = (productId: string, date: string) => {
    return blockedDates.some(bd => 
      bd.productId === productId && 
      bd.date.split('T')[0] === date && 
      bd.isActive === false
    );
  };

  // Handle unblocking dates
  const handleUnblockDate = async (blockedDateId: string) => {
    if (!window.confirm('Are you sure you want to unblock this date?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability/unblock/${blockedDateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchData(); // Refresh all data
        setSaveError('Date unblocked successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSaveError(''), 3000);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.message || 'Failed to unblock date');
      }
    } catch (error) {
      console.error('Error unblocking date:', error);
      setSaveError('Network error. Please try again.');
    }
  };

  const filteredAvailabilities = availabilities.filter(availability => {
    if (!availability) return false;
    
    const matchesSearch = 
      availability.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      availability.product?.productCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = !selectedProduct || availability.productId === selectedProduct;
    const matchesDate = !selectedStartDate || availability.startDate.startsWith(selectedStartDate);
    const matchesStatus = !selectedStatus || availability.status === selectedStatus;
    
    return matchesSearch && matchesProduct && matchesDate && matchesStatus;
  });

  const handleEdit = (availability: AvailabilityProp) => {
    setEditingAvailability(availability);
    setSaveError('');
    setModalData({
      productId: availability.productId,
      startDate: availability.startDate.split('T')[0], // Format for date input
      endDate: availability.endDate ? availability.endDate.split('T')[0] : '',
      status: availability.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this availability?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  const handleBulkBlock = async () => {
    if (!blockDates.selectedDates || blockDates.selectedDates.length === 0 || !selectedProduct) {
      setSaveError('Please select a product and at least one date');
      return;
    }

    if( blockDates.selectedDates.length > 30) {
      setSaveError('You can block a maximum of 30 dates at a time');
      return;
    }

     const today = new Date().toISOString().split('T')[0];
  if (blockDates.selectedDates.some(date => date < today)) {
    setSaveError('You cannot block past dates');
    return;
  }
    // Check for duplicate dates
    const duplicateDates = blockDates.selectedDates.filter(date => 
      isDateAlreadyBlocked(selectedProduct, date)
    );

    if (duplicateDates.length > 0) {
      const duplicatesFormatted = duplicateDates.map(date => 
        new Date(date).toLocaleDateString('en-IN')
      ).join(', ');
      setSaveError(`The following dates are already blocked: ${duplicatesFormatted}`);
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct,
          dates: blockDates.selectedDates,
          reason: blockDates.reason
        }),
      });
  
      if (response.ok) {
        fetchData();
        setIsBlockModalOpen(false);
        setBlockDates({ selectedDates: [], reason: '' });
        setSaveError('Dates blocked successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSaveError(''), 3000);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.message || 'Failed to block dates');
      }
    } catch (error) {
      console.error('Error blocking dates:', error);
      setSaveError('Network error. Please try again.');
    }
  };

  const handleViewBlockedDates = async () => {
    if (!selectedProduct) {
      setSaveError('Please select a product first');
      return;
    }
    setIsViewBlockedModalOpen(true);
  };

  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  const selectedProductBlockedDates = selectedProduct 
    ? blockedDates.filter(bd => bd.productId === selectedProduct && bd.isActive === false)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
          <p className="text-gray-600 mt-2">Manage product availability and booking status</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {filteredAvailabilities.length} availability records
          </span>
          {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
            <>
              {selectedProduct && (
                <>
                  <button
                    onClick={handleViewBlockedDates}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Blocked ({selectedProductBlockedDates.length})
                  </button>
                  <button
                    onClick={() => setIsBlockModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Block Dates
                  </button>
                </>
              )}
            </>
          )}
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
            {products.map(product => {
              const blockedCount = getBlockedDatesCount(product.id);
              return (
                <option key={product.id} value={product.id}>
                  {product.title} {blockedCount > 0 ? `(${blockedCount} blocked)` : ''}
                </option>
              );
            })}
          </select>
          
          <input
            type="date"
            placeholder="Start Date"
            value={selectedStartDate}
            onChange={(e) => setSelectedStartDate(e.target.value)}
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAvailabilities.map((availability) => (
                <tr key={availability.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {availability.product?.title || 'Unknown Product'}
                        {getBlockedDatesCount(availability.productId) > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            <Ban className="h-3 w-3 mr-1" />
                            {getBlockedDatesCount(availability.productId)} blocked
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {availability.product?.productCode || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDateRange(availability.startDate, availability.endDate)}
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
                    {availability.booked || 0}
                  </td>
                  {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(availability)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(availability.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAvailabilities.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No availability records found</h3>
          <p className="text-gray-600">
            {availabilities.length === 0 
              ? "No availability records exist. Add some availability records to get started."
              : "No records match your current filters. Try adjusting your search criteria."
            }
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <EditModel
        saveError={saveError}
        setSaveError={setSaveError}
        setIsModalOpen={setIsModalOpen}
        modalData={modalData}
        setModalData={setModalData}
        products={products}
        fetchData={fetchData}
        editingAvailability={editingAvailability}
        setEditingAvailability={setEditingAvailability}
        />
      )}

      {/* Block Dates Modal */}
      {isBlockModalOpen && (
        <BlockDates
        saveError={saveError}
        setSaveError={setSaveError}
        setSelectedProduct={setSelectedProduct}
        products={products}
        blockDates={blockDates}
        setBlockDates={setBlockDates}
        handleBulkBlock={handleBulkBlock}
        isDateAlreadyBlocked={isDateAlreadyBlocked}
        setIsBlockModalOpen={setIsBlockModalOpen}
        selectedProduct= {selectedProduct}
        />
      )}

      {/* View Blocked Dates Modal */}
      {isViewBlockedModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              Blocked Dates for {products.find(p => p.id === selectedProduct)?.title}
            </h3>
            
            {saveError && (
              <div className={`mb-4 p-3 border rounded-md text-sm ${
                saveError.includes('successfully') 
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-red-100 border-red-300 text-red-700'
              }`}>
                {saveError}
              </div>
            )}
            
            <div className="space-y-4">
              {selectedProductBlockedDates.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No blocked dates for this product.</p>
              ) : (
                <div className="space-y-2">
                  {selectedProductBlockedDates.map((blockedDate) => (
                    <div key={blockedDate.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(blockedDate.date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {blockedDate.reason && (
                          <div className="text-sm text-gray-600 mt-1">
                            Reason: {blockedDate.reason}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Blocked on: {new Date(blockedDate.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
                        <button
                          onClick={() => handleUnblockDate(blockedDate.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Unblock
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setIsViewBlockedModalOpen(false);
                    setSaveError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};