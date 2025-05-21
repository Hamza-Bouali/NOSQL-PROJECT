import React, { useState, useEffect } from 'react';
import { getAllPatients, searchPatients, getPatientsWithUpcomingAppointments } from '../../firebase/patients';
import { Patient } from '../../types';
import PatientCard from './PatientCard';
import SearchBar from './SearchBar';
import Spinner from '../UI/Spinner';
import Alert from '../UI/Alert';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ field: string; value: string } | null>(null);
  
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const loadPatients = () => {
      setLoading(true);
      setError(null);
      
      try {
        if (filter) {
          if (filter.field === 'special' && filter.value === 'upcoming') {
            unsubscribe = getPatientsWithUpcomingAppointments(setPatients);
          } else {
            unsubscribe = searchPatients(
              filter.value, 
              filter.field as 'name' | 'gender' | 'chronic_conditions', 
              setPatients
            );
          }
        } else {
          unsubscribe = getAllPatients(setPatients);
        }
      } catch (err) {
        console.error("Error loading patients:", err);
        setError("Une erreur est survenue lors du chargement des patients.");
      } finally {
        setLoading(false);
      }
    };
    
    loadPatients();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [filter]);
  
  const handleSearch = (term: string) => {
    if (term.trim() === '') {
      setFilter(null);
      return;
    }
    
    setFilter({ field: 'name', value: term });
  };
  
  const handleFilter = (newFilter: { field: string; value: string }) => {
    setFilter(newFilter);
  };
  
  const handleClearFilter = () => {
    setFilter(null);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return <Alert type="error" message={error} />;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Patients</h1>
        
        <Link 
          to="/add-patient"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nouveau patient
        </Link>
      </div>
      
      <SearchBar 
        onSearch={handleSearch} 
        onFilter={handleFilter}
        onClearFilter={handleClearFilter}
      />
      
      {patients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">Aucun patient trouvé.</p>
          {filter && (
            <button 
              onClick={handleClearFilter}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList;