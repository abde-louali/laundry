import { api } from "../../api/axios";

// GET /admin/statistics/today
export const getTodayStatistics = async () => {
    return await api.get('/admin/statistics/today');
};

// GET /admin/statistics/overall
export const getOverallStatistics = async () => {
    return await api.get('/admin/statistics/overall');
};

// POST /admin/statistics/date-range
export const getStatisticsByDateRange = async ({ dateDebut, dateFin }) => {
    return await api.post('/admin/statistics/date-range', { dateDebut, dateFin });
};

// GET /admin/statistics/daily?date=YYYY-MM-DD
export const getDailyStatistics = async (date) => {
    return await api.get('/admin/statistics/daily', { params: { date } });
};

// GET /admin/statistics/last-days?days=N
export const getLastNDaysStatistics = async (days = 7) => {
    return await api.get('/admin/statistics/last-days', { params: { days } });
};

// GET /admin/statistics/livreur/{livreurId}?dateDebut=...&dateFin=...
export const getStatisticsByLivreur = async ({ livreurId, dateDebut, dateFin }) => {
    return await api.get(`/admin/statistics/livreur/${livreurId}`, {
        params: { dateDebut, dateFin }
    });
};
