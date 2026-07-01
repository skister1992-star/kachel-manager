import React from "react";
import { Toaster } from "@/components/ui/toast";

const LoginForm = ({ onSubmit }: { onSubmit: () => void }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-4">
        <h2 className="font-bold text-lg mb-6">Login</h2>
        
        <input 
          type="text" 
          placeholder="Username"
          value={username}
          onChange={(e) => username(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => password(e.target.value)}
        />
        
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => onSubmit()}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginForm;