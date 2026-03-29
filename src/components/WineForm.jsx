import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

const WINE_TYPES = ['Red', 'White', 'Champagne', 'Sparkling', 'Rose', 'Dessert', 'Other'];

export default function WineForm({ user, wineToEdit, onClose, onSave }) {
  const [formData, setFormData] = useState(
    wineToEdit || {
      name: '', type: 'Red', country: '', region: '', vintage: '', price: '', notes: ''
    }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const wineData = {
      name: formData.name,
      type: formData.type,
      country: formData.country,
      region: formData.region,
      vintage: formData.vintage ? parseInt(formData.vintage) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      notes: formData.notes,
      owner_id: user.id
    };

    let result;
    if (wineToEdit) {
      result = await supabase.from('wines').update(wineData).eq('id', wineToEdit.id).select();
    } else {
      result = await supabase.from('wines').insert([wineData]).select();
    }

    setLoading(false);
    if (result.error) {
      alert('Error saving wine: ' + result.error.message);
    } else {
      onSave(result.data[0]);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" className="close-button" onClick={onClose}><X size={24} /></button>
        <h2>{wineToEdit ? 'Edit Wine' : 'Add New Wine'}</h2>
        
        <form onSubmit={handleSubmit} className="wine-form">
          <div className="form-group full-width">
            <label>Wine Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Château Margaux" />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                {WINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Vintage</label>
              <input type="number" name="vintage" value={formData.vintage || ''} onChange={handleChange} placeholder="e.g. 2015" max={new Date().getFullYear() + 1} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country</label>
              <input name="country" value={formData.country} onChange={handleChange} placeholder="e.g. France" />
            </div>
            <div className="form-group">
              <label>Region</label>
              <input name="region" value={formData.region} onChange={handleChange} placeholder="e.g. Bordeaux" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Price / 만원 단위 (Hidden from public)</label>
              <input type="number" step="0.01" name="price" value={formData.price || ''} onChange={handleChange} placeholder="e.g. 6.5 (6만 5천원)" />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Tasting Notes</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows="3" placeholder="Add your personal notes..."></textarea>
          </div>

          <button type="submit" className="save-button" disabled={loading}>
            {loading ? 'Saving...' : 'Save to Cellar'}
          </button>
        </form>
      </div>
    </div>
  );
}
