import React from "react";
import KachelCard from "@/components/ui/kachel-card";
import KachelManager from "@/components/ui/kachel-manager";

const Dashboard = () => {
  // Sample data - in real app this would be loaded from persistent storage
  const sampleKachels = [
    { id: "1", title: "Sample Chicle 1", url: "https://example.com/1", image: "/images/sample.png" },
    { id: "2", title: "Sample Chicle 2", url: "https://example.com/2", image: "/images/sample2.png" }
  ];
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h2 className="text-lg font-bold mb-4">Kachel Manager Dashboard</h2>
      
      <div className="flex items-center justify-center p-6">
        <h3 className="text-xl font-bold text-blue-500 mb-4">Your Kachel Items</h3>
        
        {/* Display all kachels */}
        <ul className="w-auto flex items-center justify-center" 
          children={sampleKachels.map((k) => (
            <li className="p-2"
              <KachelCard
                title={k.title}
                url={k.url}  
                image={k.image}
                onClick={() => window.open(k.url)}
              >
            </li>
          ))}
        />
        
        {/* Management controls in bottom right */}
        <div className="flex items-right justify-bottom p-2">
          <KachelManager />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;