"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

type AuthContextType = {
  isAuthenticated: boolean;
  username: string | null;
  editMode: boolean;
  login: (user: string) => void;
  logout: () => void;
  setEditMode: (mode: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  editMode: false,
  login: () => {},
  logout: () => {},
  setEditMode: () => {},
});

export const useAuth = () => useContext(AuthContext);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [editMode, setEditModeState] = useState(false);

  useEffect(() => {
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

    // Load edit mode from localStorage
    const savedEditMode = localStorage.getItem("kachel-edit-mode");
    if (savedEditMode === "true") setEditModeState(true);

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
    setEditModeState(false);
    localStorage.removeItem("kachel-edit-mode");
    sessionStorage.removeItem("kachel-auth");
  };

  const setEditMode = (mode: boolean) => {
    setEditModeState(mode);
    localStorage.setItem("kachel-edit-mode", String(mode));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, editMode, login, logout, setEditMode }}>
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