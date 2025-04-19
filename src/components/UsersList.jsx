// inside a React component
import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient/supabaseClient';
import PirateBattle from './PirateBattle';
import CrewStats from './CrewStats';
import { useNavigate, useLocation } from 'react-router-dom';

function UsersList({ pirates, setPirates, fetchPirates }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]); // Add categories state
  const [newPirate, setNewPirate] = useState({
    name: '',
    role: 'Captain',
    strength: 5,
    agility: 5,
    intelligence: 5,
    charisma: 5,
    description: '',
    image_url: ''
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isBattling, setIsBattling] = useState(false);
  const [selectedPirate, setSelectedPirate] = useState(null);

  // Add useEffect to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('pirate_categories')
          .select('*');
        
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Robohash image configurations
  const generateRoboHashUrl = (seed, set = 'set2', size = '300x300', background = '') => {
    // set1 = robots, set2 = monsters, set3 = robot heads, set4 = kittens, set5 = humans
    return `https://robohash.org/${seed}?set=${set}&size=${size}${background ? `&bgset=${background}` : ''}`;
  };

  const pirateImages = [
    generateRoboHashUrl('pirate1', 'set2'),
    generateRoboHashUrl('pirate2', 'set2'),
    generateRoboHashUrl('pirate3', 'set2'),
    generateRoboHashUrl('pirate4', 'set2'),
    generateRoboHashUrl('pirate5', 'set2'),
    generateRoboHashUrl('captain1', 'set1'),
    generateRoboHashUrl('captain2', 'set1'),
    generateRoboHashUrl('captain3', 'set1'),
    generateRoboHashUrl('monster1', 'set3'),
    generateRoboHashUrl('monster2', 'set3')
  ];

  // Remove the fetchPirates function and useEffect since they're now in App.jsx

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category && name in category) {
        const minKey = `min_${name}`;
        const maxKey = `max_${name}`;
        const numValue = parseInt(value);
        if (numValue < category[minKey] || numValue > category[maxKey]) {
          alert(`${name} must be between ${category[minKey]} and ${category[maxKey]} for this category`);
          return;
        }
      }
    }

    setNewPirate(prev => ({
      ...prev,
      [name]: value
    }));

    // Generate a unique robot image based on the name if it's the name field
    if (name === 'name' && value) {
      const newImageUrl = generateRoboHashUrl(value + Date.now(), 'set2');
      setNewPirate(prev => ({
        ...prev,
        image_url: newImageUrl
      }));
    }
  };

  const handleImageSelect = (imageUrl) => {
    setNewPirate(prev => ({
      ...prev,
      image_url: imageUrl
    }));
  };

  const handleEdit = (pirate) => {
    // Set all pirate attributes including stats
    setNewPirate({
      id: pirate.id,
      name: pirate.name,
      role: pirate.role,
      strength: parseInt(pirate.strength),
      agility: parseInt(pirate.agility),
      intelligence: parseInt(pirate.intelligence),
      charisma: parseInt(pirate.charisma),
      description: pirate.description,
      image_url: pirate.image_url
    });

    // If the pirate has a category, set it
    if (pirate.category_id) {
      setSelectedCategory(pirate.category_id);
    }

    // Update form title to indicate editing mode
    const formTitle = document.querySelector('.create-pirate-form h2');
    if (formTitle) {
      formTitle.textContent = 'Edit PirateMate';
    }

    // Scroll to the form
    document.querySelector('.create-pirate-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancel = () => {
    setNewPirate({
      name: '',
      role: 'Captain',
      strength: 5,
      agility: 5,
      intelligence: 5,
      charisma: 5,
      description: '',
      image_url: ''
    });
    setSelectedCategory(null);

    // Reset form title
    const formTitle = document.querySelector('.create-pirate-form h2');
    if (formTitle) {
      formTitle.textContent = 'Create New PirateMate';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!newPirate.name) {
        alert('Name is required');
        return;
      }

      // If no image is selected, generate one based on the name
      if (!newPirate.image_url && newPirate.name) {
        newPirate.image_url = generateRoboHashUrl(newPirate.name + Date.now(), 'set2');
      }

      let result;
      const updatedPirate = {
        name: newPirate.name,
        role: newPirate.role,
        strength: parseInt(newPirate.strength),
        agility: parseInt(newPirate.agility),
        intelligence: parseInt(newPirate.intelligence),
        charisma: parseInt(newPirate.charisma),
        description: newPirate.description,
        image_url: newPirate.image_url
      };

      // Only add category_id if a category is selected
      if (selectedCategory) {
        updatedPirate.category_id = selectedCategory;
      }

      if (newPirate.id) {
        // Update existing pirate
        result = await supabase
          .from('pirates')
          .update(updatedPirate)
          .eq('id', newPirate.id)
          .select();

        if (result.data) {
          // Immediately update the pirates list with the new data
          setPirates(pirates.map(p => 
            p.id === newPirate.id ? { ...p, ...updatedPirate } : p
          ));
        }
      } else {
        // Create new pirate
        result = await supabase
          .from('pirates')
          .insert([{
            ...updatedPirate,
            created_at: new Date().toISOString(),
            experience: 0
          }])
          .select();

        if (result.data) {
          // Add the new pirate to the list immediately
          setPirates(prev => [...prev, result.data[0]]);
        }
      }

      if (result.error) {
        throw result.error;
      }

      // Reset form
      setNewPirate({
        name: '',
        role: 'Captain',
        strength: 5,
        agility: 5,
        intelligence: 5,
        charisma: 5,
        description: '',
        image_url: ''
      });
      setSelectedCategory(null);

      // Reset form title
      const formTitle = document.querySelector('.create-pirate-form h2');
      if (formTitle) {
        formTitle.textContent = 'Create New PirateMate';
      }

    } catch (err) {
      console.error('Error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    // Add confirmation dialog
    if (!confirm('Are you sure you want to delete this PirateMate?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pirates')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Immediately update the UI by removing the deleted pirate
      setPirates(pirates.filter(p => p.id !== id));
      
      // Reset the form if we're deleting the currently edited pirate
      if (newPirate.id === id) {
        setNewPirate({
          name: '',
          role: 'Captain',
          strength: 5,
          agility: 5,
          intelligence: 5,
          charisma: 5,
          description: '',
          image_url: ''
        });
        setSelectedCategory(null);

        // Reset form title
        const formTitle = document.querySelector('.create-pirate-form h2');
        if (formTitle) {
          formTitle.textContent = 'Create New PirateMate';
        }
      }
    } catch (err) {
      console.error('Error deleting pirate:', err);
      alert(`Error deleting PirateMate: ${err.message}`);
    }
  };

  const startBattle = (pirate) => {
    setSelectedPirate(pirate);
    setIsBattling(true);
  };

  const handlePirateClick = (pirateId) => {
    console.log('Clicking pirate with ID:', pirateId);
    // Debug the pirate object
    const clickedPirate = pirates.find(p => p.id === pirateId);
    console.log('Clicked pirate object:', clickedPirate);
    
    if (pirateId) {
      navigate(`/pirate/${pirateId}`);
    } else {
      console.error('No pirate ID provided');
    }
  };

  useEffect(() => {
    // Check if we have an editPirateId in the location state
    if (location.state?.editPirateId) {
      const pirateToEdit = pirates.find(p => p.id === location.state.editPirateId);
      if (pirateToEdit) {
        handleEdit(pirateToEdit);
        // Scroll to the form
        document.querySelector('.create-pirate-form').scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.state, pirates]);

  return (
    <div>
      <h2>{newPirate.id ? 'Edit PirateMate' : 'Create New PirateMate'}</h2>
      <form onSubmit={handleSubmit} className="create-pirate-form">
        <div className="form-group">
          <label>Name: </label>
          <input
            type="text"
            name="name"
            value={newPirate.name}
            onChange={handleInputChange}
            required
          />
        </div>

        {newPirate.image_url && (
          <div className="current-image">
            <label>Current Image:</label>
            <img 
              src={newPirate.image_url} 
              alt={newPirate.name} 
              className="preview-image"
            />
          </div>
        )}

        <div className="image-selection-grid">
          {pirateImages.map((imageUrl, index) => (
            <div 
              key={index}
              className={`image-option ${newPirate.image_url === imageUrl ? 'selected' : ''}`}
              onClick={() => handleImageSelect(imageUrl)}
            >
              <img src={imageUrl} alt={`Pirate ${index + 1}`} />
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Role: </label>
          <select 
            name="role" 
            value={newPirate.role} 
            onChange={handleInputChange}
            className="role-select"
          >
            <option>Captain</option>
            <option>Navigator</option>
            <option>Gunner</option>
            <option>Cook</option>
            <option>Doctor</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category: </label>
          <select 
            name="category" 
            value={selectedCategory || ''} 
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="category-select"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="stats-section">
          <h3>Current Stats</h3>
          {['strength', 'agility', 'intelligence', 'charisma'].map(attr => (
            <div key={attr} className="stat-slider">
              <label>{attr.charAt(0).toUpperCase() + attr.slice(1)}: </label>
              <input
                type="range"
                name={attr}
                min="1"
                max="10"
                value={newPirate[attr]}
                onChange={handleInputChange}
              />
              <span className="stat-value">{newPirate[attr]}</span>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Description: </label>
          <textarea
            name="description"
            value={newPirate.description}
            onChange={handleInputChange}
            className="description-input"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Category: </label>
          <select 
            value={selectedCategory || ''} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">Select a Category ({categories.length} available)</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-buttons">
          <button type="submit" className="create-button">
            {newPirate.id ? 'Update PirateMate' : 'Create PirateMate'}
          </button>
          
          {newPirate.id && (
            <>
              <button 
                type="button" 
                className="delete-button"
                onClick={() => handleDelete(newPirate.id)}
              >
                Delete PirateMate
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>

      <h2>Your PirateMates Crew</h2>
      <CrewStats pirates={pirates} />
      <div className="pirates-grid">
        {pirates.map(pirate => (
          <div 
            key={pirate.id} 
            className="pirate-card"
            onClick={() => {
              console.log('Card clicked, pirate:', pirate);
              handlePirateClick(pirate.id);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="pirate-image">
              <img 
                src={pirate.image_url || generateRoboHashUrl(pirate.name)} 
                alt={pirate.name} 
                className="pirate-portrait"
              />
            </div>
            <h3>{pirate.name}</h3>
            <p className="role">Role: {pirate.role}</p>
            <div className="stats">
              <div className="stat">
                <span className="stat-label">STR:</span>
                <span className="stat-value">{pirate.strength}</span>
              </div>
              <div className="stat">
                <span className="stat-label">AGI:</span>
                <span className="stat-value">{pirate.agility}</span>
              </div>
              <div className="stat">
                <span className="stat-label">INT:</span>
                <span className="stat-value">{pirate.intelligence}</span>
              </div>
              <div className="stat">
                <span className="stat-label">CHA:</span>
                <span className="stat-value">{pirate.charisma}</span>
              </div>
            </div>
            <p className="description">{pirate.description}</p>
            <div className="pirate-actions" onClick={e => e.stopPropagation()}>
              <button onClick={(e) => {
                e.stopPropagation();
                startBattle(pirate);
              }} className="battle-button">
                Battle
              </button>
              <button onClick={(e) => {
                e.stopPropagation();
                handleEdit(pirate);
              }} className="edit-button">
                Edit
              </button>
              <button onClick={(e) => {
                e.stopPropagation();
                handleDelete(pirate.id);
              }} className="delete-button">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {isBattling && (
        <div className="battle-overlay">
          <PirateBattle 
            userPirate={selectedPirate}
            onBattleEnd={() => {
              setIsBattling(false);
              fetchPirates();
            }}
          />
        </div>
      )}
    </div>
  );
}

export default UsersList;
