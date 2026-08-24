import './Inventory.css';

const Inventory = ({ 
  inventory, 
  plantTypes, 
  selectedPlantType, 
  onSelectPlantType, 
  currency 
}) => {
  const getPlantEmoji = (plantType) => {
    const emojis = {
      wheat: '🌾',
      corn: '🌽',
      tomato: '🍅',
      pumpkin: '🎃'
    };
    return emojis[plantType.toLowerCase()] || '🌱';
  };

  const getPlantCost = (plantType, level = 1) => {
    const plant = plantTypes[plantType.toUpperCase()];
    if (!plant) return 0;
    return Math.floor(plant.baseCost * Math.pow(1.5, level - 1));
  };

  return (
    <div className="inventory">
      <h2>🏪 Shop & Inventory</h2>
      
      <div className="inventory-section">
        <h3>Available Plants</h3>
        <div className="plant-list">
          {Object.entries(plantTypes).map(([key, plant]) => {
            const cost = getPlantCost(key, 1);
            const canAfford = currency >= cost;
            const isSelected = selectedPlantType === plant.id;
            
            return (
              <div
                key={key}
                className={`plant-item ${isSelected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
                onClick={() => canAfford && onSelectPlantType(plant.id)}
              >
                <div className="plant-icon">{getPlantEmoji(plant.id)}</div>
                <div className="plant-info">
                  <div className="plant-name">{plant.name}</div>
                  <div className="plant-cost">💰 {cost}</div>
                  <div className="plant-description">{plant.description}</div>
                  <div className="plant-yield">Yield: {plant.baseYield}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="inventory-section">
        <h3>Harvested Items</h3>
        <div className="harvested-items">
          {inventory.length === 0 ? (
            <p className="empty-message">No items harvested yet</p>
          ) : (
            inventory.map((item) => (
              <div key={item.id} className="inventory-item">
                <div className="item-icon">{getPlantEmoji(item.item_type)}</div>
                <div className="item-info">
                  <div className="item-name">
                    {plantTypes[item.item_type.toUpperCase()]?.name || item.item_type}
                  </div>
                  <div className="item-quantity">x{item.quantity}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="inventory-tips">
        <h4>💡 Tips</h4>
        <ul>
          <li>Click a plant to select it</li>
          <li>Click empty cells to plant</li>
          <li>Click grown plants to harvest</li>
          <li>Plants grow automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default Inventory;
