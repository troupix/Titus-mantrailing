import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import { LocationContext, LocationProvider } from "./components/context/Location";
import { getAllTrail } from "./utils/api";
import { Trail } from "./types/trail";
import { AppHeader } from "./components/AppHeader";
import { TrailList } from "./components/TrailList";
import { HomePage } from "./components/HomePage";
import { StatisticsPage } from "./components/StatisticsPage";
import { BadgesPage } from "./components/BadgesPage";
import { TrailForm } from "./components/TrailForm";
import { TrailDetail } from "./components/TrailDetail";
import { EmptyState } from "./components/EmptyState";
import { ManagementPage } from "./components/ManagementPage";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { ProfilePage } from "./components/ProfilePage";

type View = "home" | "list" | "detail" | "form" | "statistics" | "badges" | "management" | "profile";


function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <LocationProvider>
      <MainApp />
    </LocationProvider>
  );
}

function MainApp() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("home");
  const [editingTrail, setEditingTrail] = useState<Trail | undefined>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
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
    targetView: "home" | "list" | "statistics" | "badges" | "management" | "profile",
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
    }else if( targetView === "management"){
      setView("management");
      setShowSidebar(false);
    } else if (targetView === "profile") {
      setView("profile");
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
    if (user) {
      getAllTrail().then((data) => {
        setTrails(data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerGetTrails, user]);

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
        <div className="flex-1">
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
          ) : view === "management" ? (
            <ManagementPage />
          ) : view === "profile" ? (
            <ProfilePage />
          ) : (
            <EmptyState onCreateNew={handleCreateNew} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
