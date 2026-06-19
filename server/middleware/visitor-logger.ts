import { prisma } from '../utils/prisma'

/**
 * เซิร์ฟเวอร์มิดเดิ้ลแวร์ดักจับข้อมูลสถิติผู้ชม (Server-side Visitor Logger Middleware)
 * ทำหน้าที่:
 * 1. ดักจับทุกรีเควส (Request) ที่ยิงมายังเซิร์ฟเวอร์
 * 2. คัดเลือกคัดแยก (Filter) ข้ามการบันทึกข้อมูลที่ไม่จำเป็น เช่น:
 *    - หน้าแอดมินหลังบ้าน (/admin)
 *    - การยิง API หลังบ้าน (/api) และไฟล์ Static/Assets ของระบบ Nuxt (._nuxt, .png, .jpg)
 *    - บอทเสิร์ชเอนจิ้นขูดข้อมูลเว็บ (GoogleBot, BingBot, ฯลฯ)
 *    - ตัวแอดมินที่กำลังเปิดแก้ไขเว็บทำงานอยู่ (ตรวจสอบจาก Supabase Auth Cookie)
 * 3. บันทึกเส้นทาง (Path), อุปกรณ์เบราว์เซอร์ (User-Agent) และเลขไอพีอินเทอร์เน็ต (IP) ลงตารางฐานข้อมูล VisitorLog แบบขนาน (Non-blocking DB query) เพื่อไม่ให้เว็บโหลดช้าลง
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname
  const userAgent = getHeader(event, 'user-agent') || ''
  
  // [1] ข้ามการบันทึกสถิติการเข้าดูของฝั่งแอดมิน
  if (path.startsWith('/admin')) {
    return
  }

  // [2] ข้ามการบันทึกไฟล์สไตล์ สคริปต์ และ API ต่างๆ
  if (
    path.startsWith('/api') || 
    path.startsWith('/_nuxt') || 
    path.startsWith('/__') ||
    path.includes('.')
  ) {
    return
  }

  // [3] ข้ามการบันทึกข้อมูลพวกบอท/หุ่นยนต์ค้นหา (Bots/Crawlers) เพื่อให้ได้ข้อมูลผู้ใช้งานจริง 100%
  const botPattern = /bot|crawler|spider|slurp|google|bing|yandex|baidu|duckduckbot/i
  if (botPattern.test(userAgent)) {
    return
  }

  // [4] ข้ามการบันทึกกรณีผู้ใช้เป็นแอดมินที่ล็อกอินค้างอยู่ในบราวเซอร์ (เช็คคุกกี้เริ่มต้นด้วย sb-)
  const cookies = parseCookies(event)
  const hasAuthSession = Object.keys(cookies).some(key => key.startsWith('sb-'))
  if (hasAuthSession) {
    return
  }

  // ดึงหมายเลข IP เครื่องของผู้เข้าชม
  const ip = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress
  
  try {
    // ทำการบันทึกข้อมูลลงฐานข้อมูลแบบเบื้องหลัง (Non-blocking) เพื่อความรวดเร็วสูงสุดของหน้าเว็บ
    prisma.visitorLog.create({
      data: {
        path,
        userAgent,
        ip: typeof ip === 'string' ? ip : undefined
      }
    }).catch(error => {
      console.error('[Visitor Logger] Failed:', error)
    })
  } catch (error) {
    // ปิดเสียงเตือนเงียบ เพื่อไม่ให้กระบวนการเกิดพังขัดขวางหน้าเว็บหลัก
    console.error('[Visitor Logger] Unexpected error:', error)
  }
})
