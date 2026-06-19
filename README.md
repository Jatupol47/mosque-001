# 🕌 Mosque-001 (ระบบจัดการมัสยิดบ้านสมเด็จ)

โปรเจกต์นี้เป็นเว็บแอปพลิเคชันสำหรับจัดการข้อมูลและประชาสัมพันธ์ข่าวสารของ **มัสยิดบ้านสมเด็จ** พัฒนาด้วยเทคโนโลยีสมัยใหม่แบบ Full-stack โดยใช้ Nuxt 3 และ Prisma

---

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

*   **Frontend**: `Nuxt 3` (Vue 3) + `Tailwind CSS v4` (ผ่าน Vite)
*   **Backend/API**: Nuxt Server Engine (`Nitro`)
*   **Database**: `PostgreSQL` จัดการผ่าน `Prisma ORM`
*   **Authentication & Storage**: `Supabase` (เก็บบัญชีแอดมิน และรูปภาพสลิป/กิจกรรม)
*   **Fonts**: Google Fonts (`Prompt`)

---

## 📊 แผนผังความสัมพันธ์การทำงาน (Architecture Flow)

แผนผังแสดงการไหลของข้อมูล (Data Flow) ตั้งแต่หน้าบ้าน (Frontend) ไปถึงหลังบ้าน (Backend Server API) จนถึงฐานข้อมูล (Database/Supabase):

```mermaid
graph TD
    subgraph Frontend [ส่วนหน้าบ้าน - App & Pages]
        AppVue[app/app.vue] --> DefaultLayout[app/layouts/default.vue]
        AppVue --> AdminLayout[app/layouts/admin.vue]
        DefaultLayout --> Pages[app/pages/ index, donate, history, activities, timetable]
        AdminLayout --> AdminPages[app/pages/admin/ index, donations, settings, statistics]
        Navbar[app/components/AppNavbar.vue] -.-> DefaultLayout
        Footer[app/components/AppFooter.vue] -.-> DefaultLayout
        AuthMiddleware[app/middleware/auth.ts] --> AdminPages
    end

    subgraph Configs [การตั้งค่าหลัก]
        NuxtConfig[nuxt.config.ts]
    end

    subgraph Backend [ส่วนหลังบ้าน - Server API & Utils]
        LoggerMiddleware[server/middleware/visitor-logger.ts] --> PrismaUtils[server/utils/prisma.ts]
        PublicAPIs[server/api/ settings, donate, donation-summary, prayer-times] --> PrismaUtils
        AdminAPIs[server/api/admin/ donations, settings, update-donation, visitor-stats, setup-db] --> PrismaUtils
    end

    subgraph External [บริการภายนอก & Database]
        PrismaUtils --> DB[(PostgreSQL Database)]
        PrismaSchema[prisma/schema.prisma] --> DB
        Pages -->|Upload Slip| SupabaseStorage[Supabase Storage slips]
        AdminPages -->|Upload Media| SupabaseStorage[Supabase Storage branding/activities]
        AdminPages -->|Auth Login| SupabaseAuth[Supabase Auth Service]
        PublicAPIs -->|Fetch Times| MuslimThaiPost[MuslimThaiPost API]
    end

    Pages -->|HTTP Fetch API| PublicAPIs
    AdminPages -->|HTTP Fetch API| AdminAPIs
```

---

## 📂 โครงสร้างการทำงานและความเกี่ยวข้องของแต่ละไฟล์

โครงสร้างความเกี่ยวข้องและการทำงานประสานกันของแต่ละไฟล์ในระบบ แบ่งตามหมวดหมู่หลัก:

### 1️⃣ ส่วนหน้าบ้านสำหรับบุคคลทั่วไป (Public Frontend Pages)

ส่วนแสดงผลให้คนทั่วไปเข้าชม ข้อมูลโหลดผ่าน API หลังบ้านเพื่อให้ทำงานได้เป็นไดนามิก:

*   🏠 **`app/pages/index.vue` (หน้าแรก)**
    *   **หน้าที่หลัก:** แสดงรูปต้อนรับมัสยิด, คำโปรย, ประวัติย่อ, ข้อมูล "เกี่ยวกับเรา" และยอดเงินบริจาครวมสะสม
    *   **การเชื่อมโยงกับไฟล์อื่น:**
        *   ดึงยอดบริจาครวมมาจาก API `server/api/donation-summary.get.ts`
        *   ดึงเนื้อหารายละเอียดหน้าแรกจาก API `server/api/settings.get.ts`

