import { prisma } from '../../utils/prisma'
import { serverSupabaseUser } from '#supabase/server'

/**
 * API ดึงข้อมูลการตั้งค่าสำหรับแผงฟอร์มแก้ไขหลังบ้าน (Admin Settings Retrieval API - GET)
 * ทำหน้าที่:
 * 1. ตรวจสอบสิทธิ์การเข้าระบบของแอดมินก่อนเข้าถึงข้อมูล
 * 2. โหลดข้อมูลการตั้งค่าเว็บไซต์ดิบทั้งหมดจากตาราง WebsiteSetting
 * 3. แปลงโครงสร้างดิบจากฐานข้อมูลมาเรียบเรียงให้อยู่ในรูป Key-Value Map ที่ง่ายต่อการกระจายเข้าฟอร์มแก้ไขหน้าบ้าน
 * 4. คืนค่า JSON คีย์ความสัมพันธ์กลับไปรวดเร็วแบบ Asynchronous
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. ตรวจสอบระบบความปลอดภัยเซสชั่นของเซิร์ฟเวอร์
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // 2. ค้นหารวมถึงตั้งค่าดิบทั้งหมดที่มีเก็บไว้ในฐานข้อมูล
    const settings = await prisma.websiteSetting.findMany()
    
    // 3. ยุบออบเจกต์และแปรสภาพข้อมูลดิบให้หน้าบ้านพร้อมแก้ไข
    const settingsMap = settings.reduce((acc, curr) => {
      try {
        // หากค่านั้นเป็นโครงสร้าง JSON String (เช่น รายการกิจกรรม อัลบั้ม) ให้สั่งแปลงกลับเป็น Object
        acc[curr.key] = JSON.parse(curr.value)
      } catch (e) {
        // หากไม่ได้บันทึกแบบ JSON ให้ใช้ค่าสตริงแบบนั้นเลย
        acc[curr.key] = curr.value
      }
      return acc
    }, {} as Record<string, any>)
    
    return settingsMap
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})
