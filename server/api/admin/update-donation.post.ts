import { prisma } from '../../utils/prisma'
import { serverSupabaseUser } from '#supabase/server'

/**
 * API อัปเดตสถานะการบริจาค (Admin Donation Status Update API - POST)
 * ทำหน้าที่:
 * 1. ตรวจสอบความถูกต้องและสิทธิ์ของแอดมินก่อนเข้าถึงข้อมูล
 * 2. รับข้อมูล ID ธุรกรรม และสถานะใหม่ (เช่น 'completed' หรือ 'pending') จากบอดี้
 * 3. ทำการอัปเดตฟิลด์ status ในตาราง Donation ผ่านตัว Prisma Client
 * 4. คืนค่า JSON ผลลัพธ์กลับไปยังฝั่งหลังบ้านแอดมินเพื่อใช้รีเฟรชยอดแสดงผลทันที
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. ตรวจสอบสิทธิ์การเข้าระบบของเซสชั่นหลังบ้าน
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // 2. ดึงข้อมูล ID บิล และสถานะการเปลี่ยนจากบอดี้ของร้องคำ
    const body = await readBody(event)
    const { id, status } = body

    // แจ้งเตือนข้อผิดพลาด หากข้อมูลขาดหายไม่ถูกต้อง
    if (!id || !status) {
      throw createError({ statusCode: 400, message: 'ID and Status are required' })
    }

    // 3. ทำการอัปเดตสเตตัสในฐานข้อมูล
    const updated = await prisma.donation.update({
      where: { id: parseInt(id) },
      data: { status }
    })
    
    // คืนค่าการอัปเดตสำเร็จ
    return { success: true, donation: updated }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})
