
import React from 'react';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

import HomePage from './components/HomePage';
import CreateFreelancer from './components/CreateFreelancer';
import FreelancerDetails from './components/FreelancerDetails';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <Link to="/" className='navbar-brand'>Freelancer Database</Link>
          <div className="navbar-nav mr-auto">
            <li className='nav-item'>
              <Link to="/" className="nav-link">Home</Link>
            </li>
{/*             <li className='nav-item'>
              <Link to="/create" className="nav-link">Create</Link>
            </li> */}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateFreelancer />} />
          <Route path="/Freelancers/:id" element={<FreelancerDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;