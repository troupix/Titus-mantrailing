import React from "react";
import { User } from "../types/entities";
import { Dog } from "../types";
import { formatAge } from "../utils/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Clock } from "lucide-react";
import { ActivityType, ACTIVITY_CONFIGS } from "../types/activityConfig";
import DogHomePageIcon from "./DogHomePageIcon";

/**
 * TrainerDogCard
 *
 * Card réutilisable affichant un chien avec ses statistiques par type d'activité.
 * Utilisé dans le TrainerDashboard pour la vue overview.
 */

export type DogActivityStats = { [key in ActivityType]?: number };

export interface DogStats {
  dog: Dog;
  owners: User[];
  activityStats: DogActivityStats; // Stats par type d'activité
  lastTrailDate: Date | null;
}

interface TrainerDogCardProps {
  dogStats: DogStats;
  onClick: () => void;
}

export function TrainerDogCard({ dogStats, onClick }: TrainerDogCardProps) {
  const {
    dog,
    owners,
    activityStats,
    lastTrailDate,
  } = dogStats;
  const totalTrails = Object.values(dogStats.activityStats).reduce((sum, s) => sum + s, 0)

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] h-full"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            {dog.profilePhoto ? (
              <img
                src={dog.profilePhoto}
                alt={dog.name}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-purple-200 text-purple-700 text-xl">
                <DogHomePageIcon className="h-8 w-8" />
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-1 truncate">{dog.name}</CardTitle>
            <CardDescription className="truncate">
              {dog.breed && <span>{dog.breed}</span>}
              {dog.birthDate && dog.breed && <span> • </span>}
              {dog.birthDate && <span>{formatAge(dog.birthDate)}</span>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Handlers */}
        {owners.length > 0 && (
          <div>
            <div className="text-sm text-muted-foreground mb-2">Handlers:</div>
            <div className="flex flex-wrap gap-2">
              {owners.map((owner) => (
                <Badge key={owner._id} variant="outline" className="text-xs">
                  {owner.username}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats par Activité */}
        {Object.keys(activityStats).length > 0 && (
          <div>
            <div className="text-sm text-muted-foreground mb-2">Activités:</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(activityStats) as ActivityType[]).map((stat) => {
                const config = ACTIVITY_CONFIGS[stat];
                return (
                  <Badge
                    key={stat}
                    variant="secondary"
                    className="gap-1"
                    style={{
                      backgroundColor: `var(--${config.color}-100)`,
                      color: `var(--${config.color}-700)`,
                      borderColor: `var(--${config.color}-200)`,
                    }}
                  >
                    {config.icon && React.createElement(config.icon, { className: "h-3 w-3" })}
                    <span className="font-semibold">{activityStats[stat]}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Globales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-semibold">{totalTrails}</div>
            <div className="text-xs text-muted-foreground">Pistes totales</div>
          </div>
        </div>

        {/* Last Trail Date */}
        {lastTrailDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="h-3 w-3" />
            <span>
              Dernière piste: {lastTrailDate.toLocaleDateString("fr-FR")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
