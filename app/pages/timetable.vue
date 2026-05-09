<script setup lang="ts">
import { computed } from 'vue'

const selectedDate = ref(new Date().toISOString().split('T')[0])

// Initial fetch for settings and prayer times
const { data: pageDataResponse } = await useAsyncData('timetable-init', async () => {
    const [settings, prayerData] = await Promise.all([
        $fetch('/api/settings'),
        $fetch('/api/prayer-times', {
            query: {
                dd: new Date(selectedDate.value).getDate(),
                mm: new Date(selectedDate.value).getMonth() + 1,
                yyyy: new Date(selectedDate.value).getFullYear()
            }
        })
    ])
    return { settings, prayerData }
})

const settings = computed(() => pageDataResponse.value?.settings)
const initialPrayerData = ref(pageDataResponse.value?.prayerData)

// Subsequent fetches for prayer times when date changes
const { data: refreshedPrayerData, pending } = await useAsyncData('prayer-times-refresh', async () => {
    const d = new Date(selectedDate.value)
    return await $fetch('/api/prayer-times', {
        query: {
            dd: d.getDate(),
            mm: d.getMonth() + 1,
            yyyy: d.getFullYear()
        }
    })
}, {
    watch: [selectedDate],
    immediate: false
})

const prayerData = computed(() => refreshedPrayerData.value || initialPrayerData.value)

// 1. เพิ่มตัวแปรสำหรับดึงวันที่และจัดรูปแบบเป็นภาษาไทย
const displayDateThai = computed(() => {
    const date = new Date(selectedDate.value)
    return date.toLocaleDateString('th-TH', {
        weekday: 'long',  // แสดงชื่อวัน (เช่น วันจันทร์)
        year: 'numeric',  // แสดงปี พ.ศ. เต็ม
        month: 'long',    // แสดงชื่อเดือนเต็ม
        day: 'numeric'    // แสดงวันที่
    })
})

const timetables = computed(() => {
    if (prayerData.value?.success) {
        return [{
            date_header: 'ประจำ' + displayDateThai.value,
            fajr: prayerData.value.times.fajr,
            sunrise: prayerData.value.times.sunrise,
            dhuhr: prayerData.value.times.dhuhr,
            asr: prayerData.value.times.asr,
            maghrib: prayerData.value.times.maghrib,
            isha: prayerData.value.times.isha
        }];
    }

    return [{
        date_header: 'ประจำ' + displayDateThai.value,
        fajr: '05:00',
        sunrise: '06:15',
        dhuhr: '12:30',
        asr: '15:45',
        maghrib: '18:45',
        isha: '20:00'
    }];
})

const getPrayers = (table: any) => [
    { name: 'ซุบฮิ (Fajr)', time: table.fajr, icon: '🌅' },
    { name: 'ชูรูก (Sunrise)', time: table.sunrise, icon: '☀️' },
    { name: 'ดุฮริ (Dhuhr)', time: table.dhuhr, icon: '☀️' },
    { name: 'อัศริ (Asr)', time: table.asr, icon: '🌤️' },
    { name: 'มัฆริบ (Maghrib)', time: table.maghrib, icon: '🌇' },
    { name: 'อิชา (Isha)', time: table.isha, icon: '🌙' }
]
</script>

<template>
    <div class="min-h-screen bg-gray-50 pt-32 pb-20 font-['Prompt']">
        <!-- ปรับขนาดความกว้างเป็น max-w-4xl เพื่อให้พอดีกับสัดส่วนตาราง -->
        <div class="max-w-4xl mx-auto px-6">
            
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl font-black text-[#155d3a] mb-4 uppercase tracking-tighter">ตารางเวลาละหมาด</h1>
                <div class="w-24 h-1.5 bg-[#facc15] mx-auto rounded-full mb-6"></div>
                <p class="text-slate-500 font-medium mb-10">{{ settings?.mosque_name || 'มัสยิดบ้านสมเด็จ' }}</p>

                <!-- Date Picker -->
                <div class="inline-flex items-center gap-4 bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-slate-100 mb-8 hover:shadow-md transition-all">
                    <span class="text-sm font-bold text-slate-400 uppercase tracking-widest">เลือกวันที่:</span>
                    <input 
                        v-model="selectedDate" 
                        type="date" 
                        class="bg-transparent font-black text-[#155d3a] outline-none cursor-pointer text-lg"
                    />
                    <div v-if="pending" class="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
            </div>

            <!-- 3. ส่วนของตารางแสดงผล -->
            <div v-for="(table, tIdx) in timetables" :key="tIdx" class="mb-12 last:mb-0">
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold text-[#155d3a]">{{ table.date_header }}</h2>
                </div>

                <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <!-- overflow-x-auto ช่วยให้ตารางเลื่อนซ้ายขวาได้บนจอมือถือขนาดเล็ก -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <!-- หัวตาราง -->
                            <thead>
                            <tr class="bg-emerald-50 text-emerald-800 border-b border-emerald-100">
                                <th class="py-4 px-6 md:py-5 md:px-8 font-bold text-base md:text-lg whitespace-nowrap">เวลาละหมาด</th>
                                <th class="py-4 px-6 md:py-5 md:px-8 font-bold text-base md:text-lg text-right whitespace-nowrap">เวลา (น.)</th>
                            </tr>
                            </thead>
                            <!-- เนื้อหาในตาราง -->
                            <tbody>
                            <tr 
                                v-for="(prayer, index) in getPrayers(table)" 
                                :key="prayer.name"
                                class="border-b border-slate-50 hover:bg-slate-50 transition-colors duration-300"
                                :class="{ 'bg-slate-50/30': index % 2 !== 0 }"
                            >
                                <td class="py-4 px-6 md:py-5 md:px-8">
                                    <div class="flex items-center gap-3 md:gap-4">
                                        <span class="text-2xl md:text-3xl drop-shadow-sm">{{ prayer.icon }}</span>
                                        <span class="font-bold text-slate-700 text-base md:text-lg">{{ prayer.name }}</span>
                                    </div>
                                </td>
                                <td class="py-4 px-6 md:py-5 md:px-8 text-right">
                                    <span class="text-xl md:text-2xl font-black text-[#155d3a] tracking-tight">{{ prayer.time }}</span>
                                </td>
                            </tr>
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>

            <div class="mt-12 p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-start sm:items-center gap-6">
                <div class="text-4xl mt-1 sm:mt-0">🕌</div>
                <div>
                    <h4 class="font-bold text-emerald-800">หมายเหตุ</h4>
                    <p class="text-sm text-emerald-600 leading-relaxed mt-1">เวลาที่แสดงเป็นเวลาโดยประมาณ อาจมีการคลาดเคลื่อนตามตำแหน่งพิกัดและฤดูกาล กรุณายึดตามเสียงอาซานจากมัสยิดเป็นหลัก</p>
                </div>
            </div>
            
        </div>
    </div>
</template>