import React, { useState } from 'react';
import { Patient, Appointment } from '../../types';
import { addAppointment, updateAppointment, deleteAppointment } from '../../firebase/patients';
import { PlusCircle, Edit, Trash2, Calendar, User, MapPin, Clock } from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import { useForm } from 'react-hook-form';
import Alert from '../UI/Alert';
import { formatDate } from '../../utils/formatters';

interface AppointmentsProps {
  patient: Patient;
  onPatientUpdate: (updatedPatient: Patient) => void;
}

const Appointments: React.FC<AppointmentsProps> = ({ patient, onPatientUpdate }) => {
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Appointment>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      doctor: '',
      department: '',
      status: 'Programmé',
      room: ''
    }
  });
  
  const openAddAppointmentModal = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      doctor: '',
      department: '',
      status: 'Programmé',
      room: ''
    });
    setIsAddingAppointment(true);
  };
  
  const openEditAppointmentModal = (appointment: Appointment) => {
    reset(appointment);
    setEditingAppointment(appointment);
  };
  
  const handleAddAppointment = async (data: Appointment) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!patient.id) throw new Error("ID du patient manquant");
      
      await addAppointment(patient.id, data);
      
      // Create a new appointment with temporary ID
      const newAppointment = {
        ...data,
        id: crypto.randomUUID() // This will be replaced with the ID from Firestore
      };
      
      // Update the local state
      const updatedPatient = {
        ...patient,
        appointments: [...patient.appointments, newAppointment]
      };
      
      onPatientUpdate(updatedPatient);
      setSuccess("Rendez-vous ajouté avec succès.");
      reset();
      setIsAddingAppointment(false);
    } catch (err) {
      console.error("Error adding appointment:", err);
      setError("Une erreur est survenue lors de l'ajout du rendez-vous.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateAppointment = async (data: Appointment) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!patient.id) throw new Error("ID du patient manquant");
      if (!editingAppointment?.id) throw new Error("ID du rendez-vous manquant");
      
      await updateAppointment(patient.id, editingAppointment.id, data);
      
      // Update the local state
      const updatedAppointments = patient.appointments.map(appointment => {
        if (appointment.id === editingAppointment.id) {
          return {
            ...appointment,
            ...data
          };
        }
        return appointment;
      });
      
      const updatedPatient = {
        ...patient,
        appointments: updatedAppointments
      };
      
      onPatientUpdate(updatedPatient);
      setSuccess("Rendez-vous mis à jour avec succès.");
      setEditingAppointment(null);
    } catch (err) {
      console.error("Error updating appointment:", err);
      setError("Une erreur est survenue lors de la mise à jour du rendez-vous.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAppointment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!patient.id) throw new Error("ID du patient manquant");
      if (!deletingAppointment?.id) throw new Error("ID du rendez-vous manquant");
      
      await deleteAppointment(patient.id, deletingAppointment.id);
      
      // Update the local state
      const updatedAppointments = patient.appointments.filter(
        appointment => appointment.id !== deletingAppointment.id
      );
      
      const updatedPatient = {
        ...patient,
        appointments: updatedAppointments
      };
      
      onPatientUpdate(updatedPatient);
      setSuccess("Rendez-vous supprimé avec succès.");
      setDeletingAppointment(null);
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError("Une erreur est survenue lors de la suppression du rendez-vous.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Programmé':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmé':
        return 'bg-green-100 text-green-800';
      case 'Terminé':
        return 'bg-gray-100 text-gray-800';
      case 'Annulé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Sort appointments by date (upcoming first, then past)
  const sortedAppointments = [...patient.appointments].sort((a, b) => {
    const today = new Date().toISOString().split('T')[0];
    const aDate = a.date;
    const bDate = b.date;
    
    // Both are upcoming or both are past
    if ((aDate >= today && bDate >= today) || (aDate < today && bDate < today)) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    
    // a is upcoming, b is past
    if (aDate >= today && bDate < today) {
      return -1;
    }
    
    // a is past, b is upcoming
    return 1;
  });
  
  // Group appointments by status
  const appointmentGroups = {
    upcoming: sortedAppointments.filter(
      appointment => appointment.date >= new Date().toISOString().split('T')[0] && 
                    appointment.status !== 'Annulé' && 
                    appointment.status !== 'Terminé'
    ),
    past: sortedAppointments.filter(
      appointment => appointment.date < new Date().toISOString().split('T')[0] || 
                    appointment.status === 'Terminé'
    ),
    cancelled: sortedAppointments.filter(
      appointment => appointment.status === 'Annulé'
    )
  };
  
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
          Rendez-vous ({patient.appointments.length})
        </h3>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusCircle className="h-4 w-4" />}
          onClick={openAddAppointmentModal}
        >
          Ajouter
        </Button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {patient.appointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucun rendez-vous disponible.
          </div>
        ) : (
          <>
            {/* Upcoming appointments */}
            {appointmentGroups.upcoming.length > 0 && (
              <div>
                <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
                  À venir
                </div>
                {appointmentGroups.upcoming.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                          <p className="text-sm font-medium text-blue-600">
                            {formatDate(appointment.date)}
                          </p>
                          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center text-sm text-gray-700">
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          {appointment.doctor}
                          {appointment.department && (
                            <span className="ml-1 text-gray-500">({appointment.department})</span>
                          )}
                        </div>
                        
                        {appointment.room && (
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            {appointment.room}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <button
                          onClick={() => openEditAppointmentModal(appointment)}
                          className="text-gray-400 hover:text-blue-600 mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingAppointment(appointment)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Past appointments */}
            {appointmentGroups.past.length > 0 && (
              <div>
                <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
                  Passés
                </div>
                {appointmentGroups.past.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-gray-600">
                            {formatDate(appointment.date)}
                          </p>
                          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center text-sm text-gray-700">
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          {appointment.doctor}
                          {appointment.department && (
                            <span className="ml-1 text-gray-500">({appointment.department})</span>
                          )}
                        </div>
                        
                        {appointment.room && (
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            {appointment.room}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <button
                          onClick={() => openEditAppointmentModal(appointment)}
                          className="text-gray-400 hover:text-blue-600 mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingAppointment(appointment)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Cancelled appointments */}
            {appointmentGroups.cancelled.length > 0 && (
              <div>
                <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
                  Annulés
                </div>
                {appointmentGroups.cancelled.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors opacity-75"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-gray-600 line-through">
                            {formatDate(appointment.date)}
                          </p>
                          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center text-sm text-gray-700">
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          {appointment.doctor}
                          {appointment.department && (
                            <span className="ml-1 text-gray-500">({appointment.department})</span>
                          )}
                        </div>
                        
                        {appointment.room && (
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            {appointment.room}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <button
                          onClick={() => openEditAppointmentModal(appointment)}
                          className="text-gray-400 hover:text-blue-600 mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingAppointment(appointment)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Add Appointment Modal */}
      <Modal
        isOpen={isAddingAppointment}
        onClose={() => setIsAddingAppointment(false)}
        title="Ajouter un rendez-vous"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddingAppointment(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(handleAddAppointment)}
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
              Date
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
          
          <div>
            <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
              Médecin
            </label>
            <input
              type="text"
              id="doctor"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("doctor", { required: "Le nom du médecin est requis" })}
            />
            {errors.doctor && (
              <p className="mt-1 text-sm text-red-600">{errors.doctor.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Service
            </label>
            <input
              type="text"
              id="department"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("department")}
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="status"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("status")}
            >
              <option value="Programmé">Programmé</option>
              <option value="Confirmé">Confirmé</option>
              <option value="Terminé">Terminé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="room" className="block text-sm font-medium text-gray-700">
              Salle / Lieu
            </label>
            <input
              type="text"
              id="room"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("room")}
            />
          </div>
        </form>
      </Modal>
      
      {/* Edit Appointment Modal */}
      <Modal
        isOpen={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
        title="Modifier le rendez-vous"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setEditingAppointment(null)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(handleUpdateAppointment)}
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
              Date
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
          
          <div>
            <label htmlFor="edit-doctor" className="block text-sm font-medium text-gray-700">
              Médecin
            </label>
            <input
              type="text"
              id="edit-doctor"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("doctor", { required: "Le nom du médecin est requis" })}
            />
            {errors.doctor && (
              <p className="mt-1 text-sm text-red-600">{errors.doctor.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">
              Service
            </label>
            <input
              type="text"
              id="edit-department"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("department")}
            />
          </div>
          
          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="edit-status"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("status")}
            >
              <option value="Programmé">Programmé</option>
              <option value="Confirmé">Confirmé</option>
              <option value="Terminé">Terminé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="edit-room" className="block text-sm font-medium text-gray-700">
              Salle / Lieu
            </label>
            <input
              type="text"
              id="edit-room"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              {...register("room")}
            />
          </div>
        </form>
      </Modal>
      
      {/* Delete Appointment Confirmation Modal */}
      <Modal
        isOpen={!!deletingAppointment}
        onClose={() => setDeletingAppointment(null)}
        title="Confirmer la suppression"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeletingAppointment(null)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAppointment}
              isLoading={isLoading}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Êtes-vous sûr de vouloir supprimer le rendez-vous du{' '}
          <span className="font-medium">{deletingAppointment?.date}</span> ?
          Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
};

export default Appointments;