import { useState } from 'react'
import './App.css'
import UsersList from './components/UsersList'
import backgroundImage from './assets/Graf_background.png'

function App() {
  return (
    <div className="app-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <h1>PirateMates</h1>
      <UsersList />
    </div>
  )
}

export default App


