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

const STATUS_CFG = {
    en_attente: { label: 'En Attente', color: 'text-laundry-warning', bg: 'bg-laundry-warning-light', bar: 'bg-laundry-warning', Icon: Clock },
    validee: { label: 'Validée', color: 'text-laundry-primary-light', bg: 'bg-blue-50', bar: 'bg-laundry-primary-light', Icon: CheckCircle2 },
    en_traitement: { label: 'En Traitement', color: 'text-purple-600', bg: 'bg-purple-50', bar: 'bg-purple-500', Icon: Wrench },
    prete: { label: 'Prête', color: 'text-laundry-success', bg: 'bg-laundry-success-light', bar: 'bg-laundry-success', Icon: PackageCheck },
    livree: { label: 'Livrée', color: 'text-laundry-accent', bg: 'bg-cyan-50', bar: 'bg-laundry-accent', Icon: Truck },
    payee: { label: 'Payée', color: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-600', Icon: CreditCard },
    annulee: { label: 'Annulée', color: 'text-laundry-error', bg: 'bg-laundry-error-light', bar: 'bg-laundry-error', Icon: XCircle },
};

const fmt = (n) => (n ?? 0).toLocaleString('fr-MA');
const today = () => new Date().toISOString().split('T')[0];
const nDaysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
};

function KpiCard({ icon: Icon, label, value, sub, color = 'text-laundry-primary', bg = 'bg-blue-50' }) {
    return (
        <div className="bg-white rounded-xl shadow-card p-5 flex flex-col gap-4 hover:shadow-card-hover hover:-translate-y-1 transition-all border border-laundry-border">
            <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>
                <Icon size={20} className={color} />
            </div>
            <div>
                <p className="text-3xl font-bold text-laundry-text-primary">{value}</p>
                <p className="text-xs font-semibold text-laundry-text-muted uppercase tracking-wider mt-1">{label}</p>
                {sub && <p className="text-[10px] font-medium text-laundry-text-secondary mt-1">{sub}</p>}
            </div>
        </div>
    );
}

