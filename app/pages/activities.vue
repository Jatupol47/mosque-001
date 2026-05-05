<script setup lang="ts">
const { data: settings } = await useFetch('/api/admin/settings')

const pageData = computed(() => settings.value?.page_activities || {
    title: 'กิจกรรมของมัสยิด',
    description: 'ติดตามข่าวสารและกิจกรรมงานบุญต่างๆ ของมัสยิดบ้านสมเด็จ',
    items: []
})

// สถานะสำหรับการแสดง Popup
const selectedActivity = ref<any>(null)
const isModalOpen = ref(false)
const expandedImageIndex = ref<number | null>(null)

const openModal = (act: any) => {
    selectedActivity.value = act
    isModalOpen.value = true
    document.body.style.overflow = 'hidden'
}

const closeModal = () => {
    isModalOpen.value = false
    selectedActivity.value = null
    document.body.style.overflow = 'auto'
}

const openLightbox = (index: number) => {
    expandedImageIndex.value = index
}

const closeLightbox = () => {
    expandedImageIndex.value = null
}

const nextImage = (e?: Event) => {
    e?.stopPropagation()
    if (expandedImageIndex.value !== null && selectedActivity.value?.images) {
        expandedImageIndex.value = (expandedImageIndex.value + 1) % selectedActivity.value.images.length
    }
}

const prevImage = (e?: Event) => {
    e?.stopPropagation()
    if (expandedImageIndex.value !== null && selectedActivity.value?.images) {
        expandedImageIndex.value = (expandedImageIndex.value - 1 + selectedActivity.value.images.length) % selectedActivity.value.images.length
    }
}

// Keyboard navigation for lightbox
if (import.meta.client) {
    window.addEventListener('keydown', (e) => {
        if (expandedImageIndex.value !== null) {
            if (e.key === 'ArrowRight') nextImage()
            if (e.key === 'ArrowLeft') prevImage()
            if (e.key === 'Escape') closeLightbox()
        }
    })
}

// ฟังก์ชันสำหรับจัดรูปแบบวันที่และเวลาแบบไทย (พ.ศ.)
const formatDateBE = (dateStr: string) => {
    if (!dateStr) return 'ไม่ระบุวันที่'
    try {
        const date = new Date(dateStr)
        // ใช้ Intl.DateTimeFormat เพื่อดึงปี พ.ศ. โดยอัตโนมัติ
        return new Intl.DateTimeFormat('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date)
    } catch (e) {
        return dateStr
    }
}

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
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-5xl font-black text-[#155d3a] mb-4 tracking-tight uppercase">
                    {{ pageData.title }}
                </h1>
                <div class="w-24 h-1.5 bg-[#facc15] mx-auto rounded-full"></div>
                <p class="mt-6 text-slate-500 font-medium text-lg">
                    {{ pageData.description }}
                </p>
            </div>

            <div v-if="pageData.items?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div 
                    v-for="(act, idx) in pageData.items" 
                    :key="idx"
                    class="bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group border border-slate-100 flex flex-col h-full transform hover:-translate-y-2 cursor-pointer"
                    @click="openModal(act)"
                >
                    <div class="h-72 overflow-hidden relative">
                        <img 
                            :src="act.image || '/images/home2.jpg'" 
                            :alt="act.title"
                            class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div class="absolute bottom-6 left-8 right-6">
                            <span class="px-4 py-2 bg-emerald-500 text-white shadow-lg rounded-full text-[10px] font-black uppercase tracking-widest flex items-center w-fit gap-2">
                                📅 {{ formatDateBE(act.date) }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="p-10 flex flex-col flex-1">
                        <h3 class="text-2xl font-black text-slate-800 mb-4 group-hover:text-emerald-700 transition-colors leading-tight">
                            {{ act.title }}
                        </h3>
                        
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

            <div v-else class="py-32 text-center">
                <div class="text-8xl mb-8 opacity-10">📅</div>
                <h3 class="text-2xl font-black text-slate-300 italic">ขออภัย ขณะนี้ยังไม่มีกิจกรรมใหม่ที่ประกาศ</h3>
            </div>
        </div>

        <!-- Popup Modal (รายละเอียดกิจกรรม) -->
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
                    <!-- ปุ่มปิด -->
                    <button @click="closeModal" class="fixed sm:absolute top-4 right-4 z-[110] w-10 h-10 bg-black/20 hover:bg-rose-500 backdrop-blur text-white rounded-full flex items-center justify-center transition-all shadow-xl group">
                        <span class="text-xl group-hover:scale-125 transition-transform">✕</span>
                    </button>

                    <div class="flex flex-col lg:flex-row h-full">
                        <!-- รูปภาพด้านซ้าย -->
                        <div class="w-full lg:w-1/2 h-[250px] sm:h-[350px] lg:h-auto shrink-0 relative">
                            <img :src="selectedActivity.image || '/images/home2.jpg'" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                            <div class="absolute bottom-6 left-6 md:bottom-8 md:left-10">
                                <span class="px-5 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    📅 {{ formatDateBE(selectedActivity.date) }}
                                </span>
                            </div>
                        </div>

                        <!-- เนื้อหาด้านขวา -->
                        <div class="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto">
                            <h2 class="text-2xl md:text-4xl font-black text-slate-900 mb-6 md:mb-8 leading-tight">
                                {{ selectedActivity.title }}
                            </h2>

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

                            <div class="prose prose-slate max-w-none">
                                <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">รายละเอียดกิจกรรม</h4>
                                <p class="text-slate-600 leading-[1.8] text-base md:text-lg whitespace-pre-line">
                                    {{ selectedActivity.description }}
                                </p>
                            </div>

                            <!-- อัลบั้มรูปภาพเพิ่มเติม -->
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

        <!-- Lightbox (แสดงรูปขยายพร้อมปุ่มเลื่อน) -->
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
                    <!-- ปุ่มปิด -->
                    <button @click="closeLightbox" class="absolute top-6 right-6 text-white text-4xl hover:text-rose-500 transition-colors z-30">✕</button>
                    
                    <!-- ปุ่มย้อนกลับ -->
                    <button 
                        v-if="selectedActivity.images?.length > 1"
                        @click="prevImage" 
                        class="absolute left-4 md:left-10 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-30 backdrop-blur-md border border-white/10"
                    >
                        <span class="text-2xl md:text-3xl">❮</span>
                    </button>

                    <!-- รูปภาพ -->
                    <div class="relative w-full h-full flex items-center justify-center p-4 md:p-20">
                        <img 
                            :src="selectedActivity.images[expandedImageIndex]" 
                            class="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none" 
                            @click.stop 
                        />
                        
                        <!-- ตัวเลขบอกลำดับ -->
                        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-bold text-sm border border-white/10">
                            {{ expandedImageIndex + 1 }} / {{ selectedActivity.images?.length }}
                        </div>
                    </div>

                    <!-- ปุ่มถัดไป -->
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
.animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
.zoom-in { animation-name: zoom; }
@keyframes zoom { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
