<script setup lang="ts">
/**
 * หน้ากิจกรรมของมัสยิด (Activities Page)
 * ทำหน้าที่: แสดงรายการข่าวสารและกิจกรรมงานบุญของมัสยิด พร้อมระบบเปิดแสดงข้อมูลขนาดใหญ่ (Popup Modal)
 * และระบบแสดงรูปภาพแบบแกลเลอรีสไลด์ภาพขนาดใหญ่ (Lightbox Carousel)
 */

// โหลดข้อมูลการตั้งค่าเนื้อหาเว็บทั้งหมด
const { data: settings } = await useFetch('/api/settings')

// ดึงข้อมูลกิจกรรมของหน้าเว็บ (page_activities) หากไม่มีใน DB ให้มีค่าเริ่มต้นรองรับ (Fallback)
const pageData = computed(() => settings.value?.page_activities || {
    title: 'กิจกรรมของมัสยิด',
    description: 'ติดตามข่าวสารและกิจกรรมงานบุญต่างๆ ของมัสยิดบ้านสมเด็จ',
    items: []
})

// === State สำหรับควบคุมการเปิดแผงรายละเอียดและแกลเลอรีรูปภาพ ===
const selectedActivity = ref<any>(null)          // เก็บออบเจกต์กิจกรรมที่กำลังถูกเลือกเปิดดู
const isModalOpen = ref(false)                   // เปิด/ปิดหน้าต่าง Popup รายละเอียดกิจกรรม
const expandedImageIndex = ref<number | null>(null) // ลำดับภาพของแกลเลอรีที่กำลังเปิดขยายใหญ่ (Lightbox)

// เปิดหน้าต่างสรุปรายละเอียดกิจกรรม และสั่งหยุดการสกรอลล์ของแถบขวาเบราว์เซอร์
const openModal = (act: any) => {
    selectedActivity.value = act
    isModalOpen.value = true
    document.body.style.overflow = 'hidden' // ป้องกันการสกรอลล์หน้าเว็บด้านหลัง
}

// ปิดหน้าต่างสรุปรายละเอียดกิจกรรม คืนค่าแถบสกรอลล์เบราว์เซอร์
const closeModal = () => {
    isModalOpen.value = false
    selectedActivity.value = null
    document.body.style.overflow = 'auto'  // อนุญาตให้กลับมาสกรอลล์หน้าเว็บได้ตามปกติ
}

// เปิดภาพแกลเลอรีสไลด์ขนาดใหญ่ (Lightbox) ตามลำดับที่กดเลือก
const openLightbox = (index: number) => {
    expandedImageIndex.value = index
}

// ปิดแผงแกลเลอรีรูปภาพขนาดใหญ่
const closeLightbox = () => {
    expandedImageIndex.value = null
}

// เลื่อนภาพไปข้างหน้าใน Lightbox (วนกลับมาภาพแรกถ้าสิ้นสุดแล้ว)
const nextImage = (e?: Event) => {
    e?.stopPropagation() // ป้องกันไม่ให้ Event กระจายไปกดปิดตัวเบื้องหลัง
    if (expandedImageIndex.value !== null && selectedActivity.value?.images) {
        expandedImageIndex.value = (expandedImageIndex.value + 1) % selectedActivity.value.images.length
    }
}

// ย้อนกลับภาพก่อนหน้าใน Lightbox
const prevImage = (e?: Event) => {
    e?.stopPropagation()
    if (expandedImageIndex.value !== null && selectedActivity.value?.images) {
        expandedImageIndex.value = (expandedImageIndex.value - 1 + selectedActivity.value.images.length) % selectedActivity.value.images.length
    }
}

// ฟังก์ชันคอยฟังปุ่มบนคีย์บอร์ด (ลูกศร ซ้าย-ขวา เพื่อสไลด์รูป, ปุ่ม ESC เพื่อปิดป็อปอัป)
const handleKeyDown = (e: KeyboardEvent) => {
    if (expandedImageIndex.value !== null) {
        if (e.key === 'ArrowRight') nextImage()
        if (e.key === 'ArrowLeft') prevImage()
        if (e.key === 'Escape') closeLightbox()
    } else if (isModalOpen.value) {
        if (e.key === 'Escape') closeModal()
    }
}

// บันทึก Event Listener บน Window สำหรับจับเหตุการณ์ปุ่มคีย์บอร์ด
if (import.meta.client) {
    window.addEventListener('keydown', handleKeyDown)
}

// ยกเลิก Event Listener เพื่อป้องกันหน่วยความจำรั่วไหล (Memory Leak) เมื่อย้ายไปหน้าอื่น
onUnmounted(() => {
    if (import.meta.client) {
        window.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'auto'
    }
})

