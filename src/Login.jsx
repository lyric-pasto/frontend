
import React, { useState } from "react";
import "./Login.css";
import logo from "./assets/logo.png";
import bg from "./assets/login.jpg";
import axios from "axios";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
  e.preventDefault();

  if (!name || !password) {
    return alert("Usuario y contraseña obligatorios");
  }

  try {
    const response = await axios.post(
      "http://localhost:3001/api/login",
      {
        username: name,
        password: password,
      }
    );

    if (response.data.ok) {
      // Login correcto → pasamos datos reales
      onLogin(response.data.user);
    } else {
      alert("Credenciales incorrectas");
    }
  } catch (error) {
    console.error(error);
    alert("Error al conectar con el servidor");
  }
};



  return (
    <div
      className="login-viewport"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="overlay"></div>
      <div className="login-card" role="dialog" aria-labelledby="login-title">
        <header className="login-header">
          <img src={logo} className="login-logo" alt="LoomTrack logo" />
          <h1 id="login-title">Bienvenido a LoomTrack</h1>
          <p className="login-sub">Accede para continuar</p>
        </header>

        <form className="login-form" onSubmit={submit}>
          <label className="field">
            <span>Usuario</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="tu.nombre"
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Contraseña</span>
            <div className="password-row">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="show-btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-pressed={showPassword}
                aria-label="Mostrar contraseña"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>

          <div className="actions">
            <button className="primary" type="submit">
              Entrar
            </button>

          </div>
        </form>

        <footer className="login-footer">
  <small>
    ¿No tienes cuenta?{" "}
    <a
      href="https://wa.me/51928193824?text=Hola,%20quisiera%20crear%20una%20cuenta%20en%20LoomTrack"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-link"
    >
      Contáctanos por WhatsApp
    </a>
  </small>
</footer>

      </div>
    </div>
  );
}
