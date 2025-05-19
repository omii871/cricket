import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FormProvider } from './components/Plyer/FormContext';
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import Form from './components/Plyer/Form';
import CrudTable from './components/Plyer/CrudTbale';
import OwnerForm from './components/Owner/OwnerForm';
import OwnerList from './components/Owner/OwnerList';
import Bides from './components/bidding/Bides';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/OwnerDashboard';
import AllTeams from './components/Teams/AllTeams';

const App = () => {
  return (
    <Router>
      <FormProvider>

        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/ownerform' element={<OwnerForm />} />
          <Route path='/home' element={<ProtectedRoute> <Home /></ProtectedRoute>} />
          <Route path="/form" element={<ProtectedRoute><Form /></ProtectedRoute>} />
          <Route path="/crud" element={<ProtectedRoute><CrudTable /></ProtectedRoute>} />
          <Route path='/ownerlist' element={<ProtectedRoute><OwnerList /></ProtectedRoute>} />
          <Route path='/Bides' element={<ProtectedRoute> < Bides /></ProtectedRoute>} />
          <Route path="/owner-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path='/teams' element={<ProtectedRoute><AllTeams /></ProtectedRoute>} />
        </Routes>
      </FormProvider>
    </Router >
  );
};

export default App;




