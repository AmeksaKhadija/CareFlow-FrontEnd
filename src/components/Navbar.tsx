import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-teal-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
                CareFlow
              </span>
            </Link>
            <div className="hidden sm:flex space-x-6 text-sm">
              <Link
                to="/"
                className="text-slate-700 hover:text-teal-600 font-medium transition-colors"
              >
                Accueil
              </Link>
              <a
                href="#about"
                className="text-slate-700 hover:text-teal-600 font-medium transition-colors"
              >
                À propos
              </a>
              <a
                href="#services"
                className="text-slate-700 hover:text-teal-600 font-medium transition-colors"
              >
                Services
              </a>
              <a
                href="#contact"
                className="text-slate-700 hover:text-teal-600 font-medium transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && user ? (
              <>
                <div className="text-sm text-slate-700 mr-2">
                  Bonjour, {user.name || user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all shadow-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-slate-600 hover:text-teal-600 font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all shadow-sm"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
