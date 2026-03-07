// src/store/livreur/livreurSelectors.js

// Selectors for easy access to state
export const selectPendingClient = (state) => state.livreur.pendingClient
export const selectSearchResult = (state) => state.livreur.searchResult
export const selectReadyForDelivery = (state) => state.livreur.readyForDelivery
export const selectCurrentOrder = (state) => state.livreur.currentOrder

// Loading selectors
export const selectLoading = (state) => state.livreur.loading
export const selectIsLoadingPendingClient = (state) => state.livreur.loading.pendingClient
export const selectIsLoadingSearch = (state) => state.livreur.loading.search
export const selectIsCreatingClient = (state) => state.livreur.loading.createClient
export const selectIsCreatingOrder = (state) => state.livreur.loading.createOrder
export const selectIsLoadingReadyForDelivery = (state) => state.livreur.loading.readyForDelivery

// Error selectors
export const selectErrors = (state) => state.livreur.error
export const selectPendingClientError = (state) => state.livreur.error.pendingClient
export const selectCreateClientError = (state) => state.livreur.error.createClient
export const selectCreateOrderError = (state) => state.livreur.error.createOrder

// Success flags
export const selectClientCreated = (state) => state.livreur.clientCreated
export const selectOrderCreated = (state) => state.livreur.orderCreated
export const selectPaymentRecorded = (state) => state.livreur.paymentRecorded