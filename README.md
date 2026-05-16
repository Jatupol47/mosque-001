# Mosque-001 (ระบบจัดการมัสยิดบ้านสมเด็จ)

โปรเจคนี้เป็นเว็บแอปพลิเคชันสำหรับจัดการข้อมูลและประชาสัมพันธ์ข่าวสารของ **มัสยิดบ้านสมเด็จ** พัฒนาด้วยเทคโนโลยีสมัยใหม่แบบ Full-stack โดยใช้ Nuxt 4 และ Prisma

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: [Nuxt 4](https://nuxt.com/) (Vue 3) + [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend/API**: Nuxt Server Engine (Nitro)
- **Database**: [PostgreSQL](https://www.postgresql.org/) จัดการผ่าน [Prisma ORM](https://www.prisma.io/)
- **Authentication & Storage**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide Vue Next](https://lucide.dev/)
- **Fonts**: Google Fonts (Sarabun / Inter)

## 🛠️ โครงสร้างโปรเจค (Project Structure)

```text
├── app/                # ส่วนหน้าบ้าน (Frontend)
│   ├── components/     # UI Components ต่างๆ
│   ├── layouts/        # Layout หลักของเว็บไซต์
│   ├── pages/          # หน้าหลัก เช่น หน้าแรก, บริจาค, ตารางเวลาละหมาด
│   └── middleware/     # ตัวกรองการเข้าถึงหน้าเว็บ (เช่น เช็ค Login Admin)
├── server/             # ส่วนหลังบ้าน (Backend API)
│   ├── api/            # API Endpoints (GET/POST/PUT/DELETE)
│   └── utils/          # เครื่องมือเสริมสำหรับ Server
├── prisma/             # การจัดการฐานข้อมูล
│   └── schema.prisma   # โครงสร้างตาราง (Donation, WebsiteSetting, VisitorLog)
├── public/             # ไฟล์ Static ต่างๆ เช่น รูปภาพ
└── nuxt.config.ts      # การตั้งค่าหลักของ Nuxt
```

## ✨ ฟีเจอร์หลัก (Main Features)

### 1. ระบบหน้าบ้าน (Public Features)
- **ตารางเวลาละหมาด (Prayer Timetable)**: แสดงเวลาละหมาดประจำวัน
- **ระบบบริจาค (Donation System)**: 
  - สามารถแจ้งยอดบริจาคและอัปโหลดหลักฐานการโอนเงิน (Slip)
  - แสดงยอดบริจาครวมแบบ Real-time บนหน้าหลัก
  - ตรวจสอบประวัติการบริจาค
- **กิจกรรมมัสยิด (Activities)**: ประชาสัมพันธ์ข่าวสารและกิจกรรมต่างๆ
- **ประวัติมัสยิด (History)**: ข้อมูลความเป็นมาของมัสยิดบ้านสมเด็จ

### 2. ระบบจัดการสำหรับผู้ดูแล (Admin Dashboard)
- **สถิติ (Statistics)**: ดูภาพรวมยอดบริจาคและจำนวนผู้เข้าชมเว็บไซต์
- **จัดการการบริจาค (Donation Management)**: ตรวจสอบและอนุมัติยอดบริจาคที่ส่งเข้ามา
- **ตั้งค่าเว็บไซต์ (Website Settings)**: 
  - แก้ไขข้อมูลบนหน้าเว็บได้ทันที (Hero text, รูปภาพ, ประวัติย่อ)
  - จัดการข้อมูล "เกี่ยวกับเรา" (About items)
- **ระบบ Login**: เข้าถึงส่วนจัดการเฉพาะผู้ที่ได้รับอนุญาต

## 💻 วิธีการติดตั้งและรันโปรเจค

### 1. ติดตั้ง Dependencies
```bash
bun install
# หรือ
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` และระบุค่าต่างๆ เช่น:
- `DATABASE_URL`: URL สำหรับเชื่อมต่อ PostgreSQL
- `DIRECT_URL`: URL สำหรับ Prisma Direct Connection
- `SUPABASE_URL` & `SUPABASE_KEY`: สำหรับจัดการไฟล์ (Storage)

### 3. เตรียมฐานข้อมูล
```bash
npx prisma generate
npx prisma db push
```

### 4. รันโปรเจคในโหมดพัฒนา
```bash
bun run dev
# หรือ
npm run dev
```

เว็บไซต์จะเปิดที่ [http://localhost:3000](http://localhost:3000)

## 📦 การ Build สำหรับใช้งานจริง (Production)
```bash
bun run build
bun run preview
```

---
*จัดทำขึ้นเพื่อมัสยิดบ้านสมเด็จ*

