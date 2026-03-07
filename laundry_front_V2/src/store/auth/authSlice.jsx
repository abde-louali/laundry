import { createSlice } from "@reduxjs/toolkit";
const initstate = {
    user: null,
    token: null

}

const authSlice = createSlice({
    name: 'auth',
    initialState: initstate,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user
            state.token = token
        },

        logOut: () => ({
            user: null,
            token: null
        })
    }
})
export const { setCredentials, logOut } = authSlice.actions
export default authSlice.reducer
