import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rows = fileContent.replace(/\r/g, '').split('\n').slice(1); 

    let insertedCount = 0;

    // 1. Looping data CSV 
    for (const row of rows) {
      if (!row.trim()) continue;

      // Gunakan const untuk semua hasil split
      const [rawTanggal, tipe, setlist, refCode] = row.split(',');
      
      // Buat variabel let khusus untuk tanggal yang bisa dimodifikasi
      let tanggal = rawTanggal;

      // Abaikan baris jika ref_code adalah data duplikat yang salah
      if (refCode === 'OSH2-2829') {
        console.log('Melewati data duplikat OSH2-2829...');
        continue;
      }

      // Koreksi typo bulan di CSV (Agustus menjadi November)
      if (tanggal === '2025-08-30') {
        tanggal = '2025-11-30'; 
      }

      await prisma.show.upsert({
        where: {
          tanggal_setlist: { tanggal, setlist }
        },
        update: {}, 
        create: {
          tanggal,
          tipe,
          setlist,
          ref_code: refCode || `IMPORT-${tanggal}`,
          member_name: "Adeline Wijaya"
        }
      });
      insertedCount++;
    }

    // 2. Suntikkan 3 Jadwal Surprise Line-up menggunakan data JSON resmi
    const missingShows = [
      { tanggal: '2024-05-31', tipe: 'SHOW', setlist: 'Pajama Drive', refCode: 'OSH2-2698' },
      { tanggal: '2025-11-21', tipe: 'SHOW', setlist: 'KIRA KIRA GIRLS', refCode: 'OSH2-3031' },
      { tanggal: '2025-11-30', tipe: 'SHOW', setlist: 'KIRA KIRA GIRLS', refCode: 'OSH2-3038' },
    ];

    for (const show of missingShows) {
      await prisma.show.upsert({
        where: {
          tanggal_setlist: { tanggal: show.tanggal, setlist: show.setlist }
        },
        update: {},
        create: {
          tanggal: show.tanggal,
          tipe: show.tipe,
          setlist: show.setlist,
          ref_code: show.refCode,
          member_name: "Adeline Wijaya"
        }
      });
      insertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil memproses data! Total ${insertedCount} jadwal masuk ke database Supabase (Duplikat OSH2-2829 telah dibuang).` 
    });

  } catch (error) {
    console.error("Error import:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}