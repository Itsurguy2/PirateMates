import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient/supabaseClient';
import './PirateDetail.css';

function PirateDetail({ pirates, updatePiratesList }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);

  // Find the pirate from the pirates array
  const pirate = pirates.find(p => p.id === id);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (pirate?.category_id) {
        const { data, error } = await supabase
          .from('pirate_categories')
          .select('*')
          .eq('id', pirate.category_id)
          .single();

        if (!error) {
          setCategoryDetails(data);
        }
      }
    };

    if (pirates.length > 0) {
      setLoading(false);
      fetchCategoryDetails();
    }
  }, [pirates, pirate]);

  const handleEdit = () => {
    // Navigate to home page and scroll to edit form
    navigate('/', { state: { editPirateId: pirate.id } });
  };

  const calculateStatPercentage = (value) => (value / 10) * 100;

  const generatePirateDescription = (pirate) => {
    const powerDescriptions = {
      Captain: "Commands the crew with natural authority and strategic insight.",
      Navigator: "Masters the seas with exceptional navigation skills and weather prediction.",
      Gunner: "Specializes in ship-to-ship combat and weapons expertise.",
      Cook: "Keeps the crew's morale high with culinary mastery and resource management.",
      Doctor: "Ensures crew survival with medical knowledge and healing abilities."
    };

    const getAttributeDescription = () => {
      const highestStat = Math.max(
        pirate.strength,
        pirate.agility,
        pirate.intelligence,
        pirate.charisma
      );

      if (highestStat === pirate.strength) {
        return "Known for overwhelming physical power in combat.";
      } else if (highestStat === pirate.agility) {
        return "Moves with incredible speed and precision.";
      } else if (highestStat === pirate.intelligence) {
        return "Outsmarts opponents with tactical brilliance.";
      } else {
        return "Influences others with remarkable charisma.";
      }
    };

    const getExperienceLevel = () => {
      const exp = pirate.experience || 0;
      if (exp >= 100) return "veteran";
      if (exp >= 50) return "seasoned";
      if (exp >= 20) return "skilled";
      return "novice";
    };

    return `${pirate.name} is a ${getExperienceLevel()} ${pirate.role.toLowerCase()} of the seas. 
    ${powerDescriptions[pirate.role]} ${getAttributeDescription()} 
    With strength of ${pirate.strength}, agility of ${pirate.agility}, 
    intelligence of ${pirate.intelligence}, and charisma of ${pirate.charisma}, 
    they've earned their reputation through ${pirate.experience || 0} battles.`;
  };

  if (loading) return <div className="loading">Loading PirateMate details...</div>;
  if (!pirate) return <div className="error">PirateMate not found</div>;

  return (
    <div className="pirate-detail-container">
      <div className="navigation-buttons">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Crew
        </button>
        <button className="edit-button" onClick={handleEdit}>
          Edit PirateMate
        </button>
      </div>
      
      <div className="pirate-detail-card">
        <div className="pirate-header">
          <img 
            src={pirate.image_url} 
            alt={pirate.name} 
            className="pirate-detail-image"
          />
          <div className="pirate-title">
            <h2>{pirate.name}</h2>
            <p className="role">{pirate.role}</p>
            {categoryDetails && (
              <p className="category">Category: {categoryDetails.name}</p>
            )}
          </div>
        </div>

        <div className="pirate-stats">
          <h3>Attributes</h3>
          <div className="stat-bars">
            <div className="stat-bar-container">
              <label>Strength</label>
              <div className="stat-bar-wrapper">
                <div 
                  className="stat-bar-fill"
                  style={{ width: `${calculateStatPercentage(pirate.strength)}%` }}
                ></div>
                <span className="stat-value">{pirate.strength}</span>
              </div>
            </div>
            <div className="stat-bar-container">
              <label>Agility</label>
              <div className="stat-bar-wrapper">
                <div 
                  className="stat-bar-fill"
                  style={{ width: `${calculateStatPercentage(pirate.agility)}%` }}
                ></div>
                <span className="stat-value">{pirate.agility}</span>
              </div>
            </div>
            <div className="stat-bar-container">
              <label>Intelligence</label>
              <div className="stat-bar-wrapper">
                <div 
                  className="stat-bar-fill"
                  style={{ width: `${calculateStatPercentage(pirate.intelligence)}%` }}
                ></div>
                <span className="stat-value">{pirate.intelligence}</span>
              </div>
            </div>
            <div className="stat-bar-container">
              <label>Charisma</label>
              <div className="stat-bar-wrapper">
                <div 
                  className="stat-bar-fill"
                  style={{ width: `${calculateStatPercentage(pirate.charisma)}%` }}
                ></div>
                <span className="stat-value">{pirate.charisma}</span>
              </div>
            </div>
          </div>

          <div className="experience-section">
            <h3>Experience</h3>
            <div className="experience-bar-container">
              <div className="experience-bar-wrapper">
                <div 
                  className="experience-bar-fill"
                  style={{ width: `${Math.min((pirate.experience || 0) / 100 * 100, 100)}%` }}
                ></div>
                <span className="experience-value">{pirate.experience || 0} XP</span>
              </div>
            </div>
          </div>

          {categoryDetails && (
            <div className="category-details">
              <h3>Category Bonuses</h3>
              <p>Strength Range: {categoryDetails.min_strength} - {categoryDetails.max_strength}</p>
              <p>Agility Range: {categoryDetails.min_agility} - {categoryDetails.max_agility}</p>
              <p>Intelligence Range: {categoryDetails.min_intelligence} - {categoryDetails.max_intelligence}</p>
              <p>Charisma Range: {categoryDetails.min_charisma} - {categoryDetails.max_charisma}</p>
            </div>
          )}

          <div className="pirate-description">
            <h3>Pirate Legend</h3>
            <p>{generatePirateDescription(pirate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PirateDetail;



