// inside a React component
import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient/supabaseClient';
import PirateBattle from './PirateBattle';
import CrewStats from './CrewStats';

function UsersList() {
  const [pirates, setPirates] = useState([]);
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
  const [selectedPirate, setSelectedPirate] = useState(null);
  const [isBattling, setIsBattling] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  useEffect(() => {
    fetchPirates();
    fetchCategories();
  }, []);

  const fetchPirates = async () => {
    const { data, error } = await supabase
      .from('pirates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pirates:', error);
    } else {
      setPirates(data || []);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('pirate_categories')
        .select('*');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      console.log('Raw categories data:', data);
      
      if (!data || data.length === 0) {
        console.log('No categories found in the database');
        return;
      }

      setCategories(data);
      console.log('Categories set in state:', data);
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (name in category) {
        const numValue = parseInt(value);
        if (numValue < category[`min_${name}`] || numValue > category[`max_${name}`]) {
          alert(`${name} must be between ${category[`min_${name}`]} and ${category[`max_${name}`]} for this category`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!newPirate.name) {
        alert('Name is required');
        return;
      }

      // If no image is selected, generate one based on the name
      if (!newPirate.image_url && newPirate.name) {
        newPirate.image_url = generateRoboHashUrl(newPirate.name + Date.now(), 'set2');
      }

      // Add created_at timestamp
      const pirateData = {
        ...newPirate,
        created_at: new Date().toISOString(),
        experience: 0, // Add default experience
      };

      console.log('Attempting to create pirate with data:', pirateData);

      const { data, error } = await supabase
        .from('pirates')
        .insert([pirateData])
        .select();

      if (error) {
        console.error('Detailed error:', error);
        alert(`Failed to create pirate: ${error.message}`);
        return;
      }

      console.log('Pirate created successfully:', data);

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
      
      // Refresh pirates list
      fetchPirates();

    } catch (err) {
      console.error('Unexpected error:', err);
      alert(`Unexpected error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('pirates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting pirate:', error);
    } else {
      fetchPirates();
    }
  };

  const startBattle = (pirate) => {
    setSelectedPirate(pirate);
    setIsBattling(true);
  };

  return (
    <div>
      <h2>Create New PirateMate</h2>
      <form onSubmit={handleSubmit} className="create-pirate-form">
        <div>
          <label>Name: </label>
          <input
            type="text"
            name="name"
            value={newPirate.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Choose Your Character:</label>
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
        </div>

        <div>
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

        <div>
          <label>Description: </label>
          <textarea
            name="description"
            value={newPirate.description}
            onChange={handleInputChange}
            className="description-input"
          />
        </div>

        <div>
          <label>Category: </label>
          <select 
            value={selectedCategory || ''} 
            onChange={(e) => {
              console.log('Selected category:', e.target.value);
              setSelectedCategory(e.target.value);
            }}
            className="category-select"
          >
            <option value="">Select a Category ({categories.length} available)</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.id})
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="create-button">Create PirateMate</button>
      </form>

      <h2>Your PirateMates Crew</h2>
      <CrewStats pirates={pirates} />
      <div className="pirates-grid">
        {pirates.map(pirate => (
          <div key={pirate.id} className="pirate-card">
            <div className="pirate-image">
              <img src={pirate.image_url || generateRoboHashUrl(pirate.name)} alt={pirate.name} />
            </div>
            <h3>{pirate.name}</h3>
            <p className="role">Role: {pirate.role}</p>
            <div className="stats">
              <span>STR: {pirate.strength}</span>
              <span>AGI: {pirate.agility}</span>
              <span>INT: {pirate.intelligence}</span>
              <span>CHA: {pirate.charisma}</span>
            </div>
            <p className="description">{pirate.description}</p>
            <div className="pirate-actions">
              <button onClick={() => startBattle(pirate)} className="battle-button">Battle</button>
              <button onClick={() => handleDelete(pirate.id)} className="delete-button">Delete</button>
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
