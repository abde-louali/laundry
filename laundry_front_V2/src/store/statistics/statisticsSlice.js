import { createSlice } from "@reduxjs/toolkit";
import {
    fetchTodayStatistics,
    fetchOverallStatistics,
    fetchStatisticsByDateRange,
    fetchDailyStatistics,
    fetchLastNDaysStatistics,
    fetchStatisticsByLivreur,
} from "./statisticsThunks";

const initialState = {
    // Today stats (StatisticsDTO with today-specific fields)
    today: null,
    // Overall stats (StatisticsDTO with global aggregates)
    overall: null,
    // Date-range stats (StatisticsDTO)
    dateRange: null,
    // Single day stats (DailyStatisticsDTO)
    daily: null,
    // Last N days (Array<DailyStatisticsDTO>)
    lastNDays: [],
    // Livreur stats (StatisticsDTO)
    livreur: null,

    loading: false,
    error: null,
};

const statisticsSlice = createSlice({
    name: 'statistics',
    initialState,
    reducers: {
        clearStatisticsError: (state) => {
            state.error = null;
        },
        clearDateRangeStats: (state) => {
            state.dateRange = null;
        },
        clearLivreurStats: (state) => {
            state.livreur = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- TODAY ---
            .addCase(fetchTodayStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTodayStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.today = action.payload;
            })
            .addCase(fetchTodayStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Erreur statistiques aujourd'hui";
            })

            // --- OVERALL ---
            .addCase(fetchOverallStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOverallStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.overall = action.payload;
            })
            .addCase(fetchOverallStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Erreur statistiques globales";
            })

            // --- DATE RANGE ---
            .addCase(fetchStatisticsByDateRange.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStatisticsByDateRange.fulfilled, (state, action) => {
                state.loading = false;
                state.dateRange = action.payload;
            })
            .addCase(fetchStatisticsByDateRange.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Erreur statistiques par période";
            })

            // --- DAILY ---
            .addCase(fetchDailyStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDailyStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.daily = action.payload;
            })
            .addCase(fetchDailyStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Erreur statistiques journalières";
            })

            // --- LAST N DAYS ---
            .addCase(fetchLastNDaysStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLastNDaysStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.lastNDays = action.payload;
            })
            .addCase(fetchLastNDaysStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Erreur historique N jours";
            })

            // --- LIVREUR ---
            .addCase(fetchStatisticsByLivreur.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStatisticsByLivreur.fulfilled, (state, action) => {
                state.loading = false;
                state.livreur = action.payload;
            })
            .addCase(fetchStatisticsByLivreur.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Erreur statistiques livreur";
            });
    },
});

export const { clearStatisticsError, clearDateRangeStats, clearLivreurStats } = statisticsSlice.actions;
export default statisticsSlice.reducer;
