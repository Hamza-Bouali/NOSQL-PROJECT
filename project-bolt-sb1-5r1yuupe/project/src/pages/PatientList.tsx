import React from 'react';
import Layout from '../components/Layout/Layout';
import PatientListComponent from '../components/PatientList/PatientList';

const PatientList: React.FC = () => {
  return (
    <Layout>
      <PatientListComponent />
    </Layout>
  );
};

export default PatientList;