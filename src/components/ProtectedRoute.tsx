import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  // Permettre l'accès au profil si l'utilisateur vient de s'inscrire
  const registrationData = localStorage.getItem("cf_registration_data");
  const isFromRegistration =
    registrationData && window.location.pathname === "/profile";

  // Rediriger vers login si pas connecté (sauf si vient de l'inscription et va vers le profil)
  if (!user && !isFromRegistration) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier les rôles si nécessaire (seulement si l'utilisateur est authentifié)
  if (requiredRoles && requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user.roles.some(
        (userRole) => userRole.toLowerCase() === role.toLowerCase()
      )
    );

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center bg-white p-8 rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Accès refusé
            </h1>
            <p className="text-slate-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
  }

  // Afficher le composant protégé
  return <>{children}</>;
}