*   📅 **`app/pages/activities.vue` (หน้ารวมกิจกรรม)**
    *   **หน้าที่หลัก:** แสดงข่าวสารและกิจกรรมงานบุญของมัสยิด มี Popup แสดงเนื้อหา และแกลเลอรีรูปสไลด์ (Lightbox)
    *   **การเชื่อมโยงกับไฟล์อื่น:**
        *   ดึงรายการกิจกรรมทั้งหมดมาแสดงจาก API `server/api/settings.get.ts`

*   🤝 **`app/pages/donate.vue` (หน้าแจ้งโอนเงินบริจาค)**
    *   **หน้าที่หลัก:** แสดงบัญชีโอนเงิน และ QR Code พร้อมฟอร์มส่งข้อมูล ยอดเงิน ขอใบกำกับภาษี และพรีวิวสลิป
    *   **การเชื่อมโยงกับไฟล์อื่น:**
        *   อัปโหลดภาพสลิปหลักฐานไปเก็บไว้ที่ **Supabase Storage**
        *   บันทึกข้อมูลและแนบลิงก์รูปภาพแจ้งโอนผ่าน API `server/api/donate.post.ts`

*   📖 **`app/pages/history.vue` (หน้าประวัติความเป็นมา)**
    *   **หน้าที่หลัก:** แสดงบทความเล่าประวัติมัสยิด และการ์ดแสดงทำเนียบรายชื่อบุคลากร (คณะกรรมการมัสยิด)
    *   **การเชื่อมโยงกับไฟล์อื่น:**
        *   ดึงประวัติมัสยิดและรายชื่อบุคลากรจาก API `server/api/settings.get.ts`

*   🕒 **`app/pages/timetable.vue` (หน้าตารางเวลาละหมาด)**
    *   **หน้าที่หลัก:** แสดงปฏิทินอิสลาม และตารางเวลาปฏิบัติศาสนกิจประจำวัน 6 เวลาหลัก
    *   **การเชื่อมโยงกับไฟล์อื่น:**
        *   ดึงอัปเดตเวลาละหมาดตามเวลาปัจจุบันจาก API `server/api/prayer-times.get.ts`

---

### 2️⃣ ส่วนหน้าหลังบ้านสำหรับผู้ดูแล (Admin Pages)

ส่วนที่ใช้ในการบริหารจัดการข้อมูลระบบ (ต้องล็อกอินผ่านสิทธิ์แอดมินก่อนเข้าใช้งาน):

*   📊 **`app/pages/admin/index.vue` (แดชบอร์ดสรุปสถิติประจำเดือน)**
    *   **หน้าที่หลัก:** แสดงสถิติ ยอดโอน และรายการบริจาคล่าสุดประจำปี/เดือนที่เลือกกรอง
    *   **การเชื่อมโยงกับไฟล์อื่น:**
        *   คุ้มกันความปลอดภัยป้องกันผู้ไม่มีสิทธิ์โดย `app/middleware/auth.ts`
        *   ดึงและกรองรายการโอนประจำเดือนมาจาก API `server/api/admin/donations.get.ts`

*   🛡️ **`app/pages/admin/donations.vue` (หน้าตรวจเงินและอนุมัติสลิป)**
    *   **หน้าที่หลัก:** แสดงรายการข้อมูลผู้แจ้งโอน, สลิปโอนเงิน (มี Hover Preview), ที่อยู่ลดหย่อนภาษี และปุ่มกดยืนยัน/ยกเลิกยอดเงิน
    *   **การเชื่อมโยงกับไฟล์อื่น:**
        *   คุ้มกันความปลอดภัยโดย `app/middleware/auth.ts`
        *   ส่งข้อมูลกดยืนยัน/ยกเลิกสเตตัสการโอนลงฐานข้อมูลผ่าน API `server/api/admin/update-donation.post.ts`

*   ⚙️ **`app/pages/admin/settings.vue` (หน้าตั้งค่าเนื้อหาเว็บไซต์)**
    *   **หน้าที่หลัก:** ฟอร์มปรับเปลี่ยน โลโก้มัสยิด, รูป QR code, ข้อมูลติดต่อ, การ์ดหน้าแรก, ข้อมูลบุคลากร และกิจกรรม
    *   **การเชื่อมโยงกับไฟล์อื่น:**
        *   ดึงการตั้งค่าดิบทั้งหมดมาเติมใส่ช่องอินพุตในฟอร์มจาก API `server/api/admin/settings.get.ts`
        *   อัปโหลดภาพสื่อประกอบใหม่ๆ ขึ้นคลาวด์ **Supabase Storage**
        *   ยิงบันทึกการแก้ไขตั้งค่าทั้งหมดลงฐานข้อมูลด้วย API `server/api/admin/settings.post.ts`

