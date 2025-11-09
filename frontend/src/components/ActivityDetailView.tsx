import React from "react";
import { Trail, isMantrailingTrail, MantrailingTrail, HikingTrail, isHikingTrail } from "../types/trail";
import { Button } from "./ui/button";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Target, TrendingUp, Award, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ActivityDetailViewProps {
  trail: Trail;
  dogName?: string;
  onBack: () => void;
}

export const ActivityDetailView: React.FC<ActivityDetailViewProps> = ({
  trail,
  dogName,
  onBack,
}) => {
  const renderMantrailingDetails = (trail: MantrailingTrail) => (
    <Card>
      <CardHeader>
        <CardTitle>{trail.location || "Piste Mantrailing"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(trail.date).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{Math.round((trail.duration || 0) / 60)} min</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{((trail.distance || 0) / 1000).toFixed(2)} km</span>
            </div>
            {trail.handlerName && (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{trail.handlerName}</span>
                </div>
            )}
            {trail.startType && (
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>
                        {trail.startType === "knowing"
                        ? "Départ visuel"
                        : trail.startType === "blind"
                        ? "Départ à l'aveugle"
                        : trail.startType === "double blind"
                        ? "Double aveugle"
                        : trail.startType}
                    </span>
                </div>
            )}
            {trail.trailType && (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{trail.trailType}</span>
                </div>
            )}
        </div>
        {trail.trainerComment && (
            <div className="mt-4 border-t pt-4">
                <p className="flex items-start gap-2 text-sm">
                <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                <span className="italic">"{trail.trainerComment}"</span>
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );

  const renderHikingDetails = (trail: HikingTrail) => (
     <Card>
      <CardHeader>
        <CardTitle>{trail.name || "Randonnée"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(trail.date).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{Math.round((trail.duration || 0) / 60)} min</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{((trail.distance || 0) / 1000).toFixed(2)} km</span>
            </div>
             {trail.elevationGain !== undefined && (
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{trail.elevationGain} m D+</span>
                </div>
            )}
            {trail.difficulty && (
                <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>
                        {trail.difficulty === "Easy" ? "Facile" :
                         trail.difficulty === "Moderate" ? "Modérée" :
                         trail.difficulty === "Hard" ? "Difficile" : "Expert"}
                    </span>
                </div>
            )}
        </div>
        {trail.notes && (
            <div className="mt-4 border-t pt-4">
                <p className="flex items-start gap-2 text-sm">
                <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                <span className="italic">"{trail.notes}"</span>
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à {dogName || "la fiche du chien"}
        </Button>
      </div>

      {isMantrailingTrail(trail) && renderMantrailingDetails(trail)}
      {isHikingTrail(trail) && renderHikingDetails(trail)}

      {!isMantrailingTrail(trail) && !isHikingTrail(trail) && (
          <p>Détails de la piste non disponibles pour ce type d'activité.</p>
      )}
    </div>
  );
};