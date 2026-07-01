import React from "react";

const KachelManager = () => {
  return (
    <div className="flex items-right justify-bottom p-2 w-auto h-auto">
      {/* Settings button with gear icon */}
      <button
        onClick={() => console.log("Settings opened")}
        className="w-4 h-1 bg-gray-300 text-white"
      >
        ⚙️ Settings
      </button>
      
      /* Theme toggle button */
      <button 
        onClick={() => console.log("Theme toggled")}
        className="w-4 h-1 bg-gray-300 text-white"
      >
        💡 Toggle Theme
      </button>
    </div>
  );
};

export default KachelManager;