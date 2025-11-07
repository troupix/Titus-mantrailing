import React, { useState, useEffect, useCallback } from "react";
import { useViewMode } from "../contexts/ViewModeContext";
import { User } from "../types/entities";
import { Dog } from "../types";
import { Trail } from "../types/trail";
import { TrainerDogCard, DogStats } from "./TrainerDogCard";
import { DogDetailView } from "./DogDetailView";
import { ActivityDetailView } from "./ActivityDetailView";
import { useAuth } from "../contexts/AuthContext";
import { getDogsByTrainer, claimDogWithShareToken } from "../utils/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";

/**

 * @interface TrainerDashboardProps

 * @description Defines the props for the TrainerDashboard component.

 */

interface TrainerDashboardProps {
  // No specific props needed for now, will be populated later
}

/**

 * @typedef {"overview" | "dog-detail" | "activity-detail"} ViewMode

 * @description Represents the different views within the Trainer Dashboard.

 */

type ViewMode = "overview" | "dog-detail" | "activity-detail";

/**

 * @interface TrainerDashboardState

 * @description Defines the state structure for the TrainerDashboard component.

 * @property {ViewMode} viewMode - The current active view within the dashboard.

 * @property {string | null} selectedDogId - The ID of the currently selected dog, if any.

 * @property {string | null} selectedActivityType - The type of activity selected, if any.

 * @property {string | null} selectedTrailId - The ID of the currently selected trail, if any.

 */

interface TrainerDashboardState {
  viewMode: ViewMode;

  selectedDogId: string | null;

  selectedActivityType: string | null; // Assuming ActivityType is a string for now

  selectedTrailId: string | null;
}

/**

 * @function TrainerDashboard

 * @description Renders the main trainer dashboard, allowing navigation between different views

 * such as an overview of all student dogs, detailed view of a single dog, and detailed view of a specific activity.

 * @param {TrainerDashboardProps} props - The component props.

 */

export const TrainerDashboard: React.FC<TrainerDashboardProps> = () => {
  const { isTrainerMode } = useViewMode();

  const { user } = useAuth();

  const [dashboardState, setDashboardState] = useState<TrainerDashboardState>({
    viewMode: "overview",

    selectedDogId: null,

    selectedActivityType: null,

    selectedTrailId: null,
  });

  const [trainerDogs, setTrainerDogs] = useState<Dog[]>([]);

  const [trainerTrails, setTrainerTrails] = useState<Trail[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Claim dog dialog state
  const [isClaimDogDialogOpen, setIsClaimDogDialogOpen] = useState(false);
  const [shareTokenInput, setShareTokenInput] = useState("");
  const [claimDogLoading, setClaimDogLoading] = useState(false);

  const fetchTrainerData = useCallback(async () => {
    console.log("fetchTrainerData: current user", user);

    if (!user || !user._id || !user.role.includes("trainer")) {
      setLoading(false);

      setError("User is not a trainer or not logged in.");

      return;
    }

    try {
      setLoading(true);

      setError(null);

      const fetchedDogs: Dog[] = await getDogsByTrainer();
      // Ensure fetchedDogs is an array before setting state
      if (Array.isArray(fetchedDogs)) {
        setTrainerDogs(fetchedDogs);
      } else {
        console.error("getDogsByTrainer did not return an array:", fetchedDogs);
        setTrainerDogs([]); // Fallback to empty array to prevent further errors
      }

      setTrainerTrails([]); // Placeholder for now, real trails will be fetched later
    } catch (err) {
      console.error("Error fetching trainer data:", err);

      setError("Failed to fetch trainer data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrainerData();
  }, [fetchTrainerData]);

  // Helper function to calculate DogStats

  const getDogStats = (dog: Dog): DogStats => {
    if (dog.activityStats === undefined) {
      return {
        dog,
        owners: [],
        activityStats: {},
        lastTrailDate: null
      };
    }

    return {
      dog,
      owners: dog.ownerIds as User[],
      activityStats: dog.activityStats,
      lastTrailDate: dog.lastTrailDate ? new Date(dog.lastTrailDate) : null,
    };
  };

  /**
   * @function handleSelectDog
   * @description Navigates to the 'dog-detail' view for the selected dog.
   * @param {string} dogId - The ID of the dog to view.
   */
  const handleSelectDog = (dogId: string) => {
    setDashboardState({
      ...dashboardState,
      viewMode: "dog-detail",
      selectedDogId: dogId,
    });
  };

  /**
   * @function handleBackToOverview
   * @description Navigates back to the 'overview' view, clearing any selected dog or trail.
   */
  const handleBackToOverview = () => {
    setDashboardState({
      ...dashboardState,
      viewMode: "overview",
      selectedDogId: null,
      selectedTrailId: null,
    });
  };

  /**
   * @function handleSelectTrail
   * @description Navigates to the 'activity-detail' view for the selected trail.
   * @param {string} trailId - The ID of the trail to view.
   */
  const handleSelectTrail = (trailId: string) => {
    setDashboardState({
      ...dashboardState,
      viewMode: "activity-detail",
      selectedTrailId: trailId,
    });
  };

  /**
   * @function handleBackToDogDetail
   * @description Navigates back to the 'dog-detail' view, clearing any selected trail.
   */
  const handleBackToDogDetail = () => {
    setDashboardState({
      ...dashboardState,
      viewMode: "dog-detail",
      selectedTrailId: null,
    });
  };

  const handleOpenClaimDogDialog = () => {
    setShareTokenInput("");
    setIsClaimDogDialogOpen(true);
  };

  const handleCloseClaimDogDialog = () => {
    setIsClaimDogDialogOpen(false);
    setShareTokenInput("");
  };

  const handleClaimDog = async () => {
    if (!shareTokenInput) {
      toast.error("Please enter a share token.");
      return;
    }

    setClaimDogLoading(true);
    try {
      await claimDogWithShareToken(shareTokenInput);
      toast.success("Dog claimed successfully!");
      await fetchTrainerData(); // Refresh the list of dogs
      handleCloseClaimDogDialog();
    } catch (error) {
      console.error("Error claiming dog:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to claim dog."
      );
    } finally {
      setClaimDogLoading(false);
    }
  };

  // If not in trainer mode, display an access denied message.
  if (!isTrainerMode) {
    return (
      <div className="flex-1 flex items-center justify-center text-2xl font-bold text-red-500">
        Access Denied: Not in Trainer Mode
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-xl font-semibold">
        Loading dogs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-xl font-semibold text-red-500">
        Error: {error}
      </div>
    );
  }

  // Calculate global statistics
  const totalDogs = trainerDogs.length;
  const totalTrails = trainerDogs
    .map((dog) =>
      dog.activityStats
        ? Object.values(dog.activityStats).reduce(
            (acc, count) => acc + count,
            0
          )
        : 0
    )
    .reduce((acc, count) => acc + count, 0);

  // Find the currently selected dog and trail based on dashboard state
  const selectedDog = trainerDogs.find(
    (dog) => dog._id === dashboardState.selectedDogId
  );
  const selectedTrail = trainerTrails.find(
    (trail) => trail._id === dashboardState.selectedTrailId
  ); // This will always be null for now

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white shadow-lg p-4">
        <h2 className="text-2xl font-bold">Tableau de Bord Éducateur</h2>
        <p className="text-sm text-green-100 opacity-90">
          Suivez la progression de vos chiens étudiants
        </p>
      </div>

      {/* Main Content Area - Conditional rendering based on viewMode */}
      <div className="flex-1 p-4 overflow-auto">
        {dashboardState.viewMode === "overview" && (
          <div className="space-y-4">
            {/* Global Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Chiens Étudiants</h3>
                <p className="text-3xl font-bold text-blue-600">{totalDogs}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Pistes Enregistrées</h3>
                <p className="text-3xl font-bold text-green-600">
                  {totalTrails}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">Élèves Actifs</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {
                    new Set(
                      trainerDogs.flatMap((dog) =>
                        dog.ownerIds.map((owner) =>
                          typeof owner === "object" &&
                          owner !== null &&
                          "_id" in owner
                            ? owner._id
                            : String(owner)
                        )
                      )
                    ).size
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <Button onClick={handleOpenClaimDogDialog}>
                Ajouter un chien avec un code
              </Button>
            </div>

            {/* Basic Dog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainerDogs.map((dog) => (
                <TrainerDogCard
                  key={dog._id}
                  dogStats={getDogStats(dog)} // Pass dogStats, trainerTrails is empty for now
                  onClick={() => handleSelectDog(dog._id!)}
                />
              ))}
            </div>
          </div>
        )}
        {dashboardState.viewMode === "dog-detail" && selectedDog && (
          <DogDetailView
            dog={selectedDog as any}
            onBack={handleBackToOverview}
            onSelectTrail={handleSelectTrail}
          />
        )}
        {dashboardState.viewMode === "activity-detail" && selectedTrail && (
          <ActivityDetailView
            trail={selectedTrail}
            onBack={handleBackToDogDetail}
          />
        )}
      </div>

      {/* Claim Dog Dialog */}
      <Dialog
        open={isClaimDogDialogOpen}
        onOpenChange={handleCloseClaimDogDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un chien avec un code</DialogTitle>
            <DialogDescription>
              Entrez le code de partage fourni par le propriétaire du chien.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="share-token">Code de partage</Label>
              <Input
                id="share-token"
                placeholder="Entrez le code ici"
                value={shareTokenInput}
                onChange={(e) => setShareTokenInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseClaimDogDialog}
              disabled={claimDogLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleClaimDog}
              disabled={claimDogLoading || !shareTokenInput}
            >
              {claimDogLoading ? "Ajout en cours..." : "Ajouter le chien"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
