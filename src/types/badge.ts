export type BadgeCategory = "distance" | "count" | "terrain" | "duration" | "streak" | "special";
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: string;
  checkUnlock: (trails: any[]) => boolean;
}

export const BADGES: Badge[] = [
  // Distance badges
  {
    id: "first_steps",
    name: "Premiers Pas",
    description: "Compléter votre première piste",
    icon: "🐾",
    category: "count",
    rarity: "common",
    requirement: "1 piste complétée",
    checkUnlock: (trails) => trails.length >= 1,
  },
  {
    id: "explorer",
    name: "Explorateur",
    description: "Compléter 10 pistes",
    icon: "🗺️",
    category: "count",
    rarity: "common",
    requirement: "10 pistes complétées",
    checkUnlock: (trails) => trails.length >= 10,
  },
  {
    id: "veteran",
    name: "Vétéran",
    description: "Compléter 50 pistes",
    icon: "🎖️",
    category: "count",
    rarity: "rare",
    requirement: "50 pistes complétées",
    checkUnlock: (trails) => trails.length >= 50,
  },
  {
    id: "master",
    name: "Maître Pisteur",
    description: "Compléter 100 pistes",
    icon: "👑",
    category: "count",
    rarity: "epic",
    requirement: "100 pistes complétées",
    checkUnlock: (trails) => trails.length >= 100,
  },
  {
    id: "legend",
    name: "Légende",
    description: "Compléter 250 pistes",
    icon: "⭐",
    category: "count",
    rarity: "legendary",
    requirement: "250 pistes complétées",
    checkUnlock: (trails) => trails.length >= 250,
  },
  
  // Distance badges
  {
    id: "walker",
    name: "Marcheur",
    description: "Parcourir 1 km au total",
    icon: "🚶",
    category: "distance",
    rarity: "common",
    requirement: "1000m parcourus",
    checkUnlock: (trails) => trails.reduce((sum, t) => sum + t.distance, 0) >= 1000,
  },
  {
    id: "hiker",
    name: "Randonneur",
    description: "Parcourir 10 km au total",
    icon: "🥾",
    category: "distance",
    rarity: "common",
    requirement: "10km parcourus",
    checkUnlock: (trails) => trails.reduce((sum, t) => sum + t.distance, 0) >= 10000,
  },
  {
    id: "marathoner",
    name: "Marathonien",
    description: "Parcourir 42 km au total",
    icon: "🏃",
    category: "distance",
    rarity: "rare",
    requirement: "42km parcourus",
    checkUnlock: (trails) => trails.reduce((sum, t) => sum + t.distance, 0) >= 42000,
  },
  {
    id: "ultra_distance",
    name: "Ultra Distance",
    description: "Parcourir 100 km au total",
    icon: "🦅",
    category: "distance",
    rarity: "epic",
    requirement: "100km parcourus",
    checkUnlock: (trails) => trails.reduce((sum, t) => sum + t.distance, 0) >= 100000,
  },
  {
    id: "world_traveler",
    name: "Tour du Monde",
    description: "Parcourir 500 km au total",
    icon: "🌍",
    category: "distance",
    rarity: "legendary",
    requirement: "500km parcourus",
    checkUnlock: (trails) => trails.reduce((sum, t) => sum + t.distance, 0) >= 500000,
  },

  // Mantrailing specific
  {
    id: "nose_work_beginner",
    name: "Flair en Formation",
    description: "Compléter 5 pistes de mantrailing",
    icon: "👃",
    category: "special",
    rarity: "common",
    requirement: "5 pistes de mantrailing",
    checkUnlock: (trails) => trails.filter(t => t.category === "mantrailing").length >= 5,
  },
  {
    id: "tracking_expert",
    name: "Expert en Pistage",
    description: "Compléter 25 pistes de mantrailing",
    icon: "🐕‍🦺",
    category: "special",
    rarity: "rare",
    requirement: "25 pistes de mantrailing",
    checkUnlock: (trails) => trails.filter(t => t.category === "mantrailing").length >= 25,
  },
  {
    id: "search_rescue",
    name: "Sauveteur",
    description: "Compléter 50 pistes de mantrailing",
    icon: "🚨",
    category: "special",
    rarity: "epic",
    requirement: "50 pistes de mantrailing",
    checkUnlock: (trails) => trails.filter(t => t.category === "mantrailing").length >= 50,
  },

  // Hiking specific
  {
    id: "mountain_lover",
    name: "Amoureux de la Montagne",
    description: "Compléter 5 randonnées",
    icon: "⛰️",
    category: "special",
    rarity: "common",
    requirement: "5 randonnées",
    checkUnlock: (trails) => trails.filter(t => t.category === "hiking").length >= 5,
  },
  {
    id: "peak_hunter",
    name: "Chasseur de Sommets",
    description: "Compléter 25 randonnées",
    icon: "🏔️",
    category: "special",
    rarity: "rare",
    requirement: "25 randonnées",
    checkUnlock: (trails) => trails.filter(t => t.category === "hiking").length >= 25,
  },
  {
    id: "alpine_master",
    name: "Maître Alpin",
    description: "Compléter 50 randonnées",
    icon: "🧗",
    category: "special",
    rarity: "epic",
    requirement: "50 randonnées",
    checkUnlock: (trails) => trails.filter(t => t.category === "hiking").length >= 50,
  },

  // Duration badges
  {
    id: "quick_tracker",
    name: "Pisteur Rapide",
    description: "Compléter une piste en moins de 2 minutes",
    icon: "⚡",
    category: "duration",
    rarity: "common",
    requirement: "Piste < 2 min",
    checkUnlock: (trails) => trails.some(t => t.duration < 120),
  },
  {
    id: "endurance",
    name: "Endurance",
    description: "Compléter une piste de plus de 1 heure",
    icon: "💪",
    category: "duration",
    rarity: "rare",
    requirement: "Piste > 1h",
    checkUnlock: (trails) => trails.some(t => t.duration > 3600),
  },
  {
    id: "iron_will",
    name: "Volonté de Fer",
    description: "Compléter une piste de plus de 3 heures",
    icon: "🔥",
    category: "duration",
    rarity: "epic",
    requirement: "Piste > 3h",
    checkUnlock: (trails) => trails.some(t => t.duration > 10800),
  },

  // Streak badges
  {
    id: "consistency",
    name: "Régularité",
    description: "Enregistrer des pistes 7 jours de suite",
    icon: "📅",
    category: "streak",
    rarity: "rare",
    requirement: "7 jours consécutifs",
    checkUnlock: (trails) => {
      if (trails.length < 7) return false;
      const dates = trails.map(t => new Date(t.date).toDateString()).sort();
      let streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
        if (diff === 1) streak++;
        else streak = 1;
        if (streak >= 7) return true;
      }
      return false;
    },
  },
  {
    id: "dedicated",
    name: "Dévoué",
    description: "Enregistrer des pistes 30 jours de suite",
    icon: "🎯",
    category: "streak",
    rarity: "epic",
    requirement: "30 jours consécutifs",
    checkUnlock: (trails) => {
      if (trails.length < 30) return false;
      const dates = trails.map(t => new Date(t.date).toDateString()).sort();
      let streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
        if (diff === 1) streak++;
        else streak = 1;
        if (streak >= 30) return true;
      }
      return false;
    },
  },

  // Special achievements
  {
    id: "long_distance",
    name: "Longue Distance",
    description: "Compléter une piste de plus de 1 km",
    icon: "🎯",
    category: "distance",
    rarity: "common",
    requirement: "Piste > 1km",
    checkUnlock: (trails) => trails.some(t => t.distance > 1000),
  },
  {
    id: "ultra_long",
    name: "Ultra Longue",
    description: "Compléter une piste de plus de 5 km",
    icon: "🏆",
    category: "distance",
    rarity: "rare",
    requirement: "Piste > 5km",
    checkUnlock: (trails) => trails.some(t => t.distance > 5000),
  },
  {
    id: "speed_demon",
    name: "Démon de Vitesse",
    description: "Parcourir 500m en moins de 3 minutes",
    icon: "🔥",
    category: "duration",
    rarity: "rare",
    requirement: "500m < 3min",
    checkUnlock: (trails) => trails.some(t => t.distance >= 500 && t.duration < 180),
  },
  {
    id: "night_owl",
    name: "Oiseau de Nuit",
    description: "Compléter 5 pistes après 20h",
    icon: "🦉",
    category: "special",
    rarity: "rare",
    requirement: "5 pistes de nuit",
    checkUnlock: (trails) => {
      const nightTrails = trails.filter(t => {
        const hour = new Date(t.date).getHours();
        return hour >= 20 || hour < 6;
      });
      return nightTrails.length >= 5;
    },
  },
  {
    id: "early_bird",
    name: "Lève-tôt",
    description: "Compléter 5 pistes avant 7h",
    icon: "🌅",
    category: "special",
    rarity: "rare",
    requirement: "5 pistes matinales",
    checkUnlock: (trails) => {
      const morningTrails = trails.filter(t => {
        const hour = new Date(t.date).getHours();
        return hour >= 5 && hour < 7;
      });
      return morningTrails.length >= 5;
    },
  },
  {
    id: "year_round",
    name: "Toute l'Année",
    description: "Enregistrer au moins une piste chaque mois de l'année",
    icon: "🌈",
    category: "streak",
    rarity: "epic",
    requirement: "12 mois différents",
    checkUnlock: (trails) => {
      const months = new Set(trails.map(t => new Date(t.date).getMonth()));
      return months.size >= 12;
    },
  },
  {
    id: "all_rounder",
    name: "Polyvalent",
    description: "Avoir au moins 10 pistes de mantrailing et 10 randonnées",
    icon: "🌟",
    category: "special",
    rarity: "epic",
    requirement: "10 de chaque catégorie",
    checkUnlock: (trails) => {
      const mantrailing = trails.filter(t => t.category === "mantrailing").length;
      const hiking = trails.filter(t => t.category === "hiking").length;
      return mantrailing >= 10 && hiking >= 10;
    },
  },
  {
    id: "collector",
    name: "Collectionneur",
    description: "Débloquer 10 badges",
    icon: "💎",
    category: "special",
    rarity: "legendary",
    requirement: "10 badges débloqués",
    checkUnlock: (trails) => {
      // This will be calculated differently
      return false;
    },
  },
  
  // Additional terrain/location badges
  {
    id: "urban_tracker",
    name: "Pisteur Urbain",
    description: "Compléter 3 pistes en milieu urbain",
    icon: "🏙️",
    category: "terrain",
    rarity: "common",
    requirement: "3 pistes urbaines",
    checkUnlock: (trails) => {
      const urbanTrails = trails.filter(t => 
        t.trailType?.toLowerCase().includes("urbain") || 
        t.trailType?.toLowerCase().includes("ville") ||
        t.location?.toLowerCase().includes("centre")
      );
      return urbanTrails.length >= 3;
    },
  },
  {
    id: "forest_wanderer",
    name: "Promeneur Forestier",
    description: "Compléter 5 pistes en forêt",
    icon: "🌲",
    category: "terrain",
    rarity: "common",
    requirement: "5 pistes en forêt",
    checkUnlock: (trails) => {
      const forestTrails = trails.filter(t => 
        t.trailType?.toLowerCase().includes("forêt") || 
        t.trailType?.toLowerCase().includes("bois")
      );
      return forestTrails.length >= 5;
    },
  },
  {
    id: "water_lover",
    name: "Amoureux de l'Eau",
    description: "Compléter 3 pistes près d'un point d'eau",
    icon: "💧",
    category: "terrain",
    rarity: "rare",
    requirement: "3 pistes aquatiques",
    checkUnlock: (trails) => {
      const waterTrails = trails.filter(t => 
        t.trailType?.toLowerCase().includes("lac") || 
        t.trailType?.toLowerCase().includes("rivière") ||
        t.trailType?.toLowerCase().includes("eau")
      );
      return waterTrails.length >= 3;
    },
  },
  {
    id: "versatile_terrain",
    name: "Terrain Varié",
    description: "Compléter des pistes sur 5 types de terrain différents",
    icon: "🗺️",
    category: "terrain",
    rarity: "epic",
    requirement: "5 terrains différents",
    checkUnlock: (trails) => {
      const terrains = new Set(trails.map(t => t.trailType?.toLowerCase().split(' ')[0]));
      return terrains.size >= 5;
    },
  },

  // Weather and conditions
  {
    id: "rain_warrior",
    name: "Guerrier de la Pluie",
    description: "Compléter 3 pistes sous la pluie",
    icon: "🌧️",
    category: "special",
    rarity: "rare",
    requirement: "3 pistes pluvieuses",
    checkUnlock: (trails) => {
      const rainyTrails = trails.filter(t => 
        t.notes?.toLowerCase().includes("pluie") || 
        t.notes?.toLowerCase().includes("humide")
      );
      return rainyTrails.length >= 3;
    },
  },
  {
    id: "summer_champion",
    name: "Champion de l'Été",
    description: "Compléter 10 pistes en été (juin-août)",
    icon: "☀️",
    category: "special",
    rarity: "common",
    requirement: "10 pistes estivales",
    checkUnlock: (trails) => {
      const summerTrails = trails.filter(t => {
        const month = new Date(t.date).getMonth();
        return month >= 5 && month <= 7; // June-August
      });
      return summerTrails.length >= 10;
    },
  },
  {
    id: "winter_hero",
    name: "Héros de l'Hiver",
    description: "Compléter 10 pistes en hiver (décembre-février)",
    icon: "❄️",
    category: "special",
    rarity: "rare",
    requirement: "10 pistes hivernales",
    checkUnlock: (trails) => {
      const winterTrails = trails.filter(t => {
        const month = new Date(t.date).getMonth();
        return month === 11 || month <= 1; // Dec-Feb
      });
      return winterTrails.length >= 10;
    },
  },

  // Performance badges
  {
    id: "efficiency_master",
    name: "Maître de l'Efficacité",
    description: "Parcourir 1km en moins de 10 minutes",
    icon: "⚡",
    category: "duration",
    rarity: "epic",
    requirement: "1km < 10min",
    checkUnlock: (trails) => trails.some(t => t.distance >= 1000 && t.duration < 600),
  },
  {
    id: "distance_record",
    name: "Record de Distance",
    description: "Compléter une piste de plus de 10 km",
    icon: "🎯",
    category: "distance",
    rarity: "legendary",
    requirement: "Piste > 10km",
    checkUnlock: (trails) => trails.some(t => t.distance > 10000),
  },
  {
    id: "short_burst",
    name: "Sprint",
    description: "Compléter une piste de moins de 100m",
    icon: "🏃‍♂️",
    category: "distance",
    rarity: "common",
    requirement: "Piste < 100m",
    checkUnlock: (trails) => trails.some(t => t.distance < 100),
  },

  // Social and training
  {
    id: "team_player",
    name: "Esprit d'Équipe",
    description: "Travailler avec 3 maîtres différents",
    icon: "👥",
    category: "special",
    rarity: "rare",
    requirement: "3 maîtres différents",
    checkUnlock: (trails) => {
      const trainers = new Set(trails.map(t => t.trainerName));
      return trainers.size >= 3;
    },
  },
  {
    id: "mentor",
    name: "Mentor",
    description: "Travailler avec 5 conducteurs différents",
    icon: "🎓",
    category: "special",
    rarity: "epic",
    requirement: "5 conducteurs différents",
    checkUnlock: (trails) => {
      const conductors = new Set(trails.map(t => t.conductorName));
      return conductors.size >= 5;
    },
  },

  // Specific mantrailing techniques
  {
    id: "blind_start_expert",
    name: "Expert Départ Aveugle",
    description: "Compléter 10 pistes avec départ à l'aveugle",
    icon: "🙈",
    category: "special",
    rarity: "rare",
    requirement: "10 départs aveugles",
    checkUnlock: (trails) => {
      const blindStarts = trails.filter(t => 
        t.departureType?.toLowerCase().includes("aveugle")
      );
      return blindStarts.length >= 10;
    },
  },
  {
    id: "visual_start_master",
    name: "Maître Départ Visuel",
    description: "Compléter 10 pistes avec départ visuel",
    icon: "👁️",
    category: "special",
    rarity: "common",
    requirement: "10 départs visuels",
    checkUnlock: (trails) => {
      const visualStarts = trails.filter(t => 
        t.departureType?.toLowerCase().includes("visible") ||
        t.departureType?.toLowerCase().includes("visuel")
      );
      return visualStarts.length >= 10;
    },
  },

  // Milestone badges
  {
    id: "century_club",
    name: "Club des Centenaires",
    description: "Parcourir 100km au total",
    icon: "💯",
    category: "distance",
    rarity: "legendary",
    requirement: "100km total",
    checkUnlock: (trails) => trails.reduce((sum, t) => sum + t.distance, 0) >= 100000,
  },
  {
    id: "time_warrior",
    name: "Guerrier du Temps",
    description: "Cumuler 50 heures d'entraînement",
    icon: "⏰",
    category: "duration",
    rarity: "epic",
    requirement: "50h cumulées",
    checkUnlock: (trails) => trails.reduce((sum, t) => sum + t.duration, 0) >= 180000,
  },
  {
    id: "weekend_warrior",
    name: "Guerrier du Week-end",
    description: "Compléter 20 pistes le samedi ou dimanche",
    icon: "🎪",
    category: "special",
    rarity: "rare",
    requirement: "20 pistes en week-end",
    checkUnlock: (trails) => {
      const weekendTrails = trails.filter(t => {
        const day = new Date(t.date).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      });
      return weekendTrails.length >= 20;
    },
  },
];
