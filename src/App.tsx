import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Router imports are handled by the framework */}
      <div className="w-auto h-auto">
        {/* Placeholder for routing logic - in actual app this would be handled by react-router-dom */}
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Kachel Manager</h1>
          <p className="text-xl text-gray-600 mb-4">Login required to access dashboard</p>
        </div>
      </div>
    </TooltipProvider>
  <QueryClientProvider client={queryClient}>
);

export default App;