import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const roles = [
  {
    value: "medecin",
    label: "Médecin",
    description: "Gérer les consultations et dossiers patients",
    icon: "👨‍⚕️",
  },
  {
    value: "infirmier",
    label: "Infirmier(ère)",
    description: "Assister les médecins et soigner les patients",
    icon: "👩‍⚕️",
  },
  {
    value: "admin",
    label: "Administrateur",
    description: "Gérer la clinique et le personnel",
    icon: "👔",
  },
  {
    value: "pharmacien",
    label: "Pharmacien",
    description: "Gérer les prescriptions et médicaments",
    icon: "💊",
  },
  {
    value: "laborantin",
    label: "Laborantin",
    description: "Gérer les analyses et résultats de laboratoire",
    icon: "🧪",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!formData.role) {
      setError("Veuillez sélectionner un rôle");
      return;
    }

    // Defensive: block patient self-registration from the client
    if (formData.role === "patient") {
      setError(
        "Les comptes patients ne peuvent pas être créés via cette page. Demandez à un administrateur ou une secrétaire de créer le compte pour le patient."
      );
      return;
    }

    if (!formData.name.trim()) {
      setError("Le nom est obligatoire");
      return;
    }

    try {
      setIsLoading(true);

      // Structure avec le champ name requis
      const registerPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      console.log("Payload envoyé:", registerPayload);

      // Inscription
      const registerResponse = await fetch(
        "http://localhost:8000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registerPayload),
        }
      );

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        console.error("Erreur API:", errorData);
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      const responseData = await registerResponse.json();
      console.log("Inscription réussie:", responseData);

      // Connexion automatique après inscription
      console.log("Tentative de connexion automatique...");

      try {
        // Attendre un moment pour que le serveur traite l'inscription
        await new Promise((resolve) => setTimeout(resolve, 500));

        const logged = await login(formData.email, formData.password);
        if (logged) {
          // Si c'est un patient, il doit compléter son profil
          if (formData.role === "patient") {
            setSuccess(
              "Inscription réussie ! Redirection vers votre profil..."
            );
            setTimeout(() => {
              navigate("/profile?welcome=true&from=register");
            }, 600);
          } else {
            // Pour les autres rôles, rediriger directement vers le dashboard
            setSuccess(
              "Inscription réussie ! Redirection vers le tableau de bord..."
            );
            setTimeout(() => {
              navigate("/dashboard");
            }, 600);
          }
          return;
        }

        // Si login n'a pas renvoyé d'utilisateur, vérifier si l'API a renvoyé un token
        if (responseData.token) {
          console.log(
            "🔑 Token trouvé dans la réponse d'inscription, utilisation directe"
          );
          try {
            localStorage.setItem("cf_token", responseData.token);

            // Essayer de récupérer le profil pour s'assurer que le token est valide
            const userResponse = await fetch(
              "http://localhost:8000/api/auth/me",
              {
                headers: {
                  Authorization: `Bearer ${responseData.token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (userResponse.ok) {
              // Redirection basée sur le rôle choisi
              if (formData.role === "patient") {
                setSuccess(
                  "Inscription réussie ! Redirection vers votre profil..."
                );
                setTimeout(
                  () => navigate("/profile?welcome=true&from=register"),
                  600
                );
              } else {
                setSuccess(
                  "Inscription réussie ! Redirection vers le tableau de bord..."
                );
                setTimeout(() => navigate("/dashboard"), 600);
              }
              return;
            }
          } catch (directError) {
            console.log("❌ Erreur avec le token direct:", directError);
          }
        }

        // Si on arrive ici, on n'a pas de session active. Stocker temporairement les données d'inscription
        localStorage.setItem(
          "cf_registration_data",
          JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: formData.role,
            timestamp: Date.now(),
          })
        );

        // Si le rôle choisi est 'patient', rediriger vers profile pour compléter les infos
        if (formData.role === "patient") {
          setError("");
          setSuccess(
            "🎉 Inscription réussie ! Redirection vers votre profil..."
          );
          setTimeout(() => {
            navigate("/profile?welcome=true&from=register");
          }, 800);
          return;
        }

        // Pour les autres rôles, demandons à l'utilisateur de se connecter si aucun token/autologin
        setError("");
        setSuccess("Inscription réussie ! Veuillez vous connecter.");
        setTimeout(() => {
          navigate(
            `/login?registered=true&email=${encodeURIComponent(formData.email)}`
          );
        }, 1200);
      } catch (loginErr) {
        console.error("Erreur lors du processus post-inscription:", loginErr);
        setError(
          "Erreur pendant la procédure d'inscription. Veuillez réessayer."
        );
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Créer un compte
            </h1>
            <p className="text-blue-100">
              Rejoignez CareFlow - Complétez votre profil après inscription
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            {/* Email et mot de passe */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Informations de connexion
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                    placeholder="Ex: Dr. Jean Dupont"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                      required
                      minLength={6}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                      required
                      minLength={6}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sélection du rôle */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Sélectionnez votre rôle *
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`block cursor-pointer p-4 border-2 rounded-lg transition-all ${
                      formData.role === role.value
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 hover:border-teal-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{role.icon}</span>
                      <div>
                        <div className="font-medium text-slate-800">
                          {role.label}
                        </div>
                        <div className="text-sm text-slate-600">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Important :</strong> Les comptes de type{" "}
                <em>Patient</em> ne peuvent pas être créés par les utilisateurs
                eux-mêmes. Seuls les administrateurs ou les secrétaires peuvent
                créer des comptes patients depuis le tableau de bord
                administrateur.
              </p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>Prochaine étape :</strong> Après inscription, vous
                pourrez compléter votre profil avec vos informations
                personnelles (nom, prénom, téléphone, etc.)
              </p>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all font-medium disabled:opacity-50"
              >
                {isLoading ? "Création en cours..." : "Créer mon compte"}
              </button>
              <Link
                to="/login"
                className="flex-1 text-center border-2 border-teal-300 text-teal-700 px-6 py-3 rounded-lg hover:bg-teal-50 transition-all font-medium"
              >
                Déjà un compte ? Se connecter
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
