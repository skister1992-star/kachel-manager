import React from "react";

const LoginForm = ({ 
  onSubmit
}: { 
  onSubmit: () => void;
}) => {
  
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h2 className="text-lg font-bold mb-4">Login</h2>
      
      <input 
        type="text" 
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <button
        onClick={() => onSubmit()}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Login
      </button>
    </div>
  );
};

export default LoginForm;