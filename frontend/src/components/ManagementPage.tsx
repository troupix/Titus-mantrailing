import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Dog } from "../utils/types";
import { formatAge } from "../utils/utils";
import { createDog, updateDog, deleteDog, uploadDogProfilePhoto, updateDogPresentation } from "../utils/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Bone,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { ImageCropUpload } from "./ImageCropUpload";
import DogHomePageIcon from "./DogHomePageIcon";

export function ManagementPage() {
  const { user, dogs, refreshDogs } = useAuth();

  const [dogPhoto, setDogPhoto] = useState<Blob | null>(null);
  const [dogPhotoPreview, setDogPhotoPreview] = useState<string | undefined>(undefined);

  // Presentation management state
  const [isPresentationDialogOpen, setIsPresentationDialogOpen] = useState(false);
  const [editingPresentationDog, setEditingPresentationDog] = useState<Dog | null>(null);
  const [presentationText, setPresentationText] = useState("");
  const [presentationLegend, setPresentationLegend] = useState("");
  const [presentationPhoto, setPresentationPhoto] = useState<Blob | null>(null);
  const [presentationPhotoPreview, setPresentationPhotoPreview] = useState<string | undefined>(undefined);
  const [presentationLoading, setPresentationLoading] = useState(false);

  useEffect(() => {
    console.log(dogs);
  }, [dogs]);

  // Dogs management state
  const [isDogsDialogOpen, setIsDogsDialogOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [dogsLoading, setDogsLoading] = useState(false);
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogBirthDate, setDogBirthDate] = useState("");

  useEffect(() => {
    if (editingDog) {
      setDogName(editingDog.name ?? "");
      setDogBreed(editingDog.breed ?? "");
      setDogBirthDate(
        editingDog.birthDate
          ? new Date(editingDog.birthDate).toISOString().split("T")[0]
          : ""
      );
      setDogPhoto(null); // Clear the Blob when editing a new dog
      setDogPhotoPreview(editingDog.profilePhoto ?? undefined);
    } else {
      resetDogForm();
    }
  }, [editingDog]);

  useEffect(() => {
    if (editingPresentationDog) {
      setPresentationText(editingPresentationDog.presentation ?? "");
      setPresentationLegend(editingPresentationDog.legend ?? "");
      setPresentationPhoto(null);
      setPresentationPhotoPreview(editingPresentationDog.presentationPhoto ?? undefined);
    } else {
      resetPresentationForm();
    }
  }, [editingPresentationDog]);

  const resetDogForm = () => {
    setDogName("");
    setDogBreed("");
    setDogBirthDate("");
    setDogPhoto(null);
    setDogPhotoPreview(undefined);
  };

  const resetPresentationForm = () => {
    setPresentationText("");
    setPresentationLegend("");
    setPresentationPhoto(null);
    setPresentationPhotoPreview(undefined);
  };

  const handleOpenDogsDialog = (dog?: Dog) => {
    if (dog) {
      setEditingDog(dog);
    } else {
      setEditingDog(null);
      resetDogForm();
    }
    setIsDogsDialogOpen(true);
  };

  const handleCloseDogsDialog = () => {
    setIsDogsDialogOpen(false);
    setEditingDog(null);
    resetDogForm();
  };

  const handleOpenPresentationDialog = (dog: Dog) => {
    setEditingPresentationDog(dog);
    setIsPresentationDialogOpen(true);
  };

  const handleClosePresentationDialog = () => {
    setIsPresentationDialogOpen(false);
    setEditingPresentationDog(null);
    resetPresentationForm();
  };

  useEffect(() => {
    console.log(isDogsDialogOpen);
  }, [isDogsDialogOpen]);

  const handleDogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setDogsLoading(true);

    try {
      let profilePhotoUrl = dogPhotoPreview;
      if (dogPhoto) {
        // If a new photo Blob exists, upload it
        const formData = new FormData();
        formData.append("photo", dogPhoto, "dog_profile_photo.jpeg");
        const uploadResponse = await uploadDogProfilePhoto(formData);
        profilePhotoUrl = uploadResponse.url; // Or whatever the response structure is
      }

      if (editingDog) {
        await updateDog(editingDog._id, {
          name: dogName,
          breed: dogBreed || undefined,
          birthDate: dogBirthDate ? new Date(dogBirthDate) : undefined,
          profilePhoto: profilePhotoUrl || undefined,
        });
        toast.success("Chien mis à jour avec succès");
      } else {
        const newDogData = {
          name: dogName,
          ownerIds: [user._id],
          breed: dogBreed || undefined,
          birthDate: dogBirthDate ? new Date(dogBirthDate) : undefined,
          trainerIds: [],
        };
        const createdDog = await createDog(newDogData);

        if (profilePhotoUrl) {
          await updateDog(createdDog._id, { profilePhoto: profilePhotoUrl });
        }
        toast.success("Chien ajouté avec succès");
      }

      await refreshDogs();
      handleCloseDogsDialog();
    } catch (error) {
      console.error("Error saving dog:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement"
      );
    }
    finally {
      setDogsLoading(false);
    }
  };

  const handlePresentationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPresentationDog) return;

    setPresentationLoading(true);

    try {
      const formData = new FormData();
      formData.append("legend", presentationLegend);
      formData.append("presentation", presentationText);

      if (presentationPhoto) {
        formData.append("photo", presentationPhoto, "dog_presentation_photo.jpeg");
      }

      await updateDogPresentation(editingPresentationDog._id, formData);
      toast.success("Présentation du chien mise à jour avec succès");
      await refreshDogs();
      handleClosePresentationDialog();
    } catch (error) {
      console.error("Error saving dog presentation:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement de la présentation"
      );
    } finally {
      setPresentationLoading(false);
    }
  };

  const handleDeleteDog = async (dogId: string) => {
    if (
      //eslint-disable-next-line no-restricted-globals
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce chien ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      await deleteDog(dogId);
      toast.success("Chien supprimé");
      await refreshDogs();
    } catch (error) {
      console.error("Error deleting dog:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="h-full overflow-auto p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="mb-2">Gestion</h1>
          <p className="text-muted-foreground">
            Gérez vos chiens, handlers et connexions avec les éducateurs
          </p>
        </div>

        {/* Dogs Tab */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-1">Mes Chiens</h2>
              <p className="text-sm text-muted-foreground">
                Gérez vos compagnons de mantrailing
              </p>
            </div>
            <Button onClick={() => handleOpenDogsDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un chien
            </Button>
          </div>
          <Dialog open={isDogsDialogOpen} onOpenChange={handleCloseDogsDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleDogSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingDog ? "Modifier le chien" : "Ajouter un chien"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDog
                      ? "Modifiez les informations de votre chien"
                      : "Ajoutez un nouveau chien à votre liste"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Titus"
                      value={dogName}
                      onChange={(e) => setDogName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breed">Race</Label>
                    <Input
                      id="breed"
                      placeholder="Ex: Berger Allemand"
                      value={dogBreed}
                      onChange={(e) => setDogBreed(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={dogBirthDate}
                      onChange={(e) => setDogBirthDate(e.target.value)}
                    />
                    {dogBirthDate && (
                      <p className="text-sm text-muted-foreground">
                        Âge: {formatAge(dogBirthDate)}
                      </p>
                    )}
                  </div>

                  <ImageCropUpload
                    value={dogPhotoPreview} // Use preview for display
                    onChange={(blob) => {
                      setDogPhoto(blob);
                      if (blob) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setDogPhotoPreview(reader.result as string);
                        };
                        reader.readAsDataURL(blob);
                      } else {
                        setDogPhotoPreview(undefined);
                      }
                    }}
                    label="Photo du chien"
                    shape="round"
                    fallbackText={dogName || "Chien"}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDogsDialog}
                    disabled={dogsLoading}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={dogsLoading}>
                    {dogsLoading
                      ? "Enregistrement..."
                      : editingDog
                      ? "Modifier"
                      : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dog Presentation Dialog */}
          <Dialog open={isPresentationDialogOpen} onOpenChange={handleClosePresentationDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handlePresentationSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingPresentationDog?.name ? `Modifier la présentation de ${editingPresentationDog.name}` : "Modifier la présentation"}
                  </DialogTitle>
                  <DialogDescription>
                    Mettez à jour la photo, la légende et le texte de présentation de votre chien.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <ImageCropUpload
                    value={presentationPhotoPreview}
                    onChange={(blob) => {
                      setPresentationPhoto(blob);
                      if (blob) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPresentationPhotoPreview(reader.result as string);
                        };
                        reader.readAsDataURL(blob);
                      } else {
                        setPresentationPhotoPreview(undefined);
                      }
                    }}
                    label="Photo de présentation"
                    shape="rect"
                    fallbackText={editingPresentationDog?.name || "Chien"}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="presentation-legend">Légende de la photo</Label>
                    <Input
                      id="presentation-legend"
                      placeholder="Ex: Titus en pleine action !"
                      value={presentationLegend}
                      onChange={(e) => setPresentationLegend(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="presentation-text">Texte de présentation (Markdown)</Label>
                    <textarea
                      id="presentation-text"
                      rows={10}
                      className="flex h-auto w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-justify"
                      placeholder="Décrivez votre chien en utilisant le format Markdown..."
                      value={presentationText}
                      onChange={(e) => setPresentationText(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClosePresentationDialog}
                    disabled={presentationLoading}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={presentationLoading}>
                    {presentationLoading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {dogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DogHomePageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="mb-2">Aucun chien enregistré</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Commencez par ajouter votre premier compagnon de mantrailing
                </p>
                <Button onClick={() => handleOpenDogsDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un chien
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dogs.map((dog) => (
                <Card key={dog._id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      {/* Dog Photo */}
                      <div className="flex-shrink-0">
                        {dog.profilePhoto ? (
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                            <img
                              src={dog.profilePhoto}
                              alt={dog.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <DogHomePageIcon className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <CardTitle className="flex items-center gap-2">
                          <DogHomePageIcon className="w-5 h-5" />
                          {dog.name}
                        </CardTitle>
                        {dog.breed && (
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Bone className="w-3 h-3" />
                            {dog.breed}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenPresentationDialog(dog)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDogsDialog(dog)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDog(dog._id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dog.birthDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatAge(dog.birthDate.toString())}</span>
                        <span className="text-muted-foreground">
                          ({new Date(dog.birthDate).toLocaleDateString("fr-FR")}
                          )
                        </span>
                      </div>
                    )}

                    {dog.ownerIds.length > 1 && (
                      <Badge variant="secondary">
                        Partagé avec {dog.ownerIds.length - 1} autre
                        {dog.ownerIds.length > 2 ? "s" : ""}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
