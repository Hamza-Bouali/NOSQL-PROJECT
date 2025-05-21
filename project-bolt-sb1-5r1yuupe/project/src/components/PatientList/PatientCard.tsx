import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, File, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { Patient } from '../../types';
import { formatDate } from '../../utils/formatters';

interface PatientCardProps {
  patient: Patient;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  // Check if the patient has any upcoming appointments
  const today = new Date().toISOString().split('T')[0];
  const appointments = patient.appointments || [];
  
  const hasUpcomingAppointment = appointments.some(
    appointment => appointment.date >= today && appointment.status !== 'Annulé' && appointment.status !== 'Terminé'
  );
  
  // Get the next upcoming appointment
  const upcomingAppointments = appointments
    .filter(appointment => appointment.date >= today && appointment.status !== 'Annulé' && appointment.status !== 'Terminé')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
  
  // Calculate age from birthdate
  const getBirthYear = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const age = getBirthYear(patient.birthdate);

  return (
    <Link 
      to={`/patients/${patient.id}`}
      className="block transition-transform hover:translate-y-[-2px]"
    >
      <div className={`
        bg-slate-50 rounded-lg shadow-sm overflow-hidden border border-slate-200
        ${hasUpcomingAppointment ? 'border-l-4 border-l-blue-500' : ''}
        hover:bg-slate-100 transition-colors duration-200
      `}>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{patient.name}</h3>
              <div className="flex items-center mt-1 text-sm text-slate-600">
                <span className="mr-3">{patient.gender}</span>
                <span>{age} ans</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {patient.blood_type && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  <Heart className="w-3 h-3 mr-1" />
                  {patient.blood_type}
                </span>
              )}
            </div>
          </div>
          
          {patient.chronic_conditions && (
            <div className="mt-2">
              <p className="text-sm text-slate-600 line-clamp-1">
                <span className="font-medium">Conditions: </span>
                {patient.chronic_conditions}
              </p>
            </div>
          )}
          
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center text-slate-600">
              <Phone className="w-4 h-4 mr-2 text-slate-400" />
              {patient.phone}
            </div>
            
            <div className="flex items-center text-slate-600">
              <Mail className="w-4 h-4 mr-2 text-slate-400" />
              {patient.email}
            </div>
            
            <div className="flex items-center text-slate-600">
              <MapPin className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
              <span className="line-clamp-1">{patient.address?.split('\n')[0] || 'Aucune adresse'}</span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
            <div className="flex items-center text-slate-600 text-sm">
              <File className="w-4 h-4 mr-1 text-blue-500" />
              {(patient.records || []).length} rapport{(patient.records || []).length !== 1 ? 's' : ''}
            </div>
            
            {nextAppointment && (
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                <span className="text-blue-700 font-medium">
                  RDV: {formatDate(nextAppointment.date)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PatientCard;