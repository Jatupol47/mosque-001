import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        // Query to get total amount and total donors
        // We only count 'completed' donations to be accurate, but wait, the default is 'pending'. Let's aggregate 'completed' and 'pending' differently or just 'completed'.
        // Let's aggregate completed donations
        const stats = await prisma.donation.aggregate({
            _sum: {
                amount: true
            },
            _count: {
                id: true
            },
            where: {
                status: 'completed' // Consider only verified donations for stats
            }
        })

        // We can also get recent donations (optional, if we want a ticker)
        
        return {
            totalAmount: stats._sum.amount || 0,
            totalDonors: stats._count.id || 0,
            success: true
        }
    } catch (error) {
        console.error('Error fetching stats:', error)
        return {
            totalAmount: 0,
            totalDonors: 0,
            success: false,
            message: 'Failed to fetch statistics'
        }
    }
})
