// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import MenuPrincipal from "./layouts/MenuPrincipal";

function App() {
  // Inicializar en false para evitar login automático por restos antiguos en localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
    }
  }, [isAuthenticated, user]);

  // handler que activa la sesión 
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Página raíz: si no está autenticado → Login; si ya autenticado → redirige al menú */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/menu/inicio" replace />
            )
          }
        />

        {/* Rutas del área privada */}
        <Route
          path="/menu/*"
          element={
            isAuthenticated ? (
              <MenuPrincipal user={user} logout={logout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* cualquier otra ruta va al root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
