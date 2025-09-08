import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute top-1/4 right-16 w-24 h-24 bg-indigo-200 rounded-full opacity-30 blur-lg animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-200 rounded-full opacity-15 blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Animated bubbles (smaller and more subtle) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 90 }).map((_, i) => {
          const size = 8 + Math.random() * 120;
          return (
            <span
              key={i}
              className="bubble absolute bg-blue-300 rounded-full opacity-20 blur-sm"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `-${size}px`,
                width: `${size}px`,
                height: `${size}px`,
                animationDuration: `${18 + Math.random() * 6}s`,
                animationDelay: `${(i * 0.5) % 20}s`,
              }}
            />
          );
        })}
      </div>

      {/* Main container with glassmorphism */}
      <div className="relative z-10 text-center p-8 md:p-12 rounded-3xl backdrop-blur-sm bg-white/30 border border-white/20 shadow-2xl max-w-4xl mx-4">
        {/* Main title */}
        <div className="mb-6">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 mb-2 tracking-tight leading-none">
            SINCOV-PM
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
        </div>

        {/* Description */}
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
          Sistema de Información y Visualización del Comportamiento del PM2.5
        </p>

        {/* Enhanced button */}
        <Link to="/monitoring">
          <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg">
            <span className="flex items-center justify-center gap-2">
              Ir a Monitoreo
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </Link>

        {/* Decorative indicators */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full opacity-80"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
      </div>

      {/* Minimalist footer */}
      <div className="absolute bottom-4 text-xs text-gray-400 z-10">
        Sistema de Visualizacón de PM2.5 &copy; 2025
      </div>
    </div>
  );
};

export default Home;