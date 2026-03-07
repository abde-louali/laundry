import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    getTodayStatistics,
    getOverallStatistics,
    getStatisticsByDateRange,
    getDailyStatistics,
    getLastNDaysStatistics,
    getStatisticsByLivreur,
} from "./statisticsService";

export const fetchTodayStatistics = createAsyncThunk(
    'statistics/fetchToday',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getTodayStatistics();
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchOverallStatistics = createAsyncThunk(
    'statistics/fetchOverall',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getOverallStatistics();
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchStatisticsByDateRange = createAsyncThunk(
    'statistics/fetchByDateRange',
    async ({ dateDebut, dateFin }, { rejectWithValue }) => {
        try {
            const res = await getStatisticsByDateRange({ dateDebut, dateFin });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchDailyStatistics = createAsyncThunk(
    'statistics/fetchDaily',
    async (date, { rejectWithValue }) => {
        try {
            const res = await getDailyStatistics(date);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchLastNDaysStatistics = createAsyncThunk(
    'statistics/fetchLastNDays',
    async (days = 7, { rejectWithValue }) => {
        try {
            const res = await getLastNDaysStatistics(days);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchStatisticsByLivreur = createAsyncThunk(
    'statistics/fetchByLivreur',
    async ({ livreurId, dateDebut, dateFin }, { rejectWithValue }) => {
        try {
            const res = await getStatisticsByLivreur({ livreurId, dateDebut, dateFin });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
