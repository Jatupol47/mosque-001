export default defineNuxtRouteMiddleware((to) => {
  /**
   * มิดเดิ้ลแวร์ตรวจสอบสิทธิ์แอดมิน (Admin Authentication Guard Middleware)
   * ทำหน้าที่:
   * 1. ตรวจจับข้อมูลผู้ใช้งานปัจจุบัน (Supabase User State)
   * 2. หากไม่พบประวัติการล็อกอิน (ไม่มีสิทธิ์แอดมิน) จะปฏิเสธการเข้าถึงหน้าหลังบ้านทันที
   * 3. ทำการเบี่ยงส้นทางส่งผู้ใช้ไปที่หน้าจอเข้าสู่ระบบ '/admin/login'
   */
  const user = useSupabaseUser()

  // หากไม่มีเซสชันการเข้าใช้งานของแอดมิน (User เป็น null หรือ undefined)
  if (!user.value) {
    return navigateTo('/admin/login') // ส่งตัวไปหน้าล็อคอิน
  }
})
