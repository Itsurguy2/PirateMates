import React from 'react';
import './CrewStats.css';

function CrewStats({ pirates }) {
  // Calculate crew statistics
  const calculateStats = () => {
    if (!pirates.length) return null;

    const totalPirates = pirates.length;
    const avgStrength = pirates.reduce((sum, p) => sum + p.strength, 0) / totalPirates;
    const avgAgility = pirates.reduce((sum, p) => sum + p.agility, 0) / totalPirates;
    const avgIntelligence = pirates.reduce((sum, p) => sum + p.intelligence, 0) / totalPirates;
    const avgCharisma = pirates.reduce((sum, p) => sum + p.charisma, 0) / totalPirates;

    // Calculate category distribution
    const categoryDistribution = pirates.reduce((acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1;
      return acc;
    }, {});

    // Calculate crew success metrics
    const crewSuccess = {
      combat: (avgStrength * 0.4 + avgAgility * 0.3 + avgIntelligence * 0.2 + avgCharisma * 0.1) * 10,
      navigation: (avgIntelligence * 0.4 + avgAgility * 0.3 + avgStrength * 0.2 + avgCharisma * 0.1) * 10,
      diplomacy: (avgCharisma * 0.4 + avgIntelligence * 0.3 + avgAgility * 0.2 + avgStrength * 0.1) * 10
    };

    return {
      averages: { avgStrength, avgAgility, avgIntelligence, avgCharisma },
      categoryDistribution,
      crewSuccess
    };
  };

  const stats = calculateStats();
  if (!stats) return <div>No crew statistics available</div>;

  return (
    <div className="crew-stats">
      <h2>Crew Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Crew Averages</h3>
          <p>Strength: {stats.averages.avgStrength.toFixed(1)}</p>
          <p>Agility: {stats.averages.avgAgility.toFixed(1)}</p>
          <p>Intelligence: {stats.averages.avgIntelligence.toFixed(1)}</p>
          <p>Charisma: {stats.averages.avgCharisma.toFixed(1)}</p>
        </div>

        <div className="stat-card">
          <h3>Crew Composition</h3>
          {Object.entries(stats.categoryDistribution).map(([role, count]) => (
            <p key={role}>{role}: {((count / pirates.length) * 100).toFixed(1)}%</p>
          ))}
        </div>

        <div className="stat-card">
          <h3>Crew Success Metrics</h3>
          <div className="success-meter">
            <p>Combat Effectiveness: {stats.crewSuccess.combat.toFixed(1)}%</p>
            <div className="meter-bar" style={{width: `${stats.crewSuccess.combat}%`}}></div>
          </div>
          <div className="success-meter">
            <p>Navigation Skill: {stats.crewSuccess.navigation.toFixed(1)}%</p>
            <div className="meter-bar" style={{width: `${stats.crewSuccess.navigation}%`}}></div>
          </div>
          <div className="success-meter">
            <p>Diplomatic Influence: {stats.crewSuccess.diplomacy.toFixed(1)}%</p>
            <div className="meter-bar" style={{width: `${stats.crewSuccess.diplomacy}%`}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrewStats;