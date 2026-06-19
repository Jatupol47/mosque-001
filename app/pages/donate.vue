<script setup lang="ts">
/**
 * หน้าจอการรับบริจาค (Donate Page)
 * ทำหน้าที่:
 * 1. แสดงคิวอาร์โค้ด (QR Code) และข้อมูลบัญชีธนาคารของมัสยิดสำหรับการโอนเงิน
 * 2. รับข้อมูลแจ้งโอนเงินจากผู้บริจาค (ชื่อ, ยอดเงิน, ข้อความอวยพร)
 * 3. อัปโหลดภาพสลิปหลักฐานการโอนไปที่ Supabase Storage
 * 4. บันทึกข้อมูลใบเสร็จ/ลดหย่อนภาษี (หากขอใบเสร็จลดหย่อน)
 * 5. บันทึกข้อมูลทั้งหมดลงฐานข้อมูลผ่าน API และแสดง Modal ใบเสร็จสำเร็จรูปพร้อมปุ่มสั่งพิมพ์/เซฟ PDF
 */

const supabase = useSupabaseClient()

// โหลดการตั้งค่ารูปคิวอาร์โค้ด ข้อมูลเนื้อหาสำหรับแสดงในหน้านี้
const { data: settings } = await useFetch('/api/settings')

// ดึงรายละเอียดข้อมูลเฉพาะสำหรับหน้าบริจาค (page_donate) หากไม่มีข้อมูลในระบบให้ใช้ค่าเริ่มต้น (Default Fallback)
const pageData = computed(() => settings.value?.page_donate || {
    title: 'ร่วมบริจาคสมทบทุน',
    description: 'การบริจาคของคุณจะถูกนำไปใช้เพื่อทำนุบำรุงมัสยิดและช่วยเหลือผู้ยากไร้ในชุมชน',
    qr_image: '/images/qr.png'
})

// === โครงสร้าง Object สเตตของแบบฟอร์มการแจ้งบริจาค ===
const form = ref({
    amount: '',               // จำนวนเงินที่ร่วมบริจาค
    donorName: '',            // ชื่อผู้บริจาค (หรือไม่ระบุก็ได้)
    donorEmail: '',           // อีเมลผู้บริจาค (ใช้รับใบกำกับภาษี)
    donorPhone: '',           // เบอร์โทรศัพท์ติดต่อ
    blessing: '',             // ข้อความอวยพร/คำดุอาอ์/ข้อเสนอแนะเพิ่มเติม
    slipUrl: '',              // ลิงก์ที่อยู่ของภาพสลิปที่อัปโหลดสำเร็จแล้ว
    requestTaxInvoice: false, // บูลีนระบุว่าต้องการใบเสร็จลดหย่อนภาษีหรือไม่
    taxId: '',                // เลขประจำตัวผู้เสียภาษี (13 หลัก)
    address: ''               // ที่อยู่จัดส่งเอกสารทางไปรษณีย์
})

// === สเตตควบคุมการแสดงผลและสถานะปุ่มกด ===
const isUploading = ref(false)         // สถานะกำลังอัปโหลดสลิป (ใช้เปิด Spinner ทับสลิป)
const isSubmitting = ref(false)        // สถานะกำลังกดส่งข้อมูลฟอร์ม
const showTaxModal = ref(false)        // สถานะแสดงหน้าต่างกรอกที่อยู่ภาษี (Tax Invoice Modal)
const showSuccessModal = ref(false)    // สถานะแสดงบิลความสำเร็จหลังบันทึกข้อมูล (Success Modal/Receipt)
const isPrintTaxMode = ref(false)      // โหมดพิมพ์ใบกำกับภาษี
const donationResult = ref<any>(null)  // เก็บออบเจกต์ผลลัพธ์ที่ได้จากการตอบกลับของ Server
const localSlipPreview = ref('')       // ลิงก์รูปภาพในเครื่องแบบชั่วคราว (Local Object URL) สำหรับพรีวิวภาพทันที

