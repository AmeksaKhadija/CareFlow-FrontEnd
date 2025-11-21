import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useDoctors } from "../../hooks/useDoctors";

// Fonction helper pour générer des horaires par défaut si pas fournis
const getDefaultSchedule = () => [
  { day: "Lundi", from: "09:00", to: "17:00" },
  { day: "Mardi", from: "09:00", to: "17:00" },
  { day: "Mercredi", from: "09:00", to: "17:00" },
  { day: "Jeudi", from: "09:00", to: "17:00" },
  { day: "Vendredi", from: "09:00", to: "17:00" },
];

// Fonction pour générer un avatar basé sur le genre/nom
const getAvatarEmoji = (name: string) => {
  const femaleNames = ["alice", "sophie", "marie", "claire", "anne"];
  const firstName = name.toLowerCase().split(" ")[1] || name.toLowerCase();
  return femaleNames.some((n) => firstName.includes(n)) ? "👩‍⚕️" : "👨‍⚕️";
};

export default function Home() {
  // `useDoctors()` may return different shapes depending on backend:
  // - an array of doctors
  // - an object like { data: [...] }
  // Normalize into a plain array to avoid runtime errors when calling .map
  const { data: rawDoctors, isLoading, error } = useDoctors();
  const doctors = Array.isArray(rawDoctors)
    ? rawDoctors
    : (rawDoctors?.data ?? []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero médical */}
          <section className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl shadow-sm p-8 mb-8 border border-teal-100">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-3">
                  Bienvenue sur <span className="text-teal-600">CareFlow</span>
                </h1>
                <p className="text-slate-600 text-lg">
                  🏥 Gestion moderne des rendez‑vous et dossiers médicaux pour
                  votre clinique
                </p>
              </div>
              <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all shadow-md font-medium"
                >
                  📅 Se connecter
                </Link>
                <Link
                  to="/register"
                  className="border-2 border-teal-300 text-teal-700 px-6 py-3 rounded-lg hover:bg-teal-50 transition-all font-medium"
                >
                  👥 S'inscrire
                </Link>
              </div>
            </div>
          </section>

          {/* About avec design clinique */}
          <section id="about" className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    À propos de CareFlow
                  </h2>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  CareFlow révolutionne la gestion clinique avec une interface
                  intuitive, une prise de rendez‑vous simplifiée et un suivi
                  complet des dossiers patients. Conçu par et pour les
                  professionnels de santé.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-teal-600 p-8 rounded-xl text-white shadow-lg">
                <h3 className="text-xl font-bold mb-4">🚑 Urgences</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Téléphone:</strong>
                    <br />
                    +33 1 23 45 67 89
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <br />
                    <a
                      href="mailto:urgences@careflow.local"
                      className="text-blue-100 hover:text-white underline"
                    >
                      urgences@careflow.local
                    </a>
                  </div>
                  <div className="text-blue-100 text-xs mt-4">
                    Disponible 24h/24 - 7j/7
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Services médicaux */}
          <section id="services" className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
              🩺 Nos Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">📅</div>
                <h4 className="font-bold text-slate-800 mb-2">Prise de RDV</h4>
                <p className="text-sm text-slate-600">
                  Calendrier intelligent, rappels automatiques et gestion des
                  créneaux.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">📋</div>
                <h4 className="font-bold text-slate-800 mb-2">
                  Dossiers Médicaux
                </h4>
                <p className="text-sm text-slate-600">
                  Historique complet, prescriptions et documents sécurisés.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">🧪</div>
                <h4 className="font-bold text-slate-800 mb-2">Laboratoire</h4>
                <p className="text-sm text-slate-600">
                  Gestion des analyses et suivi des résultats en temps réel.
                </p>
              </div>
            </div>
          </section>

          {/* Équipe médicale avec gestion d'erreur */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
              👨‍⚕️ Notre Équipe Médicale
            </h2>

            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="text-slate-600 mt-2">
                  Chargement des médecins...
                </p>
              </div>
            )}

            {/* Error state avec message amical */}
            {error && (
              <div className="text-center py-8 bg-white rounded-xl p-6">
                <p className="text-slate-600 mb-2">
                  Connectez-vous pour voir notre équipe médicale
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                >
                  Se connecter
                </Link>
              </div>
            )}

            {/* Doctors grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {doctors.length === 0 ? (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-slate-600">Aucun médecin trouvé</p>
                  </div>
                ) : (
                  doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl bg-white rounded-full w-12 h-12 flex items-center justify-center">
                            {getAvatarEmoji(doctor.name)}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">
                              {doctor.name}
                            </div>
                            <div className="text-blue-100 text-sm">
                              {doctor.specialty || "Médecine générale"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="mb-4">
                          <div className="font-medium text-slate-800 mb-2">
                            📋 Horaires
                          </div>
                          <ul className="space-y-2 text-sm">
                            {(doctor.schedule || getDefaultSchedule())
                              .slice(0, 3)
                              .map((s, i) => (
                                <li
                                  key={i}
                                  className="flex justify-between p-2 bg-slate-50 rounded"
                                >
                                  <span className="text-slate-700">
                                    {s.day}
                                  </span>
                                  <span className="text-teal-600 font-medium">
                                    {s.from} - {s.to}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/appointments/new?doctor=${doctor.id}`}
                            className="flex-1 text-center bg-gradient-to-r from-teal-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all text-sm font-medium"
                          >
                            Prendre RDV
                          </Link>
                          <Link
                            to="/register-bulk"
                            className="flex-1 text-center border-2 border-teal-300 text-teal-700 px-3 py-2 rounded-lg hover:bg-teal-50 transition-all text-sm font-medium"
                          >
                            Inscription
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          {/* Contact médical */}
          <section
            id="contact"
            className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                💬 Nous Contacter
              </h2>
              <p className="text-blue-100">
                Une question ? Notre équipe est là pour vous aider.
              </p>
            </div>

            <div className="p-6">
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="Nom complet"
                  type="text"
                  required
                />
                <input
                  className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="Email"
                  type="email"
                  required
                />
                <textarea
                  className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors sm:col-span-2"
                  rows={4}
                  placeholder="Votre message..."
                  required
                />
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all font-medium shadow-sm"
                  >
                    Envoyer le message
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
