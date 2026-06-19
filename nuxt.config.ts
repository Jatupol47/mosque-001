import tailwindcss from "@tailwindcss/vite";

/**
 * ไฟล์การตั้งค่าหลักของ Nuxt 3 (Nuxt Configuration File)
 * ทำหน้าที่:
 * 1. กำหนดเวอร์ชันความเข้ากันได้ และเปิดใช้งาน Devtools
 * 2. ลงทะเบียน Stylesheet ส่วนกลางและเปิดใช้งาน Tailwind CSS v4 ผ่าน Vite Plugin
 * 3. ลงทะเบียนและกำหนดรายละเอียดของ Google Fonts Module และ Supabase Module
 * 4. ประกาศค่าตัวแปรระดับเซิร์ฟเวอร์ (Runtime Config) และควบคุมสิทธิ์การกรองหน้าเว็บเข้าแอดมิน (Supabase Redirect Rules)
 */
export default defineNuxtConfig({
  // กำหนดวันความเข้ากันได้ของฟีเจอร์ Nuxt
  compatibilityDate: "2025-07-15",
  
  // เปิด/ปิดแผงตัวช่วยผู้พัฒนาบนบราวเซอร์ (Nuxt DevTools)
  devtools: { enabled: true },
  
  // เรียกเข้าใช้งานไฟล์ CSS หลักส่วนกลางของโปรเจกต์
  css: ['./app/assets/css/main.css'],
  
  // กำหนดค่า Vite คอมไพเลอร์ในการเปิดใช้ Tailwind CSS Plugin
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  
  // ประกาศลงทะเบียน Modules ส่วนเสริมภายนอกเข้ามาใช้งาน
  modules: [
    '@nuxtjs/google-fonts', // ดึงฟอนต์ Prompt ของ Google เข้ามาใช้งานแบบออฟไลน์ได้
    '@nuxtjs/supabase'      // ผนวกฐานข้อมูลระบบความปลอดภัยของ Supabase Auth & Storage
  ],

  // ตัวแปรสภาพแวดล้อมที่ดึงค่ามาจาก .env สำหรับรันบนเซิร์ฟเวอร์ (จะไม่แสดงในส่วนเบราว์เซอร์ผู้ใช้เพื่อความปลอดภัย)
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    databaseUrl: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
    public: {
      // สามารถลงทะเบียนตัวแปรสาธารณะที่หน้าบ้านเข้าถึงได้ที่นี่
    }
  },

  // ตั้งค่าควบคุมระบบ Supabase Authentication Integration
  supabase: {
    redirect: true, // บังคับเปลี่ยนเส้นทางกรณีหน้าเว็บที่ไม่ได้รับอนุญาตให้เข้าโดยไม่ล็อกอิน
    redirectOptions: {
      login: '/admin/login',  // หน้าสำหรับล็อกอินหลัก
      callback: '/confirm',   // จุดตรวจสอบสัญญานล็อกอินย้อนกลับ
      // รายชื่อหน้าเว็บที่อนุญาตให้คนทั่วไปเข้าใช้งานได้ โดยไม่ต้องแจ้งล็อกอิน
      exclude: ['/', '/history', '/timetable', '/activities', '/donate', '/api/**'],
    },
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  
  // ตั้งค่าดึงฟอนต์ "Prompt" จาก Google Fonts มาติดตั้งใช้งานในเครื่องทันทีเพื่อความเร็ว
  googleFonts: {
    families: {
      Prompt: [300, 400, 500, 600, 700], // ช่วงน้ำหนักความหนาของตัวอักษร
    },
    display: 'swap',
    download: true, // สั่งให้ดาวน์โหลดฟอนต์มาติดตั้งในโครงสร้างเครื่องป้องกันปัญหาโหลดฟอนต์ช้าบนหน้าจอ
  }
});