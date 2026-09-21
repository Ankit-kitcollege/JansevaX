import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center space-y-4">
      <h1 className="text-6xl font-extrabold text-sky-500 font-heading">404</h1>
      <h2 className="text-xl font-bold text-white">Page Not Found</h2>
      <p className="text-xs text-slate-400">The requested page does not exist on JansevaX.</p>
      <Link to="/" className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors">
        Return to Home
      </Link>
    </div>
  );
}
