import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, X, UserPlus, Search, Wine, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FriendsSidebar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriendsAndProfile = async () => {
      setLoading(true);
      
      // Fetch my profile
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
        
      if (myProfile) setCurrentUserProfile(myProfile);

      // Fetch friends mapping
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user.id);

      if (!friendsError && friendsData && friendsData.length > 0) {
        const friendIds = friendsData.map(f => f.friend_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .in('id', friendIds)
          .order('display_name');
          
        setFriends(profilesData || []);
      } else {
        setFriends([]);
      }
      setLoading(false);
    };

    if (user && isOpen) {
      fetchFriendsAndProfile();
    }
  }, [user, isOpen]);

  const handleFriendClick = (username) => {
    setIsOpen(false);
    navigate(`/${username}`);
  };

  const handleMyCellarClick = () => {
    if (currentUserProfile) {
      setIsOpen(false);
      navigate(`/${currentUserProfile.username}`);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newFriendUsername.trim()) return;

    setIsAdding(true);
    
    // 1. Find profile by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', newFriendUsername.trim())
      .single();

    if (profileError || !profile) {
      setAddError('존재하지 않는 아이디입니다.');
      setIsAdding(false);
      return;
    }

    if (profile.id === user.id) {
      setAddError('자기 자신은 추가할 수 없습니다.');
      setIsAdding(false);
      return;
    }

    // 2. Add to friends table
    const { error: insertError } = await supabase
      .from('friends')
      .insert({ user_id: user.id, friend_id: profile.id });

    if (insertError) {
      if (insertError.code === '23505') {
        setAddError('이미 추가된 친구입니다.');
      } else {
        setAddError('추가 중 오류가 발생했습니다.');
      }
    } else {
      setNewFriendUsername('');
      
      // refresh friends list manually 
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .eq('id', profile.id)
        .single();
      
      if (updatedProfile) {
        setFriends(prev => [...prev, updatedProfile].sort((a,b) => (a.display_name || a.username).localeCompare(b.display_name || b.username)));
      }
    }
    setIsAdding(false);
  };

  const handleRemoveFriend = async (e, friendId) => {
    e.stopPropagation();
    if (window.confirm('디지털 셀러 목록에서 삭제하시겠습니까?')) {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);
      
      if (!error) {
        setFriends(prev => prev.filter(f => f.id !== friendId));
      }
    }
  };

  return (
    <>
      <button 
        className="sidebar-toggle-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Toggle Friends Sidebar"
      >
        <Users size={18} />
        <span>Friends</span>
      </button>

      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}

      <div className={`friends-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>친구 목록</h2>
          <button onClick={() => setIsOpen(false)} className="close-sidebar-btn">
            <X size={20} />
          </button>
        </div>
        
        <div className="sidebar-content">
          {!user ? (
            <div className="sidebar-message">
              <p>친구의 셀러를 보려면 로그인하세요</p>
              <button 
                className="sidebar-login-btn"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/login');
                }}
              >
                Login
              </button>
            </div>
          ) : (
            <div className="sidebar-auth-content">
              
              <button className="my-cellar-nav-btn" onClick={handleMyCellarClick}>
                <Wine size={18} />
                <span>내 셀러 보기</span>
              </button>
              
              <div className="add-friend-section">
                <form onSubmit={handleAddFriend} className="add-friend-form">
                  <div className="add-friend-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="친구 ID 입력" 
                      value={newFriendUsername}
                      onChange={(e) => setNewFriendUsername(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={isAdding || !newFriendUsername.trim()}>
                    <UserPlus size={16} />
                  </button>
                </form>
                {addError && <p className="add-friend-error">{addError}</p>}
              </div>
              
              <div className="friends-list-container">
                <h3 className="section-title">My Friends ({friends.length})</h3>
                
                {loading && friends.length === 0 ? (
                  <div className="sidebar-message"><p>Loading...</p></div>
                ) : friends.length > 0 ? (
                  <ul className="friends-list">
                    {friends.map(friend => (
                      <li 
                        key={friend.username} 
                        onClick={() => handleFriendClick(friend.username)}
                        className="friend-item"
                      >
                        <div className="friend-info">
                          <span className="friend-name">{friend.display_name || friend.username}</span>
                          <span className="friend-id">@{friend.username}</span>
                        </div>
                        <button 
                          className="remove-friend-btn" 
                          onClick={(e) => handleRemoveFriend(e, friend.id)}
                          aria-label="Remove friend"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="sidebar-message empty">
                    <p>등록된 친구가 없습니다.<br/>상단의 검색창을 통해 친구를 추가해보세요.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
