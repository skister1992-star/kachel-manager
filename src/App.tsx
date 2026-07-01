"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

type AuthContextType = {
  isAuthenticated: boolean;
  username: string | null;
  login: (user: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check session on mount
    const stored = sessionStorage.getItem("kachel-auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIsAuthenticated(parsed.isAuthenticated || false);
        setUsername(parsed.username || null);
      } catch {
        sessionStorage.removeItem("kachel-auth");
      }
    }

    // Initialize theme from localStorage
    const theme = localStorage.getItem("theme") || "light";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const login = (user: string) => {
    setIsAuthenticated(true);
    setUsername(user);
    sessionStorage.setItem(
      "kachel-auth",
      JSON.stringify({ isAuthenticated: true, username: user })
    );
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    sessionStorage.removeItem("kachel-auth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? <Login /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;