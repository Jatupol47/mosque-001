<template>
  <div>
    <NuxtLayout name="admin">
      <div class="max-w-6xl">
        <div class="mb-8 flex justify-between items-end">
          <div>
            <h3 class="text-3xl font-black text-slate-800 mb-2">ตั้งค่าเว็บไซต์</h3>
            <p class="text-slate-500">จัดการเนื้อหาและรูปภาพในทุกหน้าของเว็บไซต์ผ่าน Supabase Storage</p>
          </div>
          <div class="flex gap-2">
            <button 
              @click="saveAllSettings" 
              :disabled="saving"
              class="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกทั้งหมด' }}
            </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-[1.5rem] w-full overflow-x-auto no-scrollbar border border-slate-200/50 shadow-inner">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0"
            :class="activeTab === tab.id ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-10">
          
          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="space-y-12">
            <!-- Branding Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 border-b pb-12">
              <div class="space-y-4">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  โลโก้มัสยิด (Logo)
                </label>
                <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <img :src="generalSettings.logo_url || '/favicon.ico'" class="w-20 h-20 object-contain rounded-xl bg-white shadow-sm border p-2 shrink-0" />
                  <div class="flex-1 space-y-2 w-full overflow-hidden">
                    <input type="file" @change="(e) => handleBrandingUpload(e, 'logo_url')" class="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-white file:text-slate-600 hover:file:bg-slate-100 cursor-pointer shadow-sm overflow-hidden" />
                    <p class="text-[10px] text-slate-400 font-bold uppercase">PNG, SVG (Transparent)</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  ไอคอนเว็บไซต์ (Icon/Favicon)
                </label>
                <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <img :src="generalSettings.icon_url || '/favicon.ico'" class="w-12 h-12 object-contain rounded-xl bg-white shadow-sm border p-1 shrink-0" />
                  <div class="flex-1 space-y-2 w-full overflow-hidden">
                    <input type="file" @change="(e) => handleBrandingUpload(e, 'icon_url')" class="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-white file:text-slate-600 hover:file:bg-slate-100 cursor-pointer shadow-sm overflow-hidden" />
                    <p class="text-[10px] text-slate-400 font-bold uppercase">ICO, PNG (32x32px)</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Basic Info Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div v-for="(label, key) in generalLabels" :key="key" class="space-y-2" :class="key === 'footer_desc' ? 'md:col-span-2' : ''">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  {{ label }}
                </label>
                
                <textarea v-if="key === 'footer_desc'" v-model="generalSettings[key]" rows="3" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium shadow-inner"></textarea>
                <input v-else v-model="generalSettings[key]" type="text" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium shadow-inner" />
              </div>
            </div>
          </div>

          <!-- Page: Navbar -->
          <div v-if="activeTab === 'navbar'" class="space-y-12">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div class="space-y-4">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  โลโก้บนแถบเมนู (Navbar Logo)
                </label>
                <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <img :src="pageData.navbar.logo || generalSettings.logo_url || '/favicon.ico'" class="w-16 h-16 object-contain rounded-xl bg-white shadow-sm border p-2 shrink-0" />
                  <div class="flex-1 space-y-2 w-full overflow-hidden">
                    <input type="file" @change="(e) => handleNavbarImageUpload(e, 'logo')" class="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-white file:text-slate-600 hover:file:bg-slate-100 cursor-pointer shadow-sm overflow-hidden" />
                    <p class="text-[10px] text-slate-400 font-bold uppercase">จะใช้โลโก้หลักหากไม่ระบุ</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  ไอคอนหน้าชื่อ (Navbar Icon)
                </label>
                <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border p-1 text-xl shrink-0">
                    <img v-if="pageData.navbar.icon" :src="pageData.navbar.icon" class="w-full h-full object-contain" />
                    <span v-else>🕌</span>
                  </div>
                  <div class="flex-1 space-y-2 w-full overflow-hidden">
                    <input type="file" @change="(e) => handleNavbarImageUpload(e, 'icon')" class="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-white file:text-slate-600 hover:file:bg-slate-100 cursor-pointer shadow-sm overflow-hidden" />
                    <p class="text-[10px] text-slate-400 font-bold uppercase">ไอคอนเล็กๆ ก่อนชื่อมัสยิด</p>
                  </div>
                </div>
              </div>

              <div class="md:col-span-2 space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  ชื่อที่แสดงบนแถบเมนู (Navbar Title)
                </label>
                <input v-model="pageData.navbar.title" type="text" placeholder="ระบุชื่อที่จะแสดงบน Navbar (ใช้ชื่อหลักหากว่างไว้)" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-bold shadow-inner" />
              </div>
            </div>
          </div>
          <div v-if="activeTab === 'index'" class="space-y-12">
            <h4 class="font-bold text-slate-800 text-lg border-b pb-4">หน้าแรก (Home Page)</h4>
            
            <!-- Hero Section -->
            <div class="grid grid-cols-1 gap-6">
              <h5 class="text-sm font-bold text-slate-700">ส่วนหัวข้อ (Hero Section)</h5>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">หัวข้อใหญ่ (Hero Title)</label>
                <input v-model="pageData.index.hero_title" type="text" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium shadow-inner" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">คำโปรย (Hero Subtitle)</label>
                <input v-model="pageData.index.hero_subtitle" type="text" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium shadow-inner" />
              </div>
              <div class="space-y-4">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">รูปภาพพื้นหลัง</label>
                <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <img :src="pageData.index.hero_image" class="w-40 h-24 object-cover rounded-xl shadow-md bg-slate-200 shrink-0" />
                  <div class="flex-1 space-y-3 w-full overflow-hidden">
                    <input type="file" @change="(e) => handleImageUpload(e, 'index', 'hero_image')" class="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                  </div>
                </div>
              </div>

              <!-- Brief History Section -->
              <div class="space-y-2 pt-4 border-t border-slate-100">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  ประวัติย่อ (หน้าแรก)
                </label>
                <textarea v-model="pageData.index.history_brief" rows="4" placeholder="ระบุประวัติความเป็นมาอย่างย่อเพื่อแสดงในหน้าแรก..." class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium shadow-inner"></textarea>
              </div>
            </div>

            <!-- Dynamic About Section -->
            <div class="space-y-6 pt-8 border-t border-slate-100">
              <div class="flex justify-between items-center">
                <div>
                  <h5 class="text-sm font-bold text-slate-700">ส่วนเกี่ยวกับมัสยิด (About Items)</h5>
                  <p class="text-xs text-slate-400">คุณสามารถเพิ่มรูปภาพและเนื้อหาได้ไม่จำกัด</p>
                </div>
                <button 
                  @click="addAboutItem"
                  class="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95"
                >
                  ➕
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  v-for="(item, index) in pageData.index.about_items" 
                  :key="index"
                  class="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 relative group"
                >
                  <button 
                    @click="removeAboutItem(index)"
                    class="absolute -top-2 -right-2 w-8 h-8 bg-white text-rose-500 rounded-full shadow-md flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 border border-rose-100 z-10"
                  >
                    🗑️
                  </button>

                  <div class="space-y-4">
                    <div class="relative w-full h-32 rounded-2xl overflow-hidden bg-slate-200 border border-slate-100 shadow-inner">
                      <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-2xl">🖼️</div>
                      <label class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                        เปลี่ยนรูปภาพ
                        <input type="file" @change="(e) => handleAboutItemUpload(e, index)" class="hidden" />
                      </label>
                    </div>
                    
                    <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">หัวข้อรายการ</label>
                      <input v-model="item.title" type="text" placeholder="หัวข้อ..." class="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-bold" />
                    </div>

                    <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">เนื้อหา</label>
                      <textarea v-model="item.description" rows="3" placeholder="รายละเอียด..." class="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="!pageData.index.about_items?.length" class="py-12 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
                <p class="text-slate-400 font-medium italic">ยังไม่มีรายการข้อมูล กดปุ่ม + เพื่อเพิ่ม</p>
              </div>
            </div>
          </div>

          <!-- Page: History -->
          <div v-if="activeTab === 'history'" class="space-y-8">
            <h4 class="font-bold text-slate-800 text-lg border-b pb-4">หน้าประวัติ (History)</h4>
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">หัวข้อหน้า</label>
                <input v-model="pageData.history.title" type="text" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium shadow-inner" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">เนื้อหาช่วงบน</label>
                <textarea v-model="pageData.history.content_top" rows="4" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium shadow-inner"></textarea>
              </div>
              
              <!-- Image Upload for History -->
              <div class="space-y-4">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">รูปภาพประกอบ</label>
                <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <img :src="pageData.history.image" class="w-40 h-24 object-cover rounded-xl shadow-md bg-slate-200 shrink-0" />
                  <div class="flex-1 space-y-3 w-full overflow-hidden">
                    <p class="text-[10px] text-slate-500 font-bold uppercase">รูปภาพสำหรับเล่าเรื่องราวประวัติ</p>
                    <input type="file" @change="(e) => handleImageUpload(e, 'history', 'image')" class="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer shadow-sm overflow-hidden" />
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">เนื้อหาช่วงล่าง</label>
                <textarea v-model="pageData.history.content_bottom" rows="4" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium shadow-inner"></textarea>
              </div>

              <!-- Personnel Section -->
              <div class="space-y-6 pt-8 border-t border-slate-100">
                <div class="flex justify-between items-center">
                  <div>
                    <h5 class="text-sm font-bold text-slate-700">โครงสร้างบุคคล (Personnel Structure)</h5>
                    <p class="text-xs text-slate-400">จัดการข้อมูลและรูปภาพของบุคลากรมัสยิด</p>
                  </div>
                  <button 
                    @click="addPersonnel"
                    class="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2"
                  >
                    ➕ เพิ่มบุคคล
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div 
                    v-for="(person, index) in pageData.history.personnel" 
                    :key="index"
                    class="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 relative group"
                  >
                    <button 
                      @click="removePersonnel(index)"
                      class="absolute -top-2 -right-2 w-8 h-8 bg-white text-rose-500 rounded-full shadow-md flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 border border-rose-100 z-10"
                    >
                      🗑️
                    </button>

                    <div class="space-y-4">
                      <div class="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-200 border border-slate-100 shadow-inner">
                        <img v-if="person.image" :src="person.image" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-3xl">👤</div>
                        <label class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                          เปลี่ยนรูปภาพ
                          <input type="file" @change="(e) => handlePersonnelImageUpload(e, index)" class="hidden" />
                        </label>
                      </div>
                      
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อ-นามสกุล</label>
                        <input v-model="person.name" type="text" placeholder="ระบุชื่อ..." class="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-bold" />
                      </div>

                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ตำแหน่ง</label>
                        <input v-model="person.position" type="text" placeholder="ระบุตำแหน่ง..." class="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm" />
                      </div>

                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ประวัติย่อ</label>
                        <textarea v-model="person.bio" rows="3" placeholder="ระบุประวัติย่อ..." class="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm"></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="!pageData.history.personnel?.length" class="py-12 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <p class="text-slate-400 font-medium italic">ยังไม่มีข้อมูลบุคลากร กดปุ่มด้านบนเพื่อเพิ่ม</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Page: Donate -->
          <div v-if="activeTab === 'donate'" class="space-y-8">
            <h4 class="font-bold text-slate-800 text-lg border-b pb-4">หน้าบริจาค (Donate)</h4>
            <div class="grid grid-cols-1 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">หัวข้อหน้า</label>
                <input v-model="pageData.donate.title" type="text" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium shadow-inner" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">รายละเอียด</label>
                <textarea v-model="pageData.donate.description" rows="3" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none font-medium shadow-inner"></textarea>
              </div>
              
              <!-- Image Upload for QR -->
              <div class="space-y-4">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">รูปภาพ QR Code บริจาค</label>
                <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <img :src="pageData.donate.qr_image" class="w-32 h-32 object-contain rounded-xl shadow-md bg-white border p-2 shrink-0" />
                  <div class="flex-1 space-y-3 w-full overflow-hidden">
                    <p class="text-[10px] text-slate-500 font-bold uppercase">อัปโหลดรูปภาพ QR Code พร้อมเพย์</p>
                    <input type="file" @change="(e) => handleImageUpload(e, 'donate', 'qr_image')" class="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer shadow-sm overflow-hidden" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Page: Activities -->
          <div v-if="activeTab === 'activities'" class="space-y-8">
            <div class="flex justify-between items-center border-b pb-4">
              <h4 class="font-bold text-slate-800 text-lg">รายการกิจกรรม (Activities)</h4>
              <button @click="addActivity" class="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2">
                ➕ เพิ่มกิจกรรม
              </button>
            </div>

            <!-- ส่วนแก้ไขหัวข้อใหญ่ของหน้ากิจกรรม -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">หัวข้อใหญ่ของหน้า</label>
                <input v-model="pageData.activities.title" type="text" placeholder="เช่น กิจกรรมของมัสยิด" class="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 outline-none font-bold" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">เนื้อหาคำโปรย</label>
                <input v-model="pageData.activities.description" type="text" placeholder="เช่น ติดตามข่าวสารงานบุญต่างๆ" class="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6">
              <div v-for="(act, idx) in pageData.activities.items" :key="idx" class="p-6 md:p-8 bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 relative group">
                <button @click="removeActivity(idx)" class="absolute -top-2 -right-2 w-10 h-10 bg-white text-rose-500 rounded-full shadow-md flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 border border-rose-100 z-10">
                  🗑️
                </button>
                
                <div class="flex flex-col lg:flex-row gap-6 md:gap-8">
                  <div class="w-full lg:w-64 h-48 bg-slate-200 rounded-3xl overflow-hidden relative border-4 border-white shadow-sm shrink-0">
                    <img v-if="act.image" :src="act.image" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-3xl">📸</div>
                    <label class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                      เลือกรูปภาพ
                      <input type="file" @change="(e) => handleActivityImageUpload(e, idx)" class="hidden" />
                    </label>
                  </div>
                  
                  <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div class="md:col-span-2 space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อกิจกรรม</label>
                      <input v-model="act.title" type="text" placeholder="ระบุชื่อกิจกรรม..." class="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 outline-none font-bold" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">วันที่และเวลาที่จัด</label>
                      <input v-model="act.date" type="datetime-local" class="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 outline-none font-bold" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">สถานที่</label>
                      <input v-model="act.location" type="text" placeholder="ระบุสถานที่..." class="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/10 outline-none" />
                    </div>
                    <div class="md:col-span-2 space-y-4">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">อัลบั้มรูปภาพกิจกรรม (เพิ่มได้หลายรูป)</label>
                      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        <div v-for="(img, imgIdx) in act.images || []" :key="imgIdx" class="aspect-square bg-slate-200 rounded-2xl overflow-hidden relative group/img border-2 border-white shadow-sm">
                          <img :src="img" class="w-full h-full object-cover" />
                          <button @click="removeActivityImage(idx, imgIdx)" class="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center lg:opacity-0 lg:group-hover/img:opacity-100 transition-opacity shadow-sm z-10">✕</button>
                        </div>
                        <label class="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all hover:border-emerald-300 group/add">
                          <span class="text-2xl group-hover/add:scale-110 transition-transform">➕</span>
                          <span class="text-[8px] font-black text-slate-400 uppercase mt-1">เพิ่มรูป</span>
                          <input type="file" multiple @change="(e) => handleActivityAlbumUpload(e, idx)" class="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!pageData.activities.items?.length" class="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
              <div class="text-5xl mb-4">📅</div>
              <p class="text-slate-400 font-bold">ยังไม่มีข้อมูลกิจกรรม</p>
              <button @click="addActivity" class="mt-4 text-emerald-600 font-bold hover:underline">เพิ่มกิจกรรมแรกของคุณ</button>
            </div>
          </div>

        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup>
