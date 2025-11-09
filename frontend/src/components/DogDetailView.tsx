/**
 * @file DogDetailView.tsx
 * @description Displays detailed information for a single student dog within the Trainer Dashboard.
 * It includes dog's profile, activity-specific statistics, and a list of trails filtered by activity type.
 */

import React, { useState } from "react";
import { Dog } from "../types";
import {
  Trail, HikingTrail,
  isMantrailingTrail,
  isHikingTrail,
  MantrailingTrail,
} from "../types/trail";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { ArrowLeft, Calendar, Clock, MapPin, Users, MessageSquare, Target, TrendingUp, Award, RefreshCw } from "lucide-react";
import { ActivityTypeStatsDisplay } from "./ActivityStatsCard";
import { formatAge } from "../utils/utils";
import { ActivityType } from "../types/activityConfig";
import { getTrailsByDogIdForTrainer } from "../utils/api";
import { Card, CardContent } from "./ui/card";

/**
 * @interface DogDetailViewProps
 * @description Defines the props for the DogDetailView component.
 * @property {Dog} dog - The dog object whose details are to be displayed.
 * @property {Trail[]} trails - An array of trails associated with the dog.
 * @property {() => void} onBack - Callback function to navigate back to the overview.
 * @property {(trailId: string) => void} onSelectTrail - Callback function when a trail is selected.
 */
interface DogDetailViewProps {
  dog: Dog;
  // trails: Trail[];
  onBack: () => void;
  onSelectTrail: (trailId: string) => void;
}

/**
 * @function DogDetailView
 * @description React functional component that renders the detailed view of a dog.
 * It allows trainers to see a dog's profile, switch between different activity types
 * to view relevant statistics and a list of associated trails.
 * @param {DogDetailViewProps} props - The component props.
 */
