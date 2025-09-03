import { useNavigate } from 'react-router-dom';
import DeleteFreelancer from './DeleteFreelancer';
import ArchiveToggle from './ArchiveToggle';
import React, { useState, useEffect } from 'react';

function HomePage() {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchPhrase, setSearchPhrase] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageSize: 10,
    currentPageNumber: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  });

  async function fetchFreelancers(page = 1, searchPhraseParam, sortOrderParam) {
    try {
      // Get token directly
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('You must be logged in');
        navigate('/login');
        return;
      }

      let url = `http://localhost:5095/api/Freelancers/filter?currentPageNumber=${page}&pageSize=${pagination.pageSize}`;
      if (filter === 'archived') url += '&isArchived=true';
      else if (filter === 'unarchived') url += '&isArchived=false';
      
      const phraseToUse = typeof searchPhraseParam === 'string' ? searchPhraseParam : searchPhrase;
      if (phraseToUse && phraseToUse.length >= 2) {
        url += `&searchPhrase=${encodeURIComponent(phraseToUse)}`;
      }
      
      const orderToUse = typeof sortOrderParam === 'string' ? sortOrderParam : sortOrder;
      url += `&sortOrder=${orderToUse}`;

      console.log('Fetching:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Freelancers data:', data);
        
        setFreelancers(data.data || []); 
        setPagination({
          totalCount: data.totalCount,
          pageSize: data.pageSize,
          currentPageNumber: data.currentPageNumber,
          totalPages: data.totalPages,
          hasPreviousPage: data.hasPreviousPage,
          hasNextPage: data.hasNextPage
        });
      } else {
        console.error('Failed to fetch freelancers:', response.status);
        alert('Failed to load freelancers');
      }
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      alert('Network error');
    }
  }

  useEffect(() => {
    fetchFreelancers(pagination.currentPageNumber, searchPhrase, sortOrder);
  }, [filter, searchPhrase, sortOrder]);

  const deleteFreelancer = (idx) => {
    setFreelancers(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    fetchFreelancers(pagination.currentPageNumber, searchPhrase, newOrder);
  };

  console.log('Pagination:', pagination); 
  
  return (
    <div className="HomePage">
      <h1 className="text-center py-5">Welcome to Freelancer Database</h1>

      {/* Search Bar */}
      <div className="d-flex justify-content-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by username or email"
          value={searchPhrase}
          onChange={e => setSearchPhrase(e.target.value)}
        />
      </div>

      {/* Freelancer Table */}
      <div className="d-flex justify-content-center">
        <div style={{ width: '1300px', maxWidth: '100%' }}>
          <div className="d-flex justify-content-between align-items-center mb-2" style={{ width: '100%' }}>
            <div className="d-flex align-items-center">
              {/* Filter Button Group */}
              <div className="btn-group me-2" role="group">
                <button 
                  className={`btn btn-outline-primary btn-sm${filter === 'all' ? ' active' : ''}`} 
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`btn btn-outline-success btn-sm${filter === 'unarchived' ? ' active' : ''}`} 
                  onClick={() => setFilter('unarchived')}
                >
                  Unarchived
                </button>
                <button 
                  className={`btn btn-outline-warning btn-sm${filter === 'archived' ? ' active' : ''}`} 
                  onClick={() => setFilter('archived')}
                >
                  Archived
                </button>
              </div>
              {/* Sort Button */}
              <button className="btn btn-light btn-sm me-2" onClick={toggleSortOrder}>
                <span className="me-1">Sort</span>
                {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
              </button>
            </div>

            {/* Create Button */}
            <button onClick={() => navigate('/create')} className="btn btn-dark btn-sm">New</button>
          </div>
          
          <div className='table-responsive'>
            <table className="table table-striped table-bordered w-100">
              <thead>
                <tr className='text-center'>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Skillsets</th>
                  <th>Hobbies</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {freelancers.map((f, idx) => (
                  <tr key={f.id || idx}>
                    <td>{f.username || f.Username}</td>
                    <td>{f.email || f.Email}</td>
                    <td>{f.phoneNum || f.PhoneNum}</td>
                    <td>
                      {Array.isArray(f.skillsets) && f.skillsets.length > 0 
                        ? f.skillsets.map(s => s.skillName).join(', ') 
                        : '—'
                      }
                    </td>
                    <td>
                      {Array.isArray(f.hobbies) && f.hobbies.length > 0 
                        ? f.hobbies.map(h => h.hobbyName).join(', ') 
                        : '—'
                      }
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button 
                        className="btn btn-info btn-sm" 
                        onClick={() => navigate(`/Freelancers/${f.id || idx}`)}
                      >
                        View
                      </button>
                      <ArchiveToggle
                        freelancerId={f.id || idx}
                        isArchived={f.isArchived}
                        onToggle={() => fetchFreelancers(pagination.currentPageNumber)}
                      />
                      <DeleteFreelancer 
                        freelancerId={f.id || idx} 
                        onDelete={() => deleteFreelancer(idx)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="d-flex justify-content-center my-3">
        <div className="pagination-buttons">
          <button
            className="btn btn-secondary btn-sm"
            disabled={!pagination.hasPreviousPage}
            onClick={() => fetchFreelancers(pagination.currentPageNumber - 1)}
          >
            Previous
          </button>
          <span> Page {pagination.currentPageNumber} of {pagination.totalPages} </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={!pagination.hasNextPage}
            onClick={() => fetchFreelancers(pagination.currentPageNumber + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;