<script setup lang="ts">

/**
 * หน้าแรก (Home Page) ของเว็บไซต์มัสยิดบ้านสมเด็จ
 */

const { data: pageDataResponse } = await useAsyncData('home-data', async () => {
    const d = new Date()
    const [settings, donations, prayerData] = await Promise.all([
        $fetch('/api/settings'),
        $fetch('/api/donations/stats'),
        $fetch('/api/prayer-times', {
            query: {
                dd: d.getDate(),
                mm: d.getMonth() + 1,
                yyyy: d.getFullYear()
            }
        }).catch(() => null)
    ])
    
    return {
        settings,
        donationAmount: donations.totalAmount || 0,
        totalDonors: donations.totalDonors || 0,
        prayerData
    }
})

const pageData = computed(() => pageDataResponse.value?.settings?.page_index || {
    hero_title: 'ยินดีต้อนรับสู่ มัสยิดบ้านสมเด็จ',
    hero_subtitle: 'ศูนย์รวมจิตใจ สันติสุข และความร่มเย็นของชุมชน',
    hero_image: '/images/background.jpg',
    about_items: []
})

const donationAmount = computed(() => pageDataResponse.value?.donationAmount || 0)
const totalDonors = computed(() => pageDataResponse.value?.totalDonors || 0)

const formattedAmount = computed(() => {
    return new Intl.NumberFormat('th-TH').format(donationAmount.value)
})

// === จัดการข้อมูลเวลาละหมาด ===
const prayerTimes = computed(() => {
    const data = pageDataResponse.value?.prayerData?.times
    if (data) {
        return [
            { name: 'ซุบฮิ', time: data.fajr, icon: '🌅' },
            { name: 'ชูรูก', time: data.sunrise, icon: '☀️' },
            { name: 'ดุฮริ', time: data.dhuhr, icon: '☀️' },
            { name: 'อัศริ', time: data.asr, icon: '🌤️' },
            { name: 'มัฆริบ', time: data.maghrib, icon: '🌇' },
            { name: 'อิชา', time: data.isha, icon: '🌙' }
        ]
    }
    // Default fallback
    return [
        { name: 'ซุบฮิ', time: '05:00', icon: '🌅' },
        { name: 'ชูรูก', time: '06:15', icon: '☀️' },
        { name: 'ดุฮริ', time: '12:30', icon: '☀️' },
        { name: 'อัศริ', time: '15:45', icon: '🌤️' },
        { name: 'มัฆริบ', time: '18:45', icon: '🌇' },
        { name: 'อิชา', time: '20:00', icon: '🌙' }
    ]
})

// === จัดการ Slider ===
const activeSlide = ref(0)
let slideInterval: any

onMounted(() => {
    slideInterval = setInterval(() => {
        activeSlide.value = (activeSlide.value + 1) % 2
    }, 6000) // สลับทุก 6 วินาที
})

onUnmounted(() => {
    if (slideInterval) clearInterval(slideInterval)
})

const setSlide = (index: number) => {
    activeSlide.value = index
    // รีเซ็ตเวลาอัตโนมัติเมื่อกดเปลี่ยนสไลด์เอง
    clearInterval(slideInterval)
    slideInterval = setInterval(() => {
        activeSlide.value = (activeSlide.value + 1) % 2
    }, 6000)
}
</script>

