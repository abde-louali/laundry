import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setCredentials } from "../store/auth/authSlice"
import { refreshApi } from "../api/axios"  // ✅ Use refreshApi
import { jwtDecode } from "jwt-decode"


const PersistLogin = () => {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const verifyRefreshToken = async () => {
      try {
        const res = await refreshApi.post("/auth/refresh")
        const newToken = res.data.token
        const decoded = jwtDecode(newToken)
        if (isMounted) {
          dispatch(setCredentials({
            token: newToken,
            user: {
              id: decoded.sub,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role
            }
          }))
        }
      } catch (err) {
        console.log("=== Refresh failed ===", err.response?.status)
        if (err?.response?.status !== 401) {
          console.error("Unexpected refresh error:", err)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (!token) {
      verifyRefreshToken()
    } else {
      setLoading(false)
    }

    return () => { isMounted = false }
  }, [dispatch])

  if (loading) return <p>Loading...</p>
  return <Outlet />
}

export default PersistLogin
