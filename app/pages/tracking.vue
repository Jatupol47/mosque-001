<script setup lang="ts">

const phone = ref('')
const loading = ref(false)
const searched = ref(false)
const donations = ref<any[]>([])

const trackDonation = async () => {
    if (!phone.value || phone.value.length < 9) return

    loading.value = true
    searched.value = true
    try {
        const response = await $fetch('/api/donations/track', {
            query: { phone: phone.value }
        })
        if (response.success) {
            donations.value = response.donations
        } else {
            donations.value = []
        }
    } catch (e) {
        console.error(e)
        donations.value = []
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="bg-gray-50 min-h-screen pt-32 pb-20 font-sans">
        <div class="max-w-3xl mx-auto px-5">
            <!-- Header -->
            <div class="text-center mb-10">
                <h1 class="text-4xl font-bold text-[#104b2e] mb-4">ตรวจสอบสถานะการบริจาค</h1>
                <p class="text-slate-500">กรอกเบอร์โทรศัพท์ที่ใช้ในการแจ้งบริจาคเพื่อตรวจสอบสถานะ</p>
            </div>

            <!-- Search Box -->
            <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8 max-w-xl mx-auto">
                <form @submit.prevent="trackDonation" class="flex flex-col md:flex-row gap-4">
                    <input 
                        v-model="phone" 
                        type="tel" 
                        placeholder="เบอร์โทรศัพท์ (เช่น 0891234567)" 
                        class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:border-[#104b2e] transition-colors"
                        required
                    />
                    <button 
                        type="submit" 
                        class="bg-[#104b2e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0c3923] transition-colors disabled:opacity-50"
                        :disabled="loading || !phone"
                    >
                        {{ loading ? 'กำลังค้นหา...' : 'ตรวจสอบ' }}
                    </button>
                </form>
            </div>

            <!-- Results -->
            <div v-if="searched && !loading">
                <div v-if="donations.length === 0" class="text-center bg-white p-10 rounded-3xl border border-slate-100 text-slate-500">
                    ไม่พบข้อมูลการบริจาคสำหรับเบอร์โทรศัพท์นี้
                </div>
                
                <div v-else class="space-y-4">
                    <h2 class="text-xl font-bold text-slate-800 mb-4">ประวัติการบริจาค (พบ {{ donations.length }} รายการ)</h2>
                    
                    <div 
                        v-for="donation in donations" 
                        :key="donation.id" 
                        class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4"
                    >
                        <div>
                            <div class="text-sm text-slate-500 mb-1">วันที่: {{ new Date(donation.date).toLocaleString('th-TH') }}</div>
                            <div class="font-bold text-slate-800 text-lg">ยอดบริจาค: {{ donation.amount.toLocaleString() }} บาท</div>
                            <div v-if="donation.donorName" class="text-sm text-slate-600 mt-1">ชื่อ: {{ donation.donorName }}</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span 
                                class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border"
                                :class="donation.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'"
                            >
                                {{ donation.status === 'completed' ? 'ตรวจสอบแล้ว' : 'รอตรวจสอบ' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