/**
 * ฟังก์ชันจัดการและอัปโหลดภาพหลักฐานการโอน (สลิป)
 * - รับ File หลักฐานมา และสร้าง Preview ในเครื่องทันที
 * - ส่ง File ขึ้นไปเก็บยัง Supabase Storage Bucket ชื่อ 'images' ภายใต้โฟลเดอร์ 'slips'
 * - ดึงลิงก์ Public URL กลับมาเก็บบันทึกใส่ฟอร์ม (form.value.slipUrl)
 */
async function handleSlipUpload(event: any) {
    const file = event.target.files[0]
    if (!file) return

    isUploading.value = true
    // สร้าง Object URL ท้องถิ่นเพื่อแสดงสลิปพรีวิวรวดเร็วทันใจ
    localSlipPreview.value = URL.createObjectURL(file)

    const fileExt = file.name.split('.').pop()
    const fileName = `slip_${Date.now()}.${fileExt}` // ป้องกันรูปซ้ำกันด้วย Timestamp
    const filePath = `slips/${fileName}`

    try {
        // ทำการส่งไฟล์ขึ้น Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        // ดึง Public URL ของรูปภาพ
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath)

        // เก็บ URL ลงในตัวแปรแบบฟอร์มเพื่อส่งหลังบ้านต่อไป
        form.value.slipUrl = publicUrl
    } catch (error: any) {
        alert('อัปโหลดสลิปล้มเหลว: ' + error.message)
    } finally {
        isUploading.value = false
    }
}

/**
 * ฟังก์ชันสำหรับส่งข้อมูลแบบฟอร์มไปบันทึกลงฐานข้อมูลหลังบ้าน
 * - ตรวจสอบความถูกต้องของข้อมูลพื้นฐาน (จำนวนเงิน และ แนบรูปสลิป)
 * - ยิงคำร้อง POST $fetch ไปที่ '/api/donate'
 * - เมื่อสำเร็จให้ล้างข้อมูลในฟอร์มทั้งหมด และเปิด Modal แสดงใบแจ้งความสำเร็จ
 */
async function submitDonation() {
    if (!form.value.amount || !form.value.slipUrl) {
        alert('กรุณากรอกจำนวนเงินและแนบสลิปการโอนเงินครับ')
        return
    }

    isSubmitting.value = true
    try {
        const response: any = await $fetch('/api/donate', {
            method: 'POST',
            body: form.value
        })
        
        // รับข้อมูลใบเสร็จที่บันทึกสำเร็จมาจาก Database
        donationResult.value = response.donation
        // แสดง Modal บิลสำเร็จพร้อมพิมพ์
        showSuccessModal.value = true
        
        // ล้างแบบฟอร์มทั้งหมดให้เป็นค่าว่างหลังจากส่งข้อมูลแล้ว
        form.value = { 
            amount: '', 
            donorName: '', 
            donorEmail: '',
            donorPhone: '',
            blessing: '', 
            slipUrl: '',
            requestTaxInvoice: false,
            taxId: '',
            address: ''
        }
        localSlipPreview.value = ''
    } catch (error: any) {
        alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
        isSubmitting.value = false
    }
}

/**
 * ฟังก์ชันสั่งพิมพ์หน้าเอกสารใบเสร็จบริจาค (Receipt Printing)
 * - หน่วงเวลา 500ms เพื่อให้สไลด์ CSS หรือการแสดงผลพร้อมรันคำสั่งพิมพ์ของเบราว์เซอร์
 */
function printReceipt() {
    isPrintTaxMode.value = false
    setTimeout(() => {
        window.print()
    }, 500)
}