*   📈 **`app/pages/admin/statistics.vue` (หน้ารายงานสถิติผู้ชม)**
    *   **หน้าที่หลัก:** สรุปยอดผู้ชมสะสม รายวัน แสดงกราฟแท่งสถิติย้อนหลัง และลำดับเพจยอดนิยมที่ถูกเปิดดู
    *   **การเชื่อมโยงกับไฟล์อื่น:**
        *   ดึงตัวเลขการคำนวณและรายงานล็อกสถิติผู้ชมเรียลไทม์จาก API `server/api/admin/visitor-stats.get.ts`

*   🔑 **`app/pages/admin/login.vue` (หน้าลงชื่อเข้าใช้งานแอดมิน)**
    *   **หน้าที่หลัก:** แบบฟอร์มกรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานระบบ
    *   **การเชื่อมโยงกับไฟล์อื่น:**
        *   ตรวจสอบความถูกต้องของบัญชีผู้ใช้งานผ่านระบบเซสชันของ **Supabase Authentication**

---

### 3️⃣ ส่วนประกอบและกรอบหน้าเว็บส่วนกลาง (Layouts & Components)

*   🌐 **`app/components/AppNavbar.vue` (แถบเมนูด้านบน)**
    *   **หน้าที่หลัก:** นำทางไปหน้าต่างๆ แสดงโลโก้และชื่อมัสยิด (ยุบเป็น Hamburger menu บนมือถือ)
    *   **การเชื่อมโยงกับไฟล์อื่น:** โหลดรูปโลโก้และชื่อมัสยิดมาแสดงผลจาก API `server/api/settings.get.ts`

*   👣 **`app/components/AppFooter.vue` (แถบข้อมูลท้ายเว็บ)**
    *   **หน้าที่หลัก:** แสดงช่องทางติดต่อ แผนที่ ลิงก์เมนูแนะนำด่วน และลิงก์แอบเข้าหลังบ้านแอดมิน
    *   **การเชื่อมโยงกับไฟล์อื่น:** โหลดข้อมูลติดต่อมาแสดงผลจาก API `server/api/settings.get.ts`

*   🖥️ **`app/layouts/default.vue` (เลย์เอาต์หน้าหลัก)**
    *   **หน้าที่หลัก:** ใช้ประกบ Navbar ไว้ข้างบน และ Footer ไว้ข้างล่างให้กับทุกหน้าคนใช้งานทั่วไป
    *   **การเชื่อมโยงกับไฟล์อื่น:** เรียกใช้งาน `AppNavbar.vue` และ `AppFooter.vue`

*   ⚙️ **`app/layouts/admin.vue` (เลย์เอาต์แผงควบคุมแอดมิน)**
    *   **หน้าที่หลัก:** จัดทำ Sidebar เมนูด้านซ้าย, แสดงโปรไฟล์แอดมิน และทำปุ่มคลิกออกจากระบบ (Logout)
    *   **การเชื่อมโยงกับไฟล์อื่น:** เชื่อมต่อเซสชัน **Supabase Auth** เพื่อดึงประวัติแอดมิน และล้างเซสชันเมื่อออกจากระบบ

---

### 4️⃣ มิดเดิ้ลแวร์และไฟล์ตั้งค่าหลัก (Configs & Middleware)

*   🛡️ **`app/middleware/auth.ts` (ระบบสกัดกั้นแอดมิน)**
    *   **หน้าที่หลัก:** ป้องกันและดักจับไม่ให้คนทั่วไปเข้าเปิดดูโฟลเดอร์หลังบ้าน `/admin`
    *   **การเชื่อมโยงกับไฟล์อื่น:** เช็คประวัติล็อกอิน หากไม่มีสิทธิ์จะเบี่ยงทางไปหน้าล็อกอิน `app/pages/admin/login.vue`

*   🛠️ **`nuxt.config.ts` (ไฟล์ตั้งค่าหลักของ Nuxt 3)**
    *   **หน้าที่หลัก:** ลงทะเบียนโมดูล Supabase, Google Fonts, TailwindCSS, และตั้งค่ายูเรลสำหรับติดต่อฐานข้อมูล
    *   **การเชื่อมโยงกับไฟล์อื่น:** กำหนดเงื่อนไข Supabase Redirect Rules เพื่อให้หน้าเพจทั่วไปยกเว้นการบังคับล็อกอิน

