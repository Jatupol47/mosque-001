import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname
  
  // Only log page visits (ignore API calls, static files, and internal Nuxt calls)
  if (
    path.startsWith('/api') || 
    path.startsWith('/_nuxt') || 
    path.startsWith('/__') ||
    path.includes('.')
  ) {
    return
  }

  const userAgent = getHeader(event, 'user-agent')
  const ip = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress
  
  try {
    await prisma.visitorLog.create({
      data: {
        path,
        userAgent,
        ip: typeof ip === 'string' ? ip : undefined
      }
    })
  } catch (error) {
    // Silently fail for logger to not interrupt the request
    console.error('[Visitor Logger] Failed:', error)
  }
})
