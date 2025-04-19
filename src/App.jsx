import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import UsersList from './components/UsersList';
import PirateDetail from './components/PirateDetail';
import backgroundImage from './assets/Graf_background.png';
import supabase from './supabaseClient/supabaseClient';

function App() {
  const [pirates, setPirates] = useState([]);

  const fetchPirates = async () => {
    try {
      const { data, error } = await supabase
        .from('pirates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPirates(data || []);
    } catch (error) {
      console.error('Error fetching pirates:', error);
    }
  };

  useEffect(() => {
    fetchPirates();
  }, []);

  const updatePiratesList = (updatedPirate) => {
    setPirates(currentPirates => 
      currentPirates.map(p => 
        p.id === updatedPirate.id ? updatedPirate : p
      )
    );
  };

  return (
    <Router>
      <div className="app-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <h1>PirateMates</h1>
        <Routes>
          <Route 
            path="/" 
            element={
              <UsersList 
                pirates={pirates} 
                setPirates={setPirates}
                fetchPirates={fetchPirates}
              />
            } 
          />
          <Route 
            path="/pirate/:id" 
            element={
              <PirateDetail 
                pirates={pirates}
                updatePiratesList={updatePiratesList}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

