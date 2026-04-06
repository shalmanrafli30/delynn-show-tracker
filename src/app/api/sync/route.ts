import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TARGET_MEMBER = "Adeline Wijaya";

// Bikin tipe data khusus agar TypeScript paham struktur array kita
interface ShowData {
  tanggal: string;
  tipe: string;
  setlist: string;
  ref_code: string;
}

function convertToWIBDate(utcDateString: string) {
  const date = new Date(utcDateString);
  date.setTime(date.getTime() + (7 * 60 * 60 * 1000));
  return date.toISOString().split('T')[0];
}

export async function GET() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    console.log(`Mulai sinkronisasi jadwal JKT48 untuk ${currentMonth}/${currentYear}...`);

    const scheduleUrl = `https://jkt48.com/api/v1/schedules?lang=id&month=${currentMonth}&year=${currentYear}`;
    const resSchedule = await fetch(scheduleUrl);
    const scheduleData = await resSchedule.json();

    if (!scheduleData.status || !scheduleData.data) {
      return NextResponse.json({ error: "Gagal mengambil jadwal utama" }, { status: 500 });
    }

    // Perbaikan 1: Gunakan 'const' dan berikan tipe data ShowData[]
    const delynnShows: ShowData[] = [];

    for (const show of scheduleData.data) {
      const refCode = show.reference_code;
      const showType = show.type;
      
      if (!refCode) continue;

      let detailUrl = "";
      if (showType === 'SHOW') {
        detailUrl = `https://jkt48.com/api/v1/theater-shows/${refCode}?lang=id`;
      } else if (showType === 'EVENT') {
        detailUrl = `https://jkt48.com/api/v1/events/${refCode}?lang=id`;
      } else {
        continue;
      }

      try {
        const resDetail = await fetch(detailUrl);
        const detailData = await resDetail.json();

        if (detailData.status && detailData.data.jkt48_member) {
          const members = detailData.data.jkt48_member;
          
          // Perbaikan 2: Ganti 'any' dengan tipe object { name: string }
          const isDelynnPresent = members.some((m: { name: string }) => m.name === TARGET_MEMBER);
          
          if (isDelynnPresent) {
            const tanggalWIB = convertToWIBDate(show.date);
            delynnShows.push({
              tanggal: tanggalWIB,
              tipe: showType,
              setlist: show.title,
              ref_code: refCode,
            });
          }
        }
      } catch (err) {
        // Perbaikan 3: err digunakan di console.error
        console.error(`Gagal hit detail ${refCode}`, err);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    let addedCount = 0;
    for (const show of delynnShows) {
      try {
        await prisma.show.upsert({
          where: {
            tanggal_setlist: {
              tanggal: show.tanggal,
              setlist: show.setlist,
            }
          },
          update: {
            ref_code: show.ref_code,
          },
          create: {
            tanggal: show.tanggal,
            tipe: show.tipe,
            setlist: show.setlist,
            ref_code: show.ref_code,
            member_name: TARGET_MEMBER,
          }
        });
        addedCount++;
      } catch (dbError) {
        // Perbaikan 4: dbError digunakan di console.error
        console.error("Duplicate atau error insert:", show.setlist, dbError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sinkronisasi selesai! Menemukan ${delynnShows.length} jadwal bulan ini. Diperbarui di DB: ${addedCount}.`,
      data: delynnShows
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}