// ฟังก์ชันช่วยจัดรูปแบบวันที่เป็นแบบปฏิทินไทย (พ.ศ.)
const formatDateBE = (dateStr: string) => {
    if (!dateStr) return 'ไม่ระบุวันที่'
    try {
        const date = new Date(dateStr)
        return new Intl.DateTimeFormat('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date)
    } catch (e) {
        return dateStr
    }
}

// ฟังก์ชันช่วยจัดรูปแบบเวลาเป็น "xx:xx น."
const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    try {
        const date = new Date(dateStr)
        return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    } catch (e) {
        return ''
    }
}
</script>

<template>
    <div class="bg-gray-50 min-h-screen pt-32 pb-20 font-['Prompt']">
        <div class="max-w-7xl mx-auto px-6">
            
            <!-- ==================== 1. Header Section (ส่วนหัวชื่อหน้ากิจกรรม) ==================== -->
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-5xl font-black text-[#155d3a] mb-4 tracking-tight uppercase">
                    {{ pageData.title }}
                </h1>
                <div class="w-24 h-1.5 bg-[#facc15] mx-auto rounded-full"></div>
                <p class="mt-6 text-slate-500 font-medium text-lg">
                    {{ pageData.description }}
                </p>
            </div>

            <!-- ==================== 2. Grid Cards Section (แสดงรายการกิจกรรม) ==================== -->
            <div v-if="pageData.items?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div 
                    v-for="(act, idx) in pageData.items" 
                    :key="idx"
                    class="bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group border border-slate-100 flex flex-col h-full transform hover:-translate-y-2 cursor-pointer"
                    @click="openModal(act)"
                >
                    <!-- รูปภาพหลักประจํากิจกรรม -->
                    <div class="h-72 overflow-hidden relative">
                        <img 
                            :src="act.image || '/images/home2.jpg'" 
                            :alt="act.title"
                            class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <!-- เลเยอร์เงาดำซ้อนทับให้ข้อความบนรูปอ่านง่ายขึ้น -->
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <!-- วันที่ของกิจกรรมวางทับมุมภาพ -->
                        <div class="absolute bottom-6 left-8 right-6">
                            <span class="px-4 py-2 bg-emerald-500 text-white shadow-lg rounded-full text-[10px] font-black uppercase tracking-widest flex items-center w-fit gap-2">
                                📅 {{ formatDateBE(act.date) }}
                            </span>
                        </div>
                    </div>
                    
                    <!-- ส่วนเนื้อหาตัวหนังสือของกิจกรรม -->
                    <div class="p-10 flex flex-col flex-1">
                        <h3 class="text-2xl font-black text-slate-800 mb-4 group-hover:text-emerald-700 transition-colors leading-tight">
                            {{ act.title }}
                        </h3>
                        
                        <!-- ข้อมูลย่อย เช่น สถานที่ และ เวลาจัดงาน -->
                        <div class="space-y-3 mb-8">
                            <div class="flex items-center gap-3 text-slate-400 text-sm font-bold">
                                <span class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-lg">📍</span>
                                <span class="tracking-wide text-ellipsis overflow-hidden whitespace-nowrap">{{ act.location || 'มัสยิดบ้านสมเด็จ' }}</span>
                            </div>
                            <div class="flex items-center gap-3 text-slate-400 text-sm font-bold">
                                <span class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-lg">⏰</span>
                                <span class="tracking-wide">เริ่มเวลา {{ formatTime(act.date) }}</span>
                            </div>
                        </div>

                        <!-- คำอธิบายกิจกรรมโดยย่อ (จำกัดแสดงผล 3 บรรทัด) -->
                        <p class="text-slate-500 leading-relaxed text-sm line-clamp-3 mb-8">
                            {{ act.description }}
                        </p>
                        
                        <div class="mt-auto">
                            <button class="w-full py-4 bg-[#0f172a] text-white font-black rounded-2xl group-hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-xs">
                                อ่านรายละเอียดเพิ่มเติม
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- แสดงข้อความเมื่อยังไม่พบกิจกรรมในระบบ -->
            <div v-else class="py-32 text-center">
                <div class="text-8xl mb-8 opacity-10">📅</div>
                <h3 class="text-2xl font-black text-slate-300 italic">ขออภัย ขณะนี้ยังไม่มีกิจกรรมใหม่ที่ประกาศ</h3>
            </div>
        </div>

        <!-- ==================== 3. Popup Modal (ป็อปอัปแสดงรายละเอียดกิจกรรมเต็ม) ==================== -->
        <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-10 bg-[#0f172a]/95 backdrop-blur-md" @click.self="closeModal">
                <div class="bg-white w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[2rem] md:rounded-[3rem] shadow-2xl relative animate-in fade-in zoom-in duration-300">
                    
                    <!-- ปุ่มกากบาทปิด Popup -->
                    <button @click="closeModal" class="fixed sm:absolute top-4 right-4 z-[110] w-10 h-10 bg-black/20 hover:bg-rose-500 backdrop-blur text-white rounded-full flex items-center justify-center transition-all shadow-xl group">
                        <span class="text-xl group-hover:scale-125 transition-transform">✕</span>
                    </button>

                    <div class="flex flex-col lg:flex-row h-full">
                        <!-- ครึ่งซ้าย: แสดงรูปหลักของกิจกรรม -->
                        <div class="w-full lg:w-1/2 h-[250px] sm:h-[350px] lg:h-auto shrink-0 relative">
                            <img :src="selectedActivity.image || '/images/home2.jpg'" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                            <div class="absolute bottom-6 left-6 md:bottom-8 md:left-10">
                                <span class="px-5 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    📅 {{ formatDateBE(selectedActivity.date) }}
                                </span>
                            </div>
                        </div>

                        <!-- ครึ่งขวา: ส่วนรายละเอียดงาน ข้อความ และแกลเลอรีรูปภาพเพิ่มเติม -->
                        <div class="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto">
                            <!-- ชื่อกิจกรรม -->
                            <h2 class="text-2xl md:text-4xl font-black text-slate-900 mb-6 md:mb-8 leading-tight">
                                {{ selectedActivity.title }}
                            </h2>

                            <!-- ข้อมูลสเกลสถานที่และเวลา -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
                                <div class="flex items-center gap-4 p-4 md:p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <div class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-xl md:text-2xl">📍</div>
                                    <div>
                                        <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">สถานที่จัด</p>
                                        <p class="font-bold text-slate-700 text-sm md:text-base">{{ selectedActivity.location || 'มัสยิดบ้านสมเด็จ' }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4 p-4 md:p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <div class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-xl md:text-2xl">⏰</div>
                                    <div>
                                        <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">เวลาเริ่ม</p>
                                        <p class="font-bold text-slate-700 text-sm md:text-base">{{ formatTime(selectedActivity.date) }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- กล่องรายละเอียดข้อมูลกิจกรรม -->
                            <div class="prose prose-slate max-w-none">
                                <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">รายละเอียดกิจกรรม</h4>
                                <p class="text-slate-600 leading-[1.8] text-base md:text-lg whitespace-pre-line">
                                    {{ selectedActivity.description }}
                                </p>
                            </div>

                            <!-- ส่วนแสดงแกลเลอรีรูปภาพย่อยเพิ่มเติม (ถ้ามี) -->
                            <div v-if="selectedActivity.images?.length" class="mt-12">
                                <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">อัลบั้มรูปภาพกิจกรรม</h4>
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div 
                                        v-for="(img, imgIdx) in selectedActivity.images" 
                                        :key="imgIdx"
                                        class="aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-zoom-in group"
                                        @click="openLightbox(imgIdx)"
                                    >
                                        <img :src="img" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                </div>
                            </div>

                            <div class="mt-8 md:mt-12 pt-8 md:pt-10 border-t border-slate-100">
                                <button @click="closeModal" class="w-full sm:w-auto px-10 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95 text-xs uppercase tracking-widest">
                                    ปิดหน้าต่างนี้
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- ==================== 4. Lightbox Modal (หน้าสไลด์รูปขยายเต็มหน้าจอ) ==================== -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
            >
                <div v-if="expandedImageIndex !== null" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl" @click="closeLightbox">
                    <!-- ปุ่มกดปิด Lightbox -->
                    <button @click="closeLightbox" class="absolute top-6 right-6 text-white text-4xl hover:text-rose-500 transition-colors z-30">✕</button>
                    
                    <!-- ปุ่มกดสไลด์ย้อนไปรูปก่อนหน้า -->
                    <button 
                        v-if="selectedActivity.images?.length > 1"
                        @click="prevImage" 
                        class="absolute left-4 md:left-10 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-30 backdrop-blur-md border border-white/10"
                    >
                        <span class="text-2xl md:text-3xl">❮</span>
                    </button>

                    <!-- รูปภาพที่ถูกขยาย -->
                    <div class="relative w-full h-full flex items-center justify-center p-4 md:p-20">
                        <img 
                            :src="selectedActivity.images[expandedImageIndex]" 
                            class="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none" 
                            @click.stop 
                        />
                        
                        <!-- ป้ายแสดงลําดับรูปภาพย่อย เช่น 1 / 3 -->
                        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-bold text-sm border border-white/10">
                            {{ expandedImageIndex + 1 }} / {{ selectedActivity.images?.length }}
                        </div>
                    </div>

                    <!-- ปุ่มกดเลื่อนไปยังรูปถัดไป -->
                    <button 
                        v-if="selectedActivity.images?.length > 1"
                        @click="nextImage" 
                        class="absolute right-4 md:right-10 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-30 backdrop-blur-md border border-white/10"
                    >
                        <span class="text-2xl md:text-3xl">❯</span>
                    </button>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
/* สร้าง Micro-animation การซูมตอนเปิดการ์ดกิจกรรมขนาดใหญ่ */
.animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
.zoom-in { animation-name: zoom; }
@keyframes zoom { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
