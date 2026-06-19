<template>
  <div>
    <!-- ใช้ Layout หลักสำหรับฝั่งแอดมินที่มีแถบนำทางข้าง (Sidebar) -->
    <NuxtLayout name="admin">
      
      <!-- ==================== 1. Header (ชื่อหน้าหลักและคำโปรย) ==================== -->
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h3 class="text-3xl font-black text-slate-800 mb-2">ตรวจสอบการโอนเงิน</h3>
          <p class="text-slate-500">ตรวจสอบหลักฐานและยืนยันยอดเงินบริจาคจากผู้มีจิตศรัทธา</p>
        </div>
      </div>

      <!-- ==================== 2. Donations Management Table (ตารางจัดการรายการบริจาค) ==================== -->
      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
        <div class="overflow-x-auto overflow-y-visible">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr
                class="text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-50 bg-slate-50/30">
                <th class="px-8 py-6">ผู้บริจาค</th>
                <th class="px-8 py-6 text-right">จำนวนเงิน</th>
                <th class="px-8 py-6">วันที่แจ้งโอน</th>
                <th class="px-8 py-6 text-center">หลักฐานสลิป</th>
                <th class="px-8 py-6 text-center">สถานะ</th>
                <th class="px-8 py-6 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <!-- วนลูปแสดงข้อมูลรายการบริจาคทั้งหมด -->
              <tr v-for="donation in data?.donations" :key="donation.id"
                class="group hover:bg-slate-50/50 transition-all duration-200">
                
                <!-- คอลัมน์ที่ 1: ข้อมูลผู้บริจาค (ชื่อ, เบอร์โทร, อีเมล, ใบกำกับภาษี และคำอวยพร) -->
                <td class="px-8 py-6">
                  <div>
                    <p class="font-bold text-slate-800">{{ donation.donorName || 'ผู้ไม่ประสงค์ออกนาม' }}</p>
                    
                    <!-- แสดงเบอร์โทรและอีเมลแบบป้าย Tag หากมีการกรอกข้อมูลมา -->
                    <div class="flex flex-wrap gap-2 mt-1">
                      <p v-if="donation.donorPhone" class="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">📞 {{ donation.donorPhone }}</p>
                      <p v-if="donation.donorEmail" class="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">📧 {{ donation.donorEmail }}</p>
                    </div>

                    <!-- แสดงกล่องที่อยู่รับใบกำกับภาษี/ลดหย่อนภาษีกรณีที่ผู้ใช้แจ้งขอข้อมูลมา -->
                    <div v-if="donation.taxId" class="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                       <p class="text-[9px] font-black text-emerald-600 uppercase tracking-tighter mb-0.5">ข้อมูลใบกำกับภาษี</p>
                       <p class="text-[10px] text-emerald-700 font-bold">เลขผู้เสียภาษี: {{ donation.taxId }}</p>
                       <p v-if="donation.address" class="text-[10px] text-emerald-600/70 mt-0.5 leading-tight">{{ donation.address }}</p>
                    </div>
                    
                    <!-- คำอวยพร/คำดุอาอ์จากผู้ร่วมทำบุญ -->
                    <p class="text-[11px] text-slate-400 mt-2 italic leading-relaxed max-w-[200px] truncate"
                      :title="donation.blessing">{{ donation.blessing || 'ไม่มีคำอวยพร' }}</p>
                  </div>
                </td>

                <!-- คอลัมน์ที่ 2: จำนวนเงินบริจาค -->
                <td class="px-8 py-6 text-right font-black text-emerald-600 text-lg">
                  ฿{{ donation.amount.toLocaleString() }}
                </td>

                <!-- คอลัมน์ที่ 3: วันและเวลาแจ้งสลิป -->
                <td class="px-8 py-6 text-slate-500 text-xs">
                  {{ new Date(donation.date).toLocaleString('th-TH', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit' }) }} น.
                </td>

                <!-- คอลัมน์ที่ 4: สลิปหลักฐานการโอนเงิน (มีระบบ Preview เมื่อเอาเมาส์ชี้ Hover) -->
                <td class="px-8 py-6 text-center">
                  <div v-if="donation.slipUrl" class="relative inline-block group/slip">
                    <a :href="donation.slipUrl" target="_blank"
                      class="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2"
                      @mouseenter="(e) => showPreview(donation.slipUrl, e)" @mouseleave="hidePreview">
                      <span>📸 ดูสลิป</span>
                    </a>
                  </div>
                  <span v-else class="text-slate-300 text-xs italic">ไม่มีหลักฐาน</span>
                </td>

                <!-- คอลัมน์ที่ 5: ป้ายสถานะปัจจุบัน (completed = ยืนยันแล้ว, pending = รอยืนยัน) -->
                <td class="px-8 py-6 text-center">
                  <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                    :class="donation.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'">
                    {{ donation.status === 'completed' ? 'ยืนยันแล้ว' : 'รอยืนยัน' }}
                  </span>
                </td>

                <!-- คอลัมน์ที่ 6: ปุ่มกดกระบวนการจัดการ (ยืนยันยอดเงิน / หรือยกเลิกเพื่อส่งคืนสเตตรออนุมัติ) -->
                <td class="px-8 py-6">
                  <div class="flex items-center justify-center gap-2">
                    <button v-if="donation.status !== 'completed'" @click="updateStatus(donation.id, 'completed')"
                      class="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 active:scale-95">
                      ยืนยัน
                    </button>
                    <button v-else @click="updateStatus(donation.id, 'pending')"
                      class="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95">
                      ยกเลิก
                    </button>
                  </div>
                </td>
              </tr>

              <!-- แสดงเมื่อไม่มีรายการใดๆ ที่แจ้งเข้ามาในระบบ -->
              <tr v-if="!data?.donations?.length">
                <td colspan="6" class="px-8 py-24 text-center">
                  <div class="text-6xl mb-6 opacity-20 text-slate-200">📥</div>
                  <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">ไม่พบรายการบริจาคที่รอการตรวจสอบ</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </NuxtLayout>

    <!-- ==================== 3. Hover Preview Tooltip (ฟลอยท์กล่องเล็กรูปสลิปขยายเมื่อชี้เมาส์) ==================== -->
    <Teleport to="body">
      <div v-if="preview.visible" class="fixed z-[9999] pointer-events-none transition-opacity duration-200" :style="{
        left: `${preview.x}px`,
        top: `${preview.y}px`,
        transform: preview.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
      }">
        <div
          class="bg-white p-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 w-64 md:w-80 ring-4 ring-black/5"
          :class="preview.placement === 'top' ? 'mb-4' : 'mt-4'">
          <img :src="preview.url" class="w-full h-auto rounded-xl" />
          <div class="mt-3 pt-3 border-t border-slate-100">
            <p class="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest">หลักฐานการโอนเงิน</p>
          </div>
          <!-- ส่วนลูกศรเล็กๆ ชี้ตรงไปยังปุ่มเมาส์เพื่อความสวยงามประณีต -->
          <div class="w-4 h-4 bg-white border-slate-200 absolute left-1/2 -translate-x-1/2 rotate-45" :class="preview.placement === 'top'
            ? 'border-r border-b -bottom-2'
            : 'border-l border-t -top-2'"></div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
/**
 * หน้าจัดการยืนยันยอดเงินบริจาค (Admin Donations Management)
 * ทำหน้าที่:
 * 1. ดึงรายการธุรกรรมการโอนเงินของผู้บริจาคทั้งหมดจาก Database
 * 2. แสดงรายละเอียดอย่างเช่น ชื่อ, จำนวนเงิน, สลิปหลักฐาน, ข้อมูลสำหรับลดหย่อนภาษี
 * 3. ระบบ Hover Preview รูปสลิปโดยไม่ต้องเปลี่ยนหน้าหรือเปิดแท็บใหม่
 * 4. แอดมินสามารถกดปุ่ม "ยืนยัน" (เปลี่ยนสถานะเป็น Completed) หรือกด "ยกเลิก" (กลับคืน Pending) ได้ทันที
 */

// เปิดใช้งานระบบตรวจสอบสิทธิ์การเข้าถึง (Admin Protected)
definePageMeta({
  layout: false,
  middleware: 'auth'
})

// ดึงรายชื่อการบริจาคทั้งหมด
const { data, refresh } = await useFetch('/api/admin/donations')

// === โครงสร้าง State คุมพรีวิวย่อสลิปลอยฟ้า (Floating Preview) ===
const preview = ref({
  visible: false, // เปิดปิดพรีวิวรูปสลิป
  url: '',        // ลิงก์ที่อยู่ภาพสลิป
  x: 0,           // พิกัดแนวแกน X
  y: 0            // พิกัดแนวแกน Y
})

/**
 * ฟังก์ชันคำนวณตำแหน่งและแสดงสลิปพรีวิวเมื่อเมาส์ชี้ปุ่ม
 * - รับ URL ภาพและ Event ชี้เมาส์มา
 * - วัดขนาดของปุ่มที่กด (getBoundingClientRect) เพื่อวางรูปภาพกล่องพรีวิวไว้ตรงกลางปุ่ม
 * - ค้นหาพื้นที่ว่างด้านบนและด้านล่างปุ่ม เพื่อหักเหทิศทางและป้องการหลุดออกนอกขอบหน้าจอเบราว์เซอร์
 */
function showPreview(url, event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const scrollY = window.scrollY
  const previewHeight = 400 // ขนาดความสูงคาดเดาของกล่องพรีวิว

  // เริ่มต้นพิกัดไว้ที่ ด้านบน ของปุ่ม
  let y = rect.top + scrollY - 10
  let placement = 'top'

  // หากพื้นที่ด้านบนเหลือน้อยเกินไป ให้พลิกพรีวิวไปวางไว้ ด้านล่าง แทน
  if (rect.top < previewHeight) {
    y = rect.bottom + scrollY + 10
    placement = 'bottom'
  }

  preview.value = {
    visible: true,
    url: url,
    x: rect.left + (rect.width / 2),
    y: y,
    placement: placement
  }
}

// ฟังก์ชันสั่งปิดพรีวิวเมื่อยกเมาส์ออก
function hidePreview() {
  preview.value.visible = false
}

/**
 * ฟังก์ชันเปลี่ยนสถานะแจ้งบริจาค (ยืนยัน/ยกเลิกยอด)
 * - ส่งเลข ID ของ Donation และสถานะที่ต้องการ ไปที่ '/api/admin/update-donation' ด้วย POST
 * - เมื่อสำเร็จให้เรียกฟังก์ชัน refresh() เพื่ออัปเดตยอดและสเตตบนหน้าจอทันทีโดยไม่ต้องโหลดหน้าเว็บใหม่
 */
async function updateStatus(id, status) {
  try {
    const res = await $fetch('/api/admin/update-donation', {
      method: 'POST',
      body: { id, status }
    })
    if (res.success) {
      await refresh()
    }
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message)
  }
}
</script>
