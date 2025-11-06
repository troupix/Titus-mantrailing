
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

interface HikingFormProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  difficulty: "Easy" | "Moderate" | "Hard" | "Expert";
  setDifficulty: (value: "Easy" | "Moderate" | "Hard" | "Expert") => void;
  elevationGain: number;
  setElevationGain: (value: number) => void;
  selectedPhotos: File[];
  setSelectedPhotos: (value: File[]) => void;
  existingPhotos: string[];
  setExistingPhotos: (value: string[]) => void;
}

export function HikingForm({
  name,
  setName,
  description,
  setDescription,
  difficulty,
  setDifficulty,
  elevationGain,
  setElevationGain,
  selectedPhotos,
  setSelectedPhotos,
  existingPhotos,
  setExistingPhotos,
}: HikingFormProps) {
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    const newPhotoPreviews = selectedPhotos.map((file) =>
      URL.createObjectURL(file)
    );
    setPhotoPreviews(newPhotoPreviews);

    return () => {
      newPhotoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedPhotos]);
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nom de la randonnée *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Mont Blanc"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez votre randonnée..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulté</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Facile</SelectItem>
              <SelectItem value="Moderate">Modérée</SelectItem>
              <SelectItem value="Hard">Difficile</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="elevationGain">Dénivelé positif (m)</Label>
          <Input
            id="elevationGain"
            type="number"
            value={elevationGain}
            onChange={(e) => setElevationGain(Number(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg text-blue-900">Photos de la randonnée</h3>
        <div className="space-y-2">
          <Label htmlFor="photos">Ajouter des photos</Label>
          <Input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setSelectedPhotos(Array.from(e.target.files));
              }
            }}
          />
        </div>

        {/* Display selected new photos */}
        {selectedPhotos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {photoPreviews.map((photoUrl, index) => (
              <div key={photoUrl + index} className="relative">
                <img
                  src={photoUrl}
                  alt={`Preview ${index}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() =>
                    setSelectedPhotos(
                      selectedPhotos.filter((_, i) => i !== index)
                    )
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Display existing photos */}
        {existingPhotos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {existingPhotos.map((photoUrl, index) => (
              <div key={photoUrl + index} className="relative">
                <img
                  src={photoUrl}
                  alt={`Existing ${index}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() =>
                    setExistingPhotos(
                      existingPhotos.filter((_, i) => i !== index)
                    )
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
