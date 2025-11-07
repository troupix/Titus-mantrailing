import TrailIcon from "../components/TrailIcon";
import { ElementType } from "react";
import HikeIcon from "../components/HikeIcon";
import CanicrossIcon from "../components/CanicrossIcon";

export type ActivityType = "mantrailing" | "hiking" | "canicross"; // Example activity types

interface ActivityConfig {
  name: string;
  color: string; // Tailwind color class base, e.g., "blue"
  icon: ElementType;
  iconName: string; // Name of the icon for mapping
}

export const ACTIVITY_CONFIGS: Record<ActivityType, ActivityConfig> = {
  mantrailing: {
    name: "Mantrailing",
    color: "blue",
    icon: TrailIcon,
    iconName: "Trail",
  },
  hiking: {
    name: "Randonnée",
    color: "green",
    icon: HikeIcon,
    iconName: "Mountain",
  },
  canicross: {
    name: "Canicross",
    color: "orange",
    icon: CanicrossIcon,
    iconName: "Canicross",
  },
};

export function getActivityConfig(type: ActivityType): ActivityConfig {
  return ACTIVITY_CONFIGS[type];
}
