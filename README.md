# 🧾 Sistema POS Web

Sistema POS (Point of Sale) desarrollado para la gestión de ventas e inventario en un negocio tipo bar/tienda.

Aplicación web construida con **React + TypeScript + Vite** y backend gestionado con **Supabase (PostgreSQL + Auth)**.

---

## 🚀 Demo en Producción

🔗 https://bar-pos-system.vercel.app/

---

## 🔐 Funcionalidades

- Autenticación de usuarios
- Gestión de roles (Administrador / Cajero)
- Registro de ventas en tiempo real
- Actualización automática de inventario
- Gestión de productos
- Generación de reportes dinámicos
- Arquitectura modular basada en componentes reutilizables
- Diseño responsive optimizado para escritorio y tablet

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Supabase (PostgreSQL)
- Supabase Auth

### Herramientas
- Git & GitHub
- Vercel (Deploy)
- ESLint

---

## 🧠 Arquitectura

La aplicación sigue una estructura modular organizada por funcionalidades:

- `LoginModule`
- `POSModule`
- `InventoryModule`
- `ReportsModule`
- `UserModule`

La conexión con Supabase se gestiona desde una capa centralizada en `lib/supabase.ts`.

---

## ⚙️ Instalación Local

```bash
git clone https://github.com/SadadJimenez/bar-pos-system.git
cd bar-pos-system
npm install
npm run dev