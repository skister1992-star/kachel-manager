import React from "react";
import { Toaster } from "@/components/ui/toast";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h2 className="text-lg font-bold mb-4">Login Required</h2>
      
      <div className="flex items-center justify-center p-6">
        <h3 className="text-xl font-bold text-blue-500 mb-4">Authentication</h3>
        
        {/* Login form */}
        <div className="flex items-center justify-center w-8 h-4">
          <input 
            type="text"
            placeholder="Username"
            value=""
            onChange={(e) => console.log("Username:", e.target.value)}
          />
          
          <input
            type="password"
            placeholder="Password"  
            value=""
            onChange={(e) => console.log("Password:", e.target.value)}
          />
        </div>
        
        {/* Login button */}
        <button 
          onClick={() => {
            // In a real app, this would validate credentials
            console.log("Login attempt");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <span className="text-center">
            <div className="w-auto" children={<p className="text-lg">Login</p>}>
              Login
            </div>
          </span>
        </button>
      </div>
      
      <p className="text-xl text-gray-600 mb-4">
        Please enter your credentials to access the dashboard.
      </p>
    </div>
  );
};

export default LoginPage;