import { prisma } from '../../utils/prisma'
import { serverSupabaseUser } from '#supabase/server'

/**
 * API วิเคราะห์สถิติสรุปรายงานจำนวนผู้เยี่ยมชมสำหรับแอดมิน (Admin Visitor Analytics API - GET)
 * ทำหน้าที่:
 * 1. ตรวจสอบระบบความปลอดภัยและสิทธิ์การเข้าถึงข้อมูลระดับแอดมิน
 * 2. รับตัวแปร Parameter ในการกรองเดือนและปี (หากระบุให้จำกัดช่วงปฏิทิน หากไม่ระบุจะแสดงกราฟ 7 วันล่าสุดเป็นค่าตั้งต้น)
 * 3. รันคิวรี่หาผลลัพธ์พร้อมกันด้วย Promise.all (Parallel queries) เพื่อลดภาระการโหลดข้อมูล:
 *    - ยอดวิวรวมทั้งหมดตั้งแต่เริ่มติดตั้งระบบ
 *    - ยอดวิวย่อยเฉพาะวันปัจจุบัน (วันนี้)
 *    - กลุ่มหน้าเว็บยอดนิยม 10 ลำดับแรก (Group by path และสั่ง Limit = 10)
 *    - ประวัติผู้เข้าชมล่าสุด 10 รายการจริง (Real-time logs)
 * 4. ยิงคิวรี่คำสั่งตรง SQL (Prisma.$queryRaw) เพื่อกรุ๊ปข้อมูลสถิติรายวันจัดส่งไปวาดบนกราฟแท่ง
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. ตรวจสอบสิทธิ์การเข้าสู่ระบบ
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // ดึงพารามิเตอร์กรองเดือน/ปี
    const query = getQuery(event)
    const filterMonth = query.month ? parseInt(query.month as string) : null
    const filterYear = query.year ? parseInt(query.year as string) : null

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // ตั้งค่าช่วงเวลาเริ่มต้นสำหรับแท่งกราฟ (ค่าตั้งต้นคือ ย้อนหลัง 7 วันจากวันปัจจุบัน)
    let chartStartDate = new Date(today)
    chartStartDate.setDate(chartStartDate.getDate() - 7)
    let chartEndDate = new Date(now)

    // พลิกขอบเขตปฏิทินหากมีการกดยื่นกรองเดือนและปีเข้ามาจริง
    if (filterMonth !== null && filterYear !== null) {
      chartStartDate = new Date(filterYear, filterMonth - 1, 1)
      chartEndDate = new Date(filterYear, filterMonth, 0, 23, 59, 59)
    }

    // 2. ดึงข้อมูล 4 ชุดหลักพร้อมกันแบบคู่ขนานเพื่อความรวดเร็ว
    const [totalVisits, todayVisits, topPages, recentVisitors] = await Promise.all([
      prisma.visitorLog.count(), // ยอดรวมบันทึกทั้งหมด
      prisma.visitorLog.count({  // ยอดรวมเฉพาะวันนี้ gte = 00:00 น.
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      // ค้นหา 10 หน้ายอดฮิต
      prisma.visitorLog.groupBy({
        by: ['path'],
        where: (filterMonth !== null && filterYear !== null) ? {
          createdAt: {
            gte: chartStartDate,
            lte: chartEndDate
          }
        } : undefined,
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
      // ค้นหารายการบันทึกผู้ใช้ล่าสุด 10 แถว
      prisma.visitorLog.findMany({
        where: (filterMonth !== null && filterYear !== null) ? {
          createdAt: {
            gte: chartStartDate,
            lte: chartEndDate
          }
        } : undefined,
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ])

    // 3. ยิง Raw SQL คำสั่งตรงในระบบฐานข้อมูล PostgreSQL เพื่อกรุ๊ปรวมจำนวนสถิติแบ่งตามวันที่จริง
    let recentStats = []
    try {
      const rawStats = await prisma.$queryRaw`
        SELECT 
          CAST("createdAt" AS DATE) as date, 
          COUNT(*)::int as count 
        FROM "VisitorLog" 
        WHERE "createdAt" >= ${chartStartDate} AND "createdAt" <= ${chartEndDate}
        GROUP BY CAST("createdAt" AS DATE)
        ORDER BY date ASC
      `
      recentStats = Array.isArray(rawStats) ? rawStats : []
    } catch (rawError) {
      console.error('[Stats API] Raw Query Error:', rawError)
    }

    // คืนสรุปข้อมูลรวมทั้งหมด
    return {
      totalVisits,
      todayVisits,
      recentStats,
      topPages,
      recentVisitors,
      period: {
        start: chartStartDate,
        end: chartEndDate
      }
    }
  } catch (error: any) {
    console.error('[Stats API] Main Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})
