<script setup lang="ts">

definePageMeta({
    layout: false,
    middleware: 'auth'
})

// === ตัวแปรจัดการวันที่และตัวกรอง ===
const filterType = ref('monthly') // 'daily' หรือ 'monthly'
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const months = [
    { val: 1, name: 'มกราคม' }, { val: 2, name: 'กุมภาพันธ์' }, { val: 3, name: 'มีนาคม' },
    { val: 4, name: 'เมษายน' }, { val: 5, name: 'พฤษภาคม' }, { val: 6, name: 'มิถุนายน' },
    { val: 7, name: 'กรกฎาคม' }, { val: 8, name: 'สิงหาคม' }, { val: 9, name: 'กันยายน' },
    { val: 10, name: 'ตุลาคม' }, { val: 11, name: 'พฤศจิกายน' }, { val: 12, name: 'ธันวาคม' }
]

const years = computed(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]
})

// === ดึงข้อมูลจาก API ===
const { data, pending, refresh } = await useFetch('/api/admin/donations', {
    query: computed(() => ({
        month: selectedMonth.value,
        year: selectedYear.value
    }))
})

// === กรองข้อมูลและคำนวณสรุป ===
const filteredDonations = computed(() => {
    if (!data.value?.donations) return []
    
    // กรองเฉพาะรายการที่ 'ยืนยันแล้ว' (Completed) เพื่อมาทำรายงาน
    const completedDonations = data.value.donations.filter((d: any) => d.status === 'completed')

    if (filterType.value === 'monthly') {
        return completedDonations
    } else {
        // Daily filter
        const targetDate = new Date(selectedDate.value).toLocaleDateString('en-US')
        return completedDonations.filter((d: any) => {
            const donationDate = new Date(d.date).toLocaleDateString('en-US')
            return donationDate === targetDate
        })
    }
})

const summary = computed(() => {
    const totalAmount = filteredDonations.value.reduce((sum: number, d: any) => sum + d.amount, 0)
    return {
        totalItems: filteredDonations.value.length,
        totalAmount
    }
})

// พิมพ์เอกสาร
const printReport = () => {
    window.print()
}
</script>

