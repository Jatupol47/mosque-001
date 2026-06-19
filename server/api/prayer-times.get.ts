/**
 * API ค้นหาตารางเวลาละหมาดจากหน่วยบริการภายนอก (Live Prayer Times Integration API - GET)
 * ทำหน้าที่:
 * 1. รับค่าคิวรีพารามิเตอร์ วัน, เดือน, และปี ค.ศ. จากหน้าบ้าน (หากไม่ได้รับมาจะใช้เวลาของเครื่องปัจจุบันเป็นตัวแปรหลัก)
 * 2. ยิงเชื่อมต่อข้ามเซิร์ฟเวอร์แบบ POST ข้อมูลไปยัง API ของเว็บบล็อกมุสลิมไทยโพสต์ ('https://prayertimes.muslimthaipost.com/app_crud.php')
 * 3. ส่ง Parameter 'id=2' ซึ่งเป็นรหัสตัวแทนของจังหวัดกรุงเทพมหานคร เพื่อดึงเวลาขึ้นมาคำนวณ
 * 4. รับและแปลงโครงสร้างข้อมูลดิบมาเรียบเรียงจัดระเบียบส่งต่อให้หน้าบ้านนำไปลูปแสดงผลลงตารางละหมาดอย่างเรียบร้อย
 */
export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const now = new Date();
        // กำหนดข้อมูลปี เดือน วัน ให้เป็นค่าปัจจุบันของระบบหากทางหน้าบ้านไม่กรอกมา
        const dd = query.dd || now.getDate();
        const mm = query.mm || (now.getMonth() + 1);
        const yyyy = query.yyyy || now.getFullYear();

        // 1. ส่งคำร้องขอตรวจสอบตารางเวลาละหมาดไปยังเซิร์ฟเวอร์ภายนอก (External Service Call)
        const response = await fetch('https://prayertimes.muslimthaipost.com/app_crud.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            // ส่งอาร์กิวเมนต์ คีย์เวิร์ด ID=2 (กรุงเทพมหานคร)
            body: `action=getsolatbyprovince&id=2&dd=${dd}&mm=${mm}&yyyy=${yyyy}`
        });

        const data = await response.json();

        // 2. จัดเรียงฟิลด์ข้อมูลที่ได้รับกลับมาให้สอดคล้องกับพารามิเตอร์ที่หน้าบ้านเรียกใช้งานง่ายๆ
        if (data.success === "1" && data.rowsolat) {
            const solat = data.rowsolat;
            return {
                success: true,
                province: data.provincename,
                date: {
                    gregorian: `${solat.dd}/${solat.mm}/${solat.yyyy}`, // ปฏิทินเกรกอเรียน (ค.ศ.)
                    hijri: `${solat.hdd}/${solat.hmm}/${solat.hyyyy}`   // ปฏิทินฮิจเราะห์ศักราช (ฮ.ศ.)
                },
                times: {
                    imsak: solat.aimsak,    // เวลาอิมซาก (เตรียมตัวงดอาหารก่อนละหมาดซุบฮิ)
                    fajr: solat.subhi,      // เวลาละหมาดซุบฮิ (รุ่งอรุณ)
                    sunrise: solat.shuruk,  // เวลาชูรูก (ดวงอาทิตย์ขึ้น)
                    dhuhr: solat.zuhri,     // เวลาละหมาดดุฮริ (บ่าย)
                    asr: solat.asri,        // เวลาละหมาดอัศริ (เย็น)
                    maghrib: solat.maghrib,  // เวลาละหมาดมัฆริบ (พลบค่ำ)
                    isha: solat.aisha       // เวลาละหมาดอิชา (กลางคืน)
                }
            };
        }

        return { success: false, error: 'Failed to fetch prayer times' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});
