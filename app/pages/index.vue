<script setup lang="ts">
const { data: pageDataResponse } = await useAsyncData('home-data', async () => {
    const [settings, donations] = await Promise.all([
        $fetch('/api/settings'),
        $fetch('/api/donation-summary')
    ])
    
    return {
        settings,
        donationAmount: donations.totalAmount
    }
})

const pageData = computed(() => pageDataResponse.value?.settings?.page_index || {
    hero_title: 'ยินดีต้อนรับสู่ มัสยิดบ้านสมเด็จ',
    hero_subtitle: 'ศูนย์รวมจิตใจ สันติสุข และความร่มเย็นของชุมชน',
    hero_image: '/images/background.jpg',
    about_items: []
})

const donationAmount = computed(() => pageDataResponse.value?.donationAmount || 0)

const formattedAmount = computed(() => {
    return new Intl.NumberFormat('th-TH').format(donationAmount.value)
})
</script>

<template>
    <div class="bg-gray-50 font-sans min-h-screen">

        <!-- Hero Section -->
        <header
            class="h-[80vh] flex justify-center items-center text-center text-white px-5 bg-center bg-cover bg-no-repeat transition-all duration-700"
            :style="{ backgroundImage: `linear-gradient(rgba(10,61,42,0.7),rgba(17,94,65,0.85)), url('${pageData.hero_image}')` }">
            <div class="max-w-[800px] flex flex-col items-center">
                <h1
                    class="text-[2.2rem] md:text-[3.5rem] mb-[15px] drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)] font-bold leading-tight uppercase tracking-tight">
                    {{ pageData.hero_title }}
                </h1>
                <p class="text-[1.1rem] md:text-[1.3rem] mb-[30px] text-[#f1f1f1] font-medium">
                    {{ pageData.hero_subtitle }}
                </p>

                <div
                    class="mb-[30px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg w-full max-w-sm mx-auto transform hover:scale-105 transition-transform duration-300">
                    <p class="text-green-100 text-sm md:text-base mb-1 font-medium tracking-wide">ยอดบริจาคสมทบทุนบำรุงมัสยิด</p>
                    <div class="text-3xl md:text-4xl font-bold text-[#facc15] tracking-wide drop-shadow-md">
                        {{ formattedAmount }} <span class="text-lg md:text-xl text-white font-normal">บาท</span>
                    </div>
                </div>

                <!-- <a href="#about"
                    class="inline-block px-10 py-3.5 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl shadow-xl transition-all duration-300 hover:-translate-y-1">
                    เรียนรู้เพิ่มเติม
                </a> -->
            </div>
        </header>

        <!-- Brief History Section -->
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

        <!-- Dynamic About Section -->
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
