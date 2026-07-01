import React from "react";
import LoginForm from "@/components/ui/login-form";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h2 className="text-lg font-bold mb-4">Login Required</h2>
      
      <LoginForm onSubmit={() => console.log("Login submitted")}>
        <p className="text-xl text-gray-600">
          Please enter your credentials to access the dashboard.
        </p>
      </LoginForm>
    </div>
  );
};

export default LoginPage;