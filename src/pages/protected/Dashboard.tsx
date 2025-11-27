import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur vient du profil (nouveau compte)
    if (
      searchParams.get("from") === "profile" ||
      document.referrer.includes("/profile")
    ) {
      setShowWelcome(true);
      // Masquer le message après 5 secondes
      setTimeout(() => setShowWelcome(false), 5000);
    }
  }, [searchParams]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">
            Vous devez être connecté pour voir cette page
          </p>
          <Link
            to="/login"
            className="bg-teal-600 text-white px-4 py-2 rounded"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const userRole = user.role;

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      patient: "Patient",
      medecin: "Médecin",
      infirmier: "Infirmier(ère)",
      admin: "Administrateur",
      pharmacien: "Pharmacien",
      laborantin: "Laborantin",
    };
    return roleMap[role] || role;
  };

  const getRoleIcon = (role: string) => {
    const iconMap: Record<string, string> = {
      patient: "🧑‍🦱",
      medecin: "👨‍⚕️",
      infirmier: "👩‍⚕️",
      admin: "👔",
      pharmacien: "💊",
      laborantin: "🧪",
    };
    return iconMap[role] || "👤";
  };

  // Dashboard spécifique par rôle
  const renderRoleSpecificDashboard = () => {
    switch (userRole) {
      case "admin":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/users"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  👥
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Gestion des utilisateurs
                  </h3>
                  <p className="text-sm text-slate-600">
                    Gérer le personnel et les patients
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/appointments"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  📅
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Tous les rendez-vous
                  </h3>
                  <p className="text-sm text-slate-600">
                    Vue d'ensemble des RDV
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/reports"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                  📊
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Rapports</h3>
                  <p className="text-sm text-slate-600">
                    Statistiques et analyses
                  </p>
                </div>
              </div>
            </Link>
          </div>
        );

      case "medecin":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/appointments"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📅
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Mes rendez-vous
                  </h3>
                  <p className="text-sm text-slate-600">
                    Consulter mon planning
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/patients"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  🧑‍🦱
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Mes patients</h3>
                  <p className="text-sm text-slate-600">Dossiers médicaux</p>
                </div>
              </div>
            </Link>

            <Link
              to="/prescriptions"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                  💊
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Prescriptions
                  </h3>
                  <p className="text-sm text-slate-600">
                    Gérer les ordonnances
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/consultations"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-2xl">
                  🩺
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Consultations
                  </h3>
                  <p className="text-sm text-slate-600">
                    Historique des consultations
                  </p>
                </div>
              </div>
            </Link>
          </div>
        );

      case "patient":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/appointments/new"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📅
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Prendre RDV</h3>
                  <p className="text-sm text-slate-600">
                    Réserver une consultation
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/appointments"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  📋
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Mes RDV</h3>
                  <p className="text-sm text-slate-600">Voir mes rendez-vous</p>
                </div>
              </div>
            </Link>

            <Link
              to="/prescriptions"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                  💊
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Mes ordonnances
                  </h3>
                  <p className="text-sm text-slate-600">
                    Consulter mes prescriptions
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/documents"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                  📄
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Documents</h3>
                  <p className="text-sm text-slate-600">
                    Résultats et documents
                  </p>
                </div>
              </div>
            </Link>
          </div>
        );

      case "pharmacien":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/prescriptions"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                  💊
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Prescriptions
                  </h3>
                  <p className="text-sm text-slate-600">
                    Gérer les ordonnances
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/pharmacies"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  🏪
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Pharmacie</h3>
                  <p className="text-sm text-slate-600">Gestion des stocks</p>
                </div>
              </div>
            </Link>
          </div>
        );

      case "laborantin":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/lab-orders"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                  🧪
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Ordres de laboratoire
                  </h3>
                  <p className="text-sm text-slate-600">Analyses à effectuer</p>
                </div>
              </div>
            </Link>

            <Link
              to="/lab-results"
              className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📊
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Résultats</h3>
                  <p className="text-sm text-slate-600">Saisir les résultats</p>
                </div>
              </div>
            </Link>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-slate-600">
              Dashboard en cours de développement pour votre rôle.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Message de bienvenue pour les nouveaux utilisateurs */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-4 text-center animate-pulse">
          <p className="text-lg">
            ✨ Bienvenue dans CareFlow ! Votre profil a été complété avec
            succès.
          </p>
        </div>
      )}

      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header du dashboard */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-3xl text-white">
                  {getRoleIcon(userRole)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Tableau de bord - {getRoleLabel(userRole)}
                  </h1>
                  <p className="text-slate-600">
                    Bienvenue, {user.name || user.email}
                  </p>
                </div>
              </div>

              <Link
                to="/profile"
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Mon profil
              </Link>
            </div>
          </div>

          {/* Actions rapides selon le rôle */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Actions rapides
            </h2>
            {renderRoleSpecificDashboard()}
          </div>

          {/* Statistiques génériques */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Informations générales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600">Dernière connexion</div>
                <div className="text-lg font-medium text-slate-800">
                  Maintenant
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600">Statut</div>
                <div className="text-lg font-medium text-green-600">Actif</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600">Rôle</div>
                <div className="text-lg font-medium text-slate-800">
                  {getRoleLabel(userRole)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
