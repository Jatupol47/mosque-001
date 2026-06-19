import { prisma } from '../utils/prisma'

/**
 * API คำนวณสรุปยอดเงินบริจาครวมสาธารณะ (Public Donation Summary API - GET)
 * ทำหน้าที่:
 * 1. สืบค้นยอดการบริจาคทั้งหมดในระบบผ่านฟังก์ชั่น aggregate ของ Prisma
 * 2. คัดเลือกประมวลผลสรุปเฉพาะธุรกรรมที่ผ่านการอนุมัติแล้วเท่านั้น (status: 'completed')
 * 3. หาผลรวมสะสม (_sum) ของฟิลด์จำนวนเงินบริจาค (amount)
 * 4. ส่งค่าผลลัพธ์ยอดสะสมกลับหน้าบ้านไปโชว์ในกล่องกระจกแก้วสวยงามที่หน้าแรก
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. เรียกใช้ฟังก์ชัน aggregate ในการหาผลรวมรวมเฉพาะยอดที่ได้รับการอนุมัติสำเร็จแล้ว (completed)
    const aggregate = await prisma.donation.aggregate({
      where: {
        status: 'completed'
      },
      _sum: {
        amount: true // สั่งบวกเพิ่มจำนวนฟิลด์ amount
      }
    })

    // 2. ส่งค่าผลรวมยอดบริจาคสะสมทั้งหมดออกไป (หากยังไม่มีประวัติให้คืนค่าเริ่มต้นเป็น 0)
    return {
      totalAmount: aggregate._sum.amount || 0
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch donation summary'
    })
  }
})
