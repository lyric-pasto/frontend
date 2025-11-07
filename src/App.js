import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user") || "null")
  );

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated ? "true" : "false");
    localStorage.setItem("user", JSON.stringify(user));
  }, [isAuthenticated, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        {isAuthenticated ? (
          <div style={{ padding: 20 }}>
            <h2>Bienvenido, {user?.name}</h2>
            <button onClick={logout}>Cerrar sesión</button>
          </div>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </header>
    </div>
  );
}

export default App;
