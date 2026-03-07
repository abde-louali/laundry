import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, LogIn, Sparkles } from "lucide-react"
import logo from '../assets/logo.png'
import { login } from "../store/auth/authThunk"
import { selectCurrentUser } from "../store/auth/authSelector"

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const userFromStore = useSelector(selectCurrentUser)

    const [user, setUser] = useState({
        email: '',
        password: ''
    })

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)
        try {
            await dispatch(login(user)).unwrap()
        } catch (err) {
            setError("Identifiants invalides")
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!userFromStore?.role) return
        const paths = {
            admin: '/admin/dashboard',
            employe: '/employe/dashboard',
            livreur: '/livreur/dashboard'
        }
        navigate(paths[userFromStore.role] || '/unauthorized', { replace: true })
    }, [userFromStore, navigate])

    return (
        <div className="min-h-[calc(100vh-160px)] w-full flex items-center justify-center p-4 relative overflow-hidden bubble-bg">
            {/* DECORATIVE BUBBLES */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-laundry-fresh/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-laundry-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-[440px] z-10 animate-fade-in">
                <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl shadow-laundry-primary/10 border border-white/40">

                    {/* HEADER */}
                    <div className="p-8 sm:p-10 text-center space-y-4">
                        <div className="inline-flex p-4 bg-white rounded-3xl shadow-lg border border-laundry-sky animate-float">
                            <img src={logo} alt="Pure Clean" className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-black text-laundry-deep tracking-tighter uppercase">
                                Bienvenue
                            </h2>
                            <p className="text-laundry-primary font-bold text-xs sm:text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                <Sparkles size={14} className="animate-pulse" /> PURE CLEAN <Sparkles size={14} className="animate-pulse" />
                            </p>
                        </div>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="px-8 pb-10 sm:px-10 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs sm:text-sm font-bold border border-red-100 animate-shake text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-laundry-deep/60 px-1 uppercase tracking-widest">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-laundry-primary transition-colors group-focus-within:text-laundry-deep">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-laundry-sky rounded-2xl focus:border-laundry-primary focus:bg-white outline-none transition-all text-sm sm:text-base font-bold text-laundry-deep shadow-sm"
                                        placeholder="votre@email.com"
                                        value={user.email}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-[10px] font-black text-laundry-deep/60 uppercase tracking-widest">Mot de passe</label>
                                    <button type="button" className="text-[10px] text-laundry-primary hover:underline font-black uppercase tracking-widest">Oublié?</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-laundry-primary transition-colors group-focus-within:text-laundry-deep">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-laundry-sky rounded-2xl focus:border-laundry-primary focus:bg-white outline-none transition-all text-sm sm:text-base font-bold text-laundry-deep shadow-sm"
                                        placeholder="••••••••"
                                        value={user.password}
                                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-laundry-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-laundry-primary/30 hover:bg-laundry-deep hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={18} strokeWidth={3} />
                                    <span>Se Connecter</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
