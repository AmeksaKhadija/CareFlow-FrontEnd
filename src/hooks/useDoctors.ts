import { useQuery } from "@tanstack/react-query";
import { userService } from "../api/userService";
import type { Doctor } from "../api/userService";

export function useDoctors() {
  return useQuery<Doctor[], Error>({
    queryKey: ["doctors"],
    queryFn: userService.getDoctors,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Ne pas réessayer en cas d'erreur
    enabled: true, // Toujours actif
    // Gérer les erreurs sans faire planter l'app
    onError: (error) => {
      console.log("Erreur lors du chargement des médecins:", error.message);
    },
  });
}
