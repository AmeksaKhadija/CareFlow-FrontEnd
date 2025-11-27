import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: searchParams.get("email") || "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Inscription réussie ! Connectez-vous avec vos identifiants.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setIsLoading(true);
      await login(formData.email, formData.password);

      // Redirection vers dashboard après connexion réussie
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-teal-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
            <p className="text-blue-100">Accédez à votre espace CareFlow</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Se souvenir de moi
                </label>
                <Link
                  to="/forgot-password"
                  className="text-teal-600 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all font-medium disabled:opacity-50"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-slate-600 text-sm">
                Pas encore de compte ?{" "}
                <Link
                  to="/register"
                  className="text-teal-600 hover:underline font-medium"
                >
                  S'inscrire
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-slate-500 hover:text-teal-600 transition-colors"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
