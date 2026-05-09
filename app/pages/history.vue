<script setup lang="ts">
const { data: settings } = await useFetch('/api/settings')

const pageData = computed(() => settings.value?.page_history || {
    title: 'ประวัติความเป็นมา',
    content_top: 'มัสยิดบ้านสมเด็จ ก่อตั้งขึ้นเมื่อปี พ.ศ. ... โดยการร่วมแรงร่วมใจของสัปปุรุษในชุมชน...',
    image: '/images/home5.jpg',
    content_bottom: 'ปัจจุบันได้รับการบูรณะและพัฒนาจนกลายเป็นศูนย์กลางของชุมชน...'
})

useHead({
    title: `${pageData.value.title} - มัสยิดบ้านสมเด็จ`
})

// ใช้ข้อมูลบุคลากรจาก settings หากไม่มีให้ใช้ Array ว่าง
const personnelList = computed(() => settings.value?.page_history?.personnel || [])
</script>

<template>
    <!-- ย้ายพื้นหลังและ Padding มาครอบตัวเมนหลักทั้งหมด เพื่อให้กลมกลืนกัน -->
    <div class="min-h-screen bg-gray-50 pt-28 pb-20">

        <!-- ส่วนที่ 1: ประวัติความเป็นมา -->
        <div class="max-w-4xl mx-auto px-6 mb-20">
            <div class="text-center mb-10">
                <h1 class="text-3xl md:text-4xl font-bold text-[#155d3a]">{{ pageData.title }}</h1>
                <div class="w-16 h-1 bg-[#facc15] mx-auto mt-4 rounded-full"></div>
            </div>

            <p class="text-gray-700 text-lg leading-relaxed mb-8 whitespace-pre-line text-center">
                {{ pageData.content_top }}
            </p>

            <div class="mb-10 flex justify-center">
                <img :src="pageData.image" alt="ภาพประวัติมัสยิด"
                    class="w-full max-w-3xl rounded-2xl shadow-lg object-cover">
            </div>

            <p class="text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto whitespace-pre-line">
                {{ pageData.content_bottom }}
            </p>
        </div>

        <!-- ส่วนที่ 2: โครงสร้างบุคคล -->
        <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-[#155d3a]">โครงสร้างบุคคลมัสยิดบ้านสมเด็จ</h2>
                <div class="w-16 h-1 bg-[#facc15] mx-auto mt-4 rounded-full"></div>
                <p class="text-gray-600 text-lg mt-4 whitespace-pre-line">
                    ข้อมูลโครงสร้างบุคคลของมัสยิดบ้านสมเด็จ
                </p>
            </div>

            <!-- Grid สำหรับแสดงผลการ์ด -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- วนลูปข้อมูลจากตัวแปร personnelList มาแสดงผล -->
                <div v-for="(person, index) in personnelList" :key="index"
                    class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">

                    <!-- ส่วนรูปภาพ (บังคับความสูงให้เท่ากันทุกรูป) -->
                    <div class="w-full h-72 relative">
                        <img :src="person.image" :alt="person.name" class="w-full h-full object-cover">
                    </div>

                    <!-- ส่วนข้อความ -->
                    <div class="p-6 text-center">
                        <h3 class="text-xl font-bold text-gray-800 mb-1">{{ person.name }}</h3>
                        <p class="text-[#155d3a] font-medium mb-3">{{ person.position }}</p>
                        <p v-if="person.bio" class="text-gray-500 text-sm leading-relaxed border-t pt-3 mt-3">
                            {{ person.bio }}
                        </p>
                    </div>

                </div>
            </div>
        </div>

    </div>
</template>