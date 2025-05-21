import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { getPatientById, deletePatient } from '../firebase/patients';
import { Patient } from '../types';
import Layout from '../components/Layout/Layout';
import PersonalInfo from '../components/PatientDetail/PersonalInfo';
import MedicalRecords from '../components/PatientDetail/MedicalRecords';
import Appointments from '../components/PatientDetail/Appointments';
import Button from '../components/UI/Button';
import Spinner from '../components/UI/Spinner';
import Alert from '../components/UI/Alert';
import Modal from '../components/UI/Modal';

const PatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const patientData = await getPatientById(patientId);
        
        if (!patientData) {
          setError("Patient non trouvé");
          return;
        }
        
        setPatient(patientData);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError("Une erreur est survenue lors du chargement du patient");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatient();
  }, [patientId]);
  
  const handlePatientUpdate = (updatedPatient: Patient) => {
    setPatient(updatedPatient);
  };
  
  const handleDeletePatient = async () => {
    if (!patientId) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await deletePatient(patientId);
      setDeleteConfirmOpen(false);
      navigate('/', { replace: true });
    } catch (err) {
      console.error("Error deleting patient:", err);
      setDeleteError("Une erreur est survenue lors de la suppression du patient");
    } finally {
      setDeleteLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }
  
  if (error || !patient) {
    return (
      <Layout>
        <Alert
          type="error"
          message={error || "Patient non trouvé"}
        />
        <div className="mt-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour à la liste des patients
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour à la liste des patients
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {patient.name}
          </h1>
        </div>
        
        <Button
          variant="danger"
          icon={<Trash2 className="h-4 w-4" />}
          onClick={() => setDeleteConfirmOpen(true)}
        >
          Supprimer
        </Button>
      </div>
      
      <div className="space-y-6">
        <PersonalInfo patient={patient} onPatientUpdate={handlePatientUpdate} />
        <MedicalRecords patient={patient} onPatientUpdate={handlePatientUpdate} />
        <Appointments patient={patient} onPatientUpdate={handlePatientUpdate} />
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirmer la suppression"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePatient}
              isLoading={deleteLoading}
            >
              Supprimer
            </Button>
          </>
        }
      >
        {deleteError && (
          <Alert
            type="error"
            message={deleteError}
            className="mb-4"
          />
        )}
        
        <p className="text-sm text-gray-500">
          Êtes-vous sûr de vouloir supprimer définitivement le patient <strong>{patient.name}</strong> ? 
          Cette action supprimera également tous les rapports médicaux et rendez-vous associés à ce patient.
          Cette action est irréversible.
        </p>
      </Modal>
    </Layout>
  );
};

export default PatientDetail;