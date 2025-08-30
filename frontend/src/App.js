
import React from 'react';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

import HomePage from './components/HomePage';
import CreateFreelancer from './components/CreateFreelancer';
import FreelancerDetails from './components/FreelancerDetails';
import Login from './components/Login';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="navbar navbar-expand navbar-dark bg-dark px-4">
          <Link to="/" className='navbar-brand '>Freelancer Database</Link>
          <div className="navbar-nav me-auto">
            <li className='nav-item'>
              <Link to="/" className="nav-link">Home</Link>
            </li>
          </div>
          <div className="navbar-nav ms-auto">
            <li className='nav-item'>
              <Link to="/login" className="nav-link">Login</Link>
            </li>
            <li className='nav-item'>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateFreelancer />} />
          <Route path="/Freelancers/:id" element={<FreelancerDetails />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;