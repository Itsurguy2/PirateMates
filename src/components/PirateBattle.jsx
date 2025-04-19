import React, { useState } from 'react';
import supabase from '../supabaseClient';
import './PirateBattle.css';

function PirateBattle({ userPirate, onBattleEnd }) {
  const [opponent, setOpponent] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [battleResult, setBattleResult] = useState(null);

  const generateOpponent = () => {
    const roles = ['Captain', 'Navigator', 'Gunner', 'Cook', 'Doctor'];
    return {
      name: `Enemy ${roles[Math.floor(Math.random() * roles.length)]}`,
      strength: Math.floor(Math.random() * 10) + 1,
      agility: Math.floor(Math.random() * 10) + 1,
      intelligence: Math.floor(Math.random() * 10) + 1,
      charisma: Math.floor(Math.random() * 10) + 1
    };
  };

  const startBattle = () => {
    const newOpponent = generateOpponent();
    setOpponent(newOpponent);
    setBattleLog([`A wild ${newOpponent.name} appears!`]);
    setBattleResult(null);
  };

  const calculateDamage = (attacker, defender, attribute) => {
    const attackValue = attacker[attribute];
    const defenseValue = defender.agility;
    return Math.max(1, Math.floor(attackValue * (1 - defenseValue / 20)));
  };

  const performAction = async (actionType) => {
    if (!opponent) return;

    let damage = 0;
    let newLog = [];

    switch (actionType) {
      case 'attack':
        damage = calculateDamage(userPirate, opponent, 'strength');
        newLog = [`${userPirate.name} attacks for ${damage} damage!`];
        break;
      case 'special':
        damage = calculateDamage(userPirate, opponent, 'intelligence');
        newLog = [`${userPirate.name} uses special ability for ${damage} damage!`];
        break;
      case 'charm':
        damage = calculateDamage(userPirate, opponent, 'charisma');
        newLog = [`${userPirate.name} attempts to charm for ${damage} damage!`];
        break;
    }

    const counterDamage = calculateDamage(opponent, userPirate, 'strength');
    newLog.push(`${opponent.name} counter-attacks for ${counterDamage} damage!`);

    if (damage >= opponent.strength) {
      newLog.push(`${userPirate.name} wins the battle!`);
      setBattleResult('win');
      
      const { error } = await supabase
        .from('pirates')
        .update({
          strength: Math.min(10, userPirate.strength + 1),
          experience: (userPirate.experience || 0) + 10
        })
        .eq('id', userPirate.id);

      if (error) {
        console.error('Error updating pirate stats:', error);
      }
    } else if (counterDamage >= userPirate.strength) {
      newLog.push(`${opponent.name} wins the battle!`);
      setBattleResult('lose');
    }

    setBattleLog(prev => [...prev, ...newLog]);
  };

  return (
    <div className="battle-container">
      {!opponent && (
        <button onClick={startBattle} className="start-battle-btn">
          Start Battle
        </button>
      )}

      {opponent && (
        <div className="battle-arena">
          <div className="combatants">
            <div className="pirate-stats">
              <h3>{userPirate.name}</h3>
              <p>STR: {userPirate.strength}</p>
              <p>AGI: {userPirate.agility}</p>
              <p>INT: {userPirate.intelligence}</p>
              <p>CHA: {userPirate.charisma}</p>
            </div>

            <div className="vs">VS</div>

            <div className="pirate-stats">
              <h3>{opponent.name}</h3>
              <p>STR: {opponent.strength}</p>
              <p>AGI: {opponent.agility}</p>
              <p>INT: {opponent.intelligence}</p>
              <p>CHA: {opponent.charisma}</p>
            </div>
          </div>

          {!battleResult && (
            <div className="battle-actions">
              <button onClick={() => performAction('attack')}>Attack</button>
              <button onClick={() => performAction('special')}>Special Attack</button>
              <button onClick={() => performAction('charm')}>Charm</button>
            </div>
          )}

          <div className="battle-log">
            {battleLog.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>

          {battleResult && (
            <button onClick={onBattleEnd} className="end-battle-btn">
              Return to Crew
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PirateBattle;
