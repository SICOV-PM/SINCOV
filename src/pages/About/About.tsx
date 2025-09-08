import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium">Volver</span>
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-800">Acerca de</h1>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="px-6 py-10 max-w-5xl mx-auto">
        {/* Introducción */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold text-blue-700 mb-4">
            SINCOV-PM
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            El <strong>Sistema de Información y Visualización del Comportamiento del PM2.5 </strong> 
            busca proporcionar herramientas para la visualización, análisis y 
            monitoreo de la calidad del aire, facilitando la toma de decisiones 
            en temas ambientales y de salud pública.
          </p>
        </section>

        {/* Características principales */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Características principales
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl shadow-lg">
              <h4 className="text-lg font-semibold text-blue-600 mb-2">
                Monitoreo
              </h4>
              <p className="text-sm text-gray-600">
                Visualización dinámica de niveles de PM2.5 a través de mapas de calor 
                y estaciones de monitoreo distribuidas en la ciudad.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-2xl shadow-lg">
              <h4 className="text-lg font-semibold text-blue-600 mb-2">
                Reportes históricos
              </h4>
              <p className="text-sm text-gray-600">
                Acceso a registros pasados para identificar tendencias, patrones y 
                comparar periodos de tiempo en la calidad del aire.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-2xl shadow-lg">
              <h4 className="text-lg font-semibold text-blue-600 mb-2">
                Predicciones y alertas
              </h4>
              <p className="text-sm text-gray-600">
                Análisis predictivo basado en datos históricos para anticipar 
                episodios de alta contaminación y emitir alertas tempranas.
              </p>
            </div>
          </div>
        </section>

        {/* Créditos */}
        <section className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Créditos</h3>
          <p className="text-gray-600">
            Este sistema fue desarrollado como parte de un proyecto académico y de investigación 
            para el análisis de la contaminación atmosférica por PM2.5.  
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © {new Date().getFullYear()} SINCOV-PM. Todos los derechos reservados.
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;
