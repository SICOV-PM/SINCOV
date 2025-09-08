import { Link } from "react-router-dom";
import Bubbles from "../../components/layout/Bubbles";
import BackgroundDecorations from "../../components/layout/BackgroundDecorations";

const Home = () => {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
      {/* Fondo decorativo */}
      <BackgroundDecorations />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Bubbles count={90} />
      </div>

      {/* Contenido principal */}
      <section className="relative z-10 text-center p-8 md:p-12 rounded-3xl backdrop-blur-sm bg-white/30 border border-white/20 shadow-2xl max-w-4xl mx-4">
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 mb-2 tracking-tight leading-none">
          SINCOV-PM
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
          Sistema de Información y Visualización del Comportamiento del PM2.5
        </p>
        <Link to="/monitoring">
          <button
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
            aria-label="Ir a monitoreo"
          >
            <span className="flex items-center justify-center gap-2">
              Ir a Monitoreo
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </button>
        </Link>
      </section>

      <footer className="absolute bottom-4 text-xs text-gray-400 z-10">
        Sistema de Visualización de PM2.5 &copy; 2025
      </footer>
    </main>
  );
};

export default Home;
