import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
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

    // Settings
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

    // Visitor Logs
    const visitorCount = await prisma.visitorLog.count()
    if (visitorCount === 0) {
      const paths = ['/', '/activities', '/history', '/donate', '/timetable']
      const logs = []
      
      // Generate logs for the last 10 days
      for (let i = 0; i < 10; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        // Random number of visits per day
        const visits = Math.floor(Math.random() * 20) + 5
        for (let j = 0; j < visits; j++) {
          logs.push({
            path: paths[Math.floor(Math.random() * paths.length)],
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ip: `192.168.1.${Math.floor(Math.random() * 100)}`,
            createdAt: new Date(date.getTime() - Math.random() * 86400000)
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
      addedVisitors: visitorCount === 0 ? 100 : 0
    }
  } catch (error: any) {
    console.error('Seed Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})
