"use client";

import React, {useState} from "react";
import {CalendarDays, Mic2, Star, TrendingUp, ChevronLeft, ChevronRight} from "lucide-react";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";

export default function DashboardClient({shows, stats}: {shows: any[]; stats: any}) {
	// === LOGIKA PAGINATION ===
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10; // Tampilkan 10 baris per halaman

	// Hitung indeks pemotongan data
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentShows = shows.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(shows.length / itemsPerPage);

	const nextPage = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};

	const prevPage = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1);
	};
	// =========================

	return (
		<div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:p-12 font-sans">
			<div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
				{/* HEADER (Tetap sama) */}
				<header className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6">
					<div className="flex flex-row items-center gap-4 sm:gap-5">
						<div className="relative shrink-0">
							<div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 sm:border-4 border-white shadow-md bg-slate-200">
								<img src="adeline_wijaya.jpg" alt="Adeline Wijaya" className="w-full h-full object-cover" />
							</div>
						</div>
						<div>
							<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">Adeline Wijaya</h1>
							<p className="text-sm sm:text-base text-slate-500 font-medium">Show History & Analytics</p>
							<div className="mt-2 flex flex-wrap gap-2">
								<span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] sm:text-xs font-bold rounded uppercase">Team Dream</span>
								<span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-[10px] sm:text-xs font-bold rounded uppercase">Gen 12</span>
							</div>
						</div>
					</div>
					<div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start bg-white md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border md:border-none border-slate-200 mt-2 md:mt-0">
						<div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-pink-600 text-white font-bold rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-sm shadow-pink-200 w-fit">Live Tracker</div>
						<p className="text-xs text-slate-400 mt-0 md:mt-2">Last update: {stats.lastUpdate}</p>
					</div>
				</header>

				{/* STATS CARDS (Tetap sama) */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					<StatCard icon={<Mic2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />} title="Show & Event" value={stats.totalShows.toString()} />
					<StatCard icon={<Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />} title="Top Setlist" value={stats.setlistFavorit} />
					<StatCard icon={<CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />} title="Show Terakhir" value={stats.lastShowDate} />
					<StatCard icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />} title="Status" value="Active" />
				</div>

				{/* MID SECTION: CHART & SETLIST BREAKDOWN */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
					{/* CHART SECTION (Memakan 2 kolom di layar lebar) */}
					<div className="lg:col-span-2 bg-white p-4 sm:p-6 border border-slate-200 rounded-2xl shadow-sm">
						<h2 className="font-bold text-slate-800 mb-4 sm:mb-6 text-sm sm:text-base">Grafik Penampilan per Bulan</h2>
						<div className="h-56 sm:h-64 md:h-80 w-full">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={stats.monthlyStats} margin={{top: 10, right: 10, left: -25, bottom: 0}}>
									<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
									<XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: "#64748b"}} dy={10} />
									<YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: "#64748b"}} />
									<Tooltip
										contentStyle={{borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: "12px"}}
										labelStyle={{fontWeight: "bold", color: "#0f172a"}}
										cursor={{fill: "#f1f5f9"}} // Warna background saat kursor di-hover ke balok
									/>
									{/* radius={[4, 4, 0, 0]} bikin ujung atas baloknya melengkung halus */}
									<Bar dataKey="total" name="Jumlah Show" fill="#db2777" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* SETLIST BREAKDOWN SECTION (Memakan 1 kolom di layar lebar) */}
					<div className="bg-white p-4 sm:p-6 border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[300px] sm:h-[330px] md:h-[400px]">
						<h2 className="font-bold text-slate-800 mb-4 sm:mb-6 text-sm sm:text-base">Setlist</h2>

						{/* Area Scrollable agar card tidak jebol ke bawah jika listnya panjang */}
						<div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
							{stats.setlistBreakdown.map((item: any, i: number) => (
								<div key={i} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-pink-50/50 transition-colors rounded-xl border border-slate-100">
									<span className="text-xs sm:text-sm font-medium text-slate-700 truncate mr-3" title={item.name}>
										{item.name}
									</span>
									<div className="flex items-center justify-center min-w-[2.5rem] px-2 py-1 bg-pink-100 text-pink-600 rounded-md shrink-0">
										<span className="text-xs sm:text-sm font-bold">{item.count}x</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* TABLE SECTION DENGAN PAGINATION */}
				<div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
					<div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
						<h2 className="font-semibold text-slate-800 text-sm sm:text-base">Semua Riwayat Penampilan</h2>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs sm:text-sm text-slate-600">
							<thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
								<tr className="whitespace-nowrap">
									<th className="px-4 sm:px-6 py-3 sm:py-4">No.</th>
									<th className="px-4 sm:px-6 py-3 sm:py-4">Tanggal</th>
									<th className="px-4 sm:px-6 py-3 sm:py-4">Kategori</th>
									<th className="px-4 sm:px-6 py-3 sm:py-4">Nama Event / Setlist</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{/* Looping menggunakan currentShows, bukan shows */}
								{currentShows.map((show, index) => (
									<tr key={show.id} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
										{/* Hitung nomor urut agar tetap menyambung antar halaman */}
										<td className="px-4 sm:px-6 py-3 sm:py-4">{indexOfFirstItem + index + 1}</td>
										<td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-slate-900">{show.tanggal}</td>
										<td className="px-4 sm:px-6 py-3 sm:py-4">
											<span className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-md ${show.tipe === "SHOW" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>{show.tipe}</span>
										</td>
										<td className="px-4 sm:px-6 py-3 sm:py-4">{show.setlist}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* KONTROL PAGINATION */}
					<div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
						<p className="text-xs sm:text-sm text-slate-500">
							Menampilkan <span className="font-medium text-slate-900">{shows.length > 0 ? indexOfFirstItem + 1 : 0}</span> - <span className="font-medium text-slate-900">{Math.min(indexOfLastItem, shows.length)}</span> dari <span className="font-medium text-slate-900">{shows.length}</span> data
						</p>

						<div className="flex items-center gap-2">
							<button onClick={prevPage} disabled={currentPage === 1} className="p-1.5 sm:p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
								<ChevronLeft className="w-4 h-4" />
							</button>

							<span className="text-xs sm:text-sm font-medium text-slate-700 min-w-[3rem] text-center">
								{currentPage} / {totalPages || 1}
							</span>

							<button onClick={nextPage} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 sm:p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>

				{/* FOOTER SECTION */}
				<footer className="pt-8 pb-4 mt-8 border-t border-slate-200">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div className="text-center md:text-left">
							<p className="text-xs sm:text-sm text-slate-500 font-medium">
								© {new Date().getFullYear()} <span className="text-slate-900 font-bold">Adeline Wijaya Show Tracker</span>
							</p>
							<p className="text-[10px] sm:text-xs text-slate-400 mt-1">Data disinkronkan otomatis dari API JKT48.</p>
						</div>

						<div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
							<span className="text-[10px] sm:text-xs text-slate-500 font-medium">Built with 💖 by</span>
							<div className="flex items-center gap-1.5">
								<span className="text-[10px] sm:text-xs font-bold text-slate-900">shalmanrafli</span>
								<span className="text-[10px] sm:text-xs text-slate-400">×</span>
								<span className="text-[10px] sm:text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Gemini AI</span>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}

function StatCard({icon, title, value}: {icon: React.ReactNode; title: string; value: string}) {
	return (
		<div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
			<div className="p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl shrink-0">{icon}</div>
			<div>
				<p className="text-[10px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">{title}</p>
				<h3 className="text-base sm:text-xl font-bold text-slate-900 truncate max-w-[100px] sm:max-w-[150px]">{value}</h3>
			</div>
		</div>
	);
}
