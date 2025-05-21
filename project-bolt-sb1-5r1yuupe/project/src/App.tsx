import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import AddPatient from './pages/AddPatient';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PatientList />} />
        <Route path="/patients/:patientId" element={<PatientDetail />} />
        <Route path="/add-patient" element={<AddPatient />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;