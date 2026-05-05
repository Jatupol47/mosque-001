import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const last7Days = new Date(today)
    last7Days.setDate(last7Days.getDate() - 7)

    const [totalVisits, todayVisits, topPages, recentVisitors] = await Promise.all([
      prisma.visitorLog.count(),
      prisma.visitorLog.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      prisma.visitorLog.groupBy({
        by: ['path'],
        _count: {
          path: true
        },
        orderBy: {
          _count: {
            path: 'desc'
          }
        },
        take: 10
      }),
      prisma.visitorLog.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ])

    // Fetch recent stats and cast to expected format
    let recentStats = []
    try {
      const rawStats = await prisma.$queryRaw`
        SELECT 
          CAST("createdAt" AS DATE) as date, 
          COUNT(*)::int as count 
        FROM "VisitorLog" 
        WHERE "createdAt" >= ${last7Days}
        GROUP BY CAST("createdAt" AS DATE)
        ORDER BY date ASC
      `
      recentStats = Array.isArray(rawStats) ? rawStats : []
    } catch (rawError) {
      console.error('[Stats API] Raw Query Error:', rawError)
    }

    return {
      totalVisits,
      todayVisits,
      recentStats,
      topPages,
      recentVisitors
    }
  } catch (error) {
    console.error('[Stats API] Main Error:', error)
    return {
      totalVisits: 0,
      todayVisits: 0,
      recentStats: [],
      topPages: [],
      recentVisitors: [],
      error: error.message
    }
  }
})