definePageMeta({ 
  layout: false,
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const activeTab = ref('general')
const saving = ref(false)

const tabs = [
  { id: 'general', name: 'ข้อมูลทั่วไป' },
  { id: 'navbar', name: 'แถบเมนู (Navbar)' },
  { id: 'index', name: 'หน้าแรก' },
  { id: 'history', name: 'ประวัติ' },
  { id: 'activities', name: 'กิจกรรม' },
  { id: 'donate', name: 'บริจาค' }
]

const generalLabels = {
  mosque_name: 'ชื่อมัสยิดหลัก',
  address: 'ที่อยู่สถานที่',
  phone: 'เบอร์โทรศัพท์ติดต่อ',
  email: 'ที่อยู่อีเมล',
  footer_desc: 'คำอธิบายท้ายเว็บ (Footer)'
}

const generalSettings = ref({
  mosque_name: '',
  address: '',
  phone: '',
  email: '',
  footer_desc: '',
  logo_url: '',
  icon_url: ''
})

const { data: settings, refresh } = await useFetch('/api/admin/settings')

const pageData = ref({
  navbar: { logo: '', icon: '', title: '' },
  index: { hero_title: '', hero_subtitle: '', hero_image: '', about_items: [] },
  history: { title: '', content_top: '', image: '', content_bottom: '', personnel: [] },
  donate: { title: '', description: '', qr_image: '' },
  activities: { title: '', description: '', items: [] }
})

watch(settings, (newVal) => {
  if (newVal) {
    // Update general settings
    for (const key of Object.keys(generalSettings.value)) {
      if (newVal[key]) generalSettings.value[key] = newVal[key]
    }
    // Update page data
    for (const key of Object.keys(pageData.value)) {
      if (newVal[`page_${key}`]) {
        pageData.value[key] = JSON.parse(JSON.stringify(newVal[`page_${key}`]))
      }
    }
  }
}, { immediate: true })

function addAboutItem() {
  if (!pageData.value.index.about_items) pageData.value.index.about_items = []
  pageData.value.index.about_items.push({ title: '', description: '', image: '' })
}

function removeAboutItem(index) {
  if (pageData.value.index.about_items) {
    pageData.value.index.about_items.splice(index, 1)
  }
}

function addPersonnel() {
  if (!pageData.value.history.personnel) pageData.value.history.personnel = []
  pageData.value.history.personnel.push({ name: '', position: '', image: '', bio: '' })
}

function removePersonnel(index) {
  if (pageData.value.history.personnel) {
    pageData.value.history.personnel.splice(index, 1)
  }
}

function addActivity() {
  if (!pageData.value.activities.items) pageData.value.activities.items = []
  pageData.value.activities.items.push({ title: '', date: '', location: '', description: '', image: '' })
}

function removeActivity(index) {
  if (pageData.value.activities.items) {
    pageData.value.activities.items.splice(index, 1)
  }
}

// --- Unified Upload Helper ---
async function uploadToSupabase(file, folder) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error(`Upload Error (${folder}):`, error)
    throw error
  }
}

