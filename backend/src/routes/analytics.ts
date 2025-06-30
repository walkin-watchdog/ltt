import express from 'express';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();


// Get dashboard analytics (Admin/Editor/Viewer)
router.get('/dashboard', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    // Get current date info
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total counts
    const [
      totalProducts,
      totalBookings,
      totalRevenue,
      monthlyBookings,
      monthlyRevenue,
      yearlyRevenue,
      pendingRequests,
      activeSubscribers,
      weeklyBookings,
      weeklyRevenue,
      totalAbandonedCarts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'CONFIRMED' }
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: startOfMonth },
          status: 'CONFIRMED'
        }
      }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: startOfMonth },
          status: 'CONFIRMED'
        }
      }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: startOfYear },
          status: 'CONFIRMED'
        }
      }),
      prisma.tripRequest.count({
        where: { status: 'PENDING' }
      }),
      prisma.newsletter.count({
        where: { isActive: true }
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: last7Days },
          status: 'CONFIRMED'
        }
      }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: last7Days },
          status: 'CONFIRMED'
        }
      }),
      prisma.abandonedCart.count(),
      // Simple conversion rate calculation
      prisma.booking.count({ where: { status: 'CONFIRMED' } }).then(async (confirmed) => {
        const total = await prisma.booking.count();
        return total > 0 ? (confirmed / total) * 100 : 0;
      })
    ]);

    // Booking trends (last 30 days)
    const bookingTrends = await prisma.booking.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: last30Days },
        status: 'CONFIRMED'
      },
      orderBy: { createdAt: 'asc' }
    });

    // Format booking trends to group by date
    const formattedBookingTrends = bookingTrends.map(trend => ({
      date: trend.createdAt.toISOString().split('T')[0],
      bookings: trend._count.id,
      revenue: trend._sum.totalAmount || 0
    }));

    // Revenue by category
    const revenueByCategory = await prisma.booking.groupBy({
      by: ['productId'],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: last30Days },
        status: 'CONFIRMED'
      },
      orderBy: { _sum: { totalAmount: 'desc' } }
    });

    // Get product details for categories
    const productIds = revenueByCategory.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    });

    // Group revenue by category
    // const categoryRevenue = revenueByCategory.reduce((acc: any, booking) => {
    //   const product = products.find(p => p.id === booking.productId);
    //   const category = product?.category || 'Unknown';
      
    //   if (!acc[category]) {
    //     acc[category] = { category, bookings: 0, revenue: 0 };
    //   }
      
    //   acc[category].bookings += booking._count.id;
    //   acc[category].revenue += booking._sum.totalAmount || 0;
      
    //   return acc;
    // }, {});

    // const formattedRevenueByCategory = Object.values(categoryRevenue);

    // Top performing products
    const topProductsData = await prisma.booking.groupBy({
      by: ['productId'],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: { status: 'CONFIRMED' },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10
    });

    const topProductIds = topProductsData.map(item => item.productId);
    const topProductDetails = await prisma.product.findMany({
      where: { 
        id: { in: topProductIds },
        isActive: true 
      },
      select: { id: true, title: true }
    });

    const topProducts = topProductsData.map(booking => {
      const product = topProductDetails.find(p => p.id === booking.productId);
      return {
        id: product?.id,
        title: product?.title,
        total_bookings: booking._count.id,
        total_revenue: booking._sum.totalAmount || 0
      };
    }).filter(product => product.id); // Filter out products that weren't found

    // Monthly comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthStats = await prisma.booking.aggregate({
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: lastMonth, lte: lastMonthEnd },
        status: 'CONFIRMED'
      }
    });

    res.json({
      overview: {
        totalProducts,
        totalBookings,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        monthlyBookings,
        monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
        weeklyBookings,
        weeklyRevenue: weeklyRevenue._sum.totalAmount || 0,
        yearlyRevenue: yearlyRevenue._sum.totalAmount || 0,
        pendingRequests,
        activeSubscribers,
        totalAbandonedCarts,
      },
      trends: {
        monthlyGrowth: {
          bookings: lastMonthStats._count.id > 0 
            ? Math.round(((monthlyBookings - lastMonthStats._count.id) / lastMonthStats._count.id) * 100)
            : 0,
          revenue: (lastMonthStats._sum.totalAmount || 0) > 0
            ? Math.round((((monthlyRevenue._sum.totalAmount || 0) - (lastMonthStats._sum.totalAmount || 0)) / (lastMonthStats._sum.totalAmount || 0)) * 100)
            : 0
        }
      },
      bookingTrends: formattedBookingTrends,
      // revenueByCategory: formattedRevenueByCategory,
      topProducts
    });
  } catch (error) {
    next(error);
  }
});

// Get detailed analytics
router.get('/detailed', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { startDate, endDate, productId, category } = req.query;
    
    const whereClause: any = { status: 'CONFIRMED' };
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    if (productId) {
      whereClause.productId = productId;
    }

    const [bookingStats, revenueStats, customerStats] = await Promise.all([
      prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { totalAmount: true }
      }),
      prisma.booking.aggregate({
        _avg: { totalAmount: true },
        _min: { totalAmount: true },
        _max: { totalAmount: true },
        where: whereClause
      }),
      prisma.booking.groupBy({
        by: ['customerEmail'],
        _count: { id: true },
        where: whereClause,
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);

    res.json({
      bookingStats,
      revenueStats,
      topCustomers: customerStats
    });
  } catch (error) {
    next(error);
  }
});
export default router;