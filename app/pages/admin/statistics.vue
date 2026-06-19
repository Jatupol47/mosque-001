<template>
  <div>
    <!-- ใช้ Layout ของส่วนแอดมินที่มีแถบนำทาง Sidebar -->
    <NuxtLayout name="admin">
      
      <!-- ==================== 1. Header & Filters (ส่วนหัวเว็บและฟิลเตอร์กรองวันเดือนปี) ==================== -->
      <div class="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 class="text-2xl md:text-3xl font-black text-slate-800 mb-1">ภาพรวมสถิติ</h3>
          <p class="text-slate-500 text-sm">วิเคราะห์จำนวนผู้เข้าชมเว็บไซต์และเพจยอดนิยม</p>
        </div>
        
        <!-- ตัวกรองดรอปดาวน์ในการเลือกช่วงเวลาเดือน/ปี -->
        <div class="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
          <div class="flex items-center gap-2 px-3 border-r border-slate-100">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">เดือน</span>
            <select v-model="selectedMonth" class="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-sm">
              <option v-for="m in months" :key="m.val" :value="m.val">{{ m.name }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2 px-3 border-r border-slate-100">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ปี</span>
            <select v-model="selectedYear" class="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-sm">
              <option v-for="y in years" :key="y" :value="y">{{ y + 543 }}</option>
            </select>
          </div>
          <!-- ปุ่มกดรีเฟรชข้อมูล ดึงตัวสปีนเนอร์หมุนมาเล่นแอนิเมชันระหว่างโหลดข้อมูล -->
          <button @click="refresh()" class="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400" :title="'รีเฟรชข้อมูล'">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :class="{ 'animate-spin': pending }"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
          </button>
        </div>
      </div>

      <!-- ==================== 2. Stats Overview Cards (การ์ดสรุปจำนวนผู้เข้าชม) ==================== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        
        <!-- การ์ด 1: ยอดรวมผู้เปิดเว็บทั้งหมดตั้งแต่เริ่มระบบ -->
        <div class="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ผู้เข้าชมทั้งหมด</div>
            <div class="text-2xl md:text-3xl font-black text-emerald-600 tracking-tight">{{ stats?.totalVisits?.toLocaleString() || 0 }}</div>
          </div>
          <div class="mt-4 text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ตั้งแต่เริ่มบันทึกข้อมูล</div>
        </div>

        <!-- การ์ด 2: จำนวนผู้เปิดเว็บวันปัจจุบัน (วันนี้) -->
        <div class="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ผู้เข้าชมวันนี้</div>
            <div class="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">{{ stats?.todayVisits?.toLocaleString() || 0 }}</div>
          </div>
          <div class="mt-4 text-[9px] md:text-[10px] text-blue-500 font-bold uppercase tracking-tighter">รีเฟรชล่าสุด: {{ new Date().toLocaleTimeString('th-TH') }}</div>
        </div>

        <!-- การ์ด 3: ค่าเฉลี่ยการเข้าชมต่อวัน (ย้อนหลัง 7 วัน) -->
        <div class="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-3xl shadow-sm border border-slate-100 sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">เฉลี่ยต่อวัน (7 วันล่าสุด)</div>
            <div class="text-2xl md:text-3xl font-black text-amber-500 tracking-tight">
              {{ Math.round((stats?.recentStats?.reduce((acc, curr) => acc + curr.count, 0) || 0) / 7) }}
            </div>
          </div>
          <div class="mt-4 text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tighter">คำนวณจากข้อมูลย้อนหลัง</div>
        </div>
      </div>

      <!-- ==================== 3. Charts & Top Pages Section (กราฟแท่งสถิติและลำดับหน้านิยม) ==================== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
        
        <!-- [3.1] กราฟแท่งสถิติการเข้าชมย้อนหลัง (สร้างด้วย HTML & Tailwind CSS แท้ มีความยืดหยุ่นสูง) -->
        <div class="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-bold text-slate-800 tracking-tight text-base md:text-lg">สถิติการเข้าชม</h2>
            <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ย้อนหลังล่าสุด</div>
          </div>
          
          <div class="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <!-- ขนาดกราฟไดนามิก เลื่อนข้างได้หากแสดงผลวันเยอะ -->
            <div class="relative pt-6 min-w-[300px]" :style="{ width: last7Days.length > 7 ? `${last7Days.length * 40}px` : '100%' }">
              <div class="flex items-end justify-between h-48 gap-1 md:gap-2">
                <!-- วนซ้ำสร้างรูปแท่งกราฟ (Bar chart elements) -->
                <div v-for="day in last7Days" :key="day.date" class="flex-1 flex flex-col items-center gap-2 group">
                  <!-- แท่งกราฟสีเขียว โชว์ตัวเลขอัตโนมัติเมื่อเอาเมาส์จี้ Hover -->
                  <div 
                    class="w-full max-w-[30px] bg-emerald-100 group-hover:bg-emerald-500 transition-all duration-300 rounded-t-lg relative mx-auto"
                    :style="{ height: `${(day.count / maxVisits) * 100}%` }"
                  >
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {{ day.count }}
                    </div>
                  </div>
                  <!-- วันที่ หรือ วัน ประจำแท่ง เช่น อา. จ. อ. -->
                  <div class="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-center h-4 flex items-center whitespace-nowrap">
                    {{ day.label }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- [3.2] ตารางสรุปเนื้อหาหน้าเพจยอดนิยม (Top Pages View) -->
        <div class="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div class="px-6 md:px-8 py-5 md:py-6 border-b border-slate-50">
            <h2 class="font-bold text-slate-800 tracking-tight text-base md:text-lg">เพจยอดนิยม</h2>
          </div>
          <div class="p-4 md:p-6">
            <div v-if="stats?.topPages?.length > 0" class="space-y-1">
              <!-- วนลูปหน้าที่มีจำนวนยอดเปิดดูสูงสุดไล่ลงไป -->
              <div v-for="(page, index) in stats?.topPages" :key="page.path" class="flex items-center gap-4 p-3 md:p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                <div class="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-emerald-500 shrink-0">
                  {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs md:text-sm font-bold text-slate-700 truncate">{{ page.path }}</div>
                  <!-- หลอดสีคุมเปอร์เซ็นความกว้างประจักษ์ความสัมพันธ์กับยอดสูงสุด -->
                  <div class="w-full bg-slate-100 h-1 mt-2 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full transition-all duration-1000" :style="{ width: `${(page._count.path / (stats.topPages[0]?._count?.path || 1)) * 100}%` }"></div>
                  </div>
                </div>
                <!-- ตัวเลขจํานวนครั้งเข้าชม -->
                <div class="text-[10px] md:text-xs font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md shrink-0">
                  {{ page._count.path }} <span class="hidden md:inline">ครั้ง</span>
                </div>
              </div>
            </div>
            <!-- แสดงเมื่อไม่มีข้อมูลในฐานข้อมูล -->
            <div v-else class="p-8 text-center text-slate-400 text-sm italic">
              ไม่มีข้อมูลการเข้าชม
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 4. Recent Visitors Real-time Table (ประวัติผู้เปิดเว็บล่าสุดเรียลไทม์) ==================== -->
      <div class="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-6 md:px-8 py-5 md:py-6 border-b border-slate-50 flex items-center justify-between">
          <h2 class="font-bold text-slate-800 tracking-tight text-base md:text-lg">กิจกรรมล่าสุด</h2>
          <span class="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Real-time</span>
        </div>
        <div class="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table class="w-full text-left min-w-[600px] md:min-w-full">
            <thead>
              <tr class="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th class="px-6 md:px-8 py-4">เวลา</th>
                <th class="px-6 md:px-8 py-4">หน้าเพจ</th>
                <th class="px-6 md:px-8 py-4">IP Address</th>
                <th class="px-6 md:px-8 py-4 hidden sm:table-cell">Device Info</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-xs">
              <tr v-for="visitor in stats?.recentVisitors" :key="visitor.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 md:px-8 py-4 font-medium text-slate-600 whitespace-nowrap">
                  {{ new Date(visitor.createdAt).toLocaleString('th-TH', { 
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                  }) }}
                </td>
                <td class="px-6 md:px-8 py-4">
                  <span class="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold tracking-wide">{{ visitor.path }}</span>
                </td>
                <td class="px-6 md:px-8 py-4 text-slate-500 font-mono text-[10px]">
                  {{ visitor.ip || 'Unknown' }}
                </td>
                <!-- อุปกรณ์/เบราว์เซอร์ของผู้ใช้ ซ่อนบนหน้าจอมือถือขนาดเล็ก -->
                <td class="px-6 md:px-8 py-4 text-[10px] text-slate-400 truncate max-w-[150px] lg:max-w-[300px] hidden sm:table-cell">
                  {{ visitor.userAgent }}
                </td>
              </tr>
              <!-- ป้ายเตือนในกรณีไม่มีประวัติการเข้าชม -->
              <tr v-if="!stats?.recentVisitors?.length">
                <td colspan="4" class="px-6 md:px-8 py-12 text-center text-slate-400 text-sm italic">
                  ไม่มีกิจกรรมล่าสุด
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
 * หน้ารายงานสถิติแอดมิน (Admin Stats Analytics Page)
 * ทำหน้าที่:
 * 1. ดึงสรุปยอดผู้ชมรายวัน รายเดือน หน้ายอดนิยม และประวัติเข้าเว็บจริงย้อนหลังเรียลไทม์
 * 2. คํานวณจัดเตรียมแท่งกราฟ (Bar Chart) ย้อนหลัง 7 วันเพื่อสรุปวิเคราะห์เปรียบเทียบในแผงควบคุม
 * 3. มีความปลอดภัยจำกัดสิทธิ์ระดับแอดมิน (Auth protected middleware)
 */

// คุ้มครองสิทธิ์แอดมินไม่ให้เข้าโดยพลการ
definePageMeta({ 
  layout: false,
  middleware: 'auth'
})

// เดือนและปีปัจจุบันสําหรับฟิลเตอร์
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

// ดึงสรุปข้อมูลการล็อกสถิติจาก API หลังบ้าน
const { data: stats, pending, refresh } = await useFetch('/api/admin/visitor-stats', {
  query: computed(() => ({
    month: selectedMonth.value,
    year: selectedYear.value
  }))
})

// คํานวณยอดสถิติย้อนหลังเพื่อส่งผลลัพธ์เป็น Array โครงสร้างสำหรับวาดกราฟแท่ง
const last7Days = computed(() => {
  const days = []
  
  const startDate = new Date(stats.value?.period?.start || new Date())
  const endDate = new Date(stats.value?.period?.end || new Date())
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  // วนลูปสร้างค่าของแต่ละวันระหว่างวันเริ่มต้นและสิ้นสุดประจำช่วง
  for (let i = 0; i <= diffDays; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    
    // ค้นหายอดการเข้าชมของวันที่นั้นๆ จาก Array ที่หลังบ้านคำนวณส่งมา
    const found = stats.value?.recentStats?.find(s => {
      if (!s.date) return false
      const sDate = typeof s.date === 'string' ? s.date : s.date.toISOString()
      return sDate.startsWith(dateStr)
    })

    days.push({
      date: dateStr,
      label: d.toLocaleDateString('th-TH', { 
        day: diffDays > 7 ? 'numeric' : undefined,
        weekday: diffDays <= 7 ? 'short' : undefined 
      }),
      count: found ? found.count : 0
    })
  }
  return days
})

// ชุดค่าดิบรายเดือนเพื่อการแสดงผลตัวเลือก
const months = [
  { val: 1, name: 'มกราคม' }, { val: 2, name: 'กุมภาพันธ์' }, { val: 3, name: 'มีนาคม' },
  { val: 4, name: 'เมษายน' }, { val: 5, name: 'พฤษภาคม' }, { val: 6, name: 'มิถุนายน' },
  { val: 7, name: 'กรกฎาคม' }, { val: 8, name: 'สิงหาคม' }, { val: 9, name: 'กันยายน' },
  { val: 10, name: 'ตุลาคม' }, { val: 11, name: 'พฤศจิกายน' }, { val: 12, name: 'ธันวาคม' }
]

// ชุดปี ค.ศ.
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear, currentYear - 1, currentYear - 2]
})

// คํานวณหาจุดสูงสุดของสถิติเข้าชมเพื่อนำไปคุมสัดส่วนความสูงของแท่งกราฟไม่ให้ล้นออกนอกบอร์ด
const maxVisits = computed(() => {
  const counts = last7Days.value.map(d => d.count)
  return Math.max(...counts, 10)
})
</script>