// --- General Branding Logic ---
async function handleBrandingUpload(event, field) {
  const file = event.target.files[0]
  if (!file) return
  
  // Preview
  generalSettings.value[field] = URL.createObjectURL(file)
  
  try {
    const publicUrl = await uploadToSupabase(file, 'branding')
    generalSettings.value[field] = publicUrl
  } catch (error) {
    alert(`อัปโหลดโลโก้ล้มเหลว: ${error.message || 'ตรวจสอบสิทธิ์ Storage Policy'}`)
  }
}

// --- Navbar Image Logic ---
async function handleNavbarImageUpload(event, field) {
  const file = event.target.files[0]
  if (!file) return
  
  pageData.value.navbar[field] = URL.createObjectURL(file)
  
  try {
    const publicUrl = await uploadToSupabase(file, 'branding/navbar')
    pageData.value.navbar[field] = publicUrl
  } catch (error) {
    alert(`อัปโหลดรูป Navbar ล้มเหลว: ${error.message}`)
  }
}

// --- Dynamic Items Logic ---
async function handleAboutItemUpload(event, index) {
  const file = event.target.files[0]
  if (!file) return
  
  pageData.value.index.about_items[index].image = URL.createObjectURL(file)
  
  try {
    const publicUrl = await uploadToSupabase(file, 'index/about')
    pageData.value.index.about_items[index].image = publicUrl
  } catch (error) {
    alert(`อัปโหลดรูปรายการล้มเหลว: ${error.message}`)
  }
}

