import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const aggregate = await prisma.donation.aggregate({
      where: {
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    })

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
