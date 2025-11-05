import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, GraduationCap, User } from "lucide-react";
import { checkEmailRoles } from "../utils/api";
import { Switch } from "./ui/switch";
import DogHomePageIcon from "./DogHomePageIcon";
import HikeIcon from "./HikeIcon";

export function LoginPage() {
  const { login, register, trainers } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [availableRoles, setAvailableRoles] = useState<("handler" | "trainer")[]>([]);
  const [selectedLoginRole, setSelectedLoginRole] = useState<"handler" | "trainer">("handler");

  // Register form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"handler" | "trainer">("handler");
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>("");

  // Check available roles when email changes
  useEffect(() => {
    const checkRoles = async () => {
      if (loginEmail && loginEmail.includes("@")) {
        try {
          const roles = await checkEmailRoles(loginEmail);
          setAvailableRoles(roles as ("handler" | "trainer")[]);
          if (roles.length > 0 && !roles.includes(selectedLoginRole)) {
            setSelectedLoginRole(roles[0] as "handler" | "trainer");
          }
        } catch (err) {
          setAvailableRoles([]);
        }
      } else {
        setAvailableRoles([]);
      }
    };

    const debounce = setTimeout(() => {
      checkRoles();
    }, 300);

    return () => clearTimeout(debounce);
  }, [loginEmail, selectedLoginRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credentials = {
        email: loginEmail,
        password: loginPassword,
        role: availableRoles.length > 1 ? selectedLoginRole : undefined,
      };
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!registerEmail || !registerPassword || !firstName || !lastName) {
      setError("Tous les champs sont requis");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (registerPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      await register({
        email: registerEmail,
        password: registerPassword,
        username: `${firstName} ${lastName}`,
        firstName,
        lastName,
        role,
        trainerId: role === "handler" ? selectedTrainerId : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center gap-3 mb-4">
            <DogHomePageIcon className="w-10 h-10 text-blue-600" />
            <HikeIcon className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle>Carnet de Mantrailing</CardTitle>
          <CardDescription>
            Connectez-vous pour gérer vos pistes et randonnées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            {/* <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList> */}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                {availableRoles.length > 1 && (
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {selectedLoginRole === "handler" ? (
                            <User className="h-5 w-5 text-blue-600" />
                          ) : (
                            <GraduationCap className="h-5 w-5 text-purple-600" />
                          )}
                          <div>
                            <Label className="text-sm">
                              {selectedLoginRole === "handler" 
                                ? "Me connecter en tant que Handler" 
                                : "Me connecter en tant qu'Éducateur"}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Vous avez plusieurs comptes avec cet email
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={selectedLoginRole === "trainer"}
                          onCheckedChange={(checked) => 
                            setSelectedLoginRole(checked ? "trainer" : "handler")
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>

              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Nom"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={role} onValueChange={(value: "handler" | "trainer") => setRole(value)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="handler">Handler (Conducteur)</SelectItem>
                      <SelectItem value="trainer">Éducateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role === "handler" && trainers.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="trainer">Éducateur (optionnel)</Label>
                    <Select value={selectedTrainerId} onValueChange={setSelectedTrainerId}>
                      <SelectTrigger id="trainer">
                        <SelectValue placeholder="Sélectionner un éducateur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun</SelectItem>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id}>
                            {trainer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
