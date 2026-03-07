import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    TrendingUp, DollarSign, ClipboardList, Clock, CheckCircle2,
    Wrench, PackageCheck, Truck, CreditCard, XCircle, BarChart3,
    Calendar, RefreshCw, Loader2, AlertCircle, ChevronDown
} from 'lucide-react';
import { fetchTodayStatistics, fetchOverallStatistics, fetchLastNDaysStatistics, fetchStatisticsByDateRange } from '../../store/statistics/statisticsThunks';
import {
    selectTodayStats, selectOverallStats, selectLastNDays,
    selectDateRangeStats, selectStatisticsLoading, selectStatisticsError
} from '../../store/statistics/statisticsSelectors';

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CFG = {
    en_attente: { label: 'En Attente', color: 'text-amber-500', bg: 'bg-amber-50', bar: 'bg-amber-400', Icon: Clock },
    validee: { label: 'Validée', color: 'text-blue-500', bg: 'bg-blue-50', bar: 'bg-blue-500', Icon: CheckCircle2 },
    en_traitement: { label: 'En Traitement', color: 'text-purple-500', bg: 'bg-purple-50', bar: 'bg-purple-500', Icon: Wrench },
    prete: { label: 'Prête', color: 'text-green-500', bg: 'bg-green-50', bar: 'bg-green-500', Icon: PackageCheck },
    livree: { label: 'Livrée', color: 'text-teal-500', bg: 'bg-teal-50', bar: 'bg-teal-500', Icon: Truck },
    payee: { label: 'Payée', color: 'text-emerald-500', bg: 'bg-emerald-50', bar: 'bg-emerald-500', Icon: CreditCard },
    annulee: { label: 'Annulée', color: 'text-red-400', bg: 'bg-red-50', bar: 'bg-red-400', Icon: XCircle },
};

