import express from 'express';
import { prisma } from '../utils/prisma'
import { authenticate, authorize } from '../middleware/auth';
import { fetchExchangeRates } from '../routes/currency';

const router = express.Router();


// Get dashboard analytics (Admin/Editor/Viewer)
router.get('/dashboard', authenticate, authorize(['ADMIN', 'EDITOR', 'VIEWER']), async (req, res, next) => {
  try {
    const reportCurrency = (
      (req.query.reportCurrency as string) ||
      'INR'
    ).toUpperCase();

    const sumInReportCurrency = async (
      rows: { currency: string; _sum: { totalAmount: number | null } }[]
    ) => {
      if (!rows.length) return 0;

      const rates = await fetchExchangeRates(reportCurrency);

      return rows.reduce((acc, row) => {
        const amt = row._sum.totalAmount || 0;
        if (!amt) return acc;
        return row.currency === reportCurrency
          ? acc + amt
          : acc + amt / (rates[row.currency] || 1);
      }, 0);
    };

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
      totalRevenueByCurrency,
      monthlyBookings,
      monthlyRevenueByCurrency,
      weeklyBookings,
      weeklyRevenueByCurrency,
      yearlyRevenueByCurrency,
      pendingRequests,
      activeSubscribers,
      totalAbandonedCarts,
      conversionRate,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.booking.count(),
      prisma.booking.groupBy({
        by: ['currency'] as const,
        _sum: { totalAmount: true },
        where: { status: 'CONFIRMED' }
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: startOfMonth },
          status: 'CONFIRMED'
        }
      }),
      prisma.booking.groupBy({
        by: ['currency'] as const,
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: startOfMonth },
          status: 'CONFIRMED'
        }
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: last7Days },
          status: 'CONFIRMED'
        }
      }),
      prisma.booking.groupBy({
        by: ['currency'] as const,
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: last7Days },
          status: 'CONFIRMED'
        }
      }),
      prisma.booking.groupBy({
        by: ['currency'] as const,
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
      prisma.abandonedCart.count(),
      // Simple conversion rate calculation
      prisma.booking.count({ where: { status: 'CONFIRMED' } }).then(async (confirmed) => {
        const total = await prisma.booking.count();
        return total > 0 ? (confirmed / total) * 100 : 0;
      })
    ]);

    const [
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      yearlyRevenue
    ] = await Promise.all([
      sumInReportCurrency(totalRevenueByCurrency),
      sumInReportCurrency(monthlyRevenueByCurrency),
      sumInReportCurrency(weeklyRevenueByCurrency),
      sumInReportCurrency(yearlyRevenueByCurrency)
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

    // Revenue by type
    const revenueByTypeRaw = await prisma.booking.groupBy({
      by: ['productId'] as const,
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: last30Days },
        status: 'CONFIRMED',
        productId: { not: null }
      },
      orderBy: { _sum: { totalAmount: 'desc' } }
    });

    const revenueByType = revenueByTypeRaw as Array<{
      productId: string;
      _count:    { id: number };
      _sum:      { totalAmount: number | null };
    }>;

    const typeProductIds = revenueByType.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: typeProductIds } },
      select: { id: true, type: true }
    });


    // 2) Aggregate manual bookings into one “Custom” bucket
    const manualAgg = await prisma.booking.aggregate({
      _count: { id: true },
      _sum:   { totalAmount: true },
      where: {
        isManual: true,
        status:   'CONFIRMED',
        createdAt:{ gte: last30Days }
      }
    });

    // 3) Merge:
    const formattedrevenueByType = revenueByType.map(item => ({
      key:     item.productId,
      bookings:item._count.id,
      revenue: item._sum.totalAmount || 0
    }));

    if (manualAgg._count.id > 0) {
      formattedrevenueByType.unshift({
        key:      'custom',
        bookings: manualAgg._count.id,
        revenue:  manualAgg._sum.totalAmount || 0
      });
    }

    // Group revenue by type
    const typeRevenue = revenueByType.reduce((acc: any, booking) => {
      const prod = products.find(p => p.id === booking.productId);
      const type = prod?.type || 'Unknown';
      
      if (!acc[type]) {
        acc[type] = { type, bookings: 0, revenue: 0 };
      }
      
      acc[type].bookings += booking._count.id;
      acc[type].revenue += booking._sum.totalAmount || 0;
      
      return acc;
    }, {});

    if (manualAgg._count.id > 0) {
          typeRevenue['Custom'] = {
            type:     'Custom',
            bookings: manualAgg._count.id,
            revenue:  manualAgg._sum.totalAmount || 0,
          };
        }

    const formattedRevenueByType = Object.values(typeRevenue);

    // Top performing products
    const topProductsData = await prisma.booking.groupBy({
      by: ['productId'] as const,
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        status:    'CONFIRMED',
        productId: { not: null }
      },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10
    });

    const topProductIds = topProductsData
      .map(item => item.productId)
      .filter((id): id is string => id !== null);
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
    
    const lastMonthStatsByCurrency = await prisma.booking.groupBy({
      by:     ['currency'] as const,
      _count: { id: true },
      _sum:   { totalAmount: true },
      where: {
        createdAt: { gte: lastMonth, lte: lastMonthEnd },
        status: 'CONFIRMED'
      }
    });

    const lastMonthStats = {
      _count: { id: lastMonthStatsByCurrency.reduce((n, r) => n + r._count.id, 0) },
      _sum:   { totalAmount: await sumInReportCurrency(lastMonthStatsByCurrency) }
    };

    res.json({
      overview: {
        totalProducts,
        totalBookings,
        reportCurrency,
        totalRevenue,
        totalRevenueByCurrency,
        monthlyBookings,
        monthlyRevenueByCurrency,
        monthlyRevenue,
        weeklyBookings,
        weeklyRevenueByCurrency,
        weeklyRevenue,
        yearlyRevenueByCurrency,
        yearlyRevenue,
        pendingRequests,
        activeSubscribers,
        totalAbandonedCarts,
        conversionRate,
      },
      trends: {
        monthlyGrowth: {
          bookings: lastMonthStats._count.id > 0 
            ? Math.round(((monthlyBookings - lastMonthStats._count.id) / lastMonthStats._count.id) * 100)
            : 0,
          revenue: (lastMonthStats._sum.totalAmount || 0) > 0
            ? Math.round(((monthlyRevenue - (lastMonthStats._sum.totalAmount || 0)) /
                          (lastMonthStats._sum.totalAmount || 0)) * 100)
            : 0
        }
      },
      bookingTrends: formattedBookingTrends,
      revenueByType: formattedRevenueByType,
      topProducts
    });
  } catch (error) {
    next(error);
  }
});

// Get detailed analytics
router.get('/detailed', authenticate, authorize(['ADMIN', 'EDITOR']), async (req, res, next) => {
  try {
    const { startDate, endDate, productId, type } = req.query;
    
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
        by: ['status'] as const,
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
        by: ['customerEmail'] as const,
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