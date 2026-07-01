import React from "react";

const KachelCard = ({ 
  title, 
  url, 
  image,
  onClick
}: { 
  title: string; 
  url: string; 
  image: string;
  onClick?: () => void;
}) => {
  
  return (
    <div className="flex items-center justify-center bg-gray-100 p-2 w-auto h-auto">
      <img src={image} alt={title} className="w-4 h-3 flex items-center justify-center">
        <h4 className="text-lg font-bold text-blue-500">{title}</h4>
        <p className="text-xl text-gray-600 mb-2">{url}</p>
      </img>
      
      {/* Optional click handler for opening URL */}
      <button 
        onClick={onClick} 
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Open
      </button>
    </div>
  );
};

export default KachelCard;