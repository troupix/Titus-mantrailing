import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { User, Mail, CheckCircle2, AlertCircle, Copy, GraduationCap } from "lucide-react";
import { useViewMode } from "../contexts/ViewModeContext";

export function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { setViewMode } = useViewMode();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.username.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.username.split(" ")[1] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return null;
  }


  const handleSave = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await updateUserProfile({
        username: `${firstName} ${lastName}`,
        email,
      });
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user.username.split(" ")[0]);
    setLastName(user.username.split(" ")[1]);
    setEmail(user.email);
    setEditing(false);
    setError("");
  };

  const getUserFullName = (user: any) => {
    if (!user || (!user.firstName && !user.lastName)) return "Utilisateur Inconnu";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim().toUpperCase();
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optionally, show a toast notification
  };

  return (
    <div className="h-full overflow-auto p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles
          </p>
        </div>

        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Profil mis à jour avec succès</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Vos informations de compte
                </CardDescription>
              </div>
              
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    <User className="w-4 h-4 inline mr-2" />
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    <User className="w-4 h-4 inline mr-2" />
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                />
              </div>

              
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              {editing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={loading}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>
                  Modifier
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {user.role.includes("trainer") && (
          <Card>
            <CardHeader>
              <CardTitle>Profil Éducateur</CardTitle>
              <CardDescription>
                Informations spécifiques à votre rôle d'éducateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nom du Trainer</span>
                <span className="font-semibold">{getUserFullName(user)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spécialités</span>
                <span>Mantrailing, Randonnée (à définir)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">ID Trainer</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{user._id}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(user._id)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Chiens en formation</span>
                <span>X chiens (à calculer)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Élèves</span>
                <span>Y élèves (à calculer)</span>
              </div>
              <div className="pt-4 border-t mt-4">
                <Button className="w-full" onClick={() => setViewMode("trainer")}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Accéder au Tableau de Bord Éducateur
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
            <CardDescription>
              Détails techniques de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ID utilisateur</span>
              <span className="font-mono">{user._id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Membre depuis</span>
              <span>{user.createdAt && new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
