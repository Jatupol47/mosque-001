import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const settings = await prisma.websiteSetting.findMany()
    const settingsMap = settings.reduce((acc, curr) => {
      try {
        acc[curr.key] = JSON.parse(curr.value)
      } catch (e) {
        acc[curr.key] = curr.value
      }
      return acc
    }, {} as Record<string, any>)
    
    // Only return public keys if necessary, but for now we can return all settings
    // if they don't contain sensitive info.
    return settingsMap
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch settings'
    })
  }
})
