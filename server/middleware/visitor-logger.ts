import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname
  const userAgent = getHeader(event, 'user-agent') || ''
  
  // 1. Skip administrative paths
  if (path.startsWith('/admin')) {
    return
  }

  // 2. Skip API calls, static files, and internal Nuxt calls
  if (
    path.startsWith('/api') || 
    path.startsWith('/_nuxt') || 
    path.startsWith('/__') ||
    path.includes('.')
  ) {
    return
  }

  // 3. Skip common Bots/Crawlers to get only real users
  const botPattern = /bot|crawler|spider|slurp|google|bing|yandex|baidu|duckduckbot/i
  if (botPattern.test(userAgent)) {
    return
  }

  // 4. Skip if the user is logged in as Admin (checking Supabase cookie)
  const cookies = parseCookies(event)
  const hasAuthSession = Object.keys(cookies).some(key => key.startsWith('sb-'))
  if (hasAuthSession) {
    return
  }

  const ip = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress
  
  try {
    // Non-blocking write to database
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
    // Silently fail for logger to not interrupt the request
    console.error('[Visitor Logger] Unexpected error:', error)
  }
})
