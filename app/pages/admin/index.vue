<template>
  <div>
    <!-- ใช้ Layout ของส่วนแอดมิน (มีแถบด้านข้าง Sidebar) -->
    <NuxtLayout name="admin">
      
      <!-- ==================== 1. Header with Filters (ส่วนหัวและตัวเลือกฟิลเตอร์) ==================== -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="text-3xl font-black text-slate-800 mb-1">ยินดีต้อนรับ แอดมิน</h3>
          <p class="text-slate-500 text-sm">ภาพรวมการบริจาคและสถานะระบบประจำเดือน</p>
        </div>
        
        <!-- ตัวเลือกดรอปดาวน์สำหรับฟิลเตอร์ เดือน และ ปี -->
        <div class="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex items-center gap-2 px-3 border-r border-slate-100">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">เดือน</span>
            <select v-model="selectedMonth" class="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-sm">
              <option v-for="m in months" :key="m.val" :value="m.val">{{ m.name }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2 px-3 border-r border-slate-100">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ปี</span>
            <select v-model="selectedYear" class="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-sm">
              <!-- แปลงปี ค.ศ. เป็น พ.ศ. (+543) ในส่วนการแสดงผล -->
              <option v-for="y in years" :key="y" :value="y">{{ y + 543 }}</option>
            </select>
          </div>
          <!-- ปุ่มกดรีเฟรชข้อมูล (มีการใส่ Micro-animation ให้หมุนขณะรอโหลดข้อมูล) -->
          <button @click="refresh()" class="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :class="{ 'animate-spin': pending }"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
          </button>
        </div>
      </div>

      <!-- ==================== 2. Stats Overview Cards (การ์ดสรุปตัวเลขสถิติ) ==================== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        
        <!-- การ์ดยอดบริจาครวมประจำเดือน -->
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ยอดบริจาคทั้งหมด</div>
            <div class="text-3xl font-black text-emerald-600 tracking-tight">฿{{ data?.totalAmount?.toLocaleString() || 0 }}</div>
          </div>
          <div class="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">อัปเดตล่าสุด: วันนี้</div>
        </div>

        <!-- การ์ดจำนวนรายการแจ้งบริจาค -->
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">จำนวนรายการ</div>
            <div class="text-3xl font-black text-slate-800 tracking-tight">{{ data?.donations?.length || 0 }} รายการ</div>
          </div>
          <div class="mt-4 text-[10px] text-blue-500 font-bold uppercase tracking-tighter">รวมรายการรอยืนยัน</div>
        </div>

      <!-- Floating Database Status -->
      <div class="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 z-50">
        <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DB: Connected</div>
      </div>
      </div>

      <!-- ==================== 3. Recent Donations Table (ตารางแสดงรายการบริจาคล่าสุดประจำเดือน) ==================== -->
      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-6 py-5 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 class="font-bold text-slate-800 tracking-tight">รายการบริจาคล่าสุด</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr class="text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-50">
                <th class="px-6 py-4 md:px-8 md:py-5">ผู้บริจาค</th>
                <th class="px-6 py-4 md:px-8 md:py-5 text-right">จำนวนเงิน</th>
                <th class="px-6 py-4 md:px-8 md:py-5 hidden md:table-cell">วันที่</th>
                <th class="px-6 py-4 md:px-8 md:py-5 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <!-- วนลูปข้อมูลรายการบริจาคที่ถูกดึงมาจากระบบ -->
              <tr v-for="donation in data?.donations" :key="donation.id"
                class="group hover:bg-slate-50/50 transition-all duration-200">
                <td class="px-6 py-4 md:px-8 md:py-5">
                  <div class="font-bold text-slate-700">{{ donation.donorName || 'ผู้ไม่ประสงค์ออกนาม' }}</div>
                  <!-- แสดงวันที่เล็กๆ บนจอมือถือเพื่อความกระชับ -->
                  <div class="text-[10px] text-slate-400 md:hidden mt-0.5">{{ new Date(donation.date).toLocaleDateString('th-TH') }}</div>
                </td>
                <td class="px-6 py-4 md:px-8 md:py-5 text-right font-black text-slate-900">
                  ฿{{ donation.amount.toLocaleString() }}
                </td>
                <td class="px-6 py-4 md:px-8 md:py-5 text-slate-500 hidden md:table-cell">
                  {{ new Date(donation.date).toLocaleDateString('th-TH') }}
                </td>
                <td class="px-6 py-4 md:px-8 md:py-5 text-center">
                  <!-- ป้ายระบุสถานะ (เสร็จสิ้น: ป้ายเขียว, รออนุมัติ: ป้ายส้ม) -->
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
                    :class="donation.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'">
                    {{ donation.status === 'completed' ? 'สำเร็จ' : 'รอดำเนินการ' }}
                  </span>
                </td>
              </tr>
              <!-- แสดงไอคอนเมื่อไม่มีข้อมูลรายงานในเดือนนั้น -->
              <tr v-if="!data?.donations?.length">
                <td colspan="4" class="px-8 py-20 text-center">
                  <div class="text-4xl mb-4 opacity-20">📥</div>
                  <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">ยังไม่มีข้อมูลการบริจาค</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup>
/**
 * หน้าหลักแผงควบคุมระบบ (Admin Dashboard)
 * ทำหน้าที่:
 * 1. แสดงรายงานสรุปยอดและจํานวนครั้งการโอนประจําเดือนที่เลือก
 * 2. แสดงรายการธุรกรรมล่าสุด คัดเลือกฟิลเตอร์กรองตามปี และเดือนได้
 * 3. มีสิทธิ์การเข้าถึงแบบจำกัด (Protected Route) ผ่านระบบตรวจสอบของ Auth Middleware
 */

// เปิดใช้งานหน้าเว็บโดยปิดการทำงานครอบ Layout ทั่วไป และเรียกใช้ 'auth' Middleware ตรวจจับความปลอดภัย
definePageMeta({
  layout: false,
  middleware: 'auth'
})

// สเตตเก็บเดือนและปีที่แอดมินเลือกจากฟิลเตอร์
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

// โหลดรายการแจ้งบริจาคประจำเดือนและสรุปผล โดยจะรีเฟรชอัปเดตข้อมูลทุกครั้งที่เดือน/ปีเปลี่ยน (Dynamic Query)
const { data, pending, refresh } = await useFetch('/api/admin/donations', {
  query: computed(() => ({
    month: selectedMonth.value,
    year: selectedYear.value
  }))
})

// ข้อมูลดิบรายชื่อเดือนภาษาไทยเพื่อนำไปใช้แสดงในแท็กดรอปดาวน์
const months = [
  { val: 1, name: 'มกราคม' }, { val: 2, name: 'กุมภาพันธ์' }, { val: 3, name: 'มีนาคม' },
  { val: 4, name: 'เมษายน' }, { val: 5, name: 'พฤษภาคม' }, { val: 6, name: 'มิถุนายน' },
  { val: 7, name: 'กรกฎาคม' }, { val: 8, name: 'สิงหาคม' }, { val: 9, name: 'กันยายน' },
  { val: 10, name: 'ตุลาคม' }, { val: 11, name: 'พฤศจิกายน' }, { val: 12, name: 'ธันวาคม' }
]

// กำหนดตัวเลือกปี ค.ศ. ย้อนหลัง 3 ปี (ปีปัจจุบัน, ปีก่อนหน้า, และสองปีก่อนหน้า)
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear, currentYear - 1, currentYear - 2]
})
</script>
