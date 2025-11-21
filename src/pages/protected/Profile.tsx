import React, { useState, useEffect } from "react";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Profile() {
  const { user, logout, login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "true";
  const isTemp = searchParams.get("temp") === "true";
  const fromRegister = searchParams.get("from") === "register";

  // Debug logs
  console.log("🔍 Profile Debug:", {
    user,
    authLoading,
    isWelcome,
    fromRegister,
    hasRegistrationData: !!localStorage.getItem("cf_registration_data"),
  });

  const [isEditing, setIsEditing] = useState(isWelcome); // Auto-edit mode si nouveau utilisateur
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tempUser, setTempUser] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [patientLoading, setPatientLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    specialty: user?.specialty || "",
    address: "",
  });

  // Zod schema pour validation des données patient
  const patientSchema = z.object({
    firstName: z.string().min(1, "Prénom requis"),
    lastName: z.string().min(1, "Nom requis"),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    phone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }),
    emergencyContact: z
      .object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    medicalInfo: z
      .object({
        bloodType: z.string().optional(),
        allergies: z.array(z.string()).optional(),
        chronicDiseases: z.array(z.string()).optional(),
        currentMedications: z.array(z.any()).optional(),
        medicalHistory: z.array(z.any()).optional(),
      })
      .optional(),
    insurance: z
      .object({
        provider: z.string().optional(),
        policyNumber: z.string().optional(),
        validUntil: z.string().optional(),
      })
      .optional(),
    preferences: z
      .object({
        preferredLanguage: z.string().optional(),
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
      })
      .optional(),
    consent: z
      .object({
        dataSharing: z.boolean().optional(),
        treatmentConsent: z.boolean().optional(),
      })
      .optional(),
  });

  useEffect(() => {
    // Vérifier s'il y a des données d'inscription récente
    const registrationData = localStorage.getItem("cf_registration_data");
    const fromRegister = searchParams.get("from") === "register";

    if (fromRegister && registrationData && !user) {
      const regData = JSON.parse(registrationData);
      console.log("📝 Données d'inscription trouvées:", regData);

      setTempUser(regData);
      setProfileData({
        name: regData.name || "",
        firstName: "",
        lastName: "",
        phone: "",
        specialty: "",
        address: "",
      });
      setIsEditing(true); // Forcer le mode édition
      return;
    }

    // Vérifier s'il y a des données temporaires d'inscription (ancien système)
    if (isTemp && !user) {
      const tempUserData = localStorage.getItem("temp_user_data");
      if (tempUserData) {
        const userData = JSON.parse(tempUserData);
        setTempUser(userData);
        setProfileData({
          name: userData.name || "",
          firstName: "",
          lastName: "",
          phone: "",
          specialty: "",
          address: "",
        });
        return;
      }
    }

    if (user) {
      setProfileData({
        name: user.name || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        specialty: user.specialty || "",
        address: "",
      });
    }
  }, [user, isTemp]);

  // Si l'utilisateur est un patient, tenter de récupérer son enregistrement patients
  useEffect(() => {
    const fetchPatient = async () => {
      if (!user) return;
      const primaryRole =
        (Array.isArray((user as any).roles) && (user as any).roles[0]) ||
        (user as any).role;
      if (primaryRole !== "patient") return;

      setPatientLoading(true);
      try {
        // essayer endpoint par user id
        const res = await apiClient.get(`/patients/user/${user.id}`);
        const payload = res.data?.data ?? res.data;
        if (payload) {
          setPatient(payload);
          // préremplir quelques champs
          setProfileData((prev) => ({
            ...prev,
            firstName: payload.firstName || prev.firstName,
            lastName: payload.lastName || prev.lastName,
            phone: payload.phone || prev.phone,
            address: payload.address?.street || prev.address,
          }));
        }
      } catch (e: any) {
        if (e?.response?.status && e.response.status !== 404) {
          console.error("Erreur récupération patient:", e);
        }
      } finally {
        setPatientLoading(false);
      }
    };

    fetchPatient();
  }, [user]);

  // Utiliser tempUser ou user selon la situation
  const currentUser = user || tempUser;

  // Vérifier si on est en train de traiter des données d'inscription
  const registrationData = localStorage.getItem("cf_registration_data");
  const isProcessingRegistration = fromRegister && registrationData && !user;

  // Afficher un loader si on traite l'inscription ou si l'auth est en cours
  if (authLoading || (isProcessingRegistration && !tempUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-slate-600">
            {isProcessingRegistration
              ? "Préparation de votre profil..."
              : "Chargement..."}
          </p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur et pas de données d'inscription, rediriger vers login
  if (!currentUser && !isProcessingRegistration) {
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // Helpers pour gérer les champs spécifiques au patient
  const handlePatientField = (key: string, value: any) => {
    setPatient((p: any) => ({ ...(p || {}), [key]: value }));
  };

  const handlePatientNested = (section: string, key: string, value: any) => {
    setPatient((p: any) => ({
      ...(p || {}),
      [section]: { ...(p?.[section] || {}), [key]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Si c'est un utilisateur venant de l'inscription (pas encore authentifié)
      if (tempUser && !user) {
        console.log(
          "🎯 Utilisateur depuis inscription - Connexion automatique..."
        );

        // Essayer de se connecter automatiquement avec les données d'inscription
        const registrationData = localStorage.getItem("cf_registration_data");
        if (registrationData) {
          const { email, password } = JSON.parse(registrationData);

          try {
            // Utiliser la fonction login du context pour authentifier et récupérer l'utilisateur
            const loggedUser = await login(email, password);
            const userId = loggedUser?.id || currentUser?.id;

            // Maintenant sauvegarder le profil avec le token stocké par login()
            // Déterminer le rôle principal (peut venir de loggedUser.roles ou tempUser.role)
            const primaryRole =
              (loggedUser &&
                (loggedUser as any).roles &&
                (loggedUser as any).roles[0]) ||
              (tempUser && (tempUser.role || "")) ||
              getPrimaryRole();

            // Supprimer le mot de passe du stockage temporaire pour la sécurité
            try {
              const reg = JSON.parse(
                localStorage.getItem("cf_registration_data") || "{}"
              );
              if (reg && reg.password) {
                delete reg.password;
                localStorage.setItem(
                  "cf_registration_data",
                  JSON.stringify(reg)
                );
              }
            } catch {}

            // Si l'utilisateur est un patient, créer/mettre à jour l'entrée patients
            if (primaryRole === "patient") {
              const patientPayload: any = {
                user: userId,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                address: { street: profileData.address || "" },
              };

              try {
                // Essayer de créer le patient
                await apiClient.post(`/patients`, patientPayload);
              } catch (pe: any) {
                // Si endpoint create absent or patient exists, essayer d'upsert via user id
                if (
                  pe?.response?.status === 404 ||
                  pe?.response?.status === 409
                ) {
                  try {
                    // essayer par user id si disponible
                    await apiClient.patch(
                      `/patients/user/${userId}`,
                      patientPayload
                    );
                  } catch (pe2: any) {
                    // dernier recours : essayer PUT /patients/:id
                    try {
                      await apiClient.put(
                        `/patients/${userId}`,
                        patientPayload
                      );
                    } catch (pe3: any) {
                      console.error("Erreur création/upsert patient:", pe3);
                      throw pe3;
                    }
                  }
                } else {
                  console.error("Erreur création patient:", pe);
                  throw pe;
                }
              }

              setSuccess(
                "✅ Profil patient enregistré ! Redirection vers votre tableau de bord..."
              );
              localStorage.removeItem("cf_registration_data");
              setTempUser(null);
              setTimeout(() => {
                navigate("/dashboard?from=profile");
              }, 1200);
              return;
            }

            // Pour les autres rôles, mettre à jour l'utilisateur comme avant
            try {
              await apiClient.patch(`/users/${userId}`, profileData);
            } catch (e: any) {
              if (e?.response?.status === 404) {
                await apiClient.patch(`/users/profile`, profileData);
              } else {
                throw e;
              }
            }

            setSuccess(
              "✅ Profil complété avec succès ! Redirection vers le tableau de bord..."
            );
            localStorage.removeItem("cf_registration_data"); // Nettoyer
            setTempUser(null);

            setTimeout(() => {
              navigate("/dashboard?from=profile");
            }, 1500);
            return;
          } catch (authError) {
            console.log(
              "❌ Erreur lors de la connexion automatique:",
              authError
            );
          }
        }

        // Si la connexion automatique échoue, sauvegarder les données et rediriger vers login
        setSuccess("Profil sauvegardé ! Redirection vers la connexion...");
        setTimeout(() => {
          navigate(
            `/login?email=${encodeURIComponent(tempUser.email)}&profile_completed=true`
          );
        }, 2000);
        return;
      }

      // Si l'utilisateur courant est un patient, valider et sauver dans la table patients
      if (getPrimaryRole() === "patient") {
        // Construire le payload à partir de l'état `patient` ou `profileData`
        const payload = {
          firstName: patient?.firstName ?? profileData.firstName,
          lastName: patient?.lastName ?? profileData.lastName,
          dateOfBirth:
            patient?.dateOfBirth ?? patient?.dateOfBirth ?? undefined,
          gender: patient?.gender ?? undefined,
          phone: patient?.phone ?? profileData.phone,
          address: {
            street: patient?.address?.street ?? profileData.address ?? "",
            city: patient?.address?.city ?? "",
            zipCode: patient?.address?.zipCode ?? "",
            country: patient?.address?.country ?? "",
          },
          emergencyContact: patient?.emergencyContact ?? undefined,
          medicalInfo: patient?.medicalInfo ?? undefined,
          insurance: patient?.insurance ?? undefined,
          preferences: patient?.preferences ?? undefined,
          consent: patient?.consent ?? undefined,
        };

        // Valider avec Zod
        const parsed = patientSchema.safeParse(payload);
        if (!parsed.success) {
          const issues = parsed.error.flatten();
          const messages = Object.values(issues.fieldErrors || {})
            .flat()
            .join(" — ");
          setError(messages || "Données patient invalides");
          setIsLoading(false);
          return;
        }

        try {
          // Si on a déjà un patient existant, PATCH par id
          if (patient && (patient._id || patient.id)) {
            const id = patient._id || patient.id;
            await apiClient.patch(`/patients/${id}`, parsed.data);
          } else {
            // Créer un nouveau patient lié à l'utilisateur
            await apiClient.post(`/patients`, {
              user: currentUser.id,
              ...parsed.data,
            });
          }

          setSuccess(
            "✅ Profil patient enregistré ! Redirection vers votre tableau de bord..."
          );
          localStorage.removeItem("cf_registration_data");
          setPatient(null);
          setTimeout(() => navigate("/dashboard?from=profile"), 1200);
          return;
        } catch (pe: any) {
          // fallback: essayer upsert via user id si endpoints différents
          try {
            await apiClient.patch(`/patients/user/${currentUser.id}`, payload);
            setSuccess(
              "✅ Profil patient enregistré (via user upsert) ! Redirection..."
            );
            localStorage.removeItem("cf_registration_data");
            setTimeout(() => navigate("/dashboard?from=profile"), 1200);
            return;
          } catch (pe2: any) {
            console.error("Erreur sauvegarde patient:", pe2);
            throw pe2;
          }
        }
      }

      // Utiliser apiClient avec fallback si endpoint /users/:id n'existe pas
      try {
        await apiClient.patch(`/users/${currentUser.id}`, {
          name: profileData.name,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          specialty: profileData.specialty,
          address: profileData.address,
        });
      } catch (e: any) {
        if (e?.response?.status === 404) {
          // essayer endpoint alternatif
          try {
            await apiClient.patch(`/users/profile`, {
              name: profileData.name,
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              phone: profileData.phone,
              specialty: profileData.specialty,
              address: profileData.address,
            });
          } catch (e2: any) {
            const errMsg =
              e2?.response?.data?.message ||
              e2?.message ||
              "Erreur lors de la mise à jour";
            throw new Error(errMsg);
          }
        } else {
          const errMsg =
            e?.response?.data?.message ||
            e?.message ||
            "Erreur lors de la mise à jour";
          throw new Error(errMsg);
        }
      }

      setSuccess("Profil mis à jour avec succès !");
      setIsEditing(false);

      // Si c'est un nouvel utilisateur (welcome=true), rediriger vers dashboard
      if (isWelcome) {
        setTimeout(() => {
          navigate("/dashboard?from=profile");
        }, 1500);
      } else {
        // Sinon, juste recharger les données
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Retourne le rôle principal de l'utilisateur, gère les objets temporaires venant de l'inscription
  const getPrimaryRole = () => {
    if (!currentUser) return "";
    // cas où roles est un tableau
    if (
      Array.isArray((currentUser as any).roles) &&
      (currentUser as any).roles.length > 0
    ) {
      return (currentUser as any).roles[0];
    }
    // cas où l'objet stocké depuis l'inscription contient une clé 'role'
    if (
      (currentUser as any).role &&
      typeof (currentUser as any).role === "string"
    ) {
      return (currentUser as any).role;
    }
    return "";
  };

  const isProfileComplete = currentUser?.firstName && currentUser?.lastName;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Message de bienvenue */}
          {isWelcome && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-medium text-green-800">
                    Bienvenue sur CareFlow !
                  </h3>
                  <p className="text-sm text-green-600">
                    Complétez votre profil pour une meilleure expérience.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header du profil */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">
                    {getRoleIcon(getPrimaryRole() || "")}
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold">
                      {currentUser.name || currentUser.email}
                      {!isProfileComplete && (
                        <span className="text-yellow-300 ml-2">⚠️</span>
                      )}
                    </h1>
                    <p className="text-blue-100 text-lg">
                      {getRoleLabel(getPrimaryRole() || "")}
                    </p>
                    <p className="text-blue-200 text-sm">
                      ID: {currentUser.id}
                    </p>
                  </div>
                </div>

                {!isProfileComplete && (
                  <div className="text-white bg-yellow-500 px-3 py-1 rounded-full text-sm">
                    Profil incomplet
                  </div>
                )}
              </div>
            </div>

            {/* Contenu du profil */}
            <div className="p-8">
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

              {!isEditing ? (
                // Mode affichage
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Informations personnelles */}
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">
                      Informations personnelles
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Email
                        </label>
                        <p className="text-slate-800">{currentUser.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Nom complet
                        </label>
                        <p className="text-slate-800">
                          {currentUser.name || "Non renseigné"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Prénom
                        </label>
                        <p className="text-slate-800">
                          {currentUser.firstName || "Non renseigné"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Nom
                        </label>
                        <p className="text-slate-800">
                          {currentUser.lastName || "Non renseigné"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Téléphone
                        </label>
                        <p className="text-slate-800">
                          {currentUser.phone || "Non renseigné"}
                        </p>
                      </div>
                      {(getPrimaryRole() === "medecin" ||
                        getPrimaryRole() === "infirmier") && (
                        <div>
                          <label className="text-sm font-medium text-slate-600">
                            Spécialité
                          </label>
                          <p className="text-slate-800">
                            {currentUser.specialty || "Non renseignée"}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Rôle
                        </label>
                        <p className="text-slate-800">
                          {getRoleLabel(getPrimaryRole() || "")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">
                      Actions rapides
                    </h2>
                    <div className="space-y-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="block w-full bg-teal-50 border border-teal-200 p-4 rounded-lg hover:bg-teal-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">✏️</span>
                          <div>
                            <div className="font-medium text-slate-800">
                              {isProfileComplete
                                ? "Modifier le profil"
                                : "Compléter le profil"}
                            </div>
                            <div className="text-sm text-slate-600">
                              {isProfileComplete
                                ? "Mettre à jour vos informations"
                                : "Ajoutez vos informations personnelles"}
                            </div>
                          </div>
                        </div>
                      </button>

                      <Link
                        to="/dashboard"
                        className="block w-full bg-blue-50 border border-blue-200 p-4 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📊</span>
                          <div>
                            <div className="font-medium text-slate-800">
                              Tableau de bord
                            </div>
                            <div className="text-sm text-slate-600">
                              Vue d'ensemble de votre activité
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // Mode édition - Formulaire
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-semibold text-slate-800 mb-6">
                    {isProfileComplete
                      ? "Modifier votre profil"
                      : "Complétez votre profil"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {getPrimaryRole() === "patient" ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={patient?.firstName ?? profileData.firstName}
                            onChange={(e) =>
                              handlePatientField("firstName", e.target.value)
                            }
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nom *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={patient?.lastName ?? profileData.lastName}
                            onChange={(e) =>
                              handlePatientField("lastName", e.target.value)
                            }
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Date de naissance
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={patient?.dateOfBirth?.slice?.(0, 10) ?? ""}
                            onChange={(e) =>
                              handlePatientField("dateOfBirth", e.target.value)
                            }
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Sexe
                          </label>
                          <select
                            value={patient?.gender ?? ""}
                            onChange={(e) =>
                              handlePatientField("gender", e.target.value)
                            }
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                          >
                            <option value="">Choisir</option>
                            <option value="male">Homme</option>
                            <option value="female">Femme</option>
                            <option value="other">Autre</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={patient?.phone ?? profileData.phone}
                            onChange={(e) =>
                              handlePatientField("phone", e.target.value)
                            }
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            placeholder="+212612345678"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Adresse
                          </label>
                          <input
                            type="text"
                            placeholder="Rue / Avenue"
                            value={
                              patient?.address?.street ?? profileData.address
                            }
                            onChange={(e) =>
                              handlePatientNested(
                                "address",
                                "street",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border-2 border-slate-200 rounded-lg mb-2 focus:border-teal-500 focus:outline-none transition-colors"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Ville"
                              value={patient?.address?.city ?? ""}
                              onChange={(e) =>
                                handlePatientNested(
                                  "address",
                                  "city",
                                  e.target.value
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Code postal"
                              value={patient?.address?.zipCode ?? ""}
                              onChange={(e) =>
                                handlePatientNested(
                                  "address",
                                  "zipCode",
                                  e.target.value
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Pays"
                              value={patient?.address?.country ?? ""}
                              onChange={(e) =>
                                handlePatientNested(
                                  "address",
                                  "country",
                                  e.target.value
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <h3 className="font-medium text-slate-800 mb-2">
                            Contact d'urgence
                          </h3>
                          <input
                            type="text"
                            placeholder="Nom"
                            value={patient?.emergencyContact?.name ?? ""}
                            onChange={(e) =>
                              handlePatientNested(
                                "emergencyContact",
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border-2 border-slate-200 rounded-lg mb-2 focus:border-teal-500 focus:outline-none transition-colors"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Lien"
                              value={
                                patient?.emergencyContact?.relationship ?? ""
                              }
                              onChange={(e) =>
                                handlePatientNested(
                                  "emergencyContact",
                                  "relationship",
                                  e.target.value
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                            <input
                              type="tel"
                              placeholder="Téléphone"
                              value={patient?.emergencyContact?.phone ?? ""}
                              onChange={(e) =>
                                handlePatientNested(
                                  "emergencyContact",
                                  "phone",
                                  e.target.value
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <h3 className="font-medium text-slate-800 mb-2">
                            Informations médicales
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Groupe sanguin (ex: A+)"
                              value={patient?.medicalInfo?.bloodType ?? ""}
                              onChange={(e) =>
                                handlePatientNested(
                                  "medicalInfo",
                                  "bloodType",
                                  e.target.value
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Allergies (séparées par des virgules)"
                              value={(
                                patient?.medicalInfo?.allergies || []
                              ).join(", ")}
                              onChange={(e) =>
                                handlePatientNested(
                                  "medicalInfo",
                                  "allergies",
                                  e.target.value
                                    .split(",")
                                    .map((s: string) => s.trim())
                                    .filter(Boolean)
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Maladies chroniques (virgule séparées)"
                              value={(
                                patient?.medicalInfo?.chronicDiseases || []
                              ).join(", ")}
                              onChange={(e) =>
                                handlePatientNested(
                                  "medicalInfo",
                                  "chronicDiseases",
                                  e.target.value
                                    .split(",")
                                    .map((s: string) => s.trim())
                                    .filter(Boolean)
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Médicaments actuels (virgule séparés)"
                              value={(
                                patient?.medicalInfo?.currentMedications || []
                              )
                                .map((m: any) => m.name || m)
                                .join(", ")}
                              onChange={(e) =>
                                handlePatientNested(
                                  "medicalInfo",
                                  "currentMedications",
                                  e.target.value
                                    .split(",")
                                    .map((s: string) => ({ name: s.trim() }))
                                    .filter((o: any) => o.name)
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <h3 className="font-medium text-slate-800 mb-2">
                            Assurance
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Fournisseur"
                              value={patient?.insurance?.provider ?? ""}
                              onChange={(e) =>
                                handlePatientNested(
                                  "insurance",
                                  "provider",
                                  e.target.value
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Numéro de police"
                              value={patient?.insurance?.policyNumber ?? ""}
                              onChange={(e) =>
                                handlePatientNested(
                                  "insurance",
                                  "policyNumber",
                                  e.target.value
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                            <input
                              type="date"
                              value={
                                patient?.insurance?.validUntil?.slice?.(
                                  0,
                                  10
                                ) ?? ""
                              }
                              onChange={(e) =>
                                handlePatientNested(
                                  "insurance",
                                  "validUntil",
                                  e.target.value
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <h3 className="font-medium text-slate-800 mb-2">
                            Préférences & Consentement
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Langue préférée"
                              value={
                                patient?.preferences?.preferredLanguage ?? "fr"
                              }
                              onChange={(e) =>
                                handlePatientNested(
                                  "preferences",
                                  "preferredLanguage",
                                  e.target.value
                                )
                              }
                              className="p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            />
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={
                                  !!patient?.preferences?.emailNotifications
                                }
                                onChange={(e) =>
                                  handlePatientNested(
                                    "preferences",
                                    "emailNotifications",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-sm">
                                Notifications email
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={
                                  !!patient?.preferences?.smsNotifications
                                }
                                onChange={(e) =>
                                  handlePatientNested(
                                    "preferences",
                                    "smsNotifications",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-sm">Notifications SMS</span>
                            </label>
                          </div>

                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!!patient?.consent?.dataSharing}
                                onChange={(e) =>
                                  handlePatientNested(
                                    "consent",
                                    "dataSharing",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-sm">
                                Partage des données
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!!patient?.consent?.treatmentConsent}
                                onChange={(e) =>
                                  handlePatientNested(
                                    "consent",
                                    "treatmentConsent",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-sm">
                                Consentement pour traitement
                              </span>
                            </label>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nom complet *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            placeholder="Ex: Dr. Jean Dupont"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nom *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            placeholder="+33 1 23 45 67 89"
                          />
                        </div>

                        {(getPrimaryRole() === "medecin" ||
                          getPrimaryRole() === "infirmier") && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Spécialité
                            </label>
                            <input
                              type="text"
                              name="specialty"
                              value={profileData.specialty}
                              onChange={handleInputChange}
                              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                              placeholder="Ex: Cardiologie, Pédiatrie..."
                            />
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Adresse
                          </label>
                          <textarea
                            name="address"
                            value={profileData.address}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                            placeholder="Votre adresse complète..."
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div className="text-sm text-slate-500">
                      * Champs obligatoires
                    </div>

                    <button
                      type="submit"
                      className="mt-4 md:mt-0 bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-700 transition-colors"
                    >
                      {isLoading
                        ? "Enregistrement..."
                        : "Enregistrer les modifications"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
