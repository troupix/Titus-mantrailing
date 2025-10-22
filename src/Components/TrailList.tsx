import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import {
  Plus,
  Dog,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mountain,
} from "lucide-react";
import { Trail, isMantrailingTrail } from "../types/trail";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import DogHomePageIcon from "./DogHomePageIcon";
import TrailIcon from "./TrailIcon";

function getTrailIcon(category: Trail["category"]) {
  return category === "mantrailing" ? TrailIcon : Mountain;
}

interface TrailListProps {
  trails: Trail[];
  selectedTrailId: string | null;
  onSelectTrail: (trailId: string) => void;
  onCreateNew: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function TrailList({
  trails,
  selectedTrailId,
  onSelectTrail,
  onCreateNew,
  isCollapsed,
  onToggleCollapse,
}: TrailListProps) {
  const isAllowedToCreate =
    localStorage.getItem("isAllowedToCreate") === "true";

  const groupedTrails = trails.reduce((acc, trail) => {
    const month = new Date(trail.date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(trail);
    return acc;
  }, {} as Record<string, Trail[]>);

  // Track which months are expanded (all expanded by default)
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(
    Object.keys(groupedTrails).reduce(
      (acc, month) => ({ ...acc, [month]: true }),
      {}
    )
  );

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  const mantrailingCount = trails.filter(
    (t) => t.category === "mantrailing"
  ).length;
  const hikingCount = trails.filter((t) => t.category === "hiking").length;

  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white">
        {/* Fixed Header - Collapsed */}
        <div className="flex-shrink-0 p-2 flex flex-col items-center gap-3 border-b border-white/10">
          <div style={{ height: "40px" }}>
            {isAllowedToCreate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onCreateNew}
                      size="icon"
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Créer une nouvelle piste</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <Button
            onClick={onToggleCollapse}
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Trail Icons */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-2 py-2 space-y-2">
            <TooltipProvider>
              {trails.map((trail) => {
                const Icon = getTrailIcon(trail.category);
                return (
                  <Tooltip key={trail.id || trail._id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          onSelectTrail(trail.id || trail._id || "")
                        }
                        className={`w-full p-2.5 rounded-lg transition-colors flex items-center justify-center border-l-2 ${
                          trail.category === "mantrailing"
                            ? selectedTrailId === (trail.id || trail._id)
                              ? "bg-blue-500/30 backdrop-blur-sm border-blue-300"
                              : "hover:bg-white/10 border-blue-400/50"
                            : selectedTrailId === (trail.id || trail._id)
                            ? "bg-green-500/30 backdrop-blur-sm border-green-300"
                            : "hover:bg-white/10 border-green-400/50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="flex items-center gap-2">
                        <p className="text-xs">
                          {isMantrailingTrail(trail)
                            ? trail.dogName
                            : trail.name}
                        </p>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            trail.category === "mantrailing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {trail.category === "mantrailing"
                            ? "Mantrailing"
                            : "Rando"}
                        </span>
                      </div>
                      <p className="text-xs opacity-75 mt-0.5">
                        {new Date(trail.date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          {isAllowedToCreate && (
            <Button
              onClick={onCreateNew}
              className="flex-1 bg-white text-blue-600 hover:bg-blue-50 shadow-md gap-2"
            >
              <Plus className="h-4 w-4" />
              Créer une nouvelle piste
            </Button>
          )}
          <div className="ml-auto">
            <Button
              onClick={onToggleCollapse}
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10 flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Statistics - Always visible */}
        <div className="mt-4">
          <h3 className="mb-2 text-blue-100 text-sm">Statistiques</h3>
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 space-y-2 border border-white/20">
            <div className="flex items-center gap-2 text-sm">
              <TrailIcon className="h-4 w-4" />
              <span>{mantrailingCount} Mantrailing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mountain className="h-4 w-4" />
              <span>{hikingCount} Randonnées</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Trail List */}
      <ScrollArea className="flex-1 overflow-auto">
        <div className="px-4 py-4 space-y-4">
          {Object.entries(groupedTrails).map(([month, monthTrails]) => (
            <Collapsible
              key={month}
              open={expandedMonths[month]}
              onOpenChange={() => toggleMonth(month)}
            >
              <div>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2 mb-3 w-full text-left text-blue-100 hover:text-white transition-colors group">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedMonths[month] ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                    <h3 className="text-sm">{month}</h3>
                    <span className="ml-auto bg-white/20 px-2 py-0.5 rounded text-xs">
                      {monthTrails.length}
                    </span>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pb-2">
                  {monthTrails.map((trail) => {
                    const Icon = getTrailIcon(trail.category);
                    const isMantrailing = trail.category === "mantrailing";
                    const isSelected =
                      selectedTrailId === (trail.id || trail._id);
                    return (
                      <button
                        key={trail.id || trail._id}
                        onClick={() =>
                          onSelectTrail(trail.id || trail._id || "")
                        }
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-2 border-l-4 ${
                          isSelected
                            ? isMantrailing
                              ? "bg-white text-blue-700 shadow-md border-blue-500"
                              : "bg-white text-green-700 shadow-md border-green-500"
                            : isMantrailing
                            ? "hover:bg-white/10 border-blue-400/50"
                            : "hover:bg-white/10 border-green-400/50"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 flex-shrink-0 ${
                            isSelected
                              ? isMantrailing
                                ? "text-blue-600"
                                : "text-green-600"
                              : ""
                          }`}
                        />{" "}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-sm">
                              {isMantrailingTrail(trail)
                                ? trail.dogName
                                : trail.name}
                            </div>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                                isSelected
                                  ? isMantrailing
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                  : isMantrailing
                                  ? "bg-blue-400/30 text-blue-100"
                                  : "bg-green-400/30 text-green-100"
                              }`}
                            >
                              {isMantrailing ? "Mantrailing" : "Rando"}
                            </span>
                          </div>
                          <div className="text-xs opacity-75 mt-0.5 truncate">
                            {trail.location ||
                              new Date(trail.date).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            • {Math.round(trail.distance || 0)}m
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
