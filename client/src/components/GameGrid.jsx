import { useState } from 'react';
import './GameGrid.css';

const GameGrid = ({ 
  gridSize, 
  plants, 
  onPlantSeed, 
  onHarvestPlant, 
  selectedPlantType,
  plantTypes 
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  const getPlantAtPosition = (x, y) => {
    return plants.find(p => p.position_x === x && p.position_y === y);
  };

  const handleCellClick = (x, y) => {
    const plant = getPlantAtPosition(x, y);
    
    if (plant) {
      if (plant.growth_stage === 1) {
        onHarvestPlant(plant.id);
      }
    } else if (selectedPlantType) {
      onPlantSeed(x, y, selectedPlantType);
    }
  };

  const getPlantEmoji = (plantType, growthStage) => {
    const plantEmojis = {
      wheat: growthStage === 0 ? '🌱' : '🌾',
      corn: growthStage === 0 ? '🌱' : '🌽',
      tomato: growthStage === 0 ? '🌱' : '🍅',
      pumpkin: growthStage === 0 ? '🌱' : '🎃'
    };
    return plantEmojis[plantType.toLowerCase()] || '🌱';
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const plant = getPlantAtPosition(x, y);
        const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
        
        cells.push(
          <div
            key={`${x}-${y}`}
            className={`grid-cell ${plant ? 'occupied' : ''} ${isHovered ? 'hovered' : ''}`}
            onClick={() => handleCellClick(x, y)}
            onMouseEnter={() => setHoveredCell({ x, y })}
            onMouseLeave={() => setHoveredCell(null)}
          >
            {plant ? (
              <div className={`plant ${plant.growth_stage === 1 ? 'grown' : 'growing'}`}>
                <div className="plant-emoji">
                  {getPlantEmoji(plant.plant_type, plant.growth_stage)}
                </div>
                {plant.level > 1 && (
                  <div className="plant-level">Lv.{plant.level}</div>
                )}
                {plant.growth_stage === 1 && (
                  <div className="harvest-indicator">✨</div>
                )}
              </div>
            ) : isHovered && selectedPlantType && (
              <div className="plant-preview">
                {plantTypes[selectedPlantType.toUpperCase()]?.name[0] || '?'}
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="game-grid-container">
      <div 
        className="game-grid" 
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`
        }}
      >
        {renderGrid()}
      </div>
    </div>
  );
};

export default GameGrid;
