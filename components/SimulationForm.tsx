'use client'

import React, { useState } from 'react';
import SimulationInfo from './SimulationInfo';

const SimulationForm = ({ onStartSimulation }) => {
  // Default polygon for a square field
  const defaultPolygon = JSON.stringify([
    [-50, 0, -50],
    [-50, 0, 50],
    [50, 0, 50],
    [50, 0, -50]
  ], null, 2);
  
  // Form state
  const [cropType, setCropType] = useState('corn');
  const [hectares, setHectares] = useState(2.5);
  const [polygonInput, setPolygonInput] = useState(defaultPolygon);
  const [plantDensity, setPlantDensity] = useState(70);
  const [error, setError] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Start simulation with provided parameters
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSimulating(true);
    
    try {
      // Parse the polygon input
      let polygon;
      try {
        polygon = JSON.parse(polygonInput);
        
        // Validate the polygon format
        if (!Array.isArray(polygon)) {
          throw new Error('Polygon must be an array of coordinates');
        }
        
        if (polygon.length < 3) {
          throw new Error('Polygon must have at least 3 vertices');
        }
        
        for (const point of polygon) {
          if (!Array.isArray(point) || point.length !== 3) {
            throw new Error('Each vertex must be an array of 3 coordinates [x, y, z]');
          }
        }
      } catch (err) {
        throw new Error(`Invalid polygon format: ${err.message}`);
      }
      
      // Pass the simulation parameters to the parent component
      onStartSimulation({
        type: cropType,
        hectares: parseFloat(hectares),
        density: parseInt(plantDensity),
        polygon: polygon
      });
      
    } catch (err) {
      setError(err.message);
      setIsSimulating(false);
    }
  };
  
  return (
    <div className="w-80 bg-green-700 p-4 h-full overflow-y-auto flex-shrink-0 z-10 shadow-lg absolute left-0 top-0 bottom-0">
      <h2 className="text-xl text-white font-bold mb-4">Simulation Parameters</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Crop Type */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">
            Crop Type
          </label>
          <select
            className="w-full p-2 rounded border border-gray-300"
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
          >
            <option value="corn">Corn</option>
            <option value="wheat">Wheat</option>
            <option value="soybean">Soybean</option>
            <option value="cotton">Cotton</option>
            <option value="rice">Rice</option>
          </select>
        </div>
        
        {/* Field Size */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">
            Field Size (hectares)
          </label>
          <input
            type="number"
            className="w-full p-2 rounded border border-gray-300"
            min="0.1"
            max="100"
            step="0.1"
            value={hectares}
            onChange={(e) => setHectares(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
          />
        </div>
        
        {/* Plant Density */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">
            Plant Density: {plantDensity}%
          </label>
          <input
            type="range"
            className="w-full"
            min="10"
            max="100"
            value={plantDensity}
            onChange={(e) => setPlantDensity(parseInt(e.target.value))}
          />
        </div>
        
        {/* Polygon Input */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">
            Field Polygon (JSON format)
          </label>
          <textarea
            className="w-full p-2 rounded border border-gray-300 font-mono text-sm"
            rows="8"
            value={polygonInput}
            onChange={(e) => setPolygonInput(e.target.value)}
            placeholder='[[-50,0,-50],[-50,0,50],[50,0,50],[50,0,-50]]'
          />
          <p className="text-xs text-gray-200 mt-1">
            Format: Array of [x, y, z] coordinates defining the field shape.
            The y-value should always be 0.
          </p>
        </div>
        
        {/* Start Simulation Button */}
        <button
          type="submit"
          className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
          disabled={isSimulating && !error}
        >
          {isSimulating && !error ? 'Simulating...' : 'Start Simulation'}
        </button>
      </form>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-600 text-white rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <SimulationInfo />
    </div>
  );
};

export default SimulationForm;