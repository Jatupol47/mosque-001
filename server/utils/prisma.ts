import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

/**
 * ตัวจัดระเบียบการเชื่อมต่อฐานข้อมูล (Prisma Client Singleton & PgPool Connection)
 * ทำหน้าที่:
 * 1. สร้าง Pool ในการเชื่อมต่อ PostgreSQL ผ่านแพ็คเกจ pg (node-postgres)
 * 2. ผนวกใช้ PrismaPg Adapter เพื่อเชื่อมฐานข้อมูลได้อย่างมีประสิทธิภาพมากขึ้นในสภาพแวดล้อม Serverless
 * 3. บันทึกและเรียกใช้ Prisma Client Instance ตัวเดียวในตัวแปร Global (Singleton Pattern)
 *    เพื่อป้องกันไม่ให้แอปเปิดการเชื่อมต่อทับถมจนฐานข้อมูลค้างระหว่างรีสตาร์ตเซิร์ฟเวอร์ในขั้นตอนพัฒนา (Development)
 */

// ดึงลิงก์ข้อมูลการติดต่อฐานข้อมูลจากไฟล์ .env
const connectionString = process.env.DATABASE_URL
// สร้างพูลสระน้ำเชื่อมต่อฐานข้อมูลส่วนกลาง
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)

// จัดทำตัวแปล Global เก็บตัวเชื่อมต่อ Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// เลือกสร้างตัวเชื่อมต่อใหม่ หรือเลือกดึงอันที่มีอยู่เดิมแล้วจากหน่วยความจำมาใช้งานซ้ำทันที (Singleton)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

// บันทึกตัวเชื่อมลง Global หากกำลังทำงานในโหมดเขียนพัฒนาโค้ด (Development) เพื่อนำมารีไซเคิลใช้งานใน Hot Reload
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
