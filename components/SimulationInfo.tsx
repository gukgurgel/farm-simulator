// components/SimulationInfo.tsx
import React from 'react';

const SimulationInfo = () => {
  return (
    <div className="mt-6 p-4 bg-green-800 rounded text-white shadow">
      <h3 className="text-lg font-bold mb-2">About This Simulator</h3>
      <div className="text-sm space-y-2">
        <p>
          This 3D Farm Crop Simulator allows you to visualize crop growth with realistic 
          weather conditions based on geographic location.
        </p>
        
        <div className="border-t border-green-600 pt-2 mt-2">
          <h4 className="font-bold">Key Features:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Select from multiple crop types (corn, wheat, soybean, cotton, rice)</li>
            <li>Customize field size and plant density</li>
            <li>Define custom field shapes using polygon coordinates</li>
            <li>Location-based weather patterns that affect crop growth</li>
            <li>Day-by-day timeline with weather visualization</li>
            <li>Growth stages based on environmental conditions</li>
          </ul>
        </div>
        
        <div className="border-t border-green-600 pt-2 mt-2">
          <h4 className="font-bold">Weather Simulation:</h4>
          <p>
            Weather conditions are simulated based on location, affecting plant growth in realistic ways:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Temperature affects growth rate and plant health</li>
            <li>Humidity and rainfall influence development</li>
            <li>Sunlight availability impacts photosynthesis</li>
            <li>Seasonal patterns change based on hemisphere</li>
          </ul>
        </div>
        
        <div className="border-t border-green-600 pt-2 mt-2">
          <h4 className="font-bold">Save & Load:</h4>
          <p>
            You can save your simulation configuration as a JSON file and reload it later.
            Configuration includes crop type, field parameters, and location.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimulationInfo;