import React, { useContext, useEffect } from "react";
import "./App.css";
import { useState } from "react";
import { LocationContext } from "./components/Context/Location";
import { getAllTrail } from "./utils/api";
import { Trail } from "./types/trail";
import BadgesIcon from "./components/BadgesIcon";
import ScoreIcon from "@mui/icons-material/Score";
import { AppHeader } from "./components/AppHeader";
import { TrailList } from "./components/TrailList";
import { HomePage } from "./components/HomePage";
import { StatisticsPage } from "./components/StatisticsPage";
import { BadgesPage } from "./components/BadgesPage";
import { TrailForm } from "./components/TrailForm";
import { TrailDetail } from "./components/TrailDetail";
import { EmptyState } from "./components/EmptyState";
import DogHomePageIcon from "./components/DogHomePageIcon";

type View = "home" | "list" | "detail" | "form" | "statistics" | "badges";

interface category {
  id: string;
  children: any[];
}

function App() {
  const [view, setView] = useState<View>("home");
  const [editingTrail, setEditingTrail] = useState<Trail | undefined>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [, setCategories] = useState<category[]>([]);
  const { trails, setTrails, triggerGetTrails, setTriggerGetTrails } = useContext(LocationContext);
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(
    trails.length > 0 ? trails[0]._id || null : null
  );
  const handleCreateNew = () => {
    setEditingTrail(undefined);
    setView("form");
    setShowSidebar(true);
  };

  const handleEdit = (trail: Trail) => {
    setEditingTrail(trail);
    setView("form");
  };

  const handleViewTrails = () => {
    setView("detail");
    setShowSidebar(true);
    if (trails.length > 0 && !selectedTrailId) {
      setSelectedTrailId(trails[0]._id || null);
    }
  };

  const handleNavigate = (
    targetView: "home" | "list" | "statistics" | "badges"
  ) => {
    if (targetView === "home") {
      setView("home");
      setShowSidebar(false);
    } else if (targetView === "list") {
      setView("detail");
      setShowSidebar(true);
      if (trails.length > 0 && !selectedTrailId) {
        setSelectedTrailId(trails[0]._id || null);
      }
    } else if (targetView === "statistics") {
      setView("statistics");
      setShowSidebar(false);
    } else if (targetView === "badges") {
      setView("badges");
      setShowSidebar(false);
    }
  };

  const handleSaveSuccess = () => {
    setTriggerGetTrails(!triggerGetTrails); // Refetch trails
    setView("detail");
    setEditingTrail(undefined);
  };

  const selectedTrail = trails.find(t => (t.id || t._id) === selectedTrailId);

  const handleCancel = () => {
    if (trails.length > 0) {
      setView("detail");
    } else {
      setView("home");
      setShowSidebar(false);
    }
    setEditingTrail(undefined);
  };

  const handleSelectTrail = (trailId: string) => {
    setSelectedTrailId(trailId);
    setView("detail");
    setShowSidebar(true);
  };

  useEffect(() => {
    getAllTrail().then((data) => {
      setTrails(data);
      const newCategories = [
        {
          id: "Statistiques",
          children: [
            {
              id: "Pistes",
              icon: <ScoreIcon sx={{ fill: "#FFFFFF" }} />,
              trail_id: "Stats",
            },
            { id: "Badges", icon: <BadgesIcon />, trail_id: "Badges" },
          ],
        },
        { id: "Piste", children: [] },
      ];
      newCategories[1].children = data
        .sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        .map((trail: any) => {
          return {
            id: new Date(trail.date).toLocaleDateString(),
            icon: <DogHomePageIcon />,
            trail_id: trail._id,
          };
        });
      setCategories(newCategories);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerGetTrails]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header Navigation */}
      <AppHeader
        currentView={view}
        onNavigate={handleNavigate}
        trailCount={trails.length}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - only show when viewing/editing trails */}
        {showSidebar && (
          <div
            className={`flex-shrink-0 border-r border-border shadow-lg transition-all duration-300 ${
              isSidebarCollapsed ? "w-16" : "w-80"
            }`}
          >
            <TrailList
              trails={trails}
              selectedTrailId={selectedTrailId}
              onSelectTrail={handleSelectTrail}
              onCreateNew={handleCreateNew}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() =>
                setIsSidebarCollapsed(!isSidebarCollapsed)
              }
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {view === "home" ? (
            <HomePage
              trails={trails}
              onViewTrails={handleViewTrails}
              onCreateNew={handleCreateNew}
              onViewStatistics={() => handleNavigate("statistics")}
              onViewBadges={() => handleNavigate("badges")}
            />
          ) : view === "statistics" ? (
            <StatisticsPage trails={trails} />
          ) : view === "badges" ? (
            <BadgesPage trails={trails} />
          ) : view === "form" ? (
            <TrailForm
              trail={editingTrail}
              onSaveSuccess={handleSaveSuccess}
              onCancel={handleCancel}
            />
          ) : view === "detail" && selectedTrail ? (
            <TrailDetail trail={selectedTrail} onEdit={handleEdit} onDeleteSuccess={handleSaveSuccess} />
          ) : (
            <EmptyState onCreateNew={handleCreateNew} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