// --- Activities Logic ---
async function handleActivityImageUpload(event, index) {
  const file = event.target.files[0]
  if (!file) return
  
  pageData.value.activities.items[index].image = URL.createObjectURL(file)
  
  try {
    const publicUrl = await uploadToSupabase(file, 'activities')
    pageData.value.activities.items[index].image = publicUrl
  } catch (error) {
    alert(`อัปโหลดรูปกิจกรรมล้มเหลว: ${error.message}`)
  }
}

async function handleActivityAlbumUpload(event, actIdx) {
  const files = event.target.files
  if (!files || files.length === 0) return
  
  if (!pageData.value.activities.items[actIdx].images) {
    pageData.value.activities.items[actIdx].images = []
  }

  for (const file of files) {
    try {
      const publicUrl = await uploadToSupabase(file, 'activities/album')
      pageData.value.activities.items[actIdx].images.push(publicUrl)
    } catch (error) {
      alert(`อัปโหลดบางรูปล้มเหลว: ${error.message}`)
    }
  }
}

function removeActivityImage(actIdx, imgIdx) {
  pageData.value.activities.items[actIdx].images.splice(imgIdx, 1)
}

// --- Image Upload Logic (General) ---
async function handleImageUpload(event, page, field) {
  const file = event.target.files[0]
  if (!file) return

  pageData.value[page][field] = URL.createObjectURL(file)

  try {
    const publicUrl = await uploadToSupabase(file, page)
    pageData.value[page][field] = publicUrl
    alert('อัปโหลดรูปภาพสำเร็จ! ✅ อย่าลืมกดบันทึกทั้งหมด')
  } catch (error) {
    alert(`อัปโหลดล้มเหลว: ${error.message}`)
  }
}

