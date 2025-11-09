import './HUD.css';

const HUD = ({ username, currency, gridSize, onExpandGrid, onLogout, expandCost }) => {
  const canExpand = gridSize < 16;
  const canAffordExpand = currency >= expandCost;

  return (
    <div className="hud">
      <div className="hud-section">
        <div className="hud-item">
          <span className="hud-label">Player:</span>
          <span className="hud-value">{username}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">💰 Currency:</span>
          <span className="hud-value gold">{currency}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">📏 Grid Size:</span>
          <span className="hud-value">{gridSize}x{gridSize}</span>
        </div>
      </div>
      
      <div className="hud-actions">
        {canExpand && (
          <button 
            className="hud-button expand-button"
            onClick={onExpandGrid}
            disabled={!canAffordExpand}
            title={canAffordExpand ? `Expand grid to ${gridSize + 2}x${gridSize + 2}` : 'Not enough currency'}
          >
            ⬆️ Expand Grid ({expandCost} 💰)
          </button>
        )}
        <button className="hud-button logout-button" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default HUD;