*   🗃️ **`prisma/schema.prisma` (โครงสร้างโมเดล Database)**
    *   **หน้าที่หลัก:** กำหนดคอลัมน์ของข้อมูลบริจาค (Donation), ข้อมูลตั้งค่าเว็บ (WebsiteSetting) และล็อกคนเข้าดูเว็บ (VisitorLog)
    *   **การเชื่อมโยงกับไฟล์อื่น:** ใช้คอมไพล์ฐานข้อมูล PostgreSQL ทำงานร่วมกับ Prisma ORM

---

### 5️⃣ บริการ API และหลังบ้านฝั่งเซิร์ฟเวอร์ (Backend Server APIs & Utils)

*   🔌 **`server/utils/prisma.ts` (ตัวเชื่อมต่อ Database Singleton)**
    *   **หน้าที่หลัก:** เชื่อม PostgreSQL ผ่าน Prisma Client โดยใช้การทำ Singleton Pattern รีไซเคิลการเชื่อมต่อ
    *   **การเชื่อมโยงกับไฟล์อื่น:** ถูกเรียกนำเข้าใช้งานโดย **API และเซิร์ฟเวอร์มิดเดิ้ลแวร์ทุกตัวในโฟลเดอร์ `server`**

*   🕵️‍♂️ **`server/middleware/visitor-logger.ts` (มิดเดิ้ลแวร์ดักสถิติผู้ชม)**
    *   **หน้าที่หลัก:** ดักเก็บยอดเข้าชมของหน้าเว็บทั่วไป คัดกรองบอทขยะและตัดตัวแอดมินออกเพื่อความแม่นยำของรายงาน
    *   **การเชื่อมโยงกับไฟล์อื่น:** บันทึกสถิติมูลลงตาราง `VisitorLog` ใน PostgreSQL ผ่าน `server/utils/prisma.ts`

*   📥 **`server/api/donate.post.ts` (API บันทึกการโอนเงิน)**
    *   **หน้าที่หลัก:** รับแบบฟอร์มการโอนจากหน้าบริจาค บันทึกลงตาราง Donation (กำหนดสถานะ pending)
    *   **การเชื่อมโยงกับไฟล์อื่น:** รับข้อมูลการบริจาคมาจากฟอร์มกรอกหน้า `app/pages/donate.vue`

*   💰 **`server/api/donation-summary.get.ts` (API รวมเงินบริจาคสะสม)**
    *   **หน้าที่หลัก:** บวกยอดเงินรวมทั้งหมดในตาราง Donation ที่แอดมินอนุมัติสำเร็จแล้ว (`status: 'completed'`)
    *   **การเชื่อมโยงกับไฟล์อื่น:** ส่งผลรวมเงินสะสมกลับไปแสดงผลที่หน้าแรก `app/pages/index.vue`

*   🕌 **`server/api/prayer-times.get.ts` (API ตารางเวลาละหมาดประจำวัน)**
    *   **หน้าที่หลัก:** ยิงเชื่อมโยงและคำนวณดึงเวลาปฏิบัติศาสนกิจจากบริการ API เสริมภายนอกของมุสลิมไทยโพสต์
    *   **การเชื่อมโยงกับไฟล์อื่น:** ป้อนข้อมูลเวลาละหมาด 6 ช่วงเวลาส่งต่อให้หน้า `app/pages/timetable.vue`

*   📝 **`server/api/settings.get.ts` (API ส่งเนื้อหาข้อมูลเว็บให้หน้าสาธารณะ)**
    *   **หน้าที่หลัก:** ดึงข้อมูลการตั้งค่าเว็บไซต์ทั้งหมดจากตาราง WebsiteSetting และคอย Parse JSON กลับคืนออโต้
    *   **การเชื่อมโยงกับไฟล์อื่น:** ป้อนข้อความ, โลโก้ และเนื้อหาต่างๆ ไปให้หน้าแรก หน้าประวัติ หน้ากิจกรรม หน้าบริจาค และเมนูส่วนกลาง

*   📂 **`server/api/admin/donations.get.ts` (API ดึงบิลบริจาคให้หลังบ้าน)**
    *   **หน้าที่หลัก:** รายการบิลโอนเงินประจำเดือน คัดกรองคัดเลือกตามเงื่อนไขเพื่อส่งข้อมูลแสดงผล Dashboard
    *   **การเชื่อมโยงกับไฟล์อื่น:** ดึงข้อมูลไปแสดงผลสรุปและรายการหลักที่หน้าแดชบอร์ด `app/pages/admin/index.vue`

