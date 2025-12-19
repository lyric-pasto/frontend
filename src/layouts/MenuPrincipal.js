import React, { useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaUserFriends,
  FaClipboardList,
  FaBoxOpen,
  FaCubes,
  FaExchangeAlt,
  FaUsersCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./MenuPrincipal.css";

import Inicio from "../pages/Inicio";
import Clientes from "../pages/Clientes";
import Pedidos from "../pages/Pedidos";
import Productos from "../pages/Productos";
import Movimientos from "../pages/Movimientos";
import Usuarios from "../pages/Usuarios";
import Material from "../pages/Material.jsx";



export default function MenuPrincipal({ user, logout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [date] = useState(() => new Date().toLocaleDateString("es-PE"));

  return (
    <div className="layout">
      {/* Barra superior */}
      <header className="top-bar">
        <div className="top-left">
          <button
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Contraer o expandir menú"
          >
            <FaBars />
          </button>
          <h1 className="title">Textiles Kalev</h1>
        </div>
        <div className="top-right">
          <span className="fecha">{date}</span>
          <span className="usuario">{user?.name}</span>
        </div>
      </header>

      {/* Menú lateral */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <nav className="menu">
          <NavLink to="inicio">
            <FaHome /> <span>Inicio</span>
          </NavLink>
          <NavLink to="clientes">
            <FaUserFriends /> <span>Clientes</span>
          </NavLink>
          <NavLink to="pedidos">
            <FaClipboardList /> <span>Pedidos</span>
          </NavLink>
          <NavLink to="productos">
            <FaCubes /> <span>Productos</span>
          </NavLink>
          <NavLink to="material">
            <FaUsersCog /> <span>Material</span>
          </NavLink>
          <NavLink to="movimientos">
            <FaExchangeAlt /> <span>Movimientos</span>
          </NavLink>
          
          <NavLink to="usuarios">
            <FaUsersCog /> <span>Usuarios</span>
          </NavLink>
          

        </nav>

        <div className="footer">
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt /> <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className={`content ${collapsed ? "expanded" : ""}`}>
        <Routes>
          <Route path="inicio" element={<Inicio />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="productos" element={<Productos />} />
          <Route path="material" element={<Material />} />
          <Route path="movimientos" element={<Movimientos />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Routes>
      </main>
    </div>
  );
}