<template>
    <div>
        <!-- Layout จะไม่ถูกนำไปแสดงในหน้า Print ด้วย CSS -->
        <NuxtLayout name="admin" class="print:hidden">
            
            <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 class="text-3xl font-black text-slate-800 mb-1">รายงานสรุปการบริจาค</h3>
                    <p class="text-slate-500 text-sm">เรียกดูรายงานแบบรายวันหรือรายเดือน และพิมพ์ออกทางเครื่องพิมพ์</p>
                </div>
                <button @click="printReport" class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
                    พิมพ์รายงาน
                </button>
            </div>

            <!-- กล่องตัวกรอง -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-6 items-end">
                <div class="flex-1 w-full">
                    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">รูปแบบรายงาน</label>
                    <select v-model="filterType" class="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-medium">
                        <option value="monthly">รายเดือน</option>
                        <option value="daily">รายวัน</option>
                    </select>
                </div>

                <template v-if="filterType === 'monthly'">
                    <div class="flex-1 w-full">
                        <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">เดือน</label>
                        <select v-model="selectedMonth" class="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-medium">
                            <option v-for="m in months" :key="m.val" :value="m.val">{{ m.name }}</option>
                        </select>
                    </div>
                    <div class="flex-1 w-full">
                        <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ปี (พ.ศ.)</label>
                        <select v-model="selectedYear" class="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-medium">
                            <option v-for="y in years" :key="y" :value="y">{{ y + 543 }}</option>
                        </select>
                    </div>
                </template>

                <template v-else>
                    <div class="flex-1 w-full">
                        <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">เลือกวันที่</label>
                        <input type="date" v-model="selectedDate" class="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-medium">
                    </div>
                </template>
            </div>

            <!-- ตารางจำลองสำหรับโหมดปกติ -->
            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div class="px-6 py-5 border-b border-slate-50 bg-slate-50/30">
                    <h2 class="font-bold text-slate-800 tracking-tight">แสดงตัวอย่างข้อมูล</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead>
                            <tr class="text-[10px] uppercase tracking-widest text-slate-400 border-b">
                                <th class="px-6 py-4">ลำดับ</th>
                                <th class="px-6 py-4">ผู้บริจาค</th>
                                <th class="px-6 py-4">วันที่</th>
                                <th class="px-6 py-4 text-right">จำนวนเงิน (บาท)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <tr v-for="(item, index) in filteredDonations" :key="item.id">
                                <td class="px-6 py-4 text-slate-500">{{ index + 1 }}</td>
                                <td class="px-6 py-4 font-bold text-slate-700">{{ item.donorName || 'ไม่ระบุนาม' }}</td>
                                <td class="px-6 py-4 text-slate-500">{{ new Date(item.date).toLocaleDateString('th-TH') }}</td>
                                <td class="px-6 py-4 text-right font-black text-slate-800">{{ item.amount.toLocaleString() }}</td>
                            </tr>
                            <tr v-if="filteredDonations.length === 0">
                                <td colspan="4" class="px-6 py-10 text-center text-slate-400">ไม่มีข้อมูลที่ตรงกับเงื่อนไข</td>
                            </tr>
                            <!-- สรุปผล -->
                            <tr v-if="filteredDonations.length > 0" class="bg-emerald-50">
                                <td colspan="3" class="px-6 py-4 text-right font-bold text-emerald-800">ยอดรวมทั้งหมด ({{ summary.totalItems }} รายการ)</td>
                                <td class="px-6 py-4 text-right font-black text-emerald-700 text-lg">{{ summary.totalAmount.toLocaleString() }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </NuxtLayout>

        <!-- ==================== Print View ==================== -->
        <!-- ส่วนนี้จะถูกซ่อนไว้ และแสดงเฉพาะเมื่อสั่งพิมพ์เท่านั้น (@media print) -->
        <div class="hidden print:block p-8 font-sans bg-white min-h-screen text-black">
            <div class="text-center mb-8 border-b pb-6">
                <h1 class="text-3xl font-bold mb-2">รายงานสรุปการรับบริจาค มัสยิดบ้านสมเด็จ</h1>
                <p class="text-lg text-gray-600">
                    {{ filterType === 'monthly' ? `ประจำเดือน ${months.find(m => m.val === selectedMonth)?.name} พ.ศ. ${selectedYear + 543}` : `ประจำวันที่ ${new Date(selectedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}` }}
                </p>
            </div>

            <table class="w-full text-left border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border border-gray-300 px-4 py-2 font-bold w-16 text-center">ลำดับ</th>
                        <th class="border border-gray-300 px-4 py-2 font-bold">ชื่อผู้บริจาค</th>
                        <th class="border border-gray-300 px-4 py-2 font-bold">วันเวลา</th>
                        <th class="border border-gray-300 px-4 py-2 font-bold text-right">จำนวนเงิน (บาท)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in filteredDonations" :key="item.id">
                        <td class="border border-gray-300 px-4 py-2 text-center">{{ index + 1 }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ item.donorName || 'ผู้ไม่ประสงค์ออกนาม' }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ new Date(item.date).toLocaleString('th-TH') }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ item.amount.toLocaleString() }}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="bg-gray-100 font-bold text-lg">
                        <td colspan="3" class="border border-gray-300 px-4 py-3 text-right">รวมรับบริจาคทั้งสิ้น ({{ summary.totalItems }} รายการ)</td>
                        <td class="border border-gray-300 px-4 py-3 text-right">{{ summary.totalAmount.toLocaleString() }}</td>
                    </tr>
                </tfoot>
            </table>

            <div class="mt-16 flex justify-between px-10 text-center">
                <div>
                    <p class="mb-16">...........................................................</p>
                    <p>(ผู้จัดทำรายงาน)</p>
                    <p class="mt-2">วันที่พิมพ์: {{ new Date().toLocaleDateString('th-TH') }}</p>
                </div>
                <div>
                    <p class="mb-16">...........................................................</p>
                    <p>(ผู้ตรวจสอบ)</p>
                </div>
            </div>
        </div>

    </div>
</template>

<style>
/* จัดการให้ซ่อน Layout แอดมินและโชว์ตารางสำหรับพิมพ์ใน Print Mode */
@media print {
    body * {
        visibility: hidden;
    }
    .print\:block, .print\:block * {
        visibility: visible;
    }
    .print\:hidden {
        display: none !important;
    }
    .print\:block {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }
}
</style>
