
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { SelectWithFreeInput } from "./SelectWithFreeInput"; // Import the new component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DogSelector } from "./DogSelector";
import { useMemo } from "react";
import { User } from "../types/entities";
import { ActivityType } from "../types/activityConfig";
import { useAuth } from "../contexts/AuthContext";

interface MantrailingFormProps {
  selectedDogId: string;
  setSelectedDogId: (value: string) => void;
  handlerName: string;
  setHandlerName: (value: string) => void;
  trainer: string;
  setTrainer: (value: string) => void;
  trailType: string;
  setTrailType: (value: string) => void;
  startType: string;
  setStartType: (value: string) => void;
  delay: number;
  setDelay: (value: number) => void;
  user: User | null;
  trainerComment: string;
  setTrainerComment: (value: string) => void;
}

export function MantrailingForm({
  selectedDogId,
  setSelectedDogId,
  handlerName,
  setHandlerName,
  trainer,
  setTrainer,
  trailType,
  setTrailType,
  startType,
  setStartType,
  delay,
  setDelay,
  user,
  trainerComment,
  setTrainerComment,
}: MantrailingFormProps) {
  const isTrainer = user?.role.includes("trainer");
  const { dogs } = useAuth(); // Get dogs from AuthContext

  // Use useMemo to filter trainers from the selected dog's populated trainers array
  const availableTrainersForDogOptions = useMemo(() => {
    if (!selectedDogId || !dogs || dogs.length === 0) {
      return [];
    }
    const currentDog = dogs.find((d) => d._id === selectedDogId);
    if (!currentDog || !currentDog.trainers) {
      return [];
    }

    // Filter trainers who are assigned for 'mantrailing' activity
    // Assuming trainerId is populated as a User object due to backend changes
    const mantrailingTrainers = currentDog.trainers
      .filter(assignedTrainer => assignedTrainer.activities.includes("mantrailing" as ActivityType))
      .map(assignedTrainer => assignedTrainer.trainerId as User);

    return mantrailingTrainers.map(trainerUser => ({
      value: trainerUser._id,
      label: trainerUser.username,
    }));
  }, [selectedDogId, dogs]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <DogSelector
            value={selectedDogId}
            onChange={setSelectedDogId}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="handlerName">Nom du maître *</Label>
          <Input
            value={handlerName}
            onChange={(e) => setHandlerName(e.target.value)}
            required
          />
        </div>
      </div>
      <SelectWithFreeInput
        id="trainer"
        label="Formateur"
        options={availableTrainersForDogOptions}
        value={trainer}
        onChange={setTrainer}
        placeholder="Sélectionnez un formateur"
        freeInputPlaceholder="Saisissez le nom du formateur"
      />
      {isTrainer && (
        <div className="space-y-2">
          <Label htmlFor="trainerComment">Commentaire du formateur</Label>
          <Textarea
            id="trainerComment"
            value={trainerComment}
            onChange={(e) => setTrainerComment(e.target.value)}
            placeholder="Ajoutez un commentaire visible uniquement par les formateurs..."
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="trailType">Type de piste</Label>
        <Input
          id="trailType"
          value={trailType}
          onChange={(e) => setTrailType(e.target.value)}
          placeholder="Ex: Milieu urbain, forêt..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startType">Type de départ</Label>
        <Select value={startType} onValueChange={setStartType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="knowing">Départ visuel / Knowing</SelectItem>
            <SelectItem value="blind">Départ à l'aveugle / Blind</SelectItem>
            <SelectItem value="double blind">
              Double aveugle / Double blind
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="delay">Délai (minutes)</Label>
        <Input
          id="delay"
          type="number"
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value) * 60)}
          placeholder="0"
        />
      </div>
    </>
  );
}
