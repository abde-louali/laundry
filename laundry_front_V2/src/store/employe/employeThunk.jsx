import { createAsyncThunk } from '@reduxjs/toolkit'
import {
    getAllCommandes,
    getCommandeById,
    patchCommandeStatus,
    patchTapisEtat
} from './employeService'

// ========== COMMANDE THUNKS ==========

export const fetchAllCommandes = createAsyncThunk(
    'employe/fetchAllCommandes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllCommandes()
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des commandes')
        }
    }
)

export const fetchCommandeById = createAsyncThunk(
    'employe/fetchCommandeById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await getCommandeById(id)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement de la commande')
        }
    }
)

export const updateCommandeStatus = createAsyncThunk(
    'employe/updateCommandeStatus',
    async ({ id, newStatus, commentaire }, { rejectWithValue }) => {
        try {
            const response = await patchCommandeStatus(id, { newStatus, commentaire })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du statut')
        }
    }
)

export const updateTapisEtat = createAsyncThunk(
    'employe/updateTapisEtat',
    async ({ tapisId, newEtat }, { rejectWithValue }) => {
        try {
            const response = await patchTapisEtat(tapisId, { newEtat })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Erreur lors de la mise à jour de l'état")
        }
    }
)
