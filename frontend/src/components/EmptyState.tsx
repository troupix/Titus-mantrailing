import {  Plus } from "lucide-react";
import { Button } from "./ui/button";
import TrailIcon from "./TrailIcon";
import HikeIcon from "./HikeIcon";

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center max-w-md px-6">
        <div className="mb-6 flex justify-center gap-4">
          <div className="bg-blue-100 p-6 rounded-full">
            <TrailIcon className="h-16 w-16 text-blue-600" />
          </div>
          <div className="bg-green-100 p-6 rounded-full">
            <HikeIcon className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h2 className="mb-3 text-blue-900">Bienvenue dans votre carnet de pistes</h2>
        <p className="text-muted-foreground mb-6">
          Commencez à documenter vos pistes de mantrailing et de randonnée. 
          Créez votre première piste pour suivre vos progrès et ceux de votre chien.
        </p>
        <Button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="h-5 w-5" />
          Créer ma première piste
        </Button>
      </div>
    </div>
  );
}
