import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { LogOut, Power } from 'lucide-react';
import { logoutThunk } from "../store/auth/authThunk";

const LogoutButton = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    navigate("/")
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all group/logout active:scale-95"
    >
      <Power size={18} strokeWidth={3} className="transition-transform group-hover/logout:rotate-12" />
      <span className="hidden min-[400px]:inline uppercase tracking-widest">Quitter</span>
    </button>
  );
}

export default LogoutButton