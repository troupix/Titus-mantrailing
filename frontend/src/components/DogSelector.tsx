import { useAuth } from "../contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Dog } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DogHomePageIcon from "./DogHomePageIcon";

interface DogSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function DogSelector({ value, onChange, required = false }: DogSelectorProps) {
  const { dogs } = useAuth();

  return (
    <div className="space-y-2">
      <Label htmlFor="dog">
        <DogHomePageIcon className="w-4 h-4 inline mr-2" />
        Chien {required && "*"}
      </Label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger id="dog">
          <SelectValue placeholder="Sélectionner un chien" />
        </SelectTrigger>
        <SelectContent>
          {dogs.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              Aucun chien disponible
            </div>
          ) : (
            dogs.map((dog) => (
              <SelectItem key={dog._id} value={dog._id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={dog.profilePhoto} alt={dog.name} />
                    <AvatarFallback className="text-xs">
                      <Dog className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{dog.name}</span>
                  {dog.breed && (
                    <span className="text-muted-foreground text-xs">({dog.breed})</span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {dogs.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Vous devez d'abord ajouter un chien dans la section "Mes Chiens"
        </p>
      )}
    </div>
  );
}
