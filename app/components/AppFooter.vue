<script setup lang="ts">
/**
 * ส่วนท้ายเว็บ (App Footer Component)
 * ทำหน้าที่:
 * 1. แสดงชื่อมัสยิด ข้อมูลแบรนดิ้ง คำอธิบายย่อส่วนท้ายเว็บไซต์
 * 2. ลิงก์เมนูด่วนยอดนิยม เพื่อเพิ่มความสะดวกของโครงสร้างการนำทาง (SEO Link Building)
 * 3. แสดงช่องทางการติดต่อ (ที่ตั้ง เบอร์โทร อีเมล) และช่องทางแอบเข้าหน้าแอดมินสำหรับผู้แลระบบ
 */

// โหลดข้อมูลติดต่อทั่วไปมาประมวลผลการแสดงผลแบบ Lazy
const { data: settings } = useLazyFetch('/api/settings')

// คํานวณชื่อมัสยิดและรูปภาพโลโก้สำหรับส่วนท้ายเว็บ
const footerMosqueName = computed(() => settings.value?.mosque_name || 'มัสยิดบ้านสมเด็จ')
const footerDesc = computed(() => settings.value?.footer_desc || 'ออกแบบและพัฒนาเพื่อชุมชน')
const footerLogo = computed(() => settings.value?.logo_url || '')
</script>

<template>
    <!-- จัดพื้นหลังสีเขียวเข้มมัสยิดดูเคร่งขรึม (#104b2e) พร้อมตัดขอบสีเหลืองทองสง่างาม (#d6a848) -->
    <footer class="bg-[#104b2e] text-white pt-14 pb-6 mt-auto border-t-[6px] border-[#d6a848] font-['Prompt']">
        <div class="max-w-7xl mx-auto px-6 md:px-10">

            <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                
                <!-- ==================== คอลัมน์ที่ 1: โลโก้ ชื่อ และคำขวัญ ==================== -->
                <div class="space-y-5">
                    <div class="flex items-center gap-3">
                        <div v-if="footerLogo" class="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2 shadow-inner">
                            <img :src="footerLogo" alt="Footer Logo" class="w-full h-full object-contain">
                        </div>
                        <span v-else class="text-3xl">🕌</span>
                        <h2 class="text-2xl font-bold tracking-tight">{{ footerMosqueName }}</h2>
                    </div>
                    <p class="text-gray-300 leading-relaxed text-sm">
                        {{ footerDesc }}
                    </p>
                </div>

                <!-- ==================== คอลัมน์ที่ 2: ลิงก์ด่วน (เมนูนำทางเสริม) ==================== -->
                <div>
                    <h3 class="text-[#facc15] font-bold text-lg mb-6 border-l-4 border-[#facc15] pl-3">เมนูแนะนำ</h3>
                    <ul class="space-y-3">
                        <li>
                            <NuxtLink to="/history"
                                class="hover:text-[#facc15] transition-colors flex items-center gap-2">
                                <span class="text-[#d6a848] text-xs">▶</span> ประวัติความเป็นมา
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/activities"
                                class="hover:text-[#facc15] transition-colors flex items-center gap-2">
                                <span class="text-[#d6a848] text-xs">▶</span> กิจกรรมมัสยิด
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/donate"
                                class="hover:text-[#facc15] transition-colors flex items-center gap-2">
                                <span class="text-[#d6a848] text-xs">▶</span> ร่วมบริจาค
                            </NuxtLink>
                        </li>
                    </ul>
                </div>

                <!-- ==================== คอลัมน์ที่ 3: ช่องทางการติดต่อประสานงาน ==================== -->
                <div>
                    <h3 class="text-[#facc15] font-bold text-lg mb-6 border-l-4 border-[#facc15] pl-3">การติดต่อ</h3>
                    <ul class="space-y-4 text-sm text-gray-300">
                        <li class="flex items-start gap-3">
                            <span class="text-[#facc15]">📍</span>
                            <span>{{ settings?.address || 'แขวงสมเด็จเจ้าพระยา เขตคลองสาน กรุงเทพมหานคร' }}</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="text-[#facc15]">📞</span>
                            <span>{{ settings?.phone || '02-XXX-XXXX' }}</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="text-[#facc15]">✉️</span>
                            <span>{{ settings?.email || 'contact@mosque.com' }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- ==================== ส่วนลิขสิทธิ์และลิงก์แอบเข้าระบบแอดมิน ==================== -->
            <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs space-y-4 md:space-y-0">
                <p>&copy; 2026 {{ footerMosqueName }}. สงวนลิขสิทธิ์.</p>
                <div class="flex gap-6">
                    <NuxtLink to="/admin" class="hover:text-[#facc15] opacity-50 hover:opacity-100 transition-all font-bold">
                        🔐 ระบบหลังบ้าน
                    </NuxtLink>
                </div>
            </div>

        </div>
    </footer>
</template>