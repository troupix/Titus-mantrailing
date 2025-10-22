import { Button } from "./ui/button";
import { Home, List, BarChart3, Award } from "lucide-react";
import TitusLogo from "./TitusLogo";

interface AppHeaderProps {
  currentView: "home" | "list" | "detail" | "form" | "statistics" | "badges";
  onNavigate: (view: "home" | "list" | "statistics" | "badges") => void;
  trailCount: number;
}

export function AppHeader({ currentView, onNavigate, trailCount }: AppHeaderProps) {
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
            <p className="text-xs text-blue-100 opacity-90">Mantrailing & Randonnée</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Button
            onClick={() => onNavigate("home")}
            variant={currentView === "home" ? "secondary" : "ghost"}
            className={currentView === "home" 
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
                variant={currentView === "list" || currentView === "detail" || currentView === "form" ? "secondary" : "ghost"}
                className={currentView === "list" || currentView === "detail" || currentView === "form"
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
                className={currentView === "statistics"
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
                className={currentView === "badges"
                  ? "gap-2 bg-white text-blue-700 hover:bg-blue-50" 
                  : "gap-2 text-white hover:bg-white/10"
                }
              >
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Badges</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
