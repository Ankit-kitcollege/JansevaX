import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import API from './api/axios';

export default function App() {
  useEffect(() => {
    // Non-blocking background warmup ping to wake up free Render container
    API.get('/reports').catch(() => {});
  }, []);

  return (

    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
            <Navbar />
            <main className="flex-1 px-4 md:px-8">
              <AppRoutes />
            </main>
            <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
              JansevaX &copy; 2026 — AI-Assisted GIS Civic Problem Intelligence Platform
            </footer>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
