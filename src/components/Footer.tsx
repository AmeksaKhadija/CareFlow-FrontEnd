import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-blue-600 rounded flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <span className="font-bold text-white">CareFlow</span>
            </div>
            <p className="text-sm">
              Votre partenaire de confiance pour la gestion clinique moderne.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  Rendez-vous
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  Dossiers médicaux
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  Laboratoire
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  Formation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">Contact</h4>
            <div className="text-sm space-y-1">
              <p>📞 +33 1 23 45 67 89</p>
              <p>✉️ contact@careflow.local</p>
              <p>📍 123 Rue de la Santé, Paris</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-600 pt-4 flex flex-col sm:flex-row justify-between items-center text-sm">
          <div>
            © {new Date().getFullYear()} CareFlow — Tous droits réservés.
          </div>
          <div className="flex gap-4 mt-3 sm:mt-0">
            <Link
              to="/privacy"
              className="hover:text-teal-400 transition-colors"
            >
              Confidentialité
            </Link>
            <Link to="/terms" className="hover:text-teal-400 transition-colors">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
