import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ActivitySquare, Home, Plus, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  // Check if the current path matches
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-slate-50 shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600 flex items-center">
              <ActivitySquare className="mr-2" />
              MediRec
            </Link>
          </div>
          
          <nav className="hidden md:flex ml-10 items-center space-x-8">
            <Link 
              to="/"
              className={`${
                isActive('/') 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
              } px-1 pt-1 inline-flex items-center text-sm font-medium`}
            >
              <Home className="mr-1 h-4 w-4" />
              Patients
            </Link>
            
            <Link 
              to="/add-patient"
              className={`${
                isActive('/add-patient') 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
              } px-1 pt-1 inline-flex items-center text-sm font-medium`}
            >
              <Plus className="mr-1 h-4 w-4" />
              Nouveau patient
            </Link>
            
            <Link 
              to="/settings"
              className={`${
                isActive('/settings') 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
              } px-1 pt-1 inline-flex items-center text-sm font-medium`}
            >
              <Settings className="mr-1 h-4 w-4" />
              Paramètres
            </Link>
          </nav>
          
          <div className="md:hidden flex items-center">
            <button className="text-slate-600 hover:text-slate-900 focus:outline-none">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="hidden md:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            to="/"
            className={`${
              isActive('/') 
              ? 'bg-blue-50 border-blue-500 text-blue-700' 
              : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Patients
          </Link>
          
          <Link 
            to="/add-patient"
            className={`${
              isActive('/add-patient') 
              ? 'bg-blue-50 border-blue-500 text-blue-700' 
              : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Nouveau patient
          </Link>
          
          <Link 
            to="/settings"
            className={`${
              isActive('/settings') 
              ? 'bg-blue-50 border-blue-500 text-blue-700' 
              : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Paramètres
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;