// --- Personnel Logic ---
async function handlePersonnelImageUpload(event, index) {
  const file = event.target.files[0]
  if (!file) return
  
  pageData.value.history.personnel[index].image = URL.createObjectURL(file)
  
  try {
    const publicUrl = await uploadToSupabase(file, 'history/personnel')
    pageData.value.history.personnel[index].image = publicUrl
  } catch (error) {
    console.error('Upload Error:', error)
    alert(`การอัปโหลดล้มเหลว: ${error.message || JSON.stringify(error)}`)
  }
}

async function saveAllSettings() {
  saving.value = true
  try {
    const promises = []
    
    // Save general
    for (const [key, value] of Object.entries(generalSettings.value)) {
      promises.push($fetch('/api/admin/settings', { method: 'POST', body: { key, value } }))
    }
    
    // Save pages
    for (const [page, data] of Object.entries(pageData.value)) {
      promises.push($fetch('/api/admin/settings', { method: 'POST', body: { key: `page_${page}`, value: data } }))
    }
    
    await Promise.all(promises)
    alert('บันทึกข้อมูลทั้งหมดเรียบร้อยแล้ว! ✅')
    await refresh()
  } catch (error) {
    console.error(error)
    alert('เกิดข้อผิดพลาดในการบันทึก ❌')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
