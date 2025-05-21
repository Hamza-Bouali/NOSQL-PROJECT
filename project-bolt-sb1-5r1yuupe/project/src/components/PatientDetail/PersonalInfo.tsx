import React, { useState } from 'react';
import { Patient } from '../../types';
import { updatePatient } from '../../firebase/patients';
import { Edit2, Mail, Phone, MapPin, Calendar, Droplet, Activity } from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import { useForm } from 'react-hook-form';
import Alert from '../UI/Alert';

interface PersonalInfoProps {
  patient: Patient;
  onPatientUpdate: (updatedPatient: Patient) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ patient, onPatientUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<Patient>({
    defaultValues: {
      name: patient.name,
      birthdate: patient.birthdate,
      gender: patient.gender,
      blood_type: patient.blood_type,
      chronic_conditions: patient.chronic_conditions,
      email: patient.email,
      phone: patient.phone,
      address: patient.address
    }
  });
  
  const onSubmit = async (data: Patient) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!patient.id) throw new Error("ID du patient manquant");
      
      await updatePatient(patient.id, data);
      
      const updatedPatient = {
        ...patient,
        ...data
      };
      
      onPatientUpdate(updatedPatient);
      setSuccess("Informations mises à jour avec succès.");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating patient:", err);
      setError("Une erreur est survenue lors de la mise à jour des informations.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate age from birthdate
  const getAge = (birthdate: string): number => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
        <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
        <Button
          variant="outline"
          size="sm"
          icon={<Edit2 className="h-4 w-4" />}
          onClick={() => setIsEditing(true)}
        >
          Modifier
        </Button>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
            <dd className="mt-1 text-lg font-medium text-gray-900">{patient.name}</dd>
          </div>
          
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500">Genre</dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.gender}</dd>
          </div>
          
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              Date de naissance
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(patient.birthdate).toLocaleDateString()} ({getAge(patient.birthdate)} ans)
            </dd>
          </div>
          
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Droplet className="h-4 w-4 mr-1 text-gray-400" />
              Groupe sanguin
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {patient.blood_type}
              </span>
            </dd>
          </div>
          
          <div className="col-span-2">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Activity className="h-4 w-4 mr-1 text-gray-400" />
              Conditions chroniques
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.chronic_conditions || "Aucune"}</dd>
          </div>
          
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Mail className="h-4 w-4 mr-1 text-gray-400" />
              Email
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.email}</dd>
          </div>
          
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Phone className="h-4 w-4 mr-1 text-gray-400" />
              Téléphone
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{patient.phone}</dd>
          </div>
          
          <div className="col-span-2">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              Adresse
            </dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{patient.address}</dd>
          </div>
        </dl>
      </div>
      
      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Modifier les informations personnelles"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              isLoading={isLoading}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.name ? 'border-red-300' : ''}`}
              {...register("name", { required: "Le nom est requis" })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Genre
              </label>
              <select
                id="gender"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("gender")}
              >
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                Date de naissance
              </label>
              <input
                type="date"
                id="birthdate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("birthdate")}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
                Groupe sanguin
              </label>
              <select
                id="blood_type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("blood_type")}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="chronic_conditions" className="block text-sm font-medium text-gray-700">
                Conditions chroniques
              </label>
              <input
                type="text"
                id="chronic_conditions"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("chronic_conditions")}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.email ? 'border-red-300' : ''}`}
                {...register("email", { 
                  required: "L'email est requis",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Adresse email invalide"
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register("phone")}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <textarea
              id="address"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("address")}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PersonalInfo;