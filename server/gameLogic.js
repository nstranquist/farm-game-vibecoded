// Plant type definitions
export const PLANT_TYPES = {
  WHEAT: {
    id: 'wheat',
    name: 'Wheat',
    baseCost: 10,
    growthTime: 30000, // 30 seconds
    baseYield: 15,
    maxLevel: 5,
    description: 'Basic crop, fast growing'
  },
  CORN: {
    id: 'corn',
    name: 'Corn',
    baseCost: 25,
    growthTime: 60000, // 1 minute
    baseYield: 40,
    maxLevel: 5,
    description: 'Medium crop, good yield'
  },
  TOMATO: {
    id: 'tomato',
    name: 'Tomato',
    baseCost: 50,
    growthTime: 90000, // 1.5 minutes
    baseYield: 80,
    maxLevel: 5,
    description: 'Advanced crop, high yield'
  },
  PUMPKIN: {
    id: 'pumpkin',
    name: 'Pumpkin',
    baseCost: 100,
    growthTime: 120000, // 2 minutes
    baseYield: 150,
    maxLevel: 5,
    description: 'Premium crop, excellent yield'
  }
};

export const getPlantCost = (plantType, level = 1) => {
  const plant = PLANT_TYPES[plantType.toUpperCase()];
  if (!plant) return 0;
  return Math.floor(plant.baseCost * Math.pow(1.5, level - 1));
};

export const getPlantYield = (plantType, level = 1) => {
  const plant = PLANT_TYPES[plantType.toUpperCase()];
  if (!plant) return 0;
  return Math.floor(plant.baseYield * Math.pow(1.3, level - 1));
};

export const getUpgradeCost = (plantType, currentLevel) => {
  const plant = PLANT_TYPES[plantType.toUpperCase()];
  if (!plant || currentLevel >= plant.maxLevel) return null;
  return Math.floor(plant.baseCost * Math.pow(2, currentLevel));
};

export const GRID_EXPANSION_COST = 500;

export const canExpandGrid = (currentSize, currency) => {
  return currentSize < 16 && currency >= GRID_EXPANSION_COST;
};
