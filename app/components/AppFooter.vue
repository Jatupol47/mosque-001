<script setup lang="ts">
const { data: settings } = useLazyFetch('/api/settings')

// Footer จะใช้ข้อมูลจาก "ข้อมูลทั่วไป" เป็นหลัก
const footerMosqueName = computed(() => settings.value?.mosque_name || 'มัสยิดบ้านสมเด็จ')
const footerDesc = computed(() => settings.value?.footer_desc || 'ออกแบบและพัฒนาเพื่อชุมชน')
const footerLogo = computed(() => settings.value?.logo_url || '')
</script>

<template>
    <footer class="bg-[#104b2e] text-white pt-14 pb-6 mt-auto border-t-[6px] border-[#d6a848] font-['Prompt']">
        <div class="max-w-7xl mx-auto px-6 md:px-10">

            <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                <!-- ส่วนโลโก้และคำอธิบาย -->
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

                <!-- ส่วนลิงก์ด่วน -->
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

                <!-- ส่วนช่องทางติดต่อ -->
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

            <!-- ส่วนลิขสิทธิ์ล่างสุด -->
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