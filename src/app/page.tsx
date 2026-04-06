import { PrismaClient } from '@prisma/client';
import DashboardClient from './DashboardClient';

const prisma = new PrismaClient();

export const revalidate = 0;

export default async function Page() {
  const allShows = await prisma.show.findMany({
    orderBy: { tanggal: 'desc' },
  });

  const totalShows = allShows.length;

  // Kalkulasi Setlist Terfavorit & Rinciannya
  const setlistCounts: Record<string, number> = {};
  allShows.forEach((show) => {
    // Menghitung kemunculan tiap nama setlist/event
    setlistCounts[show.setlist] = (setlistCounts[show.setlist] || 0) + 1;
  });
  
  let setlistFavorit = "-";
  if (Object.keys(setlistCounts).length > 0) {
    setlistFavorit = Object.keys(setlistCounts).reduce((a, b) => 
      setlistCounts[a] > setlistCounts[b] ? a : b
    );
  }

  // --- FITUR BARU: Bikin array breakdown & urutkan dari terbanyak ---
  const setlistBreakdown = Object.entries(setlistCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  // ------------------------------------------------------------------

  let lastShowDate = "-";
  if (allShows.length > 0) {
    const dateObj = new Date(allShows[0].tanggal);
    lastShowDate = dateObj.toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: '2-digit' 
    });
  }

  const chronologicalShows = [...allShows].reverse();
  const monthlyMap = new Map<string, number>();
  
  chronologicalShows.forEach((show) => {
    const dateObj = new Date(show.tanggal);
    const monthYear = dateObj.toLocaleDateString('id-ID', { 
      month: 'short', year: '2-digit' 
    });
    monthlyMap.set(monthYear, (monthlyMap.get(monthYear) || 0) + 1);
  });
  
  const monthlyStats = Array.from(monthlyMap, ([bulan, total]) => ({
    bulan,
    total,
  })).slice(-12);

  const now = new Date();
  const lastUpdate = now.toLocaleDateString('id-ID', {
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  }) + ' WIB';

  return (
    <DashboardClient 
      shows={allShows} 
      // Tambahkan setlistBreakdown ke stats
      stats={{ totalShows, setlistFavorit, lastShowDate, monthlyStats, setlistBreakdown, lastUpdate }}
    />
  );
}