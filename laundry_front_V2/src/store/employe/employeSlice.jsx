import { createSlice } from '@reduxjs/toolkit'
import {
    fetchAllCommandes,
    fetchCommandeById,
    updateCommandeStatus,
    updateTapisEtat
} from './employeThunk'

// Enum constants for use in components
export const COMMANDE_STATUS = {
    EN_ATTENTE: 'en_attente',
    VALIDEE: 'validee',
    EN_TRAITEMENT: 'en_traitement',
    PRETE: 'prete',
    LIVREE: 'livree',
    PAYEE: 'payee',
    ANNULEE: 'annulee'
}

export const TAPIS_ETAT = {
    EN_ATTENTE: 'en_attente',
    EN_NETTOYAGE: 'en_nettoyage',
    NETTOYE: 'nettoye',
    LIVRE: 'livre'
}

const initialState = {
    commandes: [],
    selectedCommande: null,

    loading: {
        commandes: false,
        selectedCommande: false,
        updateStatus: false,
        updateTapis: false
    },

    error: {
        commandes: null,
        selectedCommande: null,
        updateStatus: null,
        updateTapis: null
    }
}

const employeSlice = createSlice({
    name: 'employe',
    initialState,
    reducers: {
        clearSelectedCommande: (state) => {
            state.selectedCommande = null
        },
        clearErrors: (state) => {
            state.error = {
                commandes: null,
                selectedCommande: null,
                updateStatus: null,
                updateTapis: null
            }
        }
    },
    extraReducers: (builder) => {
        // ===== FETCH ALL COMMANDES =====
        builder
            .addCase(fetchAllCommandes.pending, (state) => {
                state.loading.commandes = true
                state.error.commandes = null
            })
            .addCase(fetchAllCommandes.fulfilled, (state, action) => {
                state.loading.commandes = false
                state.commandes = action.payload
            })
            .addCase(fetchAllCommandes.rejected, (state, action) => {
                state.loading.commandes = false
                state.error.commandes = action.payload
            })

        // ===== FETCH COMMANDE BY ID =====
        builder
            .addCase(fetchCommandeById.pending, (state) => {
                state.loading.selectedCommande = true
                state.error.selectedCommande = null
            })
            .addCase(fetchCommandeById.fulfilled, (state, action) => {
                state.loading.selectedCommande = false
                state.selectedCommande = action.payload
            })
            .addCase(fetchCommandeById.rejected, (state, action) => {
                state.loading.selectedCommande = false
                state.error.selectedCommande = action.payload
            })

        // ===== UPDATE COMMANDE STATUS =====
        builder
            .addCase(updateCommandeStatus.pending, (state) => {
                state.loading.updateStatus = true
                state.error.updateStatus = null
            })
            .addCase(updateCommandeStatus.fulfilled, (state, action) => {
                state.loading.updateStatus = false
                // Update in the list
                const idx = state.commandes.findIndex(c => c.id === action.payload.id)
                if (idx !== -1) state.commandes[idx] = action.payload
                // Update selected if it's the same
                if (state.selectedCommande?.id === action.payload.id) {
                    state.selectedCommande = { ...state.selectedCommande, ...action.payload }
                }
            })
            .addCase(updateCommandeStatus.rejected, (state, action) => {
                state.loading.updateStatus = false
                state.error.updateStatus = action.payload
            })

        // ===== UPDATE TAPIS ETAT =====
        builder
            .addCase(updateTapisEtat.pending, (state) => {
                state.loading.updateTapis = true
                state.error.updateTapis = null
            })
            .addCase(updateTapisEtat.fulfilled, (state, action) => {
                state.loading.updateTapis = false
                // Update tapis in selectedCommande
                if (state.selectedCommande) {
                    const tapisIdx = state.selectedCommande.commandeTapis?.findIndex(
                        t => t.id === action.payload.id
                    )
                    if (tapisIdx !== undefined && tapisIdx !== -1) {
                        state.selectedCommande.commandeTapis[tapisIdx] = action.payload
                    }
                }
            })
            .addCase(updateTapisEtat.rejected, (state, action) => {
                state.loading.updateTapis = false
                state.error.updateTapis = action.payload
            })
    }
})

export const { clearSelectedCommande, clearErrors } = employeSlice.actions
export default employeSlice.reducer



