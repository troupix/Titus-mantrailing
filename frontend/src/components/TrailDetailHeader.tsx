import React from "react";
import { Trail, MantrailingTrail, HikingTrail } from "../types/trail";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Edit, MapPin, Calendar, Trash2 } from "lucide-react";
import TrailIcon from "./TrailIcon";
import HikeIcon from "./HikeIcon";

interface TrailDetailHeaderProps {
  trail: Trail;
  onEdit: (trail: Trail) => void;
  onDelete: () => void;
  isMantrailing: boolean;
}

export function TrailDetailHeader({ trail, onEdit, onDelete, isMantrailing }: TrailDetailHeaderProps) {
  const isAllowedToCreate = localStorage.getItem('isAllowedToCreate') === 'true';

  const getTitle = () => {
    if (isMantrailing) {
      const mantrailingTrail = trail as MantrailingTrail;
      return `${typeof mantrailingTrail.dog === "object" ? mantrailingTrail.dog.name : ""} - ${new Date(mantrailingTrail.date).toLocaleDateString('fr-FR')}`;
    } else {
      const hikingTrail = trail as HikingTrail;
      return hikingTrail.name;
    }
  };

  return (
    <Card className={`bg-gradient-to-r ${
      isMantrailing
        ? "from-blue-600 to-blue-700"
        : "from-green-600 to-green-700"
    } text-white border-0 shadow-xl`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-3xl">{getTitle()}</CardTitle>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                {isMantrailing ? (
                  <>
                    <TrailIcon className="h-3 w-3 mr-1" />
                    Mantrailing
                  </>
                ) : (
                  <>
                    <HikeIcon className="h-3 w-3 mr-1" />
                    Randonnée
                  </>
                )}
              </Badge>
            </div>
            {trail.location && (
              <div className="flex items-center gap-2 text-blue-100">
                <MapPin className="h-4 w-4" />
                <span>{trail.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-blue-100">
              <Calendar className="h-4 w-4" />
              <span>{new Date(trail.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
          {isAllowedToCreate && (
            <div className="flex gap-2 self-start sm:self-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(trail)}
                className="gap-2 flex-shrink-0"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden xs:inline">Modifier</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                className="gap-2 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden xs:inline">Supprimer</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
