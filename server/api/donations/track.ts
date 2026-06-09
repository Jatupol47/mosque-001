import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const phone = query.phone as string

    if (!phone) {
        return {
            success: false,
            message: 'กรุณาระบุเบอร์โทรศัพท์'
        }
    }

    try {
        const donations = await prisma.donation.findMany({
            where: {
                donorPhone: {
                    contains: phone
                }
            },
            orderBy: {
                date: 'desc'
            }
        })

        return {
            success: true,
            donations
        }
    } catch (error) {
        console.error('Error tracking donation:', error)
        return {
            success: false,
            message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล'
        }
    }
})
