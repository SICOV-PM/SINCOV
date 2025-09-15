# 🌐 SICOVPM – Frontend

Este repositorio contiene el **frontend del sistema web SICOVPM**, desarrollado con **React, Vite y TailwindCSS**.  
El sistema permite visualizar de forma interactiva los datos de concentración de **PM2.5** en Bogotá bajo diferentes escenarios, consumiendo la API del backend implementado en **Django REST**.

---

## 🚀 Características

- **React + Vite** → Renderizado rápido y moderno.  
- **TailwindCSS** → Estilos utilitarios y diseño responsivo.  
- **Arquitectura modular** → Separación en componentes, páginas, servicios y rutas.  
- **Soporte para API REST** → Integración con el backend.  
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

env
VITE_API_URL=http://localhost:8000/api
▶️ Ejecución en desarrollo
npm run dev
El frontend estará disponible en http://localhost:5173/.

🏗️ Construcción para producción
# Generar build optimizada
npm run build

# Previsualizar la build
npm run preview
Esto creará una carpeta /dist lista para desplegar en un servidor web.

📁 Estructura del proyecto
La siguiente estructura refleja la organización principal del frontend
.
├── public/                 # Recursos estáticos
│   └── vite.svg
├── src/                    # Código fuente
│   ├── components/         # Componentes reutilizables
│   │   ├── layout/         # Layout principal (Navbar, Footer, etc.)
│   │   │   ├── BackgroundDecorations.tsx
│   │   │   ├── Bubbles.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Navbar.tsx
│   │   └── map/            # Componentes de mapas y visualización
│   │       ├── BaseMap.tsx
│   │       └── HeatmapLayer.tsx
│   ├── pages/              # Páginas principales
│   │   ├── About/About.tsx
│   │   ├── Contact/Contact.tsx
│   │   ├── Home/Home.tsx
│   │   ├── Monitoring/Monitoring.tsx
│   │   └── Reports/Reports.tsx
│   ├── router/             # Definición de rutas
│   │   └── AppRouter.tsx
│   ├── services/           # Consumo de la API
│   │   ├── api.ts
│   │   ├── predict.ts
│   │   ├── reports.ts
│   │   └── stations.ts
│   ├── styles/             # Archivos CSS globales
│   │   ├── animations.css
│   │   └── index.css
│   ├── App.tsx             # Componente raíz
│   ├── main.tsx            # Punto de entrada
│   └── vite-env.d.ts
├── index.html              # HTML base
├── package.json            # Dependencias y scripts
├── vite.config.ts          # Configuración de Vite
├── tsconfig.json           # Configuración de TypeScript
├── LICENSE                 # Licencia del proyecto
└── README.md               # Documentación del repositorio


📊 Scripts disponibles
npm run dev     # Ejecuta en modo desarrollo
npm run build   # Construye para producción
npm run preview # Sirve la build localmente
npm run lint    # Revisa el código con ESLint