function printTaxInvoice() {
    isPrintTaxMode.value = true
    setTimeout(() => {
        window.print()
    }, 500)
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 pt-28 pb-16 font-['Prompt']">
        <div class="max-w-6xl mx-auto px-6">
            <!-- หัวเรื่องประจำหน้าจอ -->
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl font-black text-[#155d3a] mb-4 uppercase">{{ pageData.title }}</h1>
                <div class="w-20 h-1.5 bg-[#facc15] mx-auto rounded-full shadow-sm"></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                <!-- ==================== ฝั่งซ้าย: ข้อมูลการโอนเงิน (QR Code & เลขบัญชี) ==================== -->
                <div class="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-xl overflow-hidden border border-slate-100 p-6 md:p-12 text-center">
                    <p class="text-slate-600 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                        {{ pageData.description }}
                    </p>

                    <!-- กรอบแสดง QR Code สำหรับโอนเงินเพื่อบริจาค -->
                    <div class="mb-8 inline-block p-4 md:p-6 bg-emerald-50 rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-emerald-200">
                        <img :src="pageData.qr_image" alt="QR Code สำหรับบริจาค"
                            class="w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain mx-auto rounded-2xl shadow-sm">
                    </div>

                    <!-- กล่องข้อมูลบัญชีธนาคาร -->
                    <div class="space-y-4 max-w-sm mx-auto">
                        <div class="bg-slate-900 p-5 rounded-2xl flex items-center justify-center gap-4 shadow-lg">
                            <span class="text-3xl">🏦</span>
                            <div class="text-left">
                                <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ชื่อบัญชี</p>
                                <p class="font-bold text-white text-lg leading-tight">มัสยิดบ้านสมเด็จ (เพื่อการกุศล)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ==================== ฝั่งขวา: ฟอร์มกรอกข้อมูลแจ้งโอน (Donation Form) ==================== -->
                <div class="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 md:p-12">
                    <h2 class="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                        <span class="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">📝</span>
                        แจ้งข้อมูลการโอนเงิน
                    </h2>

                    <form @submit.prevent="submitDonation" class="space-y-8">
                        
                        <!-- แถวช่องกรอกข้อมูล ชื่อและจำนวนเงิน -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อผู้บริจาค</label>
                                <input v-model="form.donorName" type="text" placeholder="ระบุชื่อ (หรือไม่ระบุก็ได้)" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">จำนวนเงิน (บาท) *</label>
                                <input v-model="form.amount" type="number" step="0.01" required placeholder="ระบุจำนวนเงิน..." class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-emerald-600 text-xl" />
                            </div>
                        </div>

                        <!-- ช่องรับข้อความคำดุอาอ์/ข้อเสนอแนะ -->
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">คำอวยพร / ข้อความ</label>
                            <textarea v-model="form.blessing" rows="3" placeholder="ข้อความถึงมัสยิด..." class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"></textarea>
                        </div>

                        <!-- ส่วนลดหย่อนภาษี (Tax Deductible Information Button) -->
                        <div class="space-y-4">
                            <button 
                                type="button"
                                @click="showTaxModal = true"
                                class="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📄</div>
                                    <div class="text-left">
                                        <p class="text-sm font-bold text-slate-700">ขอใบกำกับภาษี / ใบอนุโมทนาบัตร</p>
                                        <p class="text-[10px] text-slate-400 font-medium">กรอกข้อมูลเพื่อลดหย่อนภาษี</p>
                                    </div>
                                </div>
                                <!-- เครื่องหมายเช็คถูกสีเขียวเมื่อกรอกข้อมูลภาษีแล้ว -->
                                <div v-if="form.requestTaxInvoice" class="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</div>
                                <div v-else class="text-slate-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                            </button>

                            <!-- แถบแสดงสถานะเตือนว่าบันทึกข้อมูลภาษีเรียบร้อยแล้ว -->
                            <transition name="fade">
                                <div v-if="form.requestTaxInvoice" class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="text-emerald-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                        </div>
                                        <p class="text-xs font-bold text-emerald-700">บันทึกข้อมูลใบกำกับภาษีแล้ว</p>
                                    </div>
                                    <button type="button" @click="form.requestTaxInvoice = false" class="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest">ยกเลิก</button>
                                </div>
                            </transition>
                        </div>

                        <!-- ส่วนอัปโหลดและแสดงรูปภาพสลิป -->
                        <div class="space-y-4">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">แนบรูปภาพสลิป *</label>
                            <div class="relative group">
                                <!-- แสดงผลภาพสลิปเมื่อผู้ใช้แนบสลิปเรียบร้อยแล้ว -->
                                <div v-if="localSlipPreview" class="relative w-full h-64 rounded-[2rem] overflow-hidden border-4 border-white shadow-md mb-4 bg-slate-100">
                                    <img :src="localSlipPreview" class="w-full h-full object-contain" />
                                    <!-- ตัวหมุนโหลด (Spinner overlay) ระหว่างอัปสลิปขึ้นคลาวด์ -->
                                    <div v-if="isUploading" class="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                        <div class="flex flex-col items-center gap-3">
                                            <div class="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span class="text-white text-xs font-bold uppercase tracking-widest">กำลังอัปโหลด...</span>
                                        </div>
                                    </div>
                                    <!-- ปุ่มลบรูปสลิปเพื่ออัปรูปใหม่ -->
                                    <button type="button" @click="localSlipPreview = ''; form.slipUrl = ''" class="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur text-rose-500 rounded-full shadow-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">✕</button>
                                </div>
                                <!-- กรอบอัปโหลดกรณีที่ยังไม่มีรูปสลิป -->
                                <label v-else class="flex flex-col items-center justify-center w-full h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-100 transition-all group">
                                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                        <span class="text-4xl mb-4 group-hover:scale-110 transition-transform">📸</span>
                                        <p class="mb-2 text-sm text-slate-500 font-bold uppercase tracking-widest">คลิกเพื่อแนบรูปสลิป</p>
                                        <p class="text-[10px] text-slate-400">JPG, PNG หรือ PDF</p>
                                    </div>
                                    <input type="file" @change="handleSlipUpload" class="hidden" accept="image/*" />
                                </label>
                            </div>
                        </div>

                        <!-- ปุ่มส่งข้อมูลการโอนเงิน -->
                        <button 
                            type="submit" 
                            :disabled="isSubmitting || isUploading"
                            class="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-lg"
                        >
                            <span v-if="isSubmitting" class="flex items-center justify-center gap-3">
                                <div class="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                กำลังส่งข้อมูล...
                            </span>
                            <span v-else>ยืนยันการบริจาค ✨</span>
                        </button>
                    </form>
                </div>

            </div>
        </div>
    </div>

    <!-- ==================== 5. Tax Invoice Modal (หน้าต่างกรอกที่อยู่ภาษี) ==================== -->
    <Teleport to="body">
        <transition name="fade">
            <div v-if="showTaxModal" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <!-- แผ่นเงาหลังเบลอ (Background Overlay) -->
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showTaxModal = false"></div>
                <!-- ตัวหน้าต่างฟอร์ม -->
                <div class="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div class="h-2 bg-emerald-500 w-full"></div>
                    <div class="p-8 md:p-10">
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <h3 class="text-2xl font-black text-slate-800">ข้อมูลใบกำกับภาษี</h3>
                                <p class="text-sm text-slate-400 font-medium">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อความถูกต้อง</p>
                            </div>
                            <button @click="showTaxModal = false" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all">✕</button>
                        </div>

                        <!-- ฟอร์มกรอกที่อยู่จัดส่งเอกสารและรายละเอียดเสียภาษี -->
                        <div class="space-y-6">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อ-นามสกุล (ตามบัตรประชาชน)</label>
                                <input v-model="form.donorName" type="text" placeholder="ระบุชื่อ-นามสกุล..." class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold shadow-sm" />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">เบอร์โทรศัพท์</label>
                                    <input v-model="form.donorPhone" type="tel" placeholder="08X-XXX-XXXX" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold shadow-sm" />
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">อีเมล์</label>
                                    <input v-model="form.donorEmail" type="email" placeholder="example@mail.com" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold shadow-sm" />
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">เลขประจำตัวผู้เสียภาษี</label>
                                <input v-model="form.taxId" type="text" placeholder="เลข 13 หลัก..." class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold shadow-sm" />
                            </div>

                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ที่อยู่สำหรับการจัดส่งเอกสาร</label>
                                <textarea v-model="form.address" rows="3" placeholder="ระบุที่อยู่โดยละเอียด..." class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium shadow-sm"></textarea>
                            </div>
                        </div>

                        <!-- กลุ่มปุ่มตัดสินใจ -->
                        <div class="mt-4 text-xs text-rose-500 font-bold mb-4">
                            * หมายเหตุ: ใบกำกับภาษีฉบับจริงจะถูกจัดส่งทางไปรษณีย์ภายใน 7-14 วันทำการ
                        </div>
                        <div class="mt-4 flex gap-4">
                            <button @click="showTaxModal = false" class="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">ยกเลิก</button>
                            <button @click="form.requestTaxInvoice = true; showTaxModal = false" class="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">บันทึกข้อมูล</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- ==================== 6. Success Modal & Receipt (ใบเสร็จรับเงินสำเร็จหลังบันทึก) ==================== -->
        <transition name="fade">
            <div v-if="showSuccessModal" class="fixed inset-0 z-[110] flex items-center justify-center p-6">
                <!-- แผ่นพื้นหลังเบลอสีเขียวชอุ่ม -->
                <div class="absolute inset-0 bg-emerald-900/40 backdrop-blur-md"></div>
                
                <!-- ตัวกล่องเอกสารหลักใบแจ้งยอดใบเสร็จ -->
                <div class="bg-white w-full max-w-lg rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-y-auto max-h-[85vh] print:shadow-none print:m-0 print:overflow-visible print:max-h-none">
                    <!-- ปุ่มกากบาทปิดหน้าต่าง (Close Button) -->
                    <button @click="showSuccessModal = false" class="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all z-10 print:hidden font-bold">✕</button>
                    
                    <!-- ส่วนหัวที่จะแสดงเฉพาะเวลาที่กดสั่งพิมพ์กระดาษออกมาเท่านั้น (Hidden in Web View, Visible in Printing) -->
                    <div class="hidden print:block p-8 text-center border-b-2 border-emerald-500">
                        <h1 class="text-2xl font-black text-emerald-700 uppercase">{{ isPrintTaxMode ? 'ใบกำกับภาษี (ชั่วคราว)' : 'ใบเสร็จรับเงิน/หลักฐานการบริจาค' }}</h1>
                        <p class="text-sm font-bold text-slate-500">มัสยิดบ้านสมเด็จ (Bang Somdet Mosque)</p>
                    </div>

                    <div class="p-6 md:p-8 text-center mt-6 md:mt-0">
                        <div class="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-3xl md:text-4xl mx-auto mb-4 print:hidden">
                            🎉
                        </div>
                        
                        <h3 class="text-xl md:text-2xl font-black text-slate-800 mb-1 print:text-xl">บริจาคสำเร็จ!</h3>
                        <p class="text-sm md:text-base text-slate-500 font-medium mb-6 print:mb-4">ขออัลลอฮ์ทรงตอบแทนความดีงามแก่ท่าน</p>

                        <!-- ดีเทลรายการสรุปยอดบิลบริจาค -->
                        <div class="bg-slate-50 rounded-[2rem] p-6 mb-8 text-left space-y-3 border border-slate-100 print:bg-white print:border-none print:p-0">
                            <div class="flex justify-between items-center border-b border-slate-200 pb-3 mb-3 print:border-slate-100">
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">เลขที่อ้างอิง</span>
                                <span class="text-sm font-bold text-slate-700 font-mono">#{{ donationResult?.id?.toString().padStart(6, '0') }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-xs font-bold text-slate-400">ชื่อผู้บริจาค:</span>
                                <span class="text-sm font-bold text-slate-700">{{ donationResult?.donorName || 'ผู้ไม่ประสงค์ออกนาม' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-xs font-bold text-slate-400">จำนวนเงิน:</span>
                                <span class="text-lg font-black text-emerald-600">{{ donationResult?.amount?.toLocaleString() }} บาท</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-xs font-bold text-slate-400">วันที่:</span>
                                <span class="text-sm font-bold text-slate-700">{{ new Date(donationResult?.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
                            </div>
                            <div v-if="donationResult?.taxId" class="flex justify-between pt-3 border-t border-dashed border-slate-200 print:border-slate-100">
                                <span class="text-xs font-bold text-slate-400">เลขผู้เสียภาษี:</span>
                                <span class="text-sm font-bold text-slate-700">{{ donationResult?.taxId }}</span>
                            </div>
                            
                            <!-- แนบภาพสลิปประกอบบิลเพื่อใช้อ้างอิงการตรวจสอบ -->
                            <div class="pt-4 border-t border-slate-200 print:border-slate-100 mt-4">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">หลักฐานการโอนเงิน</p>
                                <div class="w-full h-40 bg-white rounded-xl overflow-hidden border border-slate-200">
                                    <img :src="donationResult?.slipUrl" class="w-full h-full object-contain" alt="สลิปการโอนเงิน" />
                                </div>
                            </div>
                        </div>

                        <!-- กลุ่มควบคุมในหน้าจอเว็บ (ซ่อนไม่ให้พิมพ์ออกมาบนกระดาษ) -->
                        <div class="flex flex-col gap-3 print:hidden">
                            <button @click="printReceipt" class="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                <span>🖨️</span> พิมพ์ใบเสร็จ / บันทึกเป็น PDF
                            </button>
                            <button v-if="donationResult?.taxId" @click="printTaxInvoice" class="w-full py-4 bg-amber-500 text-white font-black rounded-2xl shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
                                <span>📑</span> พิมพ์ใบกำกับภาษี (ชั่วคราว)
                            </button>
                            <button @click="showSuccessModal = false" class="w-full py-4 bg-emerald-50 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-100 transition-all">
                                กลับสู่หน้าหลัก
                            </button>
                        </div>

                        <!-- คำลงท้ายบิลที่พิมพ์ -->
                        <div class="hidden print:block mt-12 text-center text-[10px] text-slate-400 italic">
                            * เอกสารนี้เป็นเพียงหลักฐานการแจ้งบริจาคเบื้องต้น *
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<style scoped>
/* คีย์เอฟเฟกต์เฟดเปิดปิด Modal */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

/* ==================== 🛠️ CSS สำหรับคำสั่งพิมพ์เฉพาะ (Print Media Query) ==================== */
@media print {
    body * {
        visibility: hidden; /* ซ่อนองค์ประกอบอื่นๆ บนหน้าเว็บทั้งหมด */
    }
    .print\:block {
        display: block !important; /* บังคับให้บิลด้านบนแสดงผล */
    }
    .fixed, .fixed * {
        visibility: visible; /* บังคับแสดงหน้าต่าง Modal ของบิลใบเสร็จเท่านั้น */
    }
    .fixed {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 0;
        margin: 0;
    }
    .bg-emerald-900\/40 {
        display: none !important; /* ซ่อนพื้นหลังทึบหน้าจอคอม */
    }
    .max-w-lg {
        max-width: 100% !important;
    }
    button {
        display: none !important; /* ซ่อนปุ่มกดทั้งหมดออกจากสีกระดาษ */
    }
}
</style>
