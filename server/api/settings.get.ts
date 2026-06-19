import { prisma } from '../utils/prisma'

/**
 * API ค้นหาข้อมูลเนื้อหาเว็บไซต์สาธารณะ (Public Settings Retrieval API - GET)
 * ทำหน้าที่:
 * 1. ดึงรายการตั้งค่าทั้งหมดจากตาราง 'WebsiteSetting' ในรูปของ Array ออบเจกต์
 * 2. แปลงโครงสร้างแบบ Array (เช่น [{key: 'name', value: 'mosque'}, ...]) ให้เป็น Object แฟลตแมปเดี่ยว (เช่น {name: 'mosque'})
 * 3. ตรวจจับข้อมูลที่เป็น JSON String ออโต้เพื่อทำการ JSON.parse กลับเป็นออบเจกต์หน้าบ้านนำไปใช้งานลูปได้ทันทีโดยไม่ต้องไปแปลงซ้ำที่หน้าบ้าน
 * 4. คืนค่าการตั้งค่าหน้าบ้านไปเรนเดอร์ในองค์ประกอบต่างๆ เช่น เมนู, ท้ายเว็บ, หน้าแรก, ประวัติ ฯลฯ
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. ดึงข้อมูลการตั้งค่าดิบทั้งหมดจากฐานข้อมูล
    const settings = await prisma.websiteSetting.findMany()
    
    // 2. ปรับโฉมคีย์ (Reduce mapping) ให้อยู่ในรูปคีย์ย่อยพร้อมใช้งาน
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
    
    // 3. ส่งข้อมูลการตั้งค่าเรียงเรียงเรียบร้อย
    return settingsMap
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch settings'
    })
  }
})
