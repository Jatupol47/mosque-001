import { prisma } from '../../utils/prisma'
import { serverSupabaseUser } from '#supabase/server'

/**
 * API ดึงรายการแจ้งโอนบริจาคสำหรับหลังบ้านแอดมิน (Admin Donations Retrieval API - GET)
 * ทำหน้าที่:
 * 1. ตรวจสอบความถูกต้องของสิทธิ์แอดมินด้วยคุกกี้เซสชั่นผ่าน Supabase Server Client
 * 2. รับคิวรี Parameter เดือนและปี เพื่อใช้จำกัดช่วงวันของธุรกรรม (date: { gte: start, lte: end })
 * 3. ดึงรายการธุรกรรมการโอนเงินจากฐานข้อมูลโดยจัดเรียงใหม่ล่าสุดขึ้นก่อน (orderBy: { date: 'desc' })
 * 4. คํานวณสรุปยอดบริจาครวมประจำเดือนนั้นๆ เฉพาะรายการที่กดยืนยันสำเร็จแล้วเพื่อส่งข้อมูลกลับไปแสดงที่ Dashboard
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. ตรวจสอบความปลอดภัยระดับเซิร์ฟเวอร์ (Server-side Auth check)
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized' // ปฏิเสธการดึงข้อมูลหากไม่ผ่านการเข้าระบบ
      })
    }

    // 2. แกะพารามิเตอร์การฟิลเตอร์เดือนและปี
    const query = getQuery(event)
    const filterMonth = query.month ? parseInt(query.month as string) : null
    const filterYear = query.year ? parseInt(query.year as string) : null

    let whereClause: any = {}
    
    // หากเลือกฟิลเตอร์เฉพาะเดือน ให้สร้างเงื่อนไขจำกัดระหว่าง วันที่ 1 ถึงวันสิ้นเดือนนั้นๆ
    if (filterMonth !== null && filterYear !== null) {
      const startDate = new Date(filterYear, filterMonth - 1, 1)                  // วันที่ 1 ของเดือน
      const endDate = new Date(filterYear, filterMonth, 0, 23, 59, 59)            // วันสุดท้ายของเดือนเวลา 23:59:59
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    }

    // 3. ดึงรายการบริจาคทั้งหมดที่กรองแล้ว เรียงลำดับจากล่าสุดไปหาเก่าสุด
    const donations = await prisma.donation.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    })
    
    // 4. คำนวณยอดเงินรวมเฉพาะรายการที่ได้รับการยืนยัน "สำเร็จ" (completed) เท่านั้น
    const totalAmount = donations
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0)
    
    // คืนยอดรวมและรายการแจ้งบริจาค
    return {
      donations,
      totalAmount
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})