<template>
    <div class="bg-gray-50 font-sans min-h-screen">

        <!-- ==================== 1. Hero Section Slider ==================== -->
        <header
            class="relative h-[80vh] flex justify-center items-center text-center text-white px-5 bg-center bg-cover bg-no-repeat transition-all duration-700 overflow-hidden"
            :style="{ backgroundImage: `linear-gradient(rgba(10,61,42,0.7),rgba(17,94,65,0.85)), url('${pageData.hero_image}')` }">
            
            <!-- Slide 1: บริจาคและข้อมูลทั่วไป -->
            <Transition name="fade">
                <div v-show="activeSlide === 0" class="absolute max-w-[800px] flex flex-col items-center w-full">
                    <h1 class="text-[2.2rem] md:text-[3.5rem] mb-[15px] drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)] font-bold leading-tight uppercase tracking-tight">
                        {{ pageData.hero_title }}
                    </h1>
                    <p class="text-[1.1rem] md:text-[1.3rem] mb-[30px] text-[#f1f1f1] font-medium">
                        {{ pageData.hero_subtitle }}
                    </p>

                    <div class="mb-[30px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg w-full max-w-md mx-auto transform hover:scale-105 transition-transform duration-300">
                        <p class="text-green-100 text-sm md:text-base mb-2 font-medium tracking-wide">สถิติผู้ร่วมสมทบทุนบำรุงมัสยิด (รวม {{ totalDonors }} ท่าน)</p>
                        <div class="text-3xl md:text-4xl font-bold text-[#facc15] tracking-wide drop-shadow-md mb-4">
                            {{ formattedAmount }} <span class="text-lg md:text-xl text-white font-normal">บาท</span>
                        </div>
                        <NuxtLink to="/donate" class="bg-[#facc15] text-[#104b2e] px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition-colors inline-block">
                            ร่วมบริจาคออนไลน์
                        </NuxtLink>
                    </div>
                </div>
            </Transition>

            <!-- Slide 2: เวลาละหมาด -->
            <Transition name="fade">
                <div v-show="activeSlide === 1" class="absolute max-w-[800px] flex flex-col items-center w-full">
                    <h1 class="text-[2.2rem] md:text-[3.5rem] mb-[10px] drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)] font-bold leading-tight uppercase tracking-tight">
                        เวลาละหมาดประจำวัน
                    </h1>
                    <p class="text-[1.1rem] md:text-[1.3rem] mb-[20px] text-[#f1f1f1] font-medium">
                        ตารางเวลาละหมาดวันนี้ มัสยิดบ้านสมเด็จ
                    </p>

                    <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 shadow-lg w-full max-w-3xl mx-auto">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div v-for="prayer in prayerTimes" :key="prayer.name" class="bg-white/20 rounded-xl p-3 flex flex-col items-center">
                                <span class="text-2xl mb-1">{{ prayer.icon }}</span>
                                <span class="text-sm font-medium text-green-100">{{ prayer.name }}</span>
                                <span class="text-xl md:text-2xl font-bold text-[#facc15]">{{ prayer.time }}</span>
                            </div>
                        </div>
                        <div class="mt-4">
                            <NuxtLink to="/timetable" class="text-sm text-yellow-300 hover:text-yellow-100 underline">ดูตารางเวลาแบบเต็ม</NuxtLink>
                        </div>
                    </div>
                </div>
            </Transition>

            <!-- Slider Dots -->
            <div class="absolute bottom-10 flex gap-3">
                <button @click="setSlide(0)" :class="{'w-8 bg-[#facc15]': activeSlide === 0, 'w-3 bg-white/50 hover:bg-white/80': activeSlide !== 0}" class="h-3 rounded-full transition-all duration-300"></button>
                <button @click="setSlide(1)" :class="{'w-8 bg-[#facc15]': activeSlide === 1, 'w-3 bg-white/50 hover:bg-white/80': activeSlide !== 1}" class="h-3 rounded-full transition-all duration-300"></button>
            </div>
        </header>

        <!-- ==================== 2. Brief History Section ==================== -->
        <section v-if="pageData.history_brief" class="py-20 bg-white border-b border-slate-100">
            <div class="max-w-4xl mx-auto px-6 text-center">
                <div class="mb-10">
                    <h2 class="text-3xl font-bold text-gray-800 mb-4">ประวัติความเป็นมาโดยย่อ</h2>
                    <div class="w-16 h-1 bg-[#facc15] mx-auto rounded-full"></div>
                </div>
                <p class="text-lg text-slate-600 leading-relaxed whitespace-pre-line mb-10">
                    {{ pageData.history_brief }}
                </p>
                <NuxtLink to="/history" class="inline-flex items-center gap-2 px-8 py-3 bg-emerald-50 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-100 transition-all active:scale-95 group">
                    อ่านประวัติฉบับเต็ม
                    <span class="group-hover:translate-x-1 transition-transform">→</span>
                </NuxtLink>
            </div>
        </section>

        <!-- ==================== 3. Dynamic About Section ==================== -->
        <section id="about" class="max-w-7xl mx-auto px-5 py-24 text-center">
            <div class="mb-12">
                <h2 class="text-4xl font-bold text-gray-800 mb-4">เกี่ยวกับมัสยิดของเรา</h2>
                <div class="w-20 h-1.5 bg-green-700 mx-auto rounded-full"></div>
            </div>

            <div v-if="pageData.about_items?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div 
                    v-for="(item, index) in pageData.about_items" 
                    :key="index"
                    class="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group border border-slate-100"
                >
                    <div class="h-64 overflow-hidden relative">
                        <img 
                            :src="item.image || '/images/home.jpg'" 
                            :alt="item.title"
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div class="p-8 text-left">
                        <h3 class="text-xl font-bold text-slate-800 mb-3 group-hover:text-green-700 transition-colors">
                            {{ item.title }}
                        </h3>
                        <p class="text-slate-600 leading-relaxed text-sm line-clamp-4">
                            {{ item.description }}
                        </p>
                    </div>
                </div>
            </div>
            
            <div v-else class="py-20 text-slate-400 italic">
                <p>ขออภัย ขณะนี้ยังไม่มีข้อมูลรายละเอียดมัสยิด</p>
            </div>
        </section>

    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
