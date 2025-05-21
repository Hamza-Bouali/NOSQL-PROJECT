import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Button from '../UI/Button';

interface SearchBarProps {
  onSearch: (term: string) => void;
  onFilter: (filter: { field: string; value: string }) => void;
  onClearFilter: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onFilter,
  onClearFilter 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{ field: string; value: string } | null>(null);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  const handleFilterSelect = (field: string, value: string) => {
    const filter = { field, value };
    setActiveFilter(filter);
    onFilter(filter);
    setShowFilterMenu(false);
  };
  
  const clearFilter = () => {
    setActiveFilter(null);
    onClearFilter();
  };
  
  return (
    <div className="w-full mb-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
        
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center"
            icon={<Filter className="h-4 w-4" />}
          >
            Filtrer
          </Button>
          
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <div className="px-4 py-2 text-xs text-gray-500 border-b">Filtrer par</div>
                <button
                  onClick={() => handleFilterSelect('gender', 'Homme')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Genre: Homme
                </button>
                <button
                  onClick={() => handleFilterSelect('gender', 'Femme')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Genre: Femme
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => handleFilterSelect('chronic_conditions', 'Diabète')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Condition: Diabète
                </button>
                <button
                  onClick={() => handleFilterSelect('chronic_conditions', 'Hypertension')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Condition: Hypertension
                </button>
                <button
                  onClick={() => handleFilterSelect('special', 'upcoming')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  RDV à venir
                </button>
              </div>
            </div>
          )}
        </div>
        
        <Button 
          variant="primary"
          onClick={handleSearch}
          className="sm:hidden"
        >
          Rechercher
        </Button>
      </div>
      
      {activeFilter && (
        <div className="mt-3 flex">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {activeFilter.field === 'gender' ? 'Genre: ' : 
             activeFilter.field === 'chronic_conditions' ? 'Condition: ' : 
             activeFilter.field === 'special' && activeFilter.value === 'upcoming' ? 'RDV à venir' : ''}
            {activeFilter.field !== 'special' && activeFilter.value}
            <button
              onClick={clearFilter}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;