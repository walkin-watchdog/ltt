import { useState, useEffect } from 'react';
import { Calendar, Search, Clock, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [modalData, setModalData] = useState({
    productId: '',
    date: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'SOLD_OUT' | 'NOT_OPERATING',
    available: 10
  });
  const [saveError, setSaveError] = useState('');
  const { token, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [token]);

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

  const filteredAvailabilities = availabilities.filter(availability => {
    const matchesSearch = 
      availability.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      availability.product.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = !selectedProduct || availability.productId === selectedProduct;
    const matchesDate = !selectedDate || availability.date.startsWith(selectedDate);
    const matchesStatus = !selectedStatus || availability.status === selectedStatus;
    
    return matchesSearch && matchesProduct && matchesDate && matchesStatus;
  });

  const handleSave = async () => {
    // Validate form data
    if (!modalData.productId || !modalData.date) {
      setSaveError('Please fill in all required fields');
      return;
    }

    // Validate date is not in the past (unless editing existing)
    const selectedDate = new Date(modalData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!editingAvailability && selectedDate < today) {
      setSaveError('Cannot set availability for past dates');
      return;
    }

    setSaveError('');

    try {
      const url = editingAvailability 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability/${editingAvailability.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/availability`;
      
      const method = editingAvailability ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(modalData),
      });

      if (response.ok) {
        fetchData();
        setIsModalOpen(false);
        setEditingAvailability(null);
        setSaveError('');
        setModalData({
          productId: '',
          date: '',
          status: 'AVAILABLE',
          available: 10
        });
      } else {
        const errorData = await response.json();
        setSaveError(errorData.message || 'Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      setSaveError('Network error. Please try again.');
    }
  };

  const handleEdit = (availability: Availability) => {
    setEditingAvailability(availability);
    setSaveError('');
    setModalData({
      productId: availability.productId,
      date: availability.date,
      status: availability.status,
      available: availability.available
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
          <p className="text-gray-600 mt-2">Manage product availability and booking status</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {filteredAvailabilities.length} availability records
          </span>
          {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
            <button
              onClick={() => {
                setEditingAvailability(null);
                setModalData({
                  productId: '',
                  date: '',
                  status: 'AVAILABLE',
                  available: 10
                });
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-[#ff914d] text-white rounded-lg hover:bg-[#e8823d] transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Availability
            </button>
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
                        {new Date(availability.date).toLocaleDateString('en-IN')}
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
          <p className="text-gray-600">Add availability for your products to start managing bookings.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingAvailability ? 'Edit Availability' : 'Add Availability'}
            </h3>
            
            {saveError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {saveError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                <select
                  value={modalData.productId}
                  onChange={(e) => setModalData(prev => ({ ...prev, productId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  disabled={Boolean(editingAvailability)}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.title} ({product.productCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={modalData.date}
                  onChange={(e) => setModalData(prev => ({ ...prev, date: e.target.value }))}
                  min={editingAvailability ? undefined : new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  required
                />
                {!editingAvailability && (
                  <p className="text-xs text-gray-500 mt-1">Cannot select past dates for new availability</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={modalData.status}
                  onChange={(e) => setModalData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD_OUT">Sold Out</option>
                  <option value="NOT_OPERATING">Not Operating</option>
                </select>
              </div>

              {modalData.status === 'AVAILABLE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={modalData.available}
                    onChange={(e) => setModalData(prev => ({ ...prev, available: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAvailability(null);
                    setSaveError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!modalData.productId || !modalData.date}
                  className="px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};