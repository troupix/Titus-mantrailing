import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Trail, isMantrailingTrail, isHikingTrail } from "../types/trail";
import { Dog, Mountain, MapPin, Calendar, Award, TrendingUp, Clock, Ruler, BarChart3 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import DogHomePageIcon from "./DogHomePageIcon";
import TrailIcon from "./TrailIcon";


interface HomePageProps {
  trails: Trail[];
  onViewTrails: () => void;
  onCreateNew: () => void;
  onViewStatistics?: () => void;
  onViewBadges?: () => void;
}

export function HomePage({ trails, onViewTrails, onCreateNew, onViewStatistics, onViewBadges }: HomePageProps) {
  // Calculate statistics
  const mantrailingCount = trails.filter(t => t.category === "mantrailing").length;
  const hikingCount = trails.filter(t => t.category === "hiking").length;
  const totalDistance = trails.reduce((sum, t) => sum + (t.distance || 0), 0);
  const totalDuration = trails.reduce((sum, t) => sum + (t.duration || 0), 0);
  
  // Get recent trails
  const recentTrails = [...trails]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Calculate achievements
  const achievements = [
    { id: 1, name: "Première piste", description: "Complétez votre première piste", earned: trails.length >= 1 },
    { id: 2, name: "Explorateur", description: "Complétez 5 pistes", earned: trails.length >= 5 },
    { id: 3, name: "Marathonien", description: "Parcourez 5 km au total", earned: totalDistance >= 5000 },
    { id: 4, name: "Maître pisteur", description: "Complétez 10 pistes de mantrailing", earned: mantrailingCount >= 10 },
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Dog Profile Section */}
        <Card className="border-2 border-blue-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-100 to-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-blue-900">
                <DogHomePageIcon className="h-6 w-6" />
                Titus
              </CardTitle>
            </CardHeader>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                  <ImageWithFallback
                  
                    src="/Titus-mantrailing/Photos Titus retouchées -1.jpg?w=600&h=450&fit=crop"
                    alt="Titus - Épagneul Breton"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground italic text-center">
                  Crédit photo: Claudia
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl mb-2 text-blue-900">À propos de Titus</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Titus est notre épagneul breton né le <strong>02/05/2021</strong>. 
                    Il adore travailler avec son nez et nous accompagner dans nos 
                    aventures. Inscrit au Mantrailing avec <a href="https://www.lyonk9.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LyonK9</a>, il progresse 
                    constamment et nous impressionne à chaque sortie !
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-900 hover:bg-blue-200">
                    <DogHomePageIcon className="h-3 w-3 mr-1" />
                    Épagneul Breton
                  </Badge>
                  <Badge className="bg-green-100 text-green-900 hover:bg-green-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date().getFullYear() - 2021} ans
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-900 hover:bg-purple-200">
                    <Award className="h-3 w-3 mr-1" />
                    LyonK9
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={onViewStatistics}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrailIcon className="h-8 w-8 opacity-80" />
                <div>
                  <p className="text-sm opacity-90">Mantrailing</p>
                  <p className="text-3xl">{mantrailingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={onViewStatistics}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Mountain className="h-8 w-8 opacity-80" />
                <div>
                  <p className="text-sm opacity-90">Randonnées</p>
                  <p className="text-3xl">{hikingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={onViewStatistics}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Ruler className="h-8 w-8 opacity-80" />
                <div>
                  <p className="text-sm opacity-90">Distance totale</p>
                  <p className="text-3xl">{(totalDistance / 1000).toFixed(1)}</p>
                  <p className="text-xs opacity-80">km</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={onViewBadges}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 opacity-80" />
                <div>
                  <p className="text-sm opacity-90">Badges</p>
                  <p className="text-3xl">{earnedAchievements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* View Statistics Button */}
        {onViewStatistics && trails.length > 0 && (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-indigo-900">Découvrez vos statistiques détaillées</h3>
                  <p className="text-sm text-muted-foreground">
                    Graphiques, records, tendances et bien plus encore
                  </p>
                </div>
              </div>
              <Button
                onClick={onViewStatistics}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Voir les statistiques
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* About Mantrailing */}
          <Card className="shadow-lg border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <TrailIcon className="h-5 w-5" />
                Mantrailing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Le Mantrailing est une discipline canine qui consiste à retrouver une 
                personne disparue en suivant sa trace olfactive. Titus adore ça et nous 
                aussi ! C'est une activité stimulante qui renforce notre complicité et 
                développe ses capacités naturelles de pistage.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={onCreateNew}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  <TrailIcon className="h-4 w-4" />
                  Nouvelle piste
                </Button>
                <Button 
                  onClick={onViewTrails}
                  variant="outline"
                  className="gap-2"
                >
                  Voir les pistes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About Hiking */}
          <Card className="shadow-lg border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Mountain className="h-5 w-5" />
                Randonnée
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Les randonnées sont nos moments de détente et d'exploration ensemble. 
                Que ce soit en forêt, en montagne ou autour d'un lac, chaque sortie est 
                une nouvelle aventure. Titus découvre de nouveaux environnements et 
                profite pleinement de la nature.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={onCreateNew}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <Mountain className="h-4 w-4" />
                  Nouvelle randonnée
                </Button>
                <Button 
                  onClick={onViewTrails}
                  variant="outline"
                  className="gap-2"
                >
                  Voir les sorties
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trails */}
        {recentTrails.length > 0 && (
          <Card className="shadow-lg border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Dernières activités
                </CardTitle>
                <Button variant="ghost" onClick={onViewTrails}>
                  Tout voir
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentTrails.map((trail) => {
                  const Icon = trail.category === "mantrailing" ? TrailIcon : Mountain;
                  return (
                    <div
                      key={trail.id || trail._id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-shadow"
                    >
                      <div className={`p-3 rounded-full ${
                        trail.category === "mantrailing" 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate">
                          {isMantrailingTrail(trail) 
                            ? `${trail.dogName} - ${trail.location || new Date(trail.date).toLocaleDateString('fr-FR')}`
                            : trail.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(trail.date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            {trail.distance}m
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Card className="shadow-lg border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Award className="h-5 w-5" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                    achievement.earned
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-sm'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    achievement.earned
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={achievement.earned ? 'text-yellow-900' : 'text-gray-500'}>
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <Badge className="bg-yellow-500 text-white">
                      Obtenu
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
