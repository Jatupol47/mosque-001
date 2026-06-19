<template>
  <!-- พื้นหลังมืดสไตล์ Premium Slate-900 ปิดทับจัดกึ่งกลางความสมมาตร -->
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-['Prompt']">
    <div class="w-full max-w-md">
      
      <!-- ==================== 1. Header (ส่วนหัวชื่อระบบจัดการหลังบ้าน) ==================== -->
      <div class="text-center mb-10">
        <div
          class="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/20 mx-auto mb-6">
          🕌
        </div>
        <h1 class="text-3xl font-black text-white mb-2 tracking-tight">Mosque Admin</h1>
        <p class="text-slate-400 text-sm font-medium uppercase tracking-widest">ระบบจัดการหลังบ้าน</p>
      </div>

      <!-- ==================== 2. Login Card (การ์ดลงชื่อเข้าใช้งาน) ==================== -->
      <div class="bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12">
        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <!-- ช่องกรอก อีเมล -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              อีเมลแอดมิน (Email)
            </label>
            <input v-model="email" type="email" placeholder="admin@example.com" required
              class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-700 transition-all" />
          </div>

          <!-- ช่องกรอก รหัสผ่าน -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              รหัสผ่าน (Password)
            </label>
            <input v-model="password" type="password" placeholder="••••••••" required
              class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-slate-700 transition-all" />
          </div>

          <!-- กล่องเตือน Error แสดงเมื่อล็อกอินล้มเหลว (อีเมล/รหัสผ่านผิด) -->
          <div v-if="errorMsg"
            class="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-xs font-bold leading-relaxed">
            ⚠️ {{ errorMsg }}
          </div>

          <!-- ปุ่มกดยืนยันเข้าสู่ระบบ -->
          <button type="submit" :disabled="loading"
            class="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm flex items-center justify-center gap-3">
            <span v-if="loading"
              class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>{{ loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ ✨' }}</span>
          </button>

          <!-- ปุ่มกดย้อนกลับไปยังหน้าแรกของเว็บไซต์คนทั่วไป -->
          <button type="button" class="w-full">
              <a href="/" class="max-w-full py-5 bg-slate-700 text-white font-black rounded-2xl shadow-xl hover:bg-slate-500 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                  กลับสู่หน้าแรก
              </a>
          </button>

        </form>
      </div>

      <p class="text-center mt-10 text-slate-500 text-xs font-bold uppercase tracking-tighter">
        &copy; 2026 Mosque Management System
      </p>
    </div>
  </div>
</template>

<script setup>
/**
 * หน้าจอลงชื่อเข้าใช้งานของแอดมิน (Admin Login Page)
 * ทำหน้าที่:
 * 1. รับบัญชีอีเมลและรหัสผ่านเพื่อตรวจสอบสิทธิ์เข้าระบบจัดการหลังบ้าน
 * 2. ตรวจสอบข้อมูลสิทธิ์กับระบบความปลอดภัย Supabase Authentication Client
 * 3. ส่งตัวแอดมินที่ผ่านการอนุมัติสิทธิ์ไปยังบอร์ดคอนโทรลหลังบ้าน '/admin' ทันที
 */

// ปิดการเรียกใช้ Layout หลักส่วนหน้าบ้านเพื่อไม่ให้เมนูบาร์ด้านบนแสดงผลกวนความสวยงามของหน้าจอ
definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)   // ควบคุมสถานะปุ่มกดสปีนเนอร์ขณะยิงตรวจสิทธิ์
const errorMsg = ref('')     // จัดเก็บคำแจ้งเตือนกรณีรหัสผ่านคลาดเคลื่อน

/**
 * ฟังก์ชันประมวลผลการเข้าสู่ระบบ
 * - ใช้เมธอดsignInWithPassword ของ Supabase Auth Client
 * - เมื่อยืนยันสิทธิ์ถูกต้องสมบูรณ์ จะเรียกฟังก์ชัน navigateTo('/admin') เพื่อเปลี่ยนหน้าแผงควบคุมระบบหลังบ้าน
 */
async function handleLogin() {
  loading.value = true
  errorMsg.value = ''

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) throw error

    // เข้าสู่ระบบสำเร็จ ย้ายแอดมินไปหน้าควบคุมหลักหลังบ้าน
    navigateTo('/admin')
  } catch (error) {
    errorMsg.value = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
    console.error('Login error:', error.message)
  } finally {
    loading.value = false
  }
}
</script>
