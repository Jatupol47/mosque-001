<script setup lang="ts">
/**
 * หน้าประวัติความเป็นมา (History Page)
 * ทำหน้าที่:
 * 1. แสดงประวัติความเป็นมาของมัสยิดบ้านสมเด็จ ทั้งส่วนต้นและส่วนท้าย
 * 2. แสดงรูปภาพประกอบประวัติศาสตร์ของมัสยิด
 * 3. แสดงโครงสร้างบุคลากรของมัสยิด เช่น อิหม่าม, คอเต็บ, บิลาล และคณะกรรมการมัสยิด
 */

// โหลดข้อมูลการตั้งค่าหน้าเว็บ
const { data: settings } = await useFetch('/api/settings')

// ดึงรายละเอียดข้อมูลเฉพาะสำหรับหน้าประวัติ (page_history) หากไม่มีข้อมูลให้ใช้ค่าเริ่มต้นรองรับ (Fallback)
const pageData = computed(() => settings.value?.page_history || {
    title: 'ประวัติความเป็นมา',
    content_top: 'มัสยิดบ้านสมเด็จ ก่อตั้งขึ้นเมื่อปี พ.ศ. ... โดยการร่วมแรงร่วมใจของสัปปุรุษในชุมชน...',
    image: '/images/home5.jpg',
    content_bottom: 'ปัจจุบันได้รับการบูรณะและพัฒนาจนกลายเป็นศูนย์กลางของชุมชน...'
})

// ตั้งค่าหัวข้อหน้าเว็บ (SEO Meta Title) ให้แสดงผลที่แท็บเบราว์เซอร์
useHead({
    title: `${pageData.value.title} - มัสยิดบ้านสมเด็จ`
})

// ดึงรายชื่อบุคลากร (Personnel List) จากข้อมูลที่แอดมินตั้งค่าไว้ในระบบ
const personnelList = computed(() => settings.value?.page_history?.personnel || [])
</script>

<template>
    <!-- แผ่นพื้นหลังหลักและ Padding ด้านบนหลบแถบเมนูนำทาง -->
    <div class="min-h-screen bg-gray-50 pt-28 pb-20">

        <!-- ==================== ส่วนที่ 1: ประวัติความเป็นมาของมัสยิด ==================== -->
        <div class="max-w-4xl mx-auto px-6 mb-20">
            <div class="text-center mb-10">
                <h1 class="text-3xl md:text-4xl font-bold text-[#155d3a]">{{ pageData.title }}</h1>
                <div class="w-16 h-1 bg-[#facc15] mx-auto mt-4 rounded-full"></div>
            </div>

            <!-- ข้อความประวัติศาสตร์มัสยิดส่วนบน -->
            <p class="text-gray-700 text-lg leading-relaxed mb-8 whitespace-pre-line text-center">
                {{ pageData.content_top }}
            </p>

            <!-- รูปภาพหลักแสดงประวัติศาสตร์หรือสิ่งก่อสร้างมัสยิด -->
            <div class="mb-10 flex justify-center">
                <img :src="pageData.image" alt="ภาพประวัติมัสยิด"
                    class="w-full max-w-3xl rounded-2xl shadow-lg object-cover">
            </div>

            <!-- ข้อความประวัติศาสตร์มัสยิดส่วนล่าง -->
            <p class="text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto whitespace-pre-line">
                {{ pageData.content_bottom }}
            </p>
        </div>

        <!-- ==================== ส่วนที่ 2: โครงสร้างบุคลากรของมัสยิด ==================== -->
        <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-[#155d3a]">โครงสร้างบุคคลมัสยิดบ้านสมเด็จ</h2>
                <div class="w-16 h-1 bg-[#facc15] mx-auto mt-4 rounded-full"></div>
                <p class="text-gray-600 text-lg mt-4 whitespace-pre-line">
                    ข้อมูลโครงสร้างบุคคลของมัสยิดบ้านสมเด็จ
                </p>
            </div>

            <!-- กล่อง Grid แสดงแผงบุคลากร (วนซ้ำแบบ Responsive 1-3 คอลัมน์) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                
                <!-- การ์ดจำลองตัวตนบุคลากรแต่ละคน -->
                <div v-for="(person, index) in personnelList" :key="index"
                    class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">

                    <!-- ภาพถ่าย (บังคับความสูงให้สมดุลเท่ากันที่ h-72) -->
                    <div class="w-full h-72 relative">
                        <img :src="person.image" :alt="person.name" class="w-full h-full object-cover">
                    </div>

                    <!-- ส่วนข้อความ: ชื่อ, ตำแหน่งงาน และประวัติสั้นๆ -->
                    <div class="p-6 text-center">
                        <h3 class="text-xl font-bold text-gray-800 mb-1">{{ person.name }}</h3>
                        <p class="text-[#155d3a] font-medium mb-3">{{ person.position }}</p>
                        <!-- ประวัติย่อ/คตินิยมประจำใจ (แสดงถ้ามีกรอกไว้) -->
                        <p v-if="person.bio" class="text-gray-500 text-sm leading-relaxed border-t pt-3 mt-3">
                            {{ person.bio }}
                        </p>
                    </div>

                </div>
            </div>
        </div>

    </div>
</template>