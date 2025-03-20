import * as THREE from 'three';
import { generateWeatherData, applyWeatherToScene, RainSystem } from '../weather';
import { PLANT_HEIGHTS } from '../crops';

// Growth stage modifiers (0-1) for different growth phases
const GROWTH_STAGES = {
  SEEDLING: 0.2,      // Initial growth
  VEGETATIVE: 0.6,    // Main growth phase
  REPRODUCTIVE: 0.9,  // Flowering/fruiting phase
  MATURE: 1.0         // Fully mature
};

/**
 * Creates a timeline for crop growth and weather simulation
 * @param {Object} cropData - Crop type and initial parameters
 * @param {Date} startDate - Start date of simulation
 * @param {number} days - Number of days to simulate
 * @returns {Object} Timeline data
 */
export const createCropTimeline = (cropData, startDate = new Date(), days = 90) => {
  const { type, hectares, density } = cropData;
  
  // Generate weather data for the entire timeline
  const weatherData = generateWeatherData(days, startDate);
  
  // Calculate cumulative growth factors for each day
  const timelineData = weatherData.map((day, index) => {
    // Base growth percentage based on day number (simplified s-curve growth)
    const dayRatio = day.dayNumber / days;
    let baseGrowth;
    
    // Start with visible plants (at least 20% growth)
    if (dayRatio < 0.2) {
      // Initial growth starts at 20% (seedling stage)
      baseGrowth = 0.2 + (dayRatio * 0.5);
    } else if (dayRatio < 0.7) {
      // Rapid middle growth (vegetative stage)
      baseGrowth = 0.3 + (dayRatio - 0.2) * 1.2;
    } else {
      // Tapering final growth (reproductive & mature stages)
      baseGrowth = 0.7 + (dayRatio - 0.7) * 0.6;
    }
    
    // Factor in daily weather conditions
    const growthMultiplier = day.growthFactor;
    const adjustedGrowth = baseGrowth * (0.8 + growthMultiplier * 0.4);
    
    // Determine growth stage
    let growthStage;
    if (adjustedGrowth < 0.2) {
      growthStage = 'SEEDLING';
    } else if (adjustedGrowth < 0.6) {
      growthStage = 'VEGETATIVE';
    } else if (adjustedGrowth < 0.9) {
      growthStage = 'REPRODUCTIVE';
    } else {
      growthStage = 'MATURE';
    }
    
    return {
      ...day,
      growthPercent: Math.min(1, Math.max(0, adjustedGrowth)),
      growthStage
    };
  });
  
  return {
    type,
    hectares,
    density,
    days: timelineData
  };
};

/**
 * Update plants in the scene based on growth stage
 * @param {Object} timelineDay - The current day's data
 * @param {Array} plants - Array of plant objects in the scene
 * @param {string} cropType - Type of crop
 */
export const updatePlantsForGrowthStage = (timelineDay, plants, cropType) => {
  if (!plants || plants.length === 0) return;
  
  const { growthPercent } = timelineDay;
  const baseHeight = PLANT_HEIGHTS[cropType] || 1.0;
  
  console.log(`Updating ${plants.length} plants for growth stage: ${timelineDay.growthStage}, percent: ${growthPercent}`);
  
  // Update each plant
  plants.forEach(plant => {
    // Skip non-plant objects
    if (!plant.userData || !plant.userData.isPlant) return;
    
    // Adjust plant height based on growth
    const targetHeight = baseHeight * growthPercent;
    
    // Ensure minimum scale to avoid invisible plants
    const plantScale = Math.max(0.2, growthPercent);
    
    // Set the scale to match the growth percentage
    plant.scale.set(
      plantScale, 
      plantScale, 
      plantScale
    );
    
    // For corn specifically, show/hide cobs based on growth stage
    if (cropType === 'corn') {
      // Find cobs (usually the 3rd and possibly 4th child in the corn plant)
      if (plant.children && plant.children.length > 2) {
        // Primary cob - show in reproductive and mature stages
        if (plant.children[2]) {
          plant.children[2].visible = growthPercent >= 0.6;
        }
        
        // Secondary cob (if exists) - show only in mature stage
        if (plant.children[3]) {
          plant.children[3].visible = growthPercent >= 0.85;
        }
      }
    }
  });
};

/**
 * Initialize timeline controls for the scene
 * @param {Object} timeline - Timeline data
 * @param {THREE.Scene} scene - The scene
 * @param {Object} sceneObjects - Object containing references to scene objects
 * @param {Function} setDayInfo - Function to update UI with day information
 * @returns {Object} Timeline controller
 */
export const initializeTimelineController = (timeline, scene, sceneObjects, setDayInfo) => {
  let currentDayIndex = 0;
  let paused = true;
  let autoAdvanceInterval = null;
  let rainSystem = null;
  
  // Initialize rain system
  rainSystem = new RainSystem(scene, 0);
  
  // Update the scene for a specific day
  const updateSceneForDay = (dayIndex) => {
    if (dayIndex < 0 || dayIndex >= timeline.days.length) return;
    
    const dayData = timeline.days[dayIndex];
    
    // Update plants
    if (sceneObjects.plants && sceneObjects.plants.length > 0) {
      updatePlantsForGrowthStage(dayData, sceneObjects.plants, timeline.type);
    }
    
    // Update weather effects
    applyWeatherToScene(
      dayData, 
      scene, 
      { 
        directional: sceneObjects.directionalLight, 
        ambient: sceneObjects.ambientLight 
      },
      sceneObjects.clouds,
      rainSystem
    );
    
    // Update UI
    if (setDayInfo) {
      setDayInfo(dayData);
    }
    
    currentDayIndex = dayIndex;
  };
  
  // Set up auto-advance
  const setAutoAdvance = (enabled, intervalMs = 1000) => {
    clearInterval(autoAdvanceInterval);
    paused = !enabled;
    
    if (enabled) {
      autoAdvanceInterval = setInterval(() => {
        const nextDay = currentDayIndex + 1;
        if (nextDay < timeline.days.length) {
          updateSceneForDay(nextDay);
        } else {
          // Stop at the end
          clearInterval(autoAdvanceInterval);
          paused = true;
        }
      }, intervalMs);
    }
  };
  
  // Start with day 0
  updateSceneForDay(0);
  
  return {
    getCurrentDay: () => timeline.days[currentDayIndex],
    getCurrentDayIndex: () => currentDayIndex,
    getTotalDays: () => timeline.days.length,
    setDay: (dayIndex) => {
      updateSceneForDay(dayIndex);
    },
    nextDay: () => {
      if (currentDayIndex < timeline.days.length - 1) {
        updateSceneForDay(currentDayIndex + 1);
      }
    },
    prevDay: () => {
      if (currentDayIndex > 0) {
        updateSceneForDay(currentDayIndex - 1);
      }
    },
    isPaused: () => paused,
    play: () => setAutoAdvance(true),
    pause: () => setAutoAdvance(false),
    setSpeed: (speedFactor) => {
      const wasPlaying = !paused;
      if (wasPlaying) {
        pause();
        play(1000 / speedFactor);
      }
    },
    cleanup: () => {
      clearInterval(autoAdvanceInterval);
      if (rainSystem) {
        rainSystem.dispose();
      }
    }
  };
};