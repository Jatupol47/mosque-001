import { prisma } from '../../utils/prisma'
import { serverSupabaseUser } from '#supabase/server'

/**
 * API เริ่มต้นสร้างข้อมูลจำลองในฐานข้อมูล (Database Seeder API - GET)
 * ทำหน้าที่:
 * 1. ตรวจสอบสิทธิ์ของแอดมินเพื่อป้องกันบุคคลภายนอกมายิงล้างหรือป้อนข้อมูลขยะ
 * 2. ตรวจสอบหากตารางว่างเปล่า (ไม่มีข้อมูล) จะทำการบรรจุข้อมูลตัวอย่างทันที:
 *    - ข้อมูลบริจาค (Donation) 7 รายการแรก
 *    - ข้อมูลติดต่อทั่วไป (WebsiteSetting) เช่น ชื่อมัสยิด, ที่อยู่, โทร, เมล
 *    - ข้อมูลล็อกผู้ชมย้อนหลัง 10 วัน (VisitorLog) แบบกระจายตัวเลขสุ่มเฉลี่ย 5-25 ครั้งต่อวัน เพื่อใช้วาดกราฟแท่งทดสอบทันที
 * 3. ส่ง JSON แจ้งประวัติความคืบหน้าสรุปการสร้างข้อมูลจำลองกลับไป
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. ตรวจสอบความปลอดภัยคิวระบบ
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // 2. [ตาราง Donation] สร้างตัวอย่างข้อมูลบริจาคหากเป็น 0 รายการ
    const count = await prisma.donation.count()
    
    const sampleDonations = [
      { amount: 5500, donorName: 'คุณสมชาย ใจดี', date: new Date('2026-04-20'), status: 'completed' },
      { amount: 1200, donorName: 'คุณสมหญิง รักดี', date: new Date('2026-04-22'), status: 'completed' },
      { amount: 300, donorName: 'ผู้ไม่ประสงค์ออกนาม', date: new Date('2026-04-25'), status: 'completed' },
      { amount: 8000, donorName: 'หจก. บริจาคไทย', date: new Date('2026-04-28'), status: 'completed' },
      { amount: 2500, donorName: 'คุณอนันต์ ตั้งใจ', date: new Date('2026-04-29'), status: 'completed' },
      { amount: 10000, donorName: 'ครอบครัวบุญส่ง', date: new Date('2026-04-15'), status: 'completed' },
      { amount: 450, donorName: 'คุณวิภาวดี', date: new Date('2026-04-10'), status: 'completed' },
    ]

    if (count === 0) {
      await prisma.donation.createMany({
        data: sampleDonations
      })
    }

    // 3. [ตาราง WebsiteSetting] บันทึกชื่อและช่องทางติดต่อของมัสยิดถ้ายังว่างเปล่า
    const settingsCount = await prisma.websiteSetting.count()
    if (settingsCount === 0) {
      await prisma.websiteSetting.createMany({
        data: [
          { key: 'mosque_name', value: JSON.stringify('มัสยิดบ้านสมเด็จ') },
          { key: 'address', value: JSON.stringify('แขวงสมเด็จเจ้าพระยา เขตคลองสาน กรุงเทพมหานคร 10600') },
          { key: 'phone', value: JSON.stringify('02-XXX-XXXX') },
          { key: 'email', value: JSON.stringify('contact@mosque.com') },
        ]
      })
    }

    // 4. [ตาราง VisitorLog] สุ่มผลิตข้อมูลประวัติผู้ชมย้อนหลัง 10 วัน เพื่อใช้ทดสอบสถิติ
    const visitorCount = await prisma.visitorLog.count()
    if (visitorCount === 0) {
      const paths = ['/', '/activities', '/history', '/donate', '/timetable']
      const logs = []
      
      // วนรอบสรุปย้อนหลัง 10 วัน
      for (let i = 0; i < 10; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        // สุ่มยอดจำนวนผู้เปิดเว็บ 5 - 25 ครั้งในวันนั้นๆ
        const visits = Math.floor(Math.random() * 20) + 5
        for (let j = 0; j < visits; j++) {
          logs.push({
            path: paths[Math.floor(Math.random() * paths.length)],
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ip: `192.168.1.${Math.floor(Math.random() * 100)}`,
            createdAt: new Date(date.getTime() - Math.random() * 86400000) // สุ่มเวลาเกิดล็อกของวัน
          })
        }
      }

      await prisma.visitorLog.createMany({
        data: logs
      })
    }

    return { 
      success: true, 
      message: (count === 0 || visitorCount === 0) ? 'สร้างข้อมูลจำลองเรียบร้อยแล้ว' : 'มีข้อมูลอยู่ในระบบแล้ว',
      addedDonations: count === 0 ? sampleDonations.length : 0,
      addedVisitors: visitorCount === 0 ? logs.length : 0
    }
  } catch (error: any) {
    console.error('Seed Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})
