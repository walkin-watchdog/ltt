import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Calendar,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { DashboardStats } from '../types/index.ts';


export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const [reportCurrency, setReportCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'JPY' | 'SGD' | 'AED' | 'CNY'>('INR');
  const symbol = (c: string) =>
  ({ USD:'$', EUR:'€', GBP:'£', INR:'₹', AUD:'A$', CAD:'C$', JPY:'¥', SGD:'S$', AED:'د.إ', CNY:'¥' } as const)[c] ?? c

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/analytics/dashboard?reportCurrency=${encodeURIComponent(reportCurrency)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard data:', data);
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, reportCurrency]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  const revenueCards = (stats?.overview.totalRevenueByCurrency || []).map(r => ({
    title: `Revenue (${r.currency})`,
    value: `${symbol(r.currency)}${(r._sum.totalAmount || 0).toLocaleString()}`,
    icon: DollarSign,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  }));

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.overview.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Bookings',
      value: stats?.overview.totalBookings || 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      growth: stats?.trends.monthlyGrowth.bookings,
    },
    ...revenueCards,
    {
      title: 'Monthly Bookings',
      value: stats?.overview.monthlyBookings || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    { title:`Monthly Rev. (${symbol(stats?.overview.reportCurrency||'INR')})`,
      value:`${symbol(stats?.overview.reportCurrency||'INR')}${(stats?.overview.monthlyRevenue||0).toLocaleString()}`,
      icon:DollarSign, color:'text-indigo-600', bgColor:'bg-indigo-100' 
    },
    { title:`Weekly Rev. (${symbol(stats?.overview.reportCurrency||'INR')})`,
      value:`${symbol(stats?.overview.reportCurrency||'INR')}${(stats?.overview.weeklyRevenue||0).toLocaleString()}`,
      icon:TrendingUp, color:'text-teal-600', bgColor:'bg-teal-100' 
    },
    {
      title: 'Abandoned Carts',
      value: stats?.overview.totalAbandonedCarts || 0,
      icon: ShoppingCart,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Pending Requests',
      value: stats?.overview.pendingRequests || 0,
      icon: MessageSquare,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Newsletter Subscribers',
      value: stats?.overview.activeSubscribers || 0,
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                {stat.growth !== undefined && (
                  <div className={`flex items-center mt-2 ${stat.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.growth >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                    <span className="text-sm">{Math.abs(stat.growth)}% vs last month</span>
                  </div>
                )}
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue by Type & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            {stats?.topProducts?.slice(0, 5).map((product: any, index: number) => (
              <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-[#104c57] text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.title}</p>
                    <p className="text-sm text-gray-500">{product.total_bookings || 0} bookings</p>
                  </div>
                </div>
                <span className="font-semibold text-[#104c57]">{symbol(stats?.overview.reportCurrency || 'INR')}{product.total_revenue?.toLocaleString() || 0}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Product Type</h3>
          <div className="space-y-4">
            {Array.isArray(stats?.revenueByType) && stats.revenueByType.map((type, index) => (
             <div key={type.type || index} className="flex items-center justify-between py-2">
               <div className="flex items-center">
                 <div className="bg-[#ff914d] text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold mr-3">{index + 1}</div>
                 <div>
                   <p className="font-medium text-gray-900">{type.type}</p>
                   <p className="text-sm text-gray-500">{type.bookings} bookings</p>
                 </div>
               </div>
               <span className="font-semibold text-[#ff914d]">
                 {symbol(stats?.overview.reportCurrency || 'INR')}{type.revenue?.toLocaleString() || 0}
               </span>
             </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};