import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Plus, Wine, ExternalLink } from 'lucide-react';
import WineForm from '../components/WineForm';
import AdminWineList from '../components/AdminWineList';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [wines, setWines] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWine, setEditingWine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchWines();
  }, [user]);

  const fetchWines = async () => {
    setLoading(true);
    const [{ data: wineData, error: wineError }, { data: profileData }] = await Promise.all([
      supabase.from('wines').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('username').eq('id', user.id).single()
    ]);
      
    if (!wineError && wineData) {
      setWines(wineData);
    }
    if (profileData) {
      setProfile(profileData);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddWine = () => {
    setEditingWine(null);
    setShowForm(true);
  };

  const handleEditWine = (wine) => {
    setEditingWine(wine);
    setShowForm(true);
  };

  const handleDeleteWine = async (id) => {
    if (window.confirm('Are you sure you want to delete this wine from your cellar?')) {
      const { error } = await supabase.from('wines').delete().eq('id', id);
      if (!error) {
        setWines(wines.filter(w => w.id !== id));
      } else {
        alert('Error deleting wine');
      }
    }
  };

  const handleSaveWine = (savedWine) => {
    if (editingWine) {
      setWines(wines.map(w => w.id === savedWine.id ? savedWine : w));
    } else {
      setWines([savedWine, ...wines]);
    }
    setShowForm(false);
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="brand">
          <Wine size={24} />
          <h2>Cellar Master</h2>
        </div>
        <div className="user-controls">
          <span>{user?.email}</span>
          {profile && (
            <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer" className="logout-button" style={{ color: 'var(--accent)' }}>
              <ExternalLink size={18} />
              <span style={{ fontWeight: 500 }}>View My Cellar</span>
            </a>
          )}
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>
      
      <main className="admin-main">
        <div className="admin-top-bar">
          <h1>Your Collection</h1>
          <button className="add-wine-button" onClick={handleAddWine}>
            <Plus size={20} />
            <span>Add Wine</span>
          </button>
        </div>
        
        <div className="admin-content">
          {loading ? (
            <p>Loading cellar...</p>
          ) : (
            <AdminWineList 
              wines={wines} 
              onEdit={handleEditWine} 
              onDelete={handleDeleteWine} 
            />
          )}
        </div>
      </main>

      {showForm && (
        <WineForm 
          user={user} 
          wineToEdit={editingWine} 
          onClose={() => setShowForm(false)} 
          onSave={handleSaveWine} 
        />
      )}
    </div>
  );
}
