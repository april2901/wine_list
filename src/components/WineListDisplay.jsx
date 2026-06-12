import React, { useState, useMemo } from 'react';

export default function WineListDisplay({ wines }) {
  const [primarySort, setPrimarySort] = useState('type');
  const [secondarySort, setSecondarySort] = useState('price');
  const [showQuantity, setShowQuantity] = useState(false);

  const sortedWines = useMemo(() => {
    const sorted = [...wines].sort((a, b) => {
      if (secondarySort === 'price') {
        return (b.price || 0) - (a.price || 0); // descending price
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    const grouped = {};
    sorted.forEach(wine => {
      const key = primarySort === 'type' ? wine.type : (wine.country || 'Unknown Location');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(wine);
    });

    return grouped;
  }, [wines, primarySort, secondarySort]);

  // Group sorting standard (alphabetical)
  const sortedGroupKeys = Object.keys(sortedWines).sort((a, b) => a.localeCompare(b));

  return (
    <div className="wine-list-display">
      <div className="controls-row">
        <div className="sort-group">
          <label>View by:</label>
          <select value={primarySort} onChange={e => setPrimarySort(e.target.value)}>
            <option value="type">Category</option>
            <option value="region">Country</option>
          </select>
        </div>
        <div className="sort-group">
          <label>Sort by:</label>
          <select value={secondarySort} onChange={e => setSecondarySort(e.target.value)}>
            <option value="alpha">Alphabetical</option>
            <option value="price">Value</option>
          </select>
        </div>
        <div className="sort-group toggle-group">
          <label htmlFor="show-qty-toggle" style={{ cursor: 'pointer', userSelect: 'none' }}>Show Quantity</label>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              id="show-qty-toggle"
              checked={showQuantity}
              onChange={(e) => setShowQuantity(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="wine-groups">
        {sortedGroupKeys.map(groupKey => (
          <div key={groupKey} className={`wine-category ${primarySort === 'type' ? `type-color-${groupKey.toLowerCase()}` : ''}`}>
            <h2 className="category-title">
              <span>{groupKey}</span>
            </h2>
            <div className="category-items">
              {sortedWines[groupKey].map(wine => {
                const hasImage = !!wine.image_url;
                const cardContent = (
                  <>
                    <div className="wine-item-header">
                      <h3 className="wine-item-name">{wine.name}</h3>
                      <div className="wine-item-badges">
                        {wine.vintage && <span className="wine-item-vintage">{wine.vintage}</span>}
                        {showQuantity && (
                          <span className="wine-item-quantity" style={{ whiteSpace: 'nowrap' }}>
                            {(wine.quantity || 1) === 1 ? '1 bottle' : `${wine.quantity || 1} bottles`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="wine-item-meta">
                      {primarySort === 'type' && wine.country && <span>{wine.country}</span>}
                      {primarySort === 'type' && wine.region && <span> • {wine.region}</span>}
                      {primarySort === 'region' && <span>{wine.type}</span>}
                      {primarySort === 'region' && wine.region && <span> • {wine.region}</span>}
                    </div>
                    {wine.notes && <p className="wine-item-notes">{wine.notes}</p>}
                  </>
                );

                return (
                  <div key={wine.id} className={`wine-item-card type-color-${wine.type.toLowerCase()} ${hasImage ? 'has-image' : ''}`}>
                    {hasImage && (
                      <div className="wine-item-image-wrapper">
                        <img src={wine.image_url} alt={wine.name} className="wine-item-image" loading="lazy" />
                      </div>
                    )}
                    {hasImage && (
                      <div className="wine-item-menu-thumbnail-wrapper">
                        <img src={wine.image_url} alt={wine.name} className="wine-item-menu-thumbnail" loading="lazy" />
                      </div>
                    )}
                    {hasImage ? (
                      <div className="wine-item-content">{cardContent}</div>
                    ) : (
                      cardContent
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {wines.length === 0 && <p className="empty-message">No wines found in this cellar.</p>}
      </div>
    </div>
  );
}
