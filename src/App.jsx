import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Dashboard from './Dashboard';
import RoundDetails from './RoundDetails';
import EditRound from './EditRound';
import AddRound from './AddRound';
import AddCourse from './AddCourse';
import EditRoundScratch from './EditRoundScratch';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/round/:id" element={<RoundDetails />} />
        <Route path="/edit-round/:roundId" element={<EditRound />} />
        <Route path="/add-round" element={<AddRound />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/edit-round-scratch/:roundId" element={<EditRoundScratch />} />
      </Routes>
    </Router>
  );
}

export default App;
