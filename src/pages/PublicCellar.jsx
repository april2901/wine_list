import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import WineListDisplay from '../components/WineListDisplay';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { Wine, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function PublicCellar() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCellarData();
  }, [username]);

  const fetchCellarData = async () => {
    setLoading(true);
    
    // 1. Get profile by username
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (profileError || !profileData) {
      setError("Cellar not found or username is incorrect.");
      setLoading(false);
      return;
    }

    setProfile(profileData);

    // 2. Get wines for this profile
    const { data: wineData, error: wineError } = await supabase
      .from('wines')
      .select('*')
      .eq('owner_id', profileData.id)
      .order('created_at', { ascending: false });

    if (!wineError && wineData) {
      setWines(wineData);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading-screen">Uncorking the cellar...</div>;
  if (error) return (
    <div className="error-screen">
      <Wine size={48} className="error-icon" />
      <h2>{error}</h2>
      <p>Please check the URL and try again.</p>
    </div>
  );

  return (
    <div className="public-layout">
      <ThemeSwitcher />
      
      {!user && (
        <div className="public-login-action">
          <Link to="/login" className="public-login-btn">
            <LogIn size={16} />
            <span>Login to your cellar</span>
          </Link>
        </div>
      )}
      
      <header className="public-header">
        <Wine size={40} className="header-icon" />
        <h1>{profile.display_name || profile.username}&apos;s Cellar</h1>
        <div className="header-divider"></div>
        <p>A Curated Collection</p>
      </header>
      
      <main className="public-main">
        <WineListDisplay wines={wines} />
      </main>
      
      <footer className="public-footer">
        <p>Powered by Cellar Master</p>
      </footer>
    </div>
  );
}
