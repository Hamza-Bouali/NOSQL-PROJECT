import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-slate-50 mt-auto border-t border-slate-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} MediRec. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;