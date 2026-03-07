// ─── Today Statistics ─────────────────────────────────────────────────────────
export const selectTodayStats = (state) => state.statistics.today;
export const selectTodayCommandesTotal = (state) => state.statistics.today?.totalCommandesToday ?? 0;
export const selectTodayRevenues = (state) => state.statistics.today?.revenuesToday ?? 0;
export const selectTodayEnAttente = (state) => state.statistics.today?.commandesEnAttente ?? 0;
export const selectTodayValidees = (state) => state.statistics.today?.commandesValidees ?? 0;
export const selectTodayEnTraitement = (state) => state.statistics.today?.commandesEnTraitement ?? 0;
export const selectTodayPretes = (state) => state.statistics.today?.commandesPretes ?? 0;
export const selectTodayLivrees = (state) => state.statistics.today?.commandesLivrees ?? 0;
export const selectTodayPayees = (state) => state.statistics.today?.commandesPayees ?? 0;

// ─── Overall Statistics ───────────────────────────────────────────────────────
export const selectOverallStats = (state) => state.statistics.overall;
export const selectOverallTotalCommandes = (state) => state.statistics.overall?.totalCommandes ?? 0;
export const selectOverallTotalRevenues = (state) => state.statistics.overall?.totalRevenues ?? 0;
export const selectOverallCommandesByStatus = (state) => state.statistics.overall?.commandesByStatus ?? {};
export const selectOverallEnAttente = (state) => state.statistics.overall?.commandesEnAttente ?? 0;
export const selectOverallValidees = (state) => state.statistics.overall?.commandesValidees ?? 0;
export const selectOverallEnTraitement = (state) => state.statistics.overall?.commandesEnTraitement ?? 0;
export const selectOverallPretes = (state) => state.statistics.overall?.commandesPretes ?? 0;
export const selectOverallLivrees = (state) => state.statistics.overall?.commandesLivrees ?? 0;
export const selectOverallPayees = (state) => state.statistics.overall?.commandesPayees ?? 0;

// ─── Date Range Statistics ────────────────────────────────────────────────────
export const selectDateRangeStats = (state) => state.statistics.dateRange;
export const selectDateRangeTotalCommandes = (state) => state.statistics.dateRange?.totalCommandes ?? 0;
export const selectDateRangeTotalRevenues = (state) => state.statistics.dateRange?.totalRevenues ?? 0;
export const selectDateRangeCommandesByStatus = (state) => state.statistics.dateRange?.commandesByStatus ?? {};

// ─── Daily Statistics ─────────────────────────────────────────────────────────
export const selectDailyStats = (state) => state.statistics.daily;

// ─── Last N Days Statistics ───────────────────────────────────────────────────
export const selectLastNDays = (state) => state.statistics.lastNDays;

// ─── Livreur Statistics ───────────────────────────────────────────────────────
export const selectLivreurStats = (state) => state.statistics.livreur;
export const selectLivreurTotalCommandes = (state) => state.statistics.livreur?.totalCommandes ?? 0;
export const selectLivreurTotalRevenues = (state) => state.statistics.livreur?.totalRevenues ?? 0;

// ─── Loading / Error ──────────────────────────────────────────────────────────
export const selectStatisticsLoading = (state) => state.statistics.loading;
export const selectStatisticsError = (state) => state.statistics.error;
