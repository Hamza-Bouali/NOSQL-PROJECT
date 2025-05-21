import React, { useState } from 'react';
import { Patient, MedicalRecord } from '../../types';
import { addMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '../../firebase/patients';
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronUp, Thermometer, Activity, Heart } from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import { useForm } from 'react-hook-form';
import Alert from '../UI/Alert';
import { formatDate } from '../../utils/formatters';

interface MedicalRecordsProps {
  patient: Patient;
  onPatientUpdate: (updatedPatient: Patient) => void;
}

const MedicalRecords: React.FC<MedicalRecordsProps> = ({ patient, onPatientUpdate }) => {
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MedicalRecord | null>(null);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<MedicalRecord>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      symptoms: [],
      diagnosis: '',
      prescription: '',
      temperature: 37.0,
      pulse: 80,
      blood_pressure: '120/80'
    }
  });
  
  const toggleRecordExpansion = (recordId: string | undefined) => {
    if (!recordId) return;
    
    const newExpandedRecords = new Set(expandedRecords);
    if (expandedRecords.has(recordId)) {
      newExpandedRecords.delete(recordId);
    } else {
      newExpandedRecords.add(recordId);
    }
    setExpandedRecords(newExpandedRecords);
  };
  
  const handleAddRecord = async (data: MedicalRecord) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!patient.id) throw new Error("ID du patient manquant");
      
      // Convert symptoms string to array
      const processedData = {
        ...data,
        symptoms: data.symptoms || []
      };
      
      if (typeof processedData.symptoms === 'string') {
        processedData.symptoms = (processedData.symptoms as unknown as string)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
      
      await addMedicalRecord(patient.id, processedData);
      
      // Create a new record with a temporary ID
      const newRecord = {
        ...processedData,
        id: crypto.randomUUID() // This will be replaced with the ID from Firestore
      };
      
      // Update the local state
      const updatedPatient = {
        ...patient,
        records: [...patient.records, newRecord]
      };
      
      onPatientUpdate(updatedPatient);
      setSuccess("Rapport médical ajouté avec succès.");
      reset();
      setIsAddingRecord(false);
    } catch (err) {
      console.error("Error adding medical record:", err);
      setError("Une erreur est survenue lors de l'ajout du rapport médical.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateRecord = async (data: MedicalRecord) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!patient.id) throw new Error("ID du patient manquant");
      if (!editingRecord?.id) throw new Error("ID du rapport manquant");
      
      // Convert symptoms string to array
      const processedData = {
        ...data,
        symptoms: data.symptoms || []
      };
      
      if (typeof processedData.symptoms === 'string') {
        processedData.symptoms = (processedData.symptoms as unknown as string)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
      
      await updateMedicalRecord(patient.id, editingRecord.id, processedData);
      
      // Update the local state
      const updatedRecords = patient.records.map(record => {
        if (record.id === editingRecord.id) {
          return {
            ...record,
            ...processedData
          };
        }
        return record;
      });
      
      const updatedPatient = {
        ...patient,
        records: updatedRecords
      };
      
      onPatientUpdate(updatedPatient);
      setSuccess("Rapport médical mis à jour avec succès.");
      setEditingRecord(null);
    } catch (err) {
      console.error("Error updating medical record:", err);
      setError("Une erreur est survenue lors de la mise à jour du rapport médical.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteRecord = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!patient.id) throw new Error("ID du patient manquant");
      if (!deletingRecord?.id) throw new Error("ID du rapport manquant");
      
      await deleteMedicalRecord(patient.id, deletingRecord.id);
      
      // Update the local state
      const updatedRecords = patient.records.filter(record => record.id !== deletingRecord.id);
      
      const updatedPatient = {
        ...patient,
        records: updatedRecords
      };
      
      onPatientUpdate(updatedPatient);
      setSuccess("Rapport médical supprimé avec succès.");
      setDeletingRecord(null);
    } catch (err) {
      console.error("Error deleting medical record:", err);
      setError("Une erreur est survenue lors de la suppression du rapport médical.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const openAddRecordModal = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      symptoms: [],
      diagnosis: '',
      prescription: '',
      temperature: 37.0,
      pulse: 80,
      blood_pressure: '120/80'
    });
    setIsAddingRecord(true);
  };
  
  const openEditRecordModal = (record: MedicalRecord) => {
    // Convert symptoms array to comma-separated string for the form
    const symptomsString = Array.isArray(record.symptoms) 
      ? record.symptoms.join(', ') 
      : record.symptoms;
    
    reset({
      ...record,
      symptoms: symptomsString as unknown as string[]
    });
    
    setEditingRecord(record);
  };
  
  // Group records by year
  const groupRecordsByYear = () => {
    const groups: Record<string, MedicalRecord[]> = {};
    
    if (!patient.records || patient.records.length === 0) {
      return groups;
    }
    
    // Sort records by date (newest first)
    const sortedRecords = [...patient.records].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    sortedRecords.forEach(record => {
      const year = new Date(record.date).getFullYear().toString();
      
      if (!groups[year]) {
        groups[year] = [];
      }
      
      groups[year].push(record);
    });
    
    return groups;
  };
  
  const recordGroups = groupRecordsByYear();
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
      {success && (
        <Alert 
          type="success" 
          message={success} 
          onClose={() => setSuccess(null)}
          autoClose={true}
        />
      )}
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)}
        />
      )}
      
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Rapports médicaux ({patient.records.length})
        </h3>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusCircle className="h-4 w-4" />}
          onClick={openAddRecordModal}
        >
          Ajouter
        </Button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {Object.keys(recordGroups).length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucun rapport médical disponible.
          </div>
        ) : (
          Object.entries(recordGroups).map(([year, records]) => (
            <div key={year} className="divide-y divide-gray-100">
              <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
                {year}
              </div>
              {records.map((record) => (
                <div key={record.id} className="px-4 py-4 sm:px-6">
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleRecordExpansion(record.id)}
                  >
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 mr-2">
                          {formatDate(record.date)}
                        </p>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {record.diagnosis}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                        {Array.isArray(record.symptoms) 
                          ? record.symptoms.join(', ') 
                          : record.symptoms}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditRecordModal(record);
                        }}
                        className="text-gray-400 hover:text-blue-600 mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingRecord(record);
                        }}
                        className="text-gray-400 hover:text-red-600 mr-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {expandedRecords.has(record.id || '') ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedRecords.has(record.id || '') && (
                    <div className="mt-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center">
                          <Thermometer className="h-4 w-4 text-red-500 mr-1" />
                          <span className="font-medium mr-1">Température:</span>
                          {record.temperature}°C
                        </div>
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 text-green-500 mr-1" />
                          <span className="font-medium mr-1">Pouls:</span>
                          {record.pulse} bpm
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 text-red-500 mr-1" />
                          <span className="font-medium mr-1">Tension:</span>
                          {record.blood_pressure}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Symptômes:</span>{' '}
                          {Array.isArray(record.symptoms) 
                            ? record.symptoms.join(', ') 
                            : record.symptoms}
                        </p>
                        <p>
                          <span className="font-medium">Diagnostic:</span>{' '}
                          {record.diagnosis}
                        </p>
                        <p>
                          <span className="font-medium">Prescription:</span>{' '}
                          {record.prescription}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      {/* Add Record Modal */}
      <Modal
        isOpen={isAddingRecord}
        onClose={() => setIsAddingRecord(false)}
        title="Ajouter un rapport médical"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddingRecord(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(handleAddRecord)}
              isLoading={isLoading}
            >
              Ajouter
            </Button>
          </>
        }
      >
        <form className="space-y-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date de consultation
            </label>
            <input
              type="date"
              id="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("date", { required: "La date est requise" })}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                Température (°C)
              </label>
              <input
                type="number"
                step="0.1"
                id="temperature"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("temperature", { 
                  valueAsNumber: true,
                  min: {
                    value: 34,
                    message: "La température doit être supérieure à 34°C"
                  },
                  max: {
                    value: 43,
                    message: "La température doit être inférieure à 43°C"
                  }
                })}
              />
              {errors.temperature && (
                <p className="mt-1 text-sm text-red-600">{errors.temperature.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="pulse" className="block text-sm font-medium text-gray-700">
                Pouls (bpm)
              </label>
              <input
                type="number"
                id="pulse"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("pulse", { 
                  valueAsNumber: true,
                  min: {
                    value: 30,
                    message: "Le pouls doit être supérieur à 30 bpm"
                  },
                  max: {
                    value: 220,
                    message: "Le pouls doit être inférieur à 220 bpm"
                  }
                })}
              />
              {errors.pulse && (
                <p className="mt-1 text-sm text-red-600">{errors.pulse.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="blood_pressure" className="block text-sm font-medium text-gray-700">
                Tension artérielle
              </label>
              <input
                type="text"
                id="blood_pressure"
                placeholder="120/80"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("blood_pressure", {
                  pattern: {
                    value: /^\d{2,3}\/\d{2,3}$/,
                    message: "Format invalide. Exemple: 120/80"
                  }
                })}
              />
              {errors.blood_pressure && (
                <p className="mt-1 text-sm text-red-600">{errors.blood_pressure.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
              Symptômes (séparés par des virgules)
            </label>
            <input
              type="text"
              id="symptoms"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="fièvre, toux, fatigue"
              {...register("symptoms")}
            />
          </div>
          
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
              Diagnostic
            </label>
            <input
              type="text"
              id="diagnosis"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("diagnosis", { required: "Le diagnostic est requis" })}
            />
            {errors.diagnosis && (
              <p className="mt-1 text-sm text-red-600">{errors.diagnosis.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="prescription" className="block text-sm font-medium text-gray-700">
              Prescription
            </label>
            <textarea
              id="prescription"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("prescription")}
            />
          </div>
        </form>
      </Modal>
      
      {/* Edit Record Modal */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="Modifier le rapport médical"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setEditingRecord(null)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(handleUpdateRecord)}
              isLoading={isLoading}
            >
              Mettre à jour
            </Button>
          </>
        }
      >
        <form className="space-y-6">
          <div>
            <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">
              Date de consultation
            </label>
            <input
              type="date"
              id="edit-date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("date", { required: "La date est requise" })}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="edit-temperature" className="block text-sm font-medium text-gray-700">
                Température (°C)
              </label>
              <input
                type="number"
                step="0.1"
                id="edit-temperature"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("temperature", { 
                  valueAsNumber: true,
                  min: {
                    value: 34,
                    message: "La température doit être supérieure à 34°C"
                  },
                  max: {
                    value: 43,
                    message: "La température doit être inférieure à 43°C"
                  }
                })}
              />
              {errors.temperature && (
                <p className="mt-1 text-sm text-red-600">{errors.temperature.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="edit-pulse" className="block text-sm font-medium text-gray-700">
                Pouls (bpm)
              </label>
              <input
                type="number"
                id="edit-pulse"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("pulse", { 
                  valueAsNumber: true,
                  min: {
                    value: 30,
                    message: "Le pouls doit être supérieur à 30 bpm"
                  },
                  max: {
                    value: 220,
                    message: "Le pouls doit être inférieur à 220 bpm"
                  }
                })}
              />
              {errors.pulse && (
                <p className="mt-1 text-sm text-red-600">{errors.pulse.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="edit-blood_pressure" className="block text-sm font-medium text-gray-700">
                Tension artérielle
              </label>
              <input
                type="text"
                id="edit-blood_pressure"
                placeholder="120/80"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("blood_pressure", {
                  pattern: {
                    value: /^\d{2,3}\/\d{2,3}$/,
                    message: "Format invalide. Exemple: 120/80"
                  }
                })}
              />
              {errors.blood_pressure && (
                <p className="mt-1 text-sm text-red-600">{errors.blood_pressure.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="edit-symptoms" className="block text-sm font-medium text-gray-700">
              Symptômes (séparés par des virgules)
            </label>
            <input
              type="text"
              id="edit-symptoms"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="fièvre, toux, fatigue"
              {...register("symptoms")}
            />
          </div>
          
          <div>
            <label htmlFor="edit-diagnosis" className="block text-sm font-medium text-gray-700">
              Diagnostic
            </label>
            <input
              type="text"
              id="edit-diagnosis"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("diagnosis", { required: "Le diagnostic est requis" })}
            />
            {errors.diagnosis && (
              <p className="mt-1 text-sm text-red-600">{errors.diagnosis.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="edit-prescription" className="block text-sm font-medium text-gray-700">
              Prescription
            </label>
            <textarea
              id="edit-prescription"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("prescription")}
            />
          </div>
        </form>
      </Modal>
      
      {/* Delete Record Confirmation Modal */}
      <Modal
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        title="Confirmer la suppression"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeletingRecord(null)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteRecord}
              isLoading={isLoading}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Êtes-vous sûr de vouloir supprimer le rapport médical du{' '}
          <span className="font-medium">{deletingRecord?.date}</span> ?
          Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
};

export default MedicalRecords;