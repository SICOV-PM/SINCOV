# SICOVPM – Frontend

Este repositorio contiene el **frontend del sistema web SICOVPM**, desarrollado con **React, Vite y TailwindCSS**.  
El objetivo es visualizar interactivamente los datos de concentración de **PM2.5** en Bogotá bajo diferentes escenarios, consumiendo la API del backend.

---

## 🚀 Características

- **React + Vite** → Renderizado rápido y moderno.  
- **TailwindCSS** → Estilos utilitarios y diseño responsivo.  
- **Arquitectura modular** → Separación en componentes, páginas y servicios.  
- **Soporte para API REST** → Conexión con el backend (Django REST).  
- **Configuración lista para producción** con `vite build`.

---

## 📦 Requisitos previos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) >= 18  
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)  

---

## ⚙️ Instalación

```bash
# Clonar repositorio
git clone https://github.com/usuario/sicovpm-frontend.git
cd sicovpm-frontend

# Instalar dependencias
npm install
Crear un archivo .env en la raíz con la URL de la API:

bash
Copy code
VITE_API_URL=http://localhost:8000/api
▶️ Ejecución en desarrollo
bash
Copy code
npm run dev
El frontend estará disponible en http://localhost:5173/.

🏗️ Construcción para producción
bash
Copy code
# Generar build optimizada
npm run build

# Previsualizar la build
npm run preview
Esto creará una carpeta /dist lista para desplegar en un servidor web.

📁 Estructura principal
text
Copy code
.
├── public/              # Recursos estáticos
├── src/                 # Código fuente
│   ├── assets/          # Imágenes, íconos
│   ├── components/      # Componentes reutilizables
│   ├── pages/           # Páginas principales
│   ├── services/        # Consumo de API
│   └── main.tsx         # Punto de entrada
├── index.html           # HTML base
├── package.json         # Dependencias y scripts
└── vite.config.ts       # Configuración de Vite
📊 Scripts disponibles
text
Copy code
npm run dev     → Ejecuta en modo desarrollo.
npm run build   → Construye para producción.
npm run preview → Sirve la build localmente.
npm run lint    → Revisa el código con ESLint.