function StatusBreakdown({ data, total }) {
    if (!data || !total) return null;
    return (
        <div className="space-y-4">
            {Object.entries(data).map(([key, count]) => {
                const cfg = STATUS_CFG[key] || { label: key, color: 'text-laundry-text-secondary', bg: 'bg-gray-100', bar: 'bg-gray-400', Icon: ClipboardList };
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const Icon = cfg.Icon;
                return (
                    <div key={key} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <Icon size={14} className={cfg.color} />
                                <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                            </div>
                            <span className="text-sm font-bold text-laundry-text-primary">{count} <span className="text-laundry-text-muted text-xs font-medium">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-laundry-background rounded-full overflow-hidden">
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
        <div className="flex items-center justify-center h-40 text-laundry-text-muted">
            <p className="text-xs font-semibold uppercase tracking-widest">Aucune donnée</p>
        </div>
    );

    const maxCommandes = Math.max(...data.map(d => d.nombreCommandes || 0), 1);
    const maxRevenues = Math.max(...data.map(d => d.revenusTotal || 0), 1);

    return (
        <div className="mt-4">
            <div className="flex items-end gap-2 h-32">
                {data.map((d, i) => {
                    const heightPct = maxRevenues > 0 ? (d.revenusTotal / maxRevenues) * 100 : 0;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="w-full flex items-end justify-center h-full">
                                <div
                                    className="w-full max-w-[32px] bg-laundry-primary-light/40 hover:bg-laundry-primary rounded-sm transition-all duration-300"
                                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                                ></div>
                            </div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-laundry-text-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-modal z-10 whitespace-nowrap">
                                {fmt(d.revenusTotal)} DH
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-2 mt-2">
                {data.map((d, i) => {
                    const dotPct = maxCommandes > 0 ? (d.nombreCommandes / maxCommandes) * 100 : 0;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-laundry-accent" style={{ opacity: dotPct / 100 + 0.2 }} />
                            <p className="text-[9px] font-medium text-laundry-text-secondary text-center">
                                {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 border-t border-laundry-border pt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-laundry-primary-light/40" /><span className="text-xs font-medium text-laundry-text-secondary uppercase tracking-wider">Revenus</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-laundry-accent" /><span className="text-xs font-medium text-laundry-text-secondary uppercase tracking-wider">Commandes</span></div>
            </div>
        </div>
    );
}

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
        <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-laundry-primary">
                        Tableau de bord
                    </h1>
                    <p className="text-sm text-laundry-text-muted mt-1">
                        Vue d'ensemble et performances — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white border border-laundry-border text-laundry-text-secondary px-4 py-2 rounded-md text-sm font-medium hover:bg-laundry-background transition-colors disabled:opacity-50 shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Actualiser
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="flex items-center gap-3 bg-laundry-error-light border border-laundry-error/30 text-laundry-error px-4 py-3 rounded-md">
                    <AlertCircle size={18} />
                    <p className="text-sm font-medium">{typeof error === 'string' ? error : 'Une erreur est survenue'}</p>
                </div>
            )}

            {/* ── TODAY KPIs ── */}
            <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-laundry-text-muted mb-4">
                    Activité aujourd'hui
                </h2>
                {loading && !todayStats ? (
                    <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-laundry-primary" /></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard icon={ClipboardList} label="Commandes" value={fmt(todayStats?.totalCommandesToday)} color="text-laundry-primary" bg="bg-blue-50" />
                        <KpiCard icon={DollarSign} label="Revenus" value={`${fmt(todayStats?.revenuesToday)} DH`} color="text-laundry-success" bg="bg-laundry-success-light" />
                        <KpiCard icon={PackageCheck} label="Prêtes" value={fmt(todayStats?.commandesPretes)} color="text-laundry-success" bg="bg-laundry-success-light" />
                        <KpiCard icon={Clock} label="En attente" value={fmt(todayStats?.commandesEnAttente)} color="text-laundry-warning" bg="bg-laundry-warning-light" />
                    </div>
                )}
            </section>

            {/* ── OVERALL + STATUS BREAKDOWN ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-card border border-laundry-border p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-2 border-b border-laundry-border pb-4">
                        <TrendingUp size={18} className="text-laundry-text-muted" />
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-laundry-text-primary">Statistiques Globales</h2>
                    </div>
                    {loading && !overall ? (
                        <div className="flex justify-center py-8 flex-1 items-center"><Loader2 size={24} className="animate-spin text-laundry-primary" /></div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="bg-laundry-background rounded-lg p-4 border border-laundry-border">
                                <p className="text-xs font-semibold text-laundry-text-secondary uppercase tracking-wide">Total Commandes</p>
                                <p className="text-2xl font-bold text-laundry-text-primary mt-2">{fmt(overall?.totalCommandes)}</p>
                            </div>
                            <div className="bg-laundry-success-light rounded-lg p-4 border border-laundry-success/20">
                                <p className="text-xs font-semibold text-laundry-success uppercase tracking-wide">Total Revenus</p>
                                <p className="text-2xl font-bold text-laundry-success mt-2">{fmt(overall?.totalRevenues)} <span className="text-sm">DH</span></p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 border border-laundry-primary-light/20">
                                <p className="text-xs font-semibold text-laundry-primary-light uppercase tracking-wide">Prêtes</p>
                                <p className="text-2xl font-bold text-laundry-primary-light mt-2">{fmt(overall?.commandesPretes)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Payées</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-2">{fmt(overall?.commandesPayees)}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-card border border-laundry-border p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-2 border-b border-laundry-border pb-4">
                        <BarChart3 size={18} className="text-laundry-text-muted" />
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-laundry-text-primary">Répartition par Statut</h2>
                    </div>
                    {loading && !overall ? (
                        <div className="flex justify-center py-8 flex-1 items-center"><Loader2 size={24} className="animate-spin text-laundry-primary" /></div>
                    ) : (
                        <div className="flex-1">
                            <StatusBreakdown data={overall?.commandesByStatus} total={overall?.totalCommandes} />
                        </div>
                    )}
                </div>
            </section>

            {/* ── CHART — LAST N DAYS ── */}
            <section className="bg-white rounded-xl shadow-card border border-laundry-border p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-laundry-border pb-4 mb-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={18} className="text-laundry-text-muted" />
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-laundry-text-primary">Activité Récente</h2>
                    </div>
                    <div className="flex bg-laundry-background p-1 rounded-md border border-laundry-border">
                        {[7, 14, 30].map(n => (
                            <button
                                key={n}
                                onClick={() => handleChartDaysChange(n)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded ${chartDays === n ? 'bg-white text-laundry-primary shadow-sm' : 'text-laundry-text-secondary hover:text-laundry-text-primary'} transition-all`}
                            >
                                {n} Jours
                            </button>
                        ))}
                    </div>
                </div>
                {loading && lastNDays.length === 0 ? (
                    <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-laundry-primary" /></div>
                ) : (
                    <MiniBarChart data={lastNDays} />
                )}
            </section>

            {/* ── DATE RANGE FILTER ── */}
            <section className="bg-white rounded-xl shadow-card border border-laundry-border p-6">
                <div className="flex items-center gap-2 border-b border-laundry-border pb-4 mb-6">
                    <Calendar size={18} className="text-laundry-text-muted" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-laundry-text-primary">Rapport paramétrable</h2>
                </div>

                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                        <label className="text-xs font-semibold text-laundry-text-secondary">Date début</label>
                        <input
                            type="date"
                            value={dateDebut}
                            onChange={e => setDateDebut(e.target.value)}
                            className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary rounded-md px-3 py-2 text-sm font-medium outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                        <label className="text-xs font-semibold text-laundry-text-secondary">Date fin</label>
                        <input
                            type="date"
                            value={dateFin}
                            onChange={e => setDateFin(e.target.value)}
                            className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary rounded-md px-3 py-2 text-sm font-medium outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={handleDateRangeSearch}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-laundry-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-laundry-primary-light transition-colors disabled:opacity-50 shadow-sm h-[38px] w-full sm:w-auto"
                    >
                        <ChevronDown size={16} />
                        Analyser
                    </button>
                </div>

                {dateApplied && (
                    loading && !dateRange ? (
                        <div className="flex justify-center py-8 mt-6 border-t border-laundry-border"><Loader2 size={24} className="animate-spin text-laundry-primary" /></div>
                    ) : dateRange ? (
                        <div className="mt-6 pt-6 border-t border-laundry-border space-y-6 animate-slide-up">
                            <p className="text-sm font-medium text-laundry-text-secondary bg-laundry-background inline-block px-3 py-1 rounded-md">
                                Période: {dateRange.dateDebut} <span className="mx-2">→</span> {dateRange.dateFin}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <KpiCard icon={ClipboardList} label="Commandes" value={fmt(dateRange.totalCommandes)} />
                                <KpiCard icon={DollarSign} label="Revenus" value={`${fmt(dateRange.totalRevenues)} DH`} color="text-laundry-success" bg="bg-laundry-success-light" />
                                <KpiCard icon={PackageCheck} label="Prêtes" value={fmt(dateRange.commandesPretes)} color="text-emerald-600" bg="bg-emerald-50" />
                                <KpiCard icon={CreditCard} label="Payées" value={fmt(dateRange.commandesPayees)} color="text-laundry-accent" bg="bg-cyan-50" />
                            </div>
                            {dateRange.commandesByStatus && (
                                <div className="bg-laundry-background rounded-lg p-5 border border-laundry-border">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-laundry-text-primary mb-4">Répartition</p>
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
