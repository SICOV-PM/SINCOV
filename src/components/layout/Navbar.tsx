import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/monitoring" className="text-2xl font-bold text-blue-600">
            SINCOV-PM
          </Link>

          {/* Links */}
          <div className="flex gap-6">
            <NavLink
              to="/monitoring"
              className={({ isActive }) =>
                `hover:text-blue-600 ${
                  isActive ? "text-blue-600 font-semibold" : "text-gray-600"
                }`
              }
            >
              Monitoreo
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `hover:text-blue-600 ${
                  isActive ? "text-blue-600 font-semibold" : "text-gray-600"
                }`
              }
            >
              Reportes
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `hover:text-blue-600 ${
                  isActive ? "text-blue-600 font-semibold" : "text-gray-600"
                }`
              }
            >
              Acerca de
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `hover:text-blue-600 ${
                  isActive ? "text-blue-600 font-semibold" : "text-gray-600"
                }`
              }
            >
              Contacto
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
