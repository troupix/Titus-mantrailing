import { Button } from "./ui/button";
import {
  Home,
  List,
  BarChart3,
  Award,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import TitusLogo from "./TitusLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "../contexts/AuthContext";

interface AppHeaderProps {
  currentView:
    | "home"
    | "list"
    | "detail"
    | "form"
    | "statistics"
    | "badges"
    | "management"
    | "profile";
  onNavigate: (
    view: "home" | "list" | "statistics" | "badges" | "management" | "profile"
  ) => void;
  trailCount: number;
}

export function AppHeader({
  currentView,
  onNavigate,
  trailCount,
}: AppHeaderProps) {
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = () => {
    console.log("getUserInitials: user =", user);
    if (!user || !user.username) return "U";
    const nameParts = user.username.split(" ");
    if (nameParts.length === 0) return "U";
    const firstInitial = nameParts[0][0] || "";
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const getUserFullName = (user: any) => {
    if (!user || (!user.firstName && !user.lastName)) return "Utilisateur Inconnu";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim().toUpperCase();
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg shadow-md">
            <TitusLogo size={40} />
          </div>
          <div>
            <h1 className="text-xl">Carnet de Titus</h1>
            <p className="text-xs text-blue-100 opacity-90">
              Mantrailing & Randonnée
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Button
            onClick={() => onNavigate("home")}
            variant={currentView === "home" ? "secondary" : "ghost"}
            className={
              currentView === "home"
                ? "gap-2 bg-white text-blue-700 hover:bg-blue-50"
                : "gap-2 text-white hover:bg-white/10"
            }
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Accueil</span>
          </Button>

          {trailCount > 0 && (
            <>
              <Button
                onClick={() => onNavigate("list")}
                variant={
                  currentView === "list" ||
                  currentView === "detail" ||
                  currentView === "form"
                    ? "secondary"
                    : "ghost"
                }
                className={
                  currentView === "list" ||
                  currentView === "detail" ||
                  currentView === "form"
                    ? "gap-2 bg-white text-blue-700 hover:bg-blue-50"
                    : "gap-2 text-white hover:bg-white/10"
                }
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Mes pistes</span>
                <span className="ml-1 text-xs opacity-70">({trailCount})</span>
              </Button>

              <Button
                onClick={() => onNavigate("statistics")}
                variant={currentView === "statistics" ? "secondary" : "ghost"}
                className={
                  currentView === "statistics"
                    ? "gap-2 bg-white text-blue-700 hover:bg-blue-50"
                    : "gap-2 text-white hover:bg-white/10"
                }
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Statistiques</span>
              </Button>

              <Button
                onClick={() => onNavigate("badges")}
                variant={currentView === "badges" ? "secondary" : "ghost"}
                className={
                  currentView === "badges"
                    ? "gap-2 bg-white text-blue-700 hover:bg-blue-50"
                    : "gap-2 text-white hover:bg-white/10"
                }
              >
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Badges</span>
              </Button>
              {/* Management Section */}
              <Button
                onClick={() => onNavigate("management")}
                variant={currentView === "management" ? "secondary" : "ghost"}
                className={
                  currentView === "management"
                    ? "gap-2 bg-white text-blue-700 hover:bg-blue-50"
                    : "gap-2 text-white hover:bg-white/10"
                }
              >
                {" "}
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Gestion</span>
              </Button>
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 text-white hover:bg-white/10"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-white text-blue-700">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{getUserFullName(user!)}</span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("management")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Gestion (Chiens, Handlers, Éducateurs)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
