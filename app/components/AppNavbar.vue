<script setup>
import { ref, computed } from 'vue'

const isMenuOpen = ref(false)

// ดึงข้อมูลการตั้งค่าจาก API
const { data: settings } = useLazyFetch('/api/settings')

// แยกส่วนชื่อและโลโก้สำหรับ Navbar โดยเฉพาะ
const navbarTitle = computed(() => settings.value?.page_navbar?.title || settings.value?.mosque_name || 'มัสยิดบ้านสมเด็จ')
const navbarLogo = computed(() => settings.value?.page_navbar?.logo || settings.value?.logo_url || '')
const navbarIcon = computed(() => settings.value?.page_navbar?.icon || '')
</script>

<template>
    <nav class="bg-[#155d3a] shadow-md fixed top-0 left-0 w-full z-50">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

            <NuxtLink to="/" class="text-xl font-bold text-white flex items-center gap-3 group">
                <!-- ลำดับความสำคัญ: Icon เฉพาะ Navbar -> Logo เฉพาะ Navbar -> Emoji พื้นฐาน -->
                <div v-if="navbarLogo" class="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                    <img :src="navbarLogo" alt="Navbar Logo" class="w-full h-full object-contain">
                </div>
                <div v-else-if="navbarIcon" class="text-2xl group-hover:scale-110 transition-transform">
                    <img :src="navbarIcon" alt="Icon" class="w-8 h-8 object-contain">
                </div>
                <span v-else class="text-2xl group-hover:scale-110 transition-transform">🕌</span>

                <span class="group-hover:text-[#facc15] transition-colors whitespace-nowrap">{{ navbarTitle }}</span>
            </NuxtLink>

            <!-- Desktop Menu (แสดงผลเฉพาะจอใหญ่ขนาดคอมพิวเตอร์) -->
            <ul class="hidden lg:flex space-x-8 text-white font-medium whitespace-nowrap">
                <li>
                    <NuxtLink to="/"
                        class="pb-1 border-b-2 border-transparent hover:text-[#facc15] hover:border-[#facc15] transition-colors duration-300 block"
                        active-class="!text-[#facc15] !border-[#facc15]">หน้าแรก</NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/history"
                        class="pb-1 border-b-2 border-transparent hover:text-[#facc15] hover:border-[#facc15] transition-colors duration-300 block"
                        active-class="!text-[#facc15] !border-[#facc15]">ประวัติความเป็นมา</NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/timetable"
                        class="pb-1 border-b-2 border-transparent hover:text-[#facc15] hover:border-[#facc15] transition-colors duration-300 block"
                        active-class="!text-[#facc15] !border-[#facc15]">ตารางเวลาละหมาด</NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/activities"
                        class="pb-1 border-b-2 border-transparent hover:text-[#facc15] hover:border-[#facc15] transition-colors duration-300 block"
                        active-class="!text-[#facc15] !border-[#facc15]">กิจกรรม</NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/donate"
                        class="pb-1 border-b-2 border-transparent hover:text-[#facc15] hover:border-[#facc15] transition-colors duration-300 block"
                        active-class="!text-[#facc15] !border-[#facc15]">ร่วมบริจาค</NuxtLink>
                </li>
            </ul>

            <!-- Mobile & Tablet Menu Button (แสดงผลบนมือถือและแท็บเล็ต) -->
            <button @click="isMenuOpen = !isMenuOpen"
                class="lg:hidden flex flex-col space-y-1.5 cursor-pointer focus:outline-none z-[60]" aria-label="Toggle Menu">
                <span class="w-6 h-0.5 bg-white block transition-all duration-300"
                    :class="{ 'rotate-45 translate-y-2': isMenuOpen }"></span>
                <span class="w-6 h-0.5 bg-white block transition-all duration-300"
                    :class="{ 'opacity-0': isMenuOpen }"></span>
                <span class="w-6 h-0.5 bg-white block transition-all duration-300"
                    :class="{ '-rotate-45 -translate-y-2': isMenuOpen }"></span>
            </button>

        </div>

        <!-- Mobile & Tablet Dropdown Content -->
        <Transition name="slide">
            <div v-show="isMenuOpen"
                class="lg:hidden bg-[#155d3a]/95 backdrop-blur-md border-t border-white/10 fixed top-[72px] left-0 w-full h-[calc(100vh-72px)] overflow-y-auto z-50">
                <ul class="flex flex-col px-8 py-12 text-white font-medium space-y-8">
                    <li>
                        <NuxtLink @click="isMenuOpen = false" to="/"
                            class="flex items-center gap-4 py-4 text-xl border-b border-white/5 hover:text-[#facc15] transition-colors duration-300"
                            active-class="!text-[#facc15]">
                            <span class="text-2xl">🏠</span> หน้าแรก
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink @click="isMenuOpen = false" to="/history"
                            class="flex items-center gap-4 py-4 text-xl border-b border-white/5 hover:text-[#facc15] transition-colors duration-300"
                            active-class="!text-[#facc15]">
                            <span class="text-2xl">📖</span> ประวัติความเป็นมา
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink @click="isMenuOpen = false" to="/timetable"
                            class="flex items-center gap-4 py-4 text-xl border-b border-white/5 hover:text-[#facc15] transition-colors duration-300"
                            active-class="!text-[#facc15]">
                            <span class="text-2xl">🕒</span> ตารางเวลาละหมาด
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink @click="isMenuOpen = false" to="/activities"
                            class="flex items-center gap-4 py-4 text-xl border-b border-white/5 hover:text-[#facc15] transition-colors duration-300"
                            active-class="!text-[#facc15]">
                            <span class="text-2xl">📅</span> กิจกรรม
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink @click="isMenuOpen = false" to="/donate"
                            class="flex items-center gap-4 py-4 text-xl border-b border-white/5 hover:text-[#facc15] transition-colors duration-300"
                            active-class="!text-[#facc15]">
                            <span class="text-2xl">🤝</span> ร่วมบริจาค
                        </NuxtLink>
                    </li>
                </ul>
                
                <div class="px-8 pb-12 mt-auto">
                    <div class="p-6 bg-white/5 rounded-[2rem] border border-white/10 text-center">
                        <p class="text-xs text-white/40 uppercase tracking-[0.2em] font-black mb-1">Mosque Management</p>
                        <p class="text-white font-bold">{{ navbarTitle }}</p>
                    </div>
                </div>
            </div>
        </Transition>
    </nav>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
    transition: all 0.3s ease-in-out;
}
.slide-enter-from, .slide-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}
</style>