export const DogDetailView: React.FC<DogDetailViewProps> = ({
  dog,
  onBack,
  onSelectTrail,
}) => {
  // State to manage the active tab for activity types
  const [activeTab, setActiveTab] = useState<ActivityType>("mantrailing");
  const [trails, setTrails] = useState<Trail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrails = React.useCallback(async () => {
    if (!dog._id) return;
    setIsLoading(true);
    try {
      const fetchedTrails = await getTrailsByDogIdForTrainer(dog._id);
      setTrails(fetchedTrails);
    } catch (error) {
      console.error("Failed to fetch trails for dog:", error);
      // Optionally, show a toast notification here
    } finally {
      setIsLoading(false);
    }
  }, [dog._id]);

  React.useEffect(() => {
    fetchTrails();
  }, [fetchTrails]);

  // Filter trails based on the active activity tab
  const filteredTrails = trails.filter((trail) => {
    if (activeTab === "mantrailing") {
      return isMantrailingTrail(trail);
    } else if (activeTab === "hiking") {
      return isHikingTrail(trail);
    }
    return false;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header section with back button and dog's main information */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-16 w-16">
          <AvatarImage src={dog.profilePhoto} alt={dog.name} />
          <AvatarFallback>
            {dog.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold">{dog.name}</h3>
          <p className="text-sm text-muted-foreground">
            {dog.breed || "Race inconnue"} • {formatAge(dog.birthDate)}
          </p>
          <p className="text-sm text-muted-foreground">
            Handler:{" "}
            {dog.ownerIds
              .map((owner: any) => {
                if (
                  typeof owner === "object" &&
                  owner !== null &&
                  "username" in owner
                ) {
                  return owner.username;
                }
                return String(owner); // Fallback to string representation if not a User object
              })
              .join(", ")}
          </p>
        </div>
      </div>

      {/* Tabs for Activity Types */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ActivityType)}
        className="w-full p-4"
      >
        <TabsList
          className={`grid w-full grid-cols-${
            Object.keys(dog.activityStats || {}).length || 1
          }`}
        >
          {dog.activityStats &&
            Object.keys(dog.activityStats).length > 0 &&
            Object.keys(dog.activityStats).map((activityType) => (
              <TabsTrigger
                key={activityType}
                value={activityType}
                className="w-full"
              >
                {activityType.charAt(0).toUpperCase() + activityType.slice(1)}
              </TabsTrigger>
            ))}
        </TabsList>
        <TabsContent value="mantrailing" className="mt-4">
          <ActivityTypeStatsDisplay
            activityType="mantrailing"
            trails={filteredTrails}
          />

          <div className="flex items-center justify-between mb-2 mt-4">
            <h4 className="text-lg font-semibold">
              Pistes Mantrailing ({filteredTrails.length})
            </h4>
            <Button variant="ghost" size="icon" onClick={fetchTrails} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="space-y-2">
            {filteredTrails.length > 0 ? (
              filteredTrails.map((trail) => {
                const mantrailingTrail = trail as MantrailingTrail;
                const id = isMantrailingTrail(trail) ? mantrailingTrail._id : mantrailingTrail.id;
                if(!id) return <></>;
                return (
                  <Card
                    key={id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      onSelectTrail(id);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      {mantrailingTrail?.handlerName && (
                                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <Users className="h-3 w-3" />
                                          {mantrailingTrail.handlerName}
                                        </span>
                                      )}
                                    </div>

                                    <h3 className="mb-2 truncate text-blue-600">
                                      {mantrailingTrail.location || "Piste"}
                                    </h3>

                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(mantrailingTrail.date).toLocaleDateString("fr-FR")}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {((mantrailingTrail.distance || 0) / 1000).toFixed(2)} km
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {Math.round((mantrailingTrail.duration || 0) / 60)} min
                                      </span>
                                      {mantrailingTrail.startType && (
                                        <span className="flex items-center gap-1">
                                          <Target className="h-3 w-3" />
                                          {mantrailingTrail.startType === "knowing"
                                            ? "Départ visuel"
                                            : mantrailingTrail.startType === "blind"
                                            ? "Départ à l'aveugle"
                                            : mantrailingTrail.startType === "double blind"
                                            ? "Double aveugle"
                                            : mantrailingTrail.startType}
                                        </span>
                                      )}
                                      {mantrailingTrail.trailType && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {mantrailingTrail.trailType}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {mantrailingTrail.trainerComment && (
                                    <div className="mt-3 border-t pt-3">
                                        <p className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <span className="italic">"{mantrailingTrail.trainerComment}"</span>
                                        </p>
                                    </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card> 
                          );
              })
            ) : (
              <p className="text-muted-foreground">
                Aucune piste de mantrailing pour ce chien.
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="hiking" className="mt-4">
          <ActivityTypeStatsDisplay
            activityType="hiking"
            trails={filteredTrails}
          />

          <div className="flex items-center justify-between mb-2 mt-4">
            <h4 className="text-lg font-semibold">
              Pistes Randonnée ({filteredTrails.length})
            </h4>
             <Button variant="ghost" size="icon" onClick={fetchTrails} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="space-y-2">
            {filteredTrails.length > 0 ? (
              filteredTrails.map((trail) => {
                const hikingTrail = trail as HikingTrail;
                const id = isHikingTrail(trail) ? hikingTrail._id : hikingTrail.id;
                if (!id) return <></>;
                return (
                  <Card
                    key={id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      onSelectTrail(id);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="mb-2 truncate text-green-900">
                            {hikingTrail.name || "Randonnée"}
                          </h3>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(hikingTrail.date).toLocaleDateString("fr-FR")}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {((hikingTrail.distance || 0) / 1000).toFixed(2)} km
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.round((hikingTrail.duration || 0) / 60)} min
                            </span>
                            {hikingTrail.elevationGain !== undefined && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {hikingTrail.elevationGain} m D+
                              </span>
                            )}
                            {hikingTrail.difficulty && (
                              <span className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {hikingTrail.difficulty === "Easy" ? "Facile" :
                                 hikingTrail.difficulty === "Moderate" ? "Modérée" :
                                 hikingTrail.difficulty === "Hard" ? "Difficile" : "Expert"}
                              </span>
                            )}
                          </div>

                          {hikingTrail.notes && (
                            <div className="mt-3 border-t pt-3">
                              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span className="italic">"{hikingTrail.notes}"</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p className="text-muted-foreground">
                Aucune piste de randonnée pour ce chien.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
