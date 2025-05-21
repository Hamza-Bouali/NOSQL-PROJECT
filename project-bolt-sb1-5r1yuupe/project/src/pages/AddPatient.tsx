import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { addPatient } from '../firebase/patients';
import { Patient } from '../types';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout/Layout';
import Button from '../components/UI/Button';
import Alert from '../components/UI/Alert';

const AddPatient: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<Omit<Patient, 'id' | 'records' | 'appointments'>>({
    defaultValues: {
      name: '',
      birthdate: '',
      gender: 'Homme',
      blood_type: 'A+',
      chronic_conditions: '',
      email: '',
      phone: '',
      address: ''
    }
  });
  
  const onSubmit = async (data: Omit<Patient, 'id' | 'records' | 'appointments'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add empty arrays for records and appointments
      const patientData = {
        ...data,
        records: [],
        appointments: []
      };
      
      const patientId = await addPatient(patientData);
      navigate(`/patients/${patientId}`);
    } catch (err) {
      console.error("Error adding patient:", err);
      setError("Une erreur est survenue lors de l'ajout du patient.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour à la liste des patients
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Ajouter un nouveau patient
        </h1>
      </div>
      
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom complet *
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
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                Date de naissance *
              </label>
              <input
                type="date"
                id="birthdate"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.birthdate ? 'border-red-300' : ''}`}
                {...register("birthdate", { required: "La date de naissance est requise" })}
              />
              {errors.birthdate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthdate.message}</p>
              )}
            </div>
            
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
          </div>
          
          <div>
            <label htmlFor="chronic_conditions" className="block text-sm font-medium text-gray-700">
              Conditions chroniques
            </label>
            <input
              type="text"
              id="chronic_conditions"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Diabète, Hypertension, etc."
              {...register("chronic_conditions")}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.phone ? 'border-red-300' : ''}`}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
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
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isLoading}
            >
              Ajouter le patient
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddPatient;