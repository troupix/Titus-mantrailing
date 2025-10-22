import { Trail } from "../types/trail";
import { BADGES, Badge, BadgeRarity } from "../types/badge";
import { Card, CardContent } from "./ui/card";
import { Badge as BadgeUI } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Trophy, Lock, Award, Sparkles } from "lucide-react";

interface BadgesPageProps {
  trails: Trail[];
}

export function BadgesPage({ trails }: BadgesPageProps) {
  // Calculate unlocked badges
  const unlockedBadges = BADGES.filter(badge => {
    if (badge.id === "collector") {
      // Special handling for collector badge
      const otherUnlocked = BADGES.filter(b => b.id !== "collector" && b.checkUnlock(trails));
      return otherUnlocked.length >= 10;
    }
    return badge.checkUnlock(trails);
  });

  const lockedBadges = BADGES.filter(badge => !unlockedBadges.includes(badge));

  // If no trails yet, show a message
  if (trails.length === 0) {
    return (
      <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center border-2 border-blue-200">
            <Award className="h-24 w-24 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl text-blue-900 mb-4">Badges</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Vous n'avez pas encore de pistes enregistrées.
            </p>
            <p className="text-muted-foreground">
              Commencez à enregistrer vos aventures pour débloquer des badges ! 🎖️
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {BADGES.slice(0, 4).map(badge => (
                <div key={badge.id} className="opacity-40">
                  <div className="text-5xl mb-2">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRarityColor = (rarity: BadgeRarity) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-600";
      case "rare":
        return "from-blue-400 to-blue-600";
      case "epic":
        return "from-purple-400 to-purple-600";
      case "legendary":
        return "from-yellow-400 to-orange-500";
    }
  };

  const getRarityBorderColor = (rarity: BadgeRarity) => {
    switch (rarity) {
      case "common":
        return "border-gray-400";
      case "rare":
        return "border-blue-400";
      case "epic":
        return "border-purple-400";
      case "legendary":
        return "border-yellow-400";
    }
  };

  const getRarityLabel = (rarity: BadgeRarity) => {
    switch (rarity) {
      case "common":
        return "Commun";
      case "rare":
        return "Rare";
      case "epic":
        return "Épique";
      case "legendary":
        return "Légendaire";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "distance":
        return "Distance";
      case "count":
        return "Nombre";
      case "terrain":
        return "Terrain";
      case "duration":
        return "Durée";
      case "streak":
        return "Série";
      case "special":
        return "Spécial";
      default:
        return category;
    }
  };

  const BadgeCard = ({ badge, unlocked }: { badge: Badge; unlocked: boolean }) => (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
      unlocked ? "shadow-lg hover:shadow-xl" : "opacity-60 hover:opacity-70"
    }`}>
      {/* Rarity gradient border effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(badge.rarity)} opacity-20`} />
      
      <CardContent className="p-6 relative">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Badge icon */}
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center text-4xl border-4 ${
            unlocked ? getRarityBorderColor(badge.rarity) : "border-gray-300"
          } bg-white shadow-lg`}>
            {unlocked ? (
              badge.icon
            ) : (
              <Lock className="h-8 w-8 text-gray-400" />
            )}
            {unlocked && badge.rarity === "legendary" && (
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
              </div>
            )}
          </div>

          {/* Badge name */}
          <div>
            <h3 className={`${unlocked ? "text-gray-900" : "text-gray-500"}`}>
              {badge.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {badge.description}
            </p>
          </div>

          {/* Rarity and category */}
          <div className="flex gap-2 flex-wrap justify-center">
            <BadgeUI 
              variant="outline" 
              className={`text-xs ${
                badge.rarity === "legendary" ? "bg-gradient-to-r from-yellow-100 to-orange-100" :
                badge.rarity === "epic" ? "bg-purple-100" :
                badge.rarity === "rare" ? "bg-blue-100" :
                "bg-gray-100"
              }`}
            >
              {getRarityLabel(badge.rarity)}
            </BadgeUI>
            <BadgeUI variant="secondary" className="text-xs">
              {getCategoryLabel(badge.category)}
            </BadgeUI>
          </div>

          {/* Requirement */}
          <p className="text-xs text-muted-foreground bg-gray-50 px-3 py-1 rounded-full">
            {badge.requirement}
          </p>

          {/* Status */}
          {unlocked && (
            <div className="absolute top-2 right-2">
              <div className="bg-green-500 rounded-full p-1">
                <Trophy className="h-3 w-3 text-white" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const categories = Array.from(new Set(BADGES.map(b => b.category)));

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-blue-900">Badges</h1>
              <p className="text-muted-foreground">
                Débloquez des badges en complétant des défis
              </p>
            </div>
          </div>

          {/* Progress stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-900">Badges débloqués</span>
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl text-green-900">
                {unlockedBadges.length} / {BADGES.length}
              </p>
              <Progress 
                value={(unlockedBadges.length / BADGES.length) * 100} 
                className="mt-2 h-2"
              />
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-900">Taux de complétion</span>
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl text-blue-900">
                {Math.round((unlockedBadges.length / BADGES.length) * 100)}%
              </p>
              <Progress 
                value={(unlockedBadges.length / BADGES.length) * 100} 
                className="mt-2 h-2"
              />
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-900">Badges légendaires</span>
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl text-purple-900">
                {unlockedBadges.filter(b => b.rarity === "legendary").length} / {BADGES.filter(b => b.rarity === "legendary").length}
              </p>
              <Progress 
                value={(unlockedBadges.filter(b => b.rarity === "legendary").length / BADGES.filter(b => b.rarity === "legendary").length) * 100} 
                className="mt-2 h-2"
              />
            </div>
          </div>
        </div>

        {/* Badges tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white shadow-md">
            <TabsTrigger value="all">
              Tous ({BADGES.length})
            </TabsTrigger>
            <TabsTrigger value="unlocked">
              Débloqués ({unlockedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Verrouillés ({lockedBadges.length})
            </TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {BADGES.map(badge => (
                <BadgeCard 
                  key={badge.id} 
                  badge={badge} 
                  unlocked={unlockedBadges.includes(badge)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unlocked" className="space-y-4">
            {unlockedBadges.length === 0 ? (
              <Card className="p-12 text-center">
                <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Vous n'avez pas encore débloqué de badges
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complétez des pistes pour débloquer vos premiers badges !
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {unlockedBadges.map(badge => (
                  <BadgeCard 
                    key={badge.id} 
                    badge={badge} 
                    unlocked={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="locked" className="space-y-4">
            {lockedBadges.length === 0 ? (
              <Card className="p-12 text-center">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <p className="text-xl text-gray-900 mb-2">
                  🎉 Félicitations ! 🎉
                </p>
                <p className="text-muted-foreground">
                  Vous avez débloqué tous les badges !
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {lockedBadges.map(badge => (
                  <BadgeCard 
                    key={badge.id} 
                    badge={badge} 
                    unlocked={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {BADGES.filter(b => b.category === cat).map(badge => (
                  <BadgeCard 
                    key={badge.id} 
                    badge={badge} 
                    unlocked={unlockedBadges.includes(badge)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
