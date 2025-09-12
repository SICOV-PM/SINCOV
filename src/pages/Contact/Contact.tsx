import { Link } from "react-router-dom";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
    alert("Mensaje enviado (simulado) ✅");
    setFormData({ name: "", email: "", message: "" });
  };

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
            <h1 className="text-xl font-bold text-gray-800">Contacto</h1>
          </div>
        </div>
      </header>

      {/* Formulario */}
      <main className="px-6 py-10 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 glass-panel">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Envíanos un mensaje
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="tuemail@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Escribe tu mensaje aquí..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
            >
              Enviar mensaje
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Contact;
