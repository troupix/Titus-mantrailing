
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DogSelector } from "./DogSelector";

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
}: MantrailingFormProps) {
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
      <div className="space-y-2">
        <Label htmlFor="trainer">Formateur</Label>
        <Input
          id="trainer"
          value={trainer}
          onChange={(e) => setTrainer(e.target.value)}
          placeholder="Ex: Claudia"
        />
      </div>
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
