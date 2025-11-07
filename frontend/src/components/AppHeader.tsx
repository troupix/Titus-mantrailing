/**
 * @file AppHeader.tsx
 * @description The main application header component, providing navigation, user menu,
 * and the ProfileSwitcher for trainer users.
 */

import { Button } from "./ui/button";
import {
  Home,
  List,
  BarChart3,
  Award,
  Settings,
  LogOut,
  User,
  Users,
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
import { ProfileSwitcher } from "./ProfileSwitcher";
import { useViewMode } from "../contexts/ViewModeContext";

/**
 * @interface AppHeaderProps
 * @description Defines the props for the AppHeader component.
 * @property {("home" | "list" | "detail" | "form" | "statistics" | "badges" | "management" | "profile")} currentView - The currently active view in the application.
 * @property {(view: "home" | "list" | "statistics" | "badges" | "management" | "profile") => void} onNavigate - Callback function for navigation.
 * @property {number} trailCount - The total number of trails, used for display in the "Mes pistes" button.
 */
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

/**
 * @function AppHeader
 * @description React functional component that renders the application's header.
 * It includes navigation links, a user dropdown menu with profile management options,
 * and a `ProfileSwitcher` for trainer users to toggle between different view modes.
 * @param {AppHeaderProps} props - The component props.
 */
export function AppHeader({
  currentView,
  onNavigate,
  trailCount,
}: AppHeaderProps) {
  const { user, logout } = useAuth();
  const { viewMode, setViewMode } = useViewMode();

  /**
   * @function handleLogout
   * @description Handles the user logout process.
   */
  const handleLogout = () => {
    localStorage.setItem("viewMode", "user");
    logout();
  };

  /**
   * @function getUserInitials
   * @description Generates user initials from the username for display in the avatar fallback.
   * @returns {string} The user's initials.
   */
  const getUserInitials = () => {
    console.log("getUserInitials: user =", user);
    if (!user || !user.username) return "U";
    const nameParts = user.username.split(" ");
    if (nameParts.length === 0) return "U";
    const firstInitial = nameParts[0][0] || "";
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  /**
   * @function getUserFullName
   * @description Constructs the user's full name from firstName and lastName.
   * @param {any} user - The user object.
   * @returns {string} The user's full name or "Utilisateur Inconnu".
   */
  const getUserFullName = (user: any) => {
    if (!user || (!user.firstName && !user.lastName)) return "Utilisateur Inconnu";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim().toUpperCase();
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo & Title Section */}
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

        {/* Navigation Links */}
        <nav className="flex items-center gap-2">
          {viewMode === "user" && <Button
            onClick={() => {
              onNavigate("home");
            }}
            variant={currentView === "home" ? "secondary" : "ghost"}
            className={
              currentView === "home"
                ? "gap-2 bg-white text-blue-700 hover:bg-blue-50"
                : "gap-2 text-white hover:bg-white/10"
            }
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Accueil</span>
          </Button>}

          {viewMode === "trainer" && (
            <Button
              onClick={() => setViewMode("trainer")}
              variant={viewMode === "trainer" ? "secondary" : "ghost"}
              className={
                viewMode === "trainer"
                  ? "gap-2 bg-white text-blue-700 hover:bg-blue-50"
                  : "gap-2 text-white hover:bg-white/10"
              }
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Mes élèves</span>
            </Button>
          )}

          {viewMode === "user" && trailCount > 0 && (
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
            </>
          )}
          {/* User Menu Dropdown */}
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
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{getUserFullName(user!)}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* ProfileSwitcher is only visible for trainer users */}
              {user?.role && user.role.includes("trainer")&& (
                <DropdownMenuItem className="p-0" onSelect={(e) => e.preventDefault()}>
                  <ProfileSwitcher />
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onNavigate("profile")}>
                <User className="mr-2 h-4 w-4" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate("management")}>
                <Settings className="mr-2 h-4 w-4" />
                Gestion (Chiens)
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
        </nav>
      </div>
    </header>
  );
}
