import { prisma } from '../utils/prisma'

/**
 * API แจ้งยอดบริจาค (Public Donation Creation API - POST)
 * ทำหน้าที่:
 * 1. รับบอดี้คำร้อง (HTTP Request Body) จากหน้าบ้านส่งมาแบบ JSON
 * 2. แกะแกนข้อมูลที่จำเป็น เช่น ยอดเงินบริจาค, ชื่อผู้ให้, คำอนุโมทนา, เลขผู้เสียภาษี, และที่อยู่สลิป
 * 3. บันทึกข้อมูลลงตารางฐานข้อมูล 'Donation' ภายใต้สถานะเริ่มต้นคือ 'pending' (รอตรวจสอบ)
 * 4. คืนค่า JSON สรุปการบันทึกสำเร็จกลับไปให้หน้าบ้านแสดงบิลความสำเร็จ
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. อ่านข้อมูลของแบบฟอร์มที่มีการยิงแจ้งเข้ามาจากช่องทางหน้าเว็บ
    const body = await readBody(event)
    const { amount, donorName, donorEmail, donorPhone, blessing, slipUrl, taxId, address } = body

    try {
      // 2. สั่งสร้างและจัดเก็บรายการบริจาคใหม่ในตาราง Donation ด้วย Prisma Client
      const donation = await prisma.donation.create({
        data: {
          amount: parseFloat(amount), // แปลงจำนวนเงินรับมาเป็นทศนิยมเพื่อจัดเก็บแม่นยำ
          donorName,
          donorEmail,
          donorPhone,
          blessing,
          slipUrl,
          taxId,
          address,
          status: 'pending'          // กำหนดเป็น 'pending' เสมอเพื่อให้ฝั่งแอดมินตรวจก่อน
        }
      })
      // คืนผลลัพธ์สำเร็จ
      return { success: true, donation }
    } catch (dbError: any) {
      console.error('[Donation API] Database Error:', dbError)
      throw createError({
        statusCode: 500,
        statusMessage: 'ไม่สามารถบันทึกข้อมูลการบริจาคได้ กรุณาลองใหม่อีกครั้ง'
      })
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})
