// Dashboard related types
export interface DashboardStats {
  overview: {
    totalProducts: number;
    totalBookings: number;
    totalRevenue: number;
    monthlyBookings: number;
    monthlyRevenue: number;
    weeklyBookings: number;
    weeklyRevenue: number;
    yearlyRevenue: number;
    pendingRequests: number;
    activeSubscribers: number;
    totalAbandonedCarts: number;
    conversionRate: number;
  };
  trends: {
    monthlyGrowth: {
      bookings: number;
      revenue: number;
    };
  };
  bookingTrends: any[];
  revenueByType: any[];
  topProducts: any[];
}
