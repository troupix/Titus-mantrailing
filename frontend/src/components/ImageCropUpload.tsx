import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Upload, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ImageCropUploadProps {
  value?: string;
  onChange: (croppedImage: Blob | null) => void;
  label?: string;
  aspectRatio?: number;
  shape?: "round" | "rect";
  fallbackText?: string;
}

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropUpload({
  value,
  onChange,
  label = "Photo",
  aspectRatio = 1,
  shape = "round",
  fallbackText = "Photo",
}: ImageCropUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setIsDialogOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    // Set canvas size to match the crop area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // --- Start of new resizing logic ---
    const MAX_IMAGE_SIZE = 800; // Max width or height in pixels

    let { width, height } = canvas;

    // Check if the image needs resizing
    if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
      const aspectRatio = width / height;

      if (width > height) {
        width = MAX_IMAGE_SIZE;
        height = MAX_IMAGE_SIZE / aspectRatio;
      } else {
        height = MAX_IMAGE_SIZE;
        width = MAX_IMAGE_SIZE * aspectRatio;
      }

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) {
        throw new Error("No 2d context for temporary canvas");
      }

      tempCanvas.width = width;
      tempCanvas.height = height;

      tempCtx.drawImage(canvas, 0, 0, width, height);

      // Convert the resized image to Blob
      return new Promise((resolve) => {
        tempCanvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.8);
      });
    }
    // --- End of new resizing logic ---

    // If no resizing needed, convert original cropped image to Blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.9);
    });
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onChange(croppedImageBlob);
      setIsDialogOpen(false);
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  };

  const handleCropCancel = () => {
    setIsDialogOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <div className="flex items-center gap-4">
        {/* Preview */}
        <Avatar className={shape === "round" ? "h-24 w-24" : "h-24 w-24 rounded-lg"}>
          <AvatarImage src={value} alt={fallbackText} />
          <AvatarFallback className="text-lg">
            {fallbackText.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4 mr-2" />
            {value ? "Changer" : "Télécharger"}
          </Button>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {/* Crop Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recadrer l'image</DialogTitle>
            <DialogDescription>
              Ajustez la position et le zoom de votre image
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cropper */}
            <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  cropShape={shape === "round" ? "round" : "rect"}
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            {/* Zoom Control */}
            <div className="space-y-2">
              <Label>Zoom</Label>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(values) => setZoom(values[0])}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCropCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleCropConfirm}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
