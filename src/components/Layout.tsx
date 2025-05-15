import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect for scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Effect for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navbar */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-sm shadow-sm' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                Córdoba Casas
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink to="/" currentPath={location.pathname}>
                Inicio
              </NavLink>
              <NavLink to="/propiedades" currentPath={location.pathname}>
                Propiedades
              </NavLink>
              <NavLink to="/contacto" currentPath={location.pathname}>
                Contacto
              </NavLink>
              <NavLink to="/admin" currentPath={location.pathname}>
                Admin
              </NavLink>
            </nav>
            <div className="md:hidden">
              <button
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                onClick={() => {
                  const mobileMenu = document.getElementById("mobile-menu");
                  mobileMenu?.classList.toggle("hidden");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          <div id="mobile-menu" className="md:hidden hidden pb-4">
            <div className="flex flex-col space-y-3">
              <MobileNavLink to="/" currentPath={location.pathname}>
                Inicio
              </MobileNavLink>
              <MobileNavLink to="/propiedades" currentPath={location.pathname}>
                Propiedades
              </MobileNavLink>
              <MobileNavLink to="/contacto" currentPath={location.pathname}>
                Contacto
              </MobileNavLink>
              <MobileNavLink to="/admin" currentPath={location.pathname}>
                Admin
              </MobileNavLink>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with padding for fixed header */}
      <main className="flex-grow pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Córdoba Casas</h3>
              <p className="text-gray-300">
                Tu agente inmobiliario de confianza en Córdoba. Ofrecemos servicios de venta y alquiler de propiedades en toda la ciudad.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/propiedades" className="text-gray-300 hover:text-white">
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link to="/contacto" className="text-gray-300 hover:text-white">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contacto</h3>
              <address className="not-italic text-gray-300">
                <p className="mb-2">Av. Colón 1234</p>
                <p className="mb-2">Córdoba Capital, Argentina</p>
                <p className="mb-2">+54 9 351 234-5678</p>
                <p>contacto@cordobacasas.com</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Córdoba Casas. Todos los derechos reservados. Nicolas Perez.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink: React.FC<{
  to: string;
  currentPath: string;
  children: React.ReactNode;
}> = ({ to, currentPath, children }) => {
  const isActive = currentPath === to || (to !== "/" && currentPath.startsWith(to));

  return (
    <Link
      to={to}
      className={`font-medium ${
        isActive
          ? "text-blue-600 border-b-2 border-blue-600"
          : "text-gray-600 hover:text-blue-600"
      } py-5`}
    >
      {children}
    </Link>
  );
};

const MobileNavLink: React.FC<{
  to: string;
  currentPath: string;
  children: React.ReactNode;
}> = ({ to, currentPath, children }) => {
  const isActive = currentPath === to || (to !== "/" && currentPath.startsWith(to));

  return (
    <Link
      to={to}
      className={`text-center py-2 ${
        isActive
          ? "bg-blue-100 text-blue-600 font-medium rounded-md"
          : "text-gray-600 hover:text-blue-600"
      }`}
    >
      {children}
    </Link>
  );
};

export default Layout;