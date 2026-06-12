import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, UploadCloud } from 'lucide-react';

const WINE_TYPES = ['Red', 'White', 'Champagne', 'Sparkling', 'Rose', 'Dessert', 'Other'];

export default function WineForm({ user, wineToEdit, onClose, onSave }) {
  const [formData, setFormData] = useState(
    wineToEdit 
      ? { ...wineToEdit, image_url: wineToEdit.image_url || '' }
      : { name: '', type: 'Red', country: '', region: '', vintage: '', price: '', notes: '', quantity: 1, image_url: '' }
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('wine-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('wine-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) {
      alert('Please wait for the image upload to complete.');
      return;
    }
    setLoading(true);

    const wineData = {
      name: formData.name,
      type: formData.type,
      country: formData.country,
      region: formData.region,
      vintage: formData.vintage ? parseInt(formData.vintage) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      notes: formData.notes,
      quantity: formData.quantity ? parseInt(formData.quantity) : 1,
      image_url: formData.image_url,
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
            <div className="form-group">
              <label>Price / 만원 단위 (Hidden from public)</label>
              <input type="number" step="0.01" name="price" value={formData.price || ''} onChange={handleChange} placeholder="e.g. 6.5 (6만 5천원)" />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" name="quantity" min="0" value={formData.quantity || ''} onChange={handleChange} placeholder="e.g. 1" required />
            </div>
          </div>

          <div className="form-group full-width image-upload-wrapper">
            <label>Wine Photo</label>
            {formData.image_url ? (
              <div className="image-upload-preview-container">
                <img src={formData.image_url} alt="Wine preview" className="image-upload-preview" />
                <button type="button" className="image-remove-btn" onClick={handleRemoveImage} title="Remove image">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="image-upload-dropzone">
                {uploading ? (
                  <div className="upload-loading-spinner"></div>
                ) : (
                  <>
                    <UploadCloud size={28} className="image-upload-dropzone-icon" />
                    <span>Click to upload photo</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG, JPG, GIF up to 5MB</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading} 
                />
              </label>
            )}
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
