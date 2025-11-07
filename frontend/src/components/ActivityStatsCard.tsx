import React, { ElementType } from 'react';
import { Trail, MantrailingTrail, isMantrailingTrail } from '../types/trail';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ActivityType, getActivityConfig } from '../types/activityConfig';

// Generic ActivityStatsCard (from design folder)
interface GenericActivityStatsCardProps {
  activityType?: ActivityType;
  icon: ElementType;
  label: string;
  value: string | number;
  description?: string;
  className?: string;
}

export function ActivityStatsCard({
  activityType,
  icon: Icon,
  label,
  value,
  description,
  className = "",
}: GenericActivityStatsCardProps) {
  const config = activityType ? getActivityConfig(activityType) : null;
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardDescription className={`flex items-center gap-2 ${config ? `text-${config.color}-600` : ""}`}>
          <Icon
            className={`h-4 w-4 `}
            style={config ? { color: `var(--${config.color}-600)` } : undefined}
          />
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="text-3xl font-semibold"
          style={config ? { color: `var(--${config.color}-700)` } : undefined}
        >
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ActivityTypeStatsDisplay (the original component, renamed)
/**
 * @interface ActivityTypeStatsDisplayProps
 * @description Defines the props for the ActivityTypeStatsDisplay component.
 * @property {("mantrailing" | "hiking")} activityType - The type of activity for which to display statistics.
 * @property {Trail[]} trails - An array of trails filtered by the activity type.
 */
interface ActivityTypeStatsDisplayProps {
  activityType: ActivityType;
  trails: Trail[];
}

/**
 * @function ActivityTypeStatsDisplay
 * @description React functional component that displays key statistics for a given activity type.
 * It calculates total trails, total distance, and total duration from the provided trails array.
 * For Mantrailing, it also calculates start type distribution and average delay.
 * @param {ActivityTypeStatsDisplayProps} props - The component props.
 */
export const ActivityTypeStatsDisplay: React.FC<ActivityTypeStatsDisplayProps> = ({ activityType, trails }) => {
  const totalTrails = trails.length;
  // Calculate total distance in kilometers, rounded to two decimal places.
  // Calculate total duration in seconds.

  // Mantrailing specific stats
  const mantrailingTrails = trails.filter(isMantrailingTrail) as MantrailingTrail[];
  const startTypeCounts = mantrailingTrails.reduce((acc, trail) => {
    const type = trail.startType || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxDelay = mantrailingTrails.length > 0 ? mantrailingTrails.sort((a, b) => (b?.delay || 0) - (a?.delay || 0))[0].delay : 0;
  /**
   * @function formatDuration
   * @description Formats a duration in seconds into a human-readable string (e.g., "1h 30min").
   * @param {number} seconds - The duration in seconds.
   * @returns {string} The formatted duration string.
   */
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) {
      return `${minutes}min`;
    }
    return `${hours}h ${minutes}min`;
  };

  const config = getActivityConfig(activityType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`text-xl`} style={{ color: `var(--${config.color}-600)` }}>
          Statistiques {activityType === "mantrailing" ? "Mantrailing" : "Randonnée"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <ActivityStatsCard
          activityType={activityType}
          icon={config.icon}
          label="Total Pistes"
          value={totalTrails}
        />
        {activityType === "mantrailing" && mantrailingTrails.length > 0 && (
          <Card className="col-span-2 border-2 border-blue-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className={`flex items-center gap-2 ${config ? `text-${config.color}-600` : ""}`}>Détails Mantrailing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-700">Types de Départ:</h4>
                  {Object.entries(startTypeCounts).map(([type, count]) => (
                    <p key={type} className="text-sm text-muted-foreground">
                      {type.charAt(0).toUpperCase() + type.slice(1)}: {count}
                    </p>
                  ))}
                </div>
                {maxDelay && maxDelay > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700">Délai Maximum de Départ:</h4>
                    <p className="text-sm text-muted-foreground">{formatDuration(maxDelay)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
