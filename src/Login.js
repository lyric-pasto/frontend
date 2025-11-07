import React, { useState } from "react";
import "./Login.css";
import logo from "./logo.svg";
import bg from "./bg.jpg"; // <-- nueva línea

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!name) return alert("Ingresa un nombre de usuario");
    onLogin({ name, avatar: null });
  };

  return (
    <div className="login-viewport">
      {/* usa style para la imagen de fondo */}
      <div
        className="login-bg"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="login-card" role="dialog" aria-labelledby="login-title">
        <header className="login-header">
          <img src={logo} className="login-logo" alt="Loom-track logo" />
          <h1 id="login-title">Bienvenido a Loom-track</h1>
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
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setName("invitado");
                onLogin({ name: "invitado" });
              }}
            >
              Entrar como invitado
            </button>
          </div>
        </form>

        <footer className="login-footer">
          <small>¿No tienes cuenta? Contacta con el administrador.</small>
        </footer>
      </div>
    </div>
  );
}