const fmt = (n) => (n ?? 0).toLocaleString('fr-MA');
const today = () => new Date().toISOString().split('T')[0];
const nDaysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color = 'text-laundry-primary', bg = 'bg-laundry-sky/30' }) {
    return (
        <div className="bg-white border-2 border-laundry-sky/50 rounded-3xl p-6 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
                <Icon size={22} className={color} />
            </div>
            <div>
                <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.18em]">{label}</p>
                <p className="text-3xl font-black text-laundry-deep mt-1">{value}</p>
                {sub && <p className="text-[10px] font-bold text-laundry-deep/40 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function StatusBreakdown({ data, total }) {
    if (!data || !total) return null;
    return (
        <div className="space-y-3">
            {Object.entries(data).map(([key, count]) => {
                const cfg = STATUS_CFG[key] || { label: key, color: 'text-slate-500', bg: 'bg-slate-50', bar: 'bg-slate-400', Icon: ClipboardList };
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const Icon = cfg.Icon;
                return (
                    <div key={key} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <Icon size={14} className={cfg.color} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                            </div>
                            <span className="text-xs font-black text-laundry-deep">{count} <span className="text-laundry-deep/30">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-laundry-sky/40 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${cfg.bar} rounded-full transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MiniBarChart({ data }) {
    if (!data || data.length === 0) return (
        <div className="flex items-center justify-center h-32 text-laundry-deep/20">
            <p className="text-[10px] font-black uppercase tracking-widest">Aucune donnée</p>
        </div>
    );

    const maxCommandes = Math.max(...data.map(d => d.nombreCommandes || 0), 1);
    const maxRevenues = Math.max(...data.map(d => d.revenusTotal || 0), 1);

    return (
        <div className="mt-4">
            {/* Revenue bars */}
            <div className="flex items-end gap-1.5 h-28">
                {data.map((d, i) => {
                    const heightPct = maxRevenues > 0 ? (d.revenusTotal / maxRevenues) * 100 : 0;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                            <div className="relative flex-1 w-full flex items-end">
                                <div
                                    className="w-full bg-laundry-primary/20 hover:bg-laundry-primary/40 rounded-t-lg transition-all duration-500 relative"
                                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                                >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-laundry-deep text-white text-[8px] font-black px-2 py-1 rounded-lg whitespace-nowrap z-10">
                                        {fmt(d.revenusTotal)} DH
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Order count dots */}
            <div className="flex items-center gap-1.5 mt-1">
                {data.map((d, i) => {
                    const dotPct = maxCommandes > 0 ? (d.nombreCommandes / maxCommandes) * 100 : 0;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-laundry-primary/60" style={{ opacity: dotPct / 100 + 0.2 }} />
                            <p className="text-[7px] font-black text-laundry-deep/30 text-center">
                                {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-laundry-primary/30" /><span className="text-[9px] font-black text-laundry-deep/40 uppercase tracking-wider">Revenus (DH)</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-laundry-primary/60" /><span className="text-[9px] font-black text-laundry-deep/40 uppercase tracking-wider">Cmds / jour</span></div>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const todayStats = useSelector(selectTodayStats);
    const overall = useSelector(selectOverallStats);
    const lastNDays = useSelector(selectLastNDays);
    const dateRange = useSelector(selectDateRangeStats);
    const loading = useSelector(selectStatisticsLoading);
    const error = useSelector(selectStatisticsError);

    const [chartDays, setChartDays] = useState(7);
    const [dateDebut, setDateDebut] = useState(nDaysAgo(7));
    const [dateFin, setDateFin] = useState(today());
    const [dateApplied, setDateApplied] = useState(false);

    useEffect(() => {
        dispatch(fetchTodayStatistics());
        dispatch(fetchOverallStatistics());
        dispatch(fetchLastNDaysStatistics(chartDays));
    }, [dispatch]);

    const handleChartDaysChange = (days) => {
        setChartDays(days);
        dispatch(fetchLastNDaysStatistics(days));
    };

    const handleDateRangeSearch = () => {
        if (dateDebut && dateFin) {
            dispatch(fetchStatisticsByDateRange({ dateDebut, dateFin }));
            setDateApplied(true);
        }
    };

    const handleRefresh = () => {
        dispatch(fetchTodayStatistics());
        dispatch(fetchOverallStatistics());
        dispatch(fetchLastNDaysStatistics(chartDays));
        if (dateApplied) dispatch(fetchStatisticsByDateRange({ dateDebut, dateFin }));
    };

    return (
        <div className="space-y-10 animate-fade-in">

            {/* HEADER */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-laundry-deep uppercase tracking-tighter">
                        <span className="text-laundry-primary">Dashboard</span> Admin
                    </h1>
                    <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] mt-1">
                        Vue d'ensemble — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 bg-laundry-primary text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-laundry-deep transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Actualiser
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-600 px-5 py-4 rounded-2xl">
                    <AlertCircle size={18} />
                    <p className="text-xs font-bold">{typeof error === 'string' ? error : 'Une erreur est survenue'}</p>
                </div>
            )}

            {/* ── TODAY KPIs ── */}
            <section>
                <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] mb-4">
                    📅 Aujourd'hui
                </p>
                {loading && !todayStats ? (
                    <div className="flex justify-center py-8"><Loader2 size={32} className="animate-spin text-laundry-primary" /></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard icon={ClipboardList} label="Commandes" value={fmt(todayStats?.totalCommandesToday)} color="text-laundry-primary" bg="bg-laundry-sky/30" />
                        <KpiCard icon={DollarSign} label="Revenus" value={`${fmt(todayStats?.revenuesToday)} DH`} color="text-emerald-500" bg="bg-emerald-50" />
                        <KpiCard icon={PackageCheck} label="Prêtes" value={fmt(todayStats?.commandesPretes)} color="text-green-500" bg="bg-green-50" />
                        <KpiCard icon={Clock} label="En attente" value={fmt(todayStats?.commandesEnAttente)} color="text-amber-500" bg="bg-amber-50" />
                        <KpiCard icon={CheckCircle2} label="Validées" value={fmt(todayStats?.commandesValidees)} color="text-blue-500" bg="bg-blue-50" />
                        <KpiCard icon={Wrench} label="En traitement" value={fmt(todayStats?.commandesEnTraitement)} color="text-purple-500" bg="bg-purple-50" />
                        <KpiCard icon={Truck} label="Livrées" value={fmt(todayStats?.commandesLivrees)} color="text-teal-500" bg="bg-teal-50" />
                        <KpiCard icon={CreditCard} label="Payées" value={fmt(todayStats?.commandesPayees)} color="text-emerald-600" bg="bg-emerald-50" />
                    </div>
                )}
            </section>

            {/* ── OVERALL + STATUS BREAKDOWN ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overall KPIs */}
                <div className="bg-white border-2 border-laundry-sky/50 rounded-3xl p-6 space-y-5">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-laundry-primary" />
                        <p className="text-[10px] font-black text-laundry-deep/50 uppercase tracking-[0.2em]">Statistiques Globales</p>
                    </div>
                    {loading && !overall ? (
                        <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-laundry-primary" /></div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-laundry-sky/20 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-laundry-deep/30 uppercase tracking-widest">Total Commandes</p>
                                <p className="text-3xl font-black text-laundry-deep mt-1">{fmt(overall?.totalCommandes)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-emerald-600/50 uppercase tracking-widest">Total Revenus</p>
                                <p className="text-2xl font-black text-emerald-600 mt-1">{fmt(overall?.totalRevenues)} <span className="text-sm">DH</span></p>
                            </div>
                            <div className="bg-green-50 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-green-600/50 uppercase tracking-widest">Prêtes</p>
                                <p className="text-2xl font-black text-green-600 mt-1">{fmt(overall?.commandesPretes)}</p>
                            </div>
                            <div className="bg-blue-50 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-blue-600/50 uppercase tracking-widest">Payées</p>
                                <p className="text-2xl font-black text-blue-600 mt-1">{fmt(overall?.commandesPayees)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status breakdown */}
                <div className="bg-white border-2 border-laundry-sky/50 rounded-3xl p-6 space-y-5">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={18} className="text-laundry-primary" />
                        <p className="text-[10px] font-black text-laundry-deep/50 uppercase tracking-[0.2em]">Répartition par Statut</p>
                    </div>
                    {loading && !overall ? (
                        <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-laundry-primary" /></div>
                    ) : (
                        <StatusBreakdown data={overall?.commandesByStatus} total={overall?.totalCommandes} />
                    )}
                </div>
            </section>

            {/* ── CHART — LAST N DAYS ── */}
            <section className="bg-white border-2 border-laundry-sky/50 rounded-3xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={18} className="text-laundry-primary" />
                        <p className="text-[10px] font-black text-laundry-deep/50 uppercase tracking-[0.2em]">Activité — Derniers jours</p>
                    </div>
                    <div className="flex gap-2">
                        {[7, 14, 30].map(n => (
                            <button
                                key={n}
                                onClick={() => handleChartDaysChange(n)}
                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${chartDays === n ? 'bg-laundry-primary text-white' : 'bg-laundry-sky/30 text-laundry-deep/50 hover:bg-laundry-sky'}`}
                            >
                                {n}J
                            </button>
                        ))}
                    </div>
                </div>
                {loading && lastNDays.length === 0 ? (
                    <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-laundry-primary" /></div>
                ) : (
                    <MiniBarChart data={lastNDays} />
                )}
            </section>

            {/* ── DATE RANGE FILTER ── */}
            <section className="bg-white border-2 border-laundry-sky/50 rounded-3xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-laundry-primary" />
                    <p className="text-[10px] font-black text-laundry-deep/50 uppercase tracking-[0.2em]">Statistiques par Période</p>
                </div>

                {/* Date pickers */}
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-laundry-deep/30 uppercase tracking-widest">Date début</label>
                        <input
                            type="date"
                            value={dateDebut}
                            onChange={e => setDateDebut(e.target.value)}
                            className="bg-laundry-sky/20 border-2 border-laundry-sky focus:border-laundry-primary rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-laundry-deep/30 uppercase tracking-widest">Date fin</label>
                        <input
                            type="date"
                            value={dateFin}
                            onChange={e => setDateFin(e.target.value)}
                            className="bg-laundry-sky/20 border-2 border-laundry-sky focus:border-laundry-primary rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={handleDateRangeSearch}
                        disabled={loading}
                        className="flex items-center gap-2 bg-laundry-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-laundry-deep transition-colors disabled:opacity-50"
                    >
                        <ChevronDown size={14} />
                        Rechercher
                    </button>
                </div>

                {/* Date range results */}
                {dateApplied && (
                    loading && !dateRange ? (
                        <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-laundry-primary" /></div>
                    ) : dateRange ? (
                        <div className="pt-4 border-t border-laundry-sky/40 space-y-4">
                            <p className="text-[9px] font-black text-laundry-deep/30 uppercase tracking-widest">
                                Résultats: {dateRange.dateDebut} → {dateRange.dateFin}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <KpiCard icon={ClipboardList} label="Total commandes" value={fmt(dateRange.totalCommandes)} />
                                <KpiCard icon={DollarSign} label="Total revenus" value={`${fmt(dateRange.totalRevenues)} DH`} color="text-emerald-500" bg="bg-emerald-50" />
                                <KpiCard icon={PackageCheck} label="Prêtes" value={fmt(dateRange.commandesPretes)} color="text-green-500" bg="bg-green-50" />
                                <KpiCard icon={CreditCard} label="Payées" value={fmt(dateRange.commandesPayees)} color="text-teal-500" bg="bg-teal-50" />
                            </div>
                            {dateRange.commandesByStatus && (
                                <div className="bg-laundry-sky/10 rounded-2xl p-5">
                                    <p className="text-[9px] font-black text-laundry-deep/30 uppercase tracking-widest mb-4">Répartition</p>
                                    <StatusBreakdown data={dateRange.commandesByStatus} total={dateRange.totalCommandes} />
                                </div>
                            )}
                        </div>
                    ) : null
                )}
            </section>
        </div>
    );
}