*   🖊️ **`server/api/admin/update-donation.post.ts` (API อนุมัติการโอนเงิน)**
    *   **หน้าที่หลัก:** แก้ไขสลับสถานะของสลิป Donation รหัสที่ระบุในตารางให้เป็น 'completed' หรือ 'pending'
    *   **การเชื่อมโยงกับไฟล์อื่น:** รับคำสั่งยืนยัน/ยกเลิกสลิปมาจากหน้าจอตรวจสอบหลักฐาน `app/pages/admin/donations.vue`

*   📂 **`server/api/admin/settings.get.ts` (API ดึงข้อมูลดิบหน้าเว็บส่งให้หลังบ้าน)**
    *   **หน้าที่หลัก:** ดึงค่าตั้งค่าเว็บไซต์ดิบทั้งหมดจาก DB เพื่อบรรจุเข้าช่องฟอร์มแก้ไขในแผงจัดการหลังบ้าน
    *   **การเชื่อมโยงกับไฟล์อื่น:** ดึงข้อมูลดิบไปจัดเรียงใส่ในช่องกรอกอินพุตที่หน้าฟอร์มแก้ไขเนื้อหา `app/pages/admin/settings.vue`

*   💾 **`server/api/admin/settings.post.ts` (API เซฟแก้ไขข้อมูลหน้าเว็บ)**
    *   **หน้าที่หลัก:** รับข้อมูลคีย์และค่าตั้งค่าใหม่ บันทึกรูปแบบ Upsert (อัปเดตค่าเดิม หรือสร้างใหม่ถ้ายังไม่มีคีย์)
    *   **การเชื่อมโยงกับไฟล์อื่น:** บันทึกข้อมูลที่ส่งมาจากฟอร์มปุ่มกดเซฟหน้า `app/pages/admin/settings.vue`

*   📊 **`server/api/admin/visitor-stats.get.ts` (API วิเคราะห์ประวัติผู้เปิดเว็บย้อนหลัง)**
    *   **หน้าที่หลัก:** คำนวณสรุปผู้ชมรวม ยอดผู้ชมวันนี้ และรันคำสั่ง SQL ตรง ($queryRaw) กรุ๊ปรวมจำนวนผู้ชมประจำวัน
    *   **การเชื่อมโยงกับไฟล์อื่น:** ส่งชุดข้อมูลไปวาดแท่งกราฟหลังบ้านและลิสต์เข้าชมล่าสุดในหน้า `app/pages/admin/statistics.vue`

*   🌱 **`server/api/admin/setup-db.get.ts` (API ข้อมูลทดลองเริ่มต้น Seeder)**
    *   **หน้าที่หลัก:** อำนวยความสะดวกกรณีตารางว่างเปล่า จะช่วยจำลองสถิติผู้ชมย้อนหลัง 10 วัน และประวัติการบริจาคให้ทันที
    *   **การเชื่อมโยงกับไฟล์อื่น:** ใช้ทดสอบระบบหลังการติดตั้งเพื่อให้แผงควบคุม Dashboard และหน้าสถิติมีกราฟขึ้นแสดงผล

---

## 💻 ขั้นตอนการติดตั้งและรันใช้งานโปรเจกต์

### 1. ติดตั้ง Dependencies
```bash
npm install
# หรือใช้ bun
bun install
```

### 2. ตั้งค่า Environment Variables (.env)
สร้างไฟล์ `.env` ที่โฟลเดอร์หลักของโปรเจกต์ และระบุค่าเชื่อมต่อต่างๆ ดังนี้:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mosque_db?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/mosque_db?schema=public"
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your-supabase-anon-key"
```

### 3. เตรียมโครงสร้างฐานข้อมูลและการทำ Migration
รันคำสั่งด้านล่างเพื่ออัปเดตโมเดอร์ตารางไปยังฐานข้อมูล PostgreSQL:
```bash
npx prisma generate
npx prisma db push
```

### 4. รันโปรเจกต์ในโหมดพัฒนา (Development Mode)
```bash
npm run dev
# หรือ
bun run dev
```
เซิร์ฟเวอร์จะเปิดที่อยู่อิเล็กทรอนิกส์รันหน้าเว็บสแตนด์บายรอที่: [http://localhost:3000](http://localhost:3000)

### 5. การ Build สำหรับพร้อมนำไปปรับใช้จริง (Production)
```bash
npm run build
npm run preview
```

---
*จัดทำคู่มือโครงสร้างการทำงานขึ้นเพื่อความประณีต สวยงาม และอำนวยความสะดวกในการศึกษาโค้ดโครงการมัสยิดบ้านสมเด็จ*
