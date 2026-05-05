export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { amount, donorName, donorEmail, donorPhone, blessing, slipUrl, taxId, address } = body

    const { PrismaClient } = await import('@prisma/client')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const pg = await import('pg')

    const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    try {
      const donation = await prisma.donation.create({
        data: {
          amount: parseFloat(amount),
          donorName,
          donorEmail,
          donorPhone,
          blessing,
          slipUrl,
          taxId,
          address,
          status: 'pending'
        }
      })
      return { success: true, donation }
    } finally {
      await prisma.$disconnect()
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})
