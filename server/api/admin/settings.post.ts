import { prisma } from '../../utils/prisma'
import { serverSupabaseUser } from '#supabase/server'

/**
 * API อัปเดตและเซฟข้อมูลการตั้งค่าในระบบหลังบ้าน (Admin Settings Save API - POST)
 * ทำหน้าที่:
 * 1. ตรวจสอบความปลอดภัยคิวเซสชันการเข้าถึงข้อมูลระดับแอดมิน
 * 2. รับคู่ข้อมูลคีย์ (key) และค่าใหม่ (value) จากบอดี้ของร้องคำ
 * 3. ทำการแปลงโครงสร้าง value เป็นรูปแบบ JSON string อัตโนมัติก่อนจัดเก็บ (เพื่อรองรับการเก็บ Array รายการซับซ้อน)
 * 4. ใช้ฟังก์ชั่น upsert ของ Prisma ในการเซฟ: หากมีคีย์เดิมในระบบให้ Update ค่านั้น / หากไม่มีคีย์เดิมให้ทำการ Create ขึ้นมาใหม่ทันที
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. ตรวจสอบระบบความปลอดภัยสิทธิ์การเข้าถึงข้อมูลหลังบ้าน
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // 2. แกะข้อมูลพารามิเตอร์ key และ value ที่แจ้งบันทึกเข้ามา
    const body = await readBody(event)
    const { key, value } = body
    
    // 3. เซฟลงฐานข้อมูลแบบ "ถ้ามีอยู่แล้วให้แก้ไข ถ้าไม่มีให้สร้างใหม่" (Upsert query)
    const setting = await prisma.websiteSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) }, // แปลงเป็น JSON String เสมอ
      create: { key, value: JSON.stringify(value) }
    })
    
    return setting
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})
