import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function AdminWineList({ wines, onEdit, onDelete, onUpdateQuantity }) {
  if (wines.length === 0) {
    return <p className="empty-state">Your cellar is currently empty. Add some wines to get started!</p>;
  }

  return (
    <div className="admin-wine-list">
      <div className="table-header">
        <div className="col-name">Name</div>
        <div className="col-type">Type</div>
        <div className="col-region">Region</div>
        <div className="col-vintage">Vintage</div>
        <div className="col-price">Price</div>
        <div className="col-qty">Qty</div>
        <div className="col-actions">Actions</div>
      </div>
      
      {wines.map(wine => (
        <div key={wine.id} className="table-row">
          <div className="col-name">
            <div className="col-name-container">
              <div className="admin-wine-thumbnail-wrapper">
                {wine.image_url ? (
                  <img src={wine.image_url} alt={wine.name} className="admin-wine-thumbnail" />
                ) : (
                  <span style={{ fontSize: '1.2rem' }}>🍷</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong>{wine.name}</strong>
                {wine.notes && <span className="wine-notes-preview">{wine.notes.substring(0, 30)}...</span>}
              </div>
            </div>
          </div>
          <div className="col-type"><span className={`type-badge type-color-${wine.type.toLowerCase()}`}>{wine.type}</span></div>
          <div className="col-region">{wine.country} {wine.region && `- ${wine.region}`}</div>
          <div className="col-vintage">{wine.vintage || '-'}</div>
          <div className="col-price">{wine.price ? `${wine.price}만원` : '-'}</div>
          <div className="col-qty">
            <div className="qty-controls">
              <button 
                type="button" 
                className="qty-btn" 
                onClick={() => onUpdateQuantity(wine.id, (wine.quantity || 1) - 1)}
                disabled={(wine.quantity || 1) <= 0}
              >-</button>
              <span className="qty-value">{wine.quantity || 1}</span>
              <button 
                type="button" 
                className="qty-btn" 
                onClick={() => onUpdateQuantity(wine.id, (wine.quantity || 1) + 1)}
              >+</button>
            </div>
          </div>
          <div className="col-actions">
            <button className="action-btn edit" onClick={() => onEdit(wine)} title="Edit">
              <Edit2 size={16} />
            </button>
            <button className="action-btn delete" onClick={() => onDelete(wine.id)} title="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
