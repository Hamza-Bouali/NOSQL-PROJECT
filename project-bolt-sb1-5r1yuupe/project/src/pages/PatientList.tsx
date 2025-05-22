import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import PatientListComponent from '../components/PatientList/PatientList';
import { getAllPatients } from '../firebase/patients';
import { useLoading } from '../App';
import Alert from '../components/UI/Alert';

const PatientList: React.FC = () => {
  const { isLoading, setLoading } = useLoading(); // Use isLoading from the context
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true); // Show loading spinner
      setError(null);

      try {
        const patientsData = await getAllPatients();
        setPatients(patientsData);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Une erreur est survenue lors du chargement des patients.');
      } finally {
        setLoading(false); // Hide loading spinner
      }
    };

    fetchPatients();
  }, [setLoading]);

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <Layout>
      {isLoading ? <div className="flex justify-center items-center h-64">Loading...</div> : <PatientListComponent patients={patients} />}
    </Layout>
  );
};

export default PatientList;