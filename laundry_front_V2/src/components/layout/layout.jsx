import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { selectCurrentUser } from '../../store/auth/authSelector';

const Layout = () => {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  // LOGIN PAGE STRUCTURAL EXEMPTION
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-row overflow-hidden">
      {/* 1. DESKTOP SIDEBAR */}
      {user && <Sidebar user={user} />}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* CONTEXTUAL TOP HEADER */}
        <Header />

        {/* SCROLLABLE CONTENT BODY */}
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 pb-32 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        {user && <BottomNav user={user} />}
      </div>
    </div>
  );
};

export default Layout;