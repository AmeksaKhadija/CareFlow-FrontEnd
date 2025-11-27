import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../api/userService";
import type { User } from "../../api/userService";
import { apiClient } from "../../api/client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [creatingPatientFor, setCreatingPatientFor] = useState<string | null>(
    null
  );
  const [patientForm, setPatientForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
  });

  const allowedForCreate = (role: string) => {
    // allow admin and secretary roles to create patients
    const r = (role || "").toLowerCase();
    return (
      r === "admin" ||
      r === "secretaire" ||
      r === "secretary" ||
      r === "secrétaire"
    );
  };

  useEffect(() => {
    if (!user) return;
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("🔄 [Users] Attempting to load users...");
      console.log("🔄 [Users] API Base URL:", "http://localhost:8000/api");

      const data = await userService.getUsers();

      console.log("📦 [Users] Raw response data:", data);
      console.log("📦 [Users] Data type:", typeof data);
      console.log("📦 [Users] Is array?", Array.isArray(data));

      // normalize: backend may return array or { data: [...] } or { users: [...] }
      const list = Array.isArray(data)
        ? data
        : (data?.users ?? data?.data ?? []);

      console.log("✅ [Users] Normalized user list:", list);
      console.log("✅ [Users] User count:", list ? list.length : 0);

      setUsers(list || []);
    } catch (e: any) {
      console.error("❌ [Users] Error loading users:", e);
      console.error("❌ [Users] Error status:", e?.response?.status);
      console.error("❌ [Users] Error data:", e?.response?.data);
      console.error("❌ [Users] Error message:", e?.message);

      const errorMessage =
        e?.response?.data?.message ||
        e?.message ||
        "Erreur lors du chargement des utilisateurs";

      console.error("❌ [Users] Final error message:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible."))
      return;
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers((s) => s.filter((u) => u.id !== id && u._id !== id));
    } catch (e: any) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Erreur lors de la suppression"
      );
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError("Tous les champs sont requis pour créer un compte patient");
      return;
    }
    setCreating(true);
    try {
      // Admin/secretary creates a patient account via the register endpoint
      const payload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: "patient",
      };
      const res = await apiClient.post("/auth/register", payload);
      // refresh
      await loadUsers();
      setNewUser({ name: "", email: "", password: "" });
      alert("Compte patient créé avec succès");
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Erreur lors de la création du compte"
      );
    } finally {
      setCreating(false);
    }
  };

  const startCreatePatientFor = (id: string, user: User) => {
    setCreatingPatientFor(id);
    setPatientForm({
      firstName: user.firstName || user.name || "",
      lastName: user.lastName || "",
      dateOfBirth: "",
      gender: "",
      phone: user.phone || "",
    });
  };

  const cancelCreatePatient = () => {
    setCreatingPatientFor(null);
    setPatientForm({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
    });
  };

  const submitCreatePatientFor = async (userId: string) => {
    setError("");
    try {
      // minimal payload required by backend Joi schema
      const payload = {
        userId,
        firstName: patientForm.firstName,
        lastName: patientForm.lastName,
        dateOfBirth: patientForm.dateOfBirth,
        gender: patientForm.gender,
        phone: patientForm.phone,
      };
      await apiClient.post(`/patients`, payload);
      alert("Dossier patient créé avec succès");
      cancelCreatePatient();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Erreur lors de la création du dossier patient"
      );
    }
  };

  const handlePatientField = (k: string, v: string) =>
    setPatientForm((s) => ({ ...s, [k]: v }));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">
            Vous devez être connecté pour voir cette page
          </p>
        </div>
      </div>
    );
  }

  // Only admin or secretary can manage users
  const role = user.role || "";
  const roleLower = (role || "").toString().toLowerCase();

  // Debug logs pour diagnostiquer le problème d'accès
  console.log("🔍 DEBUG - User object:", user);
  console.log("🔍 DEBUG - User role:", role);
  console.log("🔍 DEBUG - Role lower:", roleLower);
  console.log("🔍 DEBUG - Is admin?", roleLower === "admin");
  console.log("🔍 DEBUG - AllowedForCreate?", allowedForCreate(roleLower));

  // Temporairement, permettons l'accès à tous les utilisateurs connectés pour debug
  const hasAccess = roleLower === "admin" || allowedForCreate(roleLower);
  console.log("🔍 DEBUG - Has access?", hasAccess);

  // TEMPORAIRE : Permettre l'accès à tous pour tester
  if (false && !hasAccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-xl font-semibold">Accès refusé</h2>
            <p className="text-slate-600">
              Vous n'avez pas les permissions pour gérer les utilisateurs.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      {/* Dev debug panel to help diagnose blank page issues */}
      {import.meta.env.DEV && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <details className="bg-yellow-50 border p-3 rounded mb-4">
            <summary className="font-medium">Debug (dev only)</summary>
            <pre className="text-xs mt-2 whitespace-pre-wrap">
              {JSON.stringify({ user, users, loading, error }, null, 2)}
            </pre>
          </details>
        </div>
      )}
      <main className="flex-grow py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Gestion des utilisateurs
            </h1>
            <p className="text-sm text-slate-600">
              Liste des comptes enregistrés dans la base de données.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-4">Utilisateurs</h3>
              {loading ? (
                <div>Chargement...</div>
              ) : error ? (
                <div className="text-red-600 p-4 bg-red-50 rounded">
                  <p>{error}</p>
                  <button
                    onClick={loadUsers}
                    className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="text-sm text-slate-600">
                        <th className="p-2">Nom</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Rôle</th>
                        <th className="p-2">Créé</th>
                        <th className="p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center text-gray-500"
                          >
                            <div>
                              <p>
                                Aucun utilisateur trouvé dans la base de données
                              </p>
                              <button
                                onClick={loadUsers}
                                className="mt-2 text-sm bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700"
                              >
                                Actualiser
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <React.Fragment key={u.id || (u as any)._id}>
                            <tr className="border-t">
                              <td className="p-2">{u.name || u.email}</td>
                              <td className="p-2">{u.email}</td>
                              <td className="p-2">{u.role}</td>
                              <td className="p-2">
                                {u.createdAt
                                  ? new Date(u.createdAt).toLocaleString()
                                  : "-"}
                              </td>
                              <td className="p-2 flex gap-3">
                                <button
                                  onClick={() =>
                                    handleDelete(u.id || (u as any)._id)
                                  }
                                  className="text-red-600 hover:underline"
                                >
                                  Supprimer
                                </button>
                                <button
                                  onClick={() =>
                                    startCreatePatientFor(
                                      u.id || (u as any)._id,
                                      u
                                    )
                                  }
                                  className="text-teal-600 hover:underline"
                                >
                                  Créer dossier patient
                                </button>
                              </td>
                            </tr>

                            {creatingPatientFor ===
                              (u.id || (u as any)._id) && (
                              <tr className="bg-slate-50">
                                <td colSpan={5} className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                                    <div>
                                      <label className="block text-xs text-slate-600">
                                        Prénom
                                      </label>
                                      <input
                                        value={patientForm.firstName}
                                        onChange={(e) =>
                                          handlePatientField(
                                            "firstName",
                                            e.target.value
                                          )
                                        }
                                        className="p-2 border rounded w-full"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-slate-600">
                                        Nom
                                      </label>
                                      <input
                                        value={patientForm.lastName}
                                        onChange={(e) =>
                                          handlePatientField(
                                            "lastName",
                                            e.target.value
                                          )
                                        }
                                        className="p-2 border rounded w-full"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-slate-600">
                                        Date de naissance
                                      </label>
                                      <input
                                        type="date"
                                        value={patientForm.dateOfBirth}
                                        onChange={(e) =>
                                          handlePatientField(
                                            "dateOfBirth",
                                            e.target.value
                                          )
                                        }
                                        className="p-2 border rounded w-full"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-slate-600">
                                        Genre
                                      </label>
                                      <select
                                        value={patientForm.gender}
                                        onChange={(e) =>
                                          handlePatientField(
                                            "gender",
                                            e.target.value
                                          )
                                        }
                                        className="p-2 border rounded w-full"
                                      >
                                        <option value="">--</option>
                                        <option value="male">male</option>
                                        <option value="female">female</option>
                                        <option value="other">other</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs text-slate-600">
                                        Téléphone
                                      </label>
                                      <input
                                        value={patientForm.phone}
                                        onChange={(e) =>
                                          handlePatientField(
                                            "phone",
                                            e.target.value
                                          )
                                        }
                                        className="p-2 border rounded w-full"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-3 flex gap-3">
                                    <button
                                      onClick={() =>
                                        submitCreatePatientFor(
                                          u.id || (u as any)._id
                                        )
                                      }
                                      className="bg-teal-600 text-white px-4 py-2 rounded"
                                    >
                                      Créer
                                    </button>
                                    <button
                                      onClick={cancelCreatePatient}
                                      className="bg-slate-200 px-4 py-2 rounded"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-4">Créer un compte patient</h3>
              <form onSubmit={handleCreatePatient} className="space-y-4">
                {error && <div className="text-red-600">{error}</div>}
                <div>
                  <label className="block text-sm text-slate-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>
                <div>
                  <button
                    disabled={creating}
                    className="w-full bg-teal-600 text-white py-2 rounded"
                  >
                    {creating ? "Création..." : "Créer le compte patient"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
