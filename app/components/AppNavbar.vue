<script setup>
/**
 * ส่วนหัวแถบเมนูนำทาง (App Navbar Component)
 * ทำหน้าที่:
 * 1. แสดงชื่อและโลโก้มัสยิดบ้านสมเด็จที่หัวเว็บทุกหน้า
 * 2. แสดงรายการเมนูเชื่อมโยงไปยังหน้าย่อยต่างๆ (หน้าแรก, ประวัติ, ตารางละหมาด, กิจกรรม, บริจาค)
 * 3. รองรับปุ่มแฮมเบอร์เกอร์พับเก็บเมนูนำทางสวยงามเมื่อเปิดด้วยหน้าจอมือถือ/แท็บเล็ต (Responsive Hamburger Menu)
 */
import { ref, computed } from 'vue'

// สเตตควบคุมการเปิด/ปิดเมนูสไลด์บาร์บนมือถือ
const isMenuOpen = ref(false)

// ดึงข้อมูลการตั้งค่าเว็บไซต์ (ชื่อและโลโก้หลัก) จาก API หลังบ้านแบบไม่ขัดขวางการเรนเดอร์ (Lazy Fetch)
const { data: settings } = useLazyFetch('/api/settings')

// คํานวณชื่อที่จะโชว์บน Navbar (หากแอดมินตั้งชื่อเฉพาะ Navbar ให้โชว์ชื่อเฉพาะ หากไม่มีใช้ชื่อหลัก หากไม่มีใช้ค่าเริ่มต้น)
const navbarTitle = computed(() => settings.value?.page_navbar?.title || settings.value?.mosque_name || 'มัสยิดบ้านสมเด็จ')

// คํานวณหาที่อยู่ลิงก์รูปภาพโลโก้
const navbarLogo = computed(() => settings.value?.page_navbar?.logo || settings.value?.logo_url || '')

// คํานวณหาไอคอนจิ๋ว
const navbarIcon = computed(() => settings.value?.page_navbar?.icon || '')
</script>

<template>
    <!-- ล็อคแถบเมนูให้อยู่ด้านบนสุดของทุกๆ หน้า (fixed top-0) พร้อมเลเยอร์เงาซ้อนทับและสีเขียวมัสยิด (#155d3a) -->
    <nav class="bg-[#155d3a] shadow-md fixed top-0 left-0 w-full z-50">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

            <!-- ==================== โลโก้และชื่อมัสยิด (แบรนดิ้งฝั่งซ้าย) ==================== -->
            <NuxtLink to="/" class="text-xl font-bold text-white flex items-center gap-3 group">
                <!-- ลำดับความสำคัญการเลือกใช้ภาพไอคอนประกอบชื่อ -->
                <div v-if="navbarLogo" class="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                    <img :src="navbarLogo" alt="Navbar Logo" class="w-full h-full object-contain">
                </div>
                <div v-else-if="navbarIcon" class="text-2xl group-hover:scale-110 transition-transform">
                    <img :src="navbarIcon" alt="Icon" class="w-8 h-8 object-contain">
                </div>
                <span v-else class="text-2xl group-hover:scale-110 transition-transform">🕌</span>

                <span class="group-hover:text-[#facc15] transition-colors whitespace-nowrap">{{ navbarTitle }}</span>
            </NuxtLink>

            <!-- ==================== รายการเมนูสำหรับคอมพิวเตอร์ (Desktop Menu - ซ่อนบนจอเล็ก) ==================== -->
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

            <!-- ==================== ปุ่มแฮมเบอร์เกอร์สำหรับมือถือ (Mobile Hamburger Button) ==================== -->
            <button @click="isMenuOpen = !isMenuOpen"
                class="lg:hidden flex flex-col space-y-1.5 cursor-pointer focus:outline-none z-[60]" aria-label="Toggle Menu">
                <!-- เส้นสามเส้นที่จะค่อยๆ หมุนแปลงร่างเป็นกากบาท (X) เมือกดสวิตช์เปิดปิดด้วย CSS Transition -->
                <span class="w-6 h-0.5 bg-white block transition-all duration-300"
                    :class="{ 'rotate-45 translate-y-2': isMenuOpen }"></span>
                <span class="w-6 h-0.5 bg-white block transition-all duration-300"
                    :class="{ 'opacity-0': isMenuOpen }"></span>
                <span class="w-6 h-0.5 bg-white block transition-all duration-300"
                    :class="{ '-rotate-45 -translate-y-2': isMenuOpen }"></span>
            </button>

        </div>

        <!-- ==================== รายการเมนูสไลด์สำหรับมือถือ (Mobile Dropdown Contents) ==================== -->
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
                
                <!-- ข้อมูลดิบท้ายเมนูสไลด์บาร์มือถือ -->
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
/* แอนิเมชันสไลด์เฟดเข้าออกจากด้านบนของเมนูมือถือ */
.slide-enter-active, .slide-leave-active {
    transition: all 0.3s ease-in-out;
}
.slide-enter-from, .slide-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}
</style>