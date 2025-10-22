import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Trail, isMantrailingTrail, isHikingTrail } from "../types/trail";
import { 
  TrendingUp, 
  Award, 
  Calendar,
  Zap,
  Timer,
  Ruler,
  Target,
  BarChart3
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import TrailIcon from "./TrailIcon";
import HikeIcon from "./HikeIcon";
import { Button } from "./ui/button";

interface StatisticsPageProps {
  trails: Trail[];
}

export function StatisticsPage({ trails }: StatisticsPageProps) {
  // Calculate global statistics
  const totalTrails = trails.length;
  const totalDistance = trails.reduce((sum, t) => sum + (t.distance ?? 0), 0);
  const totalDuration = trails.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  
  // Calculate category statistics
  const mantrailingTrails = trails.filter(t => t.category === "mantrailing");
  const hikingTrails = trails.filter(t => t.category === "hiking");
  
  const mantrailingDistance = mantrailingTrails.reduce((sum, t) => sum + (t.distance ?? 0), 0);
  const hikingDistance = hikingTrails.reduce((sum, t) => sum + (t.distance ?? 0), 0);
  
  const mantrailingDuration = mantrailingTrails.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const hikingDuration = hikingTrails.reduce((sum, t) => sum + (t.duration ?? 0), 0);

  // --- Records Calculations ---

  // Helper to find min/max in a trail array for a given property
  const findRecord = <T extends Trail>(arr: T[], prop: 'distance' | 'duration', type: 'max' | 'min'): T | undefined => {
    const filteredArr = arr.filter(t => (t[prop] ?? 0) > 0);
    if (filteredArr.length === 0) return undefined;
    return filteredArr.reduce((record, current) => {
      const recordVal = record[prop] ?? 0;
      const currentVal = current[prop] ?? 0;
      if (type === 'max') return currentVal > recordVal ? current : record;
      return currentVal < recordVal ? current : record; // This will return a T
    });
  };

  // Distance Records
  const longestMantrailingTrail = findRecord(mantrailingTrails, 'distance', 'max');
  const shortestMantrailingTrail = findRecord(mantrailingTrails, 'distance', 'min');
  const longestHikingTrail = findRecord(hikingTrails, 'distance', 'max');
  const shortestHikingTrail = findRecord(hikingTrails, 'distance', 'min');

  // Duration Records
  const longestMantrailingDuration = findRecord(mantrailingTrails, 'duration', 'max');
  const shortestMantrailingDuration = findRecord(mantrailingTrails, 'duration', 'min');
  const longestHikingDuration = findRecord(hikingTrails, 'duration', 'max');
  const shortestHikingDuration = findRecord(hikingTrails, 'duration', 'min');

  // --- Speed Calculations ---

  // Helper to calculate speed for a set of trails
  const calculateSpeedStats = <T extends Trail>(arr: T[]) => {
    const trailsWithSpeed = arr.map(t => {
      const distance = t.distance ?? 0;
      const duration = t.duration ?? 0;
      return {
          ...t,
          speed: duration > 0 ? distance / duration : 0
      };
    });

    const validSpeeds = trailsWithSpeed.filter(t => t.speed > 0);
    if (validSpeeds.length === 0) {
      return { maxSpeed: 0, minSpeed: 0, avgSpeed: 0, fastestTrail: undefined, slowestTrail: undefined };
    }

    const maxSpeed = Math.max(...validSpeeds.map(t => t.speed));
    const minSpeed = Math.min(...validSpeeds.map(t => t.speed));
    
    const totalDistance = arr.reduce((sum, t) => sum + (t.distance ?? 0), 0);
    const totalDuration = arr.reduce((sum, t) => sum + (t.duration ?? 0), 0);
    const avgSpeed = totalDuration > 0 ? totalDistance / totalDuration : 0;

    const fastestTrail = trailsWithSpeed.find(t => t.speed === maxSpeed);
    const slowestTrail = trailsWithSpeed.find(t => t.speed === minSpeed);

    return { maxSpeed, minSpeed, avgSpeed, fastestTrail, slowestTrail };
  };

  const mantrailingSpeedStats = calculateSpeedStats(mantrailingTrails);
  const hikingSpeedStats = calculateSpeedStats(hikingTrails);

  // Monthly breakdown
  const monthlyData = trails.reduce((acc, trail) => {
    const month = new Date(trail.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, mantrailing: 0, hiking: 0, total: 0 };
    }
    acc[month][trail.category]++;
    acc[month].total++;
    return acc;
  }, {} as Record<string, { month: string; mantrailing: number; hiking: number; total: number }>);

  const monthlyChartData = Object.values(monthlyData).reverse();

  const [distanceFilter, setDistanceFilter] = useState<"all" | "mantrailing" | "hiking">("all");

  // Distance breakdown over time
  const distanceOverTimeData = trails
    .filter(trail => {
      if ((trail.distance ?? 0) <= 0) return false;
      if (distanceFilter === 'all') return true;
      return trail.category === distanceFilter;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(trail => ({
      date: new Date(trail.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      distance: trail.distance,
      mantrailingDistance: isMantrailingTrail(trail) && (distanceFilter === 'all' || distanceFilter === 'mantrailing') ? trail.distance : undefined,
      hikingDistance: isHikingTrail(trail) && (distanceFilter === 'all' || distanceFilter === 'hiking') ? trail.distance : undefined,
    }));

  // Category pie chart data
  const categoryData = [
    { name: "Mantrailing", value: mantrailingTrails.length, color: "#3b82f6" },
    { name: "Randonnée", value: hikingTrails.length, color: "#22c55e" }
  ];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl text-blue-900">Statistiques</h1>
            <p className="text-muted-foreground">Analyse de vos performances et progrès</p>
          </div>
        </div>

        {/* Global Statistics */}
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Statistiques Globales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg">
                <div className="flex justify-center mb-2">
                  <Award className="h-8 w-8 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">Nombre de pistes</p>
                <p className="text-4xl mb-1">{totalTrails}</p>
                <div className="flex justify-center gap-2 text-xs opacity-90">
                  <span className="flex items-center gap-1">
                    <TrailIcon className="h-3 w-3" /> {mantrailingTrails.length}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <HikeIcon className="h-3 w-3" /> {hikingTrails.length}
                  </span>
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg">
                <div className="flex justify-center mb-2">
                  <Ruler className="h-8 w-8 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">Distance totale</p>
                <p className="text-4xl mb-1">{(totalDistance / 1000).toFixed(2)}</p>
                <p className="text-sm opacity-90">km</p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg">
                <div className="flex justify-center mb-2">
                  <Timer className="h-8 w-8 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">Durée totale</p>
                <p className="text-2xl mb-1">{formatDuration(totalDuration)}</p>
                <p className="text-xs opacity-90">d'activité</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card className="shadow-lg border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardTitle className="flex items-center gap-2">
                Répartition par activité
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrailIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Mantrailing</span>
                  </div>
                  <p className="text-2xl text-blue-900">{mantrailingTrails.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(mantrailingDistance / 1000).toFixed(2)} km
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <HikeIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Randonnée</span>
                  </div>
                  <p className="text-2xl text-green-900">{hikingTrails.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(hikingDistance / 1000).toFixed(2)} km
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card className="shadow-lg border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Activité mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="mantrailing" name="Mantrailing" fill="#3b82f6" />
                    <Bar dataKey="hiking" name="Randonnée" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records */}
        <Card className="shadow-lg border-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-600" />
              Records personnels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="distance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="distance">Distance</TabsTrigger>
                <TabsTrigger value="duration">Durée</TabsTrigger>
                <TabsTrigger value="speed">Vitesse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="distance" className="space-y-4 mt-4">
                <div className="space-y-6">
                  {/* Mantrailing Distance */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-800"><TrailIcon className="h-5 w-5" />Mantrailing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-5 w-5 text-blue-600" /><h3 className="text-blue-900">Plus longue piste</h3></div>
                        <p className="text-3xl text-blue-900 mb-2">{(longestMantrailingTrail?.distance ?? 0)} m</p>                        
                        {longestMantrailingTrail && isMantrailingTrail(longestMantrailingTrail) && <><p className="text-sm text-muted-foreground mb-1">{`${longestMantrailingTrail.dogName} - ${longestMantrailingTrail.location || ''}`}</p><Badge className="bg-blue-600">{new Date(longestMantrailingTrail.date).toLocaleDateString('fr-FR')}</Badge></>}
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-3"><Ruler className="h-5 w-5 text-blue-600" /><h3 className="text-blue-900">Plus courte piste</h3></div>
                        <p className="text-3xl text-blue-900 mb-2">{(shortestMantrailingTrail?.distance ?? 0)} m</p>                        
                        {shortestMantrailingTrail && isMantrailingTrail(shortestMantrailingTrail) && <><p className="text-sm text-muted-foreground mb-1">{`${shortestMantrailingTrail.dogName} - ${shortestMantrailingTrail.location || ''}`}</p><Badge className="bg-blue-600">{new Date(shortestMantrailingTrail.date).toLocaleDateString('fr-FR')}</Badge></>}
                      </div>
                    </div>
                  </div>
                  {/* Hiking Distance */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-800"><HikeIcon className="h-5 w-5" />Randonnée</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-5 w-5 text-green-600" /><h3 className="text-green-900">Plus longue rando</h3></div>
                        <p className="text-3xl text-green-900 mb-2">{(longestHikingTrail?.distance ?? 0)} m</p>
                        {longestHikingTrail && isHikingTrail(longestHikingTrail) && <><p className="text-sm text-muted-foreground mb-1">{longestHikingTrail.name}</p><Badge className="bg-green-600">{new Date(longestHikingTrail.date).toLocaleDateString('fr-FR')}</Badge></>}
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-3"><Ruler className="h-5 w-5 text-green-600" /><h3 className="text-green-900">Plus courte rando</h3></div>
                        <p className="text-3xl text-green-900 mb-2">{(shortestHikingTrail?.distance ?? 0)} m</p>                        
                        {shortestHikingTrail && isHikingTrail(shortestHikingTrail) && <><p className="text-sm text-muted-foreground mb-1">{shortestHikingTrail.name}</p><Badge className="bg-green-600">{new Date(shortestHikingTrail.date).toLocaleDateString('fr-FR')}</Badge></>}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="duration" className="space-y-4 mt-4">
                <div className="space-y-6">
                  {/* Mantrailing Duration */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-800"><TrailIcon className="h-5 w-5" />Mantrailing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-3"><Timer className="h-5 w-5 text-purple-600" /><h3 className="text-purple-900">Durée la plus longue</h3></div>
                        {longestMantrailingDuration && isMantrailingTrail(longestMantrailingDuration) ? (<>
                          <p className="text-2xl text-purple-900 mb-2">{formatDuration(longestMantrailingDuration.duration ?? 0)}</p>
                          <p className="text-sm text-muted-foreground mb-1">{`${longestMantrailingDuration.dogName} - ${longestMantrailingDuration.location || ''}`}</p>
                          <Badge className="bg-purple-600">{new Date(longestMantrailingDuration.date).toLocaleDateString('fr-FR')}</Badge>
                        </>) : <p className="text-2xl text-purple-900 mb-2">N/A</p>}
                      </div>
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg border-2 border-pink-200">
                        <div className="flex items-center gap-2 mb-3"><Zap className="h-5 w-5 text-pink-600" /><h3 className="text-pink-900">Durée la plus courte</h3></div>
                        {shortestMantrailingDuration && isMantrailingTrail(shortestMantrailingDuration) ? (<>
                          <p className="text-2xl text-pink-900 mb-2">{formatDuration(shortestMantrailingDuration.duration ?? 0)}</p>
                          <p className="text-sm text-muted-foreground mb-1">{`${shortestMantrailingDuration.dogName} - ${shortestMantrailingDuration.location || ''}`}</p>
                          <Badge className="bg-pink-600">{new Date(shortestMantrailingDuration.date).toLocaleDateString('fr-FR')}</Badge>
                        </>) : <p className="text-2xl text-pink-900 mb-2">N/A</p>}
                      </div>
                    </div>
                  </div>
                  {/* Hiking Duration */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-800"><HikeIcon className="h-5 w-5" />Randonnée</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-3"><Timer className="h-5 w-5 text-purple-600" /><h3 className="text-purple-900">Durée la plus longue</h3></div>
                        {longestHikingDuration && isHikingTrail(longestHikingDuration) ? (<>
                          <p className="text-2xl text-purple-900 mb-2">{formatDuration(longestHikingDuration.duration ?? 0)}</p>
                          <p className="text-sm text-muted-foreground mb-1">{longestHikingDuration.name}</p>
                          <Badge className="bg-purple-600">{new Date(longestHikingDuration.date).toLocaleDateString('fr-FR')}</Badge>
                        </>) : <p className="text-2xl text-purple-900 mb-2">N/A</p>}
                      </div>
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg border-2 border-pink-200">
                        <div className="flex items-center gap-2 mb-3"><Zap className="h-5 w-5 text-pink-600" /><h3 className="text-pink-900">Durée la plus courte</h3></div>
                        {shortestHikingDuration && isHikingTrail(shortestHikingDuration) ? (<>
                          <p className="text-2xl text-pink-900 mb-2">{formatDuration(shortestHikingDuration.duration ?? 0)}</p>
                          <p className="text-sm text-muted-foreground mb-1">{shortestHikingDuration.name}</p>
                          <Badge className="bg-pink-600">{new Date(shortestHikingDuration.date).toLocaleDateString('fr-FR')}</Badge>
                        </>) : <p className="text-2xl text-pink-900 mb-2">N/A</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="speed" className="space-y-4 mt-4">
                <div className="space-y-6">
                  {/* Mantrailing Speed */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-800"><TrailIcon className="h-5 w-5" />Mantrailing</h3>
                    {mantrailingDuration > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg border-2 border-orange-200">
                          <div className="flex items-center gap-2 mb-3"><Zap className="h-5 w-5 text-orange-600" /><h3 className="text-orange-900">Vitesse max</h3></div>
                          <p className="text-3xl text-orange-900 mb-2">{mantrailingSpeedStats.maxSpeed.toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground mb-2">m/s</p>
                          {mantrailingSpeedStats.fastestTrail && <Badge className="bg-orange-600">{new Date(mantrailingSpeedStats.fastestTrail.date).toLocaleDateString('fr-FR')}</Badge>}
                        </div>
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-lg border-2 border-cyan-200">
                          <div className="flex items-center gap-2 mb-3"><Target className="h-5 w-5 text-cyan-600" /><h3 className="text-cyan-900">Vitesse min</h3></div>
                          <p className="text-3xl text-cyan-900 mb-2">{mantrailingSpeedStats.minSpeed.toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground mb-2">m/s</p>
                          {mantrailingSpeedStats.slowestTrail && <Badge className="bg-cyan-600">{new Date(mantrailingSpeedStats.slowestTrail.date).toLocaleDateString('fr-FR')}</Badge>}
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg border-2 border-indigo-200">
                          <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-5 w-5 text-indigo-600" /><h3 className="text-indigo-900">Vitesse moyenne</h3></div>
                          <p className="text-3xl text-indigo-900 mb-2">{mantrailingSpeedStats.avgSpeed.toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground">m/s</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <p className="text-muted-foreground">Données non disponibles pour calculer la vitesse.</p>
                      </div>
                    )}
                  </div>

                  {/* Hiking Speed */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-800"><HikeIcon className="h-5 w-5" />Randonnée</h3>
                    {hikingDuration > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg border-2 border-orange-200">
                          <div className="flex items-center gap-2 mb-3"><Zap className="h-5 w-5 text-orange-600" /><h3 className="text-orange-900">Vitesse max</h3></div>
                          <p className="text-3xl text-orange-900 mb-2">{hikingSpeedStats.maxSpeed.toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground mb-2">m/s</p>
                          {hikingSpeedStats.fastestTrail && <Badge className="bg-orange-600">{new Date(hikingSpeedStats.fastestTrail.date).toLocaleDateString('fr-FR')}</Badge>}
                        </div>
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-lg border-2 border-cyan-200">
                          <div className="flex items-center gap-2 mb-3"><Target className="h-5 w-5 text-cyan-600" /><h3 className="text-cyan-900">Vitesse min</h3></div>
                          <p className="text-3xl text-cyan-900 mb-2">{hikingSpeedStats.minSpeed.toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground mb-2">m/s</p>
                          {hikingSpeedStats.slowestTrail && <Badge className="bg-cyan-600">{new Date(hikingSpeedStats.slowestTrail.date).toLocaleDateString('fr-FR')}</Badge>}
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg border-2 border-indigo-200">
                          <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-5 w-5 text-indigo-600" /><h3 className="text-indigo-900">Vitesse moyenne</h3></div>
                          <p className="text-3xl text-indigo-900 mb-2">{hikingSpeedStats.avgSpeed.toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground">m/s</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <p className="text-muted-foreground">Données non disponibles pour calculer la vitesse.</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Progress Over Time */}
        <Card className="shadow-lg border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Évolution des distances
              </CardTitle>
              <div className="flex items-center gap-1 bg-white/50 p-1 rounded-lg">
                <Button size="sm" variant={distanceFilter === 'all' ? 'secondary' : 'ghost'} onClick={() => setDistanceFilter('all')} className="h-7">
                  Tout
                </Button>
                <Button size="sm" variant={distanceFilter === 'mantrailing' ? 'secondary' : 'ghost'} onClick={() => setDistanceFilter('mantrailing')} className="h-7">
                  <TrailIcon className="h-4 w-4 mr-1" />
                  Mantrailing
                </Button>
                <Button size="sm" variant={distanceFilter === 'hiking' ? 'secondary' : 'ghost'} onClick={() => setDistanceFilter('hiking')} className="h-7">
                  <HikeIcon className="h-4 w-4 mr-1" />
                  Randonnée
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={distanceOverTimeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Distance (m)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {(distanceFilter === 'all' || distanceFilter === 'mantrailing') && <Line 
                    type="monotone" 
                    dataKey="mantrailingDistance"
                    name="Mantrailing"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />}
                  {(distanceFilter === 'all' || distanceFilter === 'hiking') && <Line
                    type="monotone" 
                    dataKey="hikingDistance"
                    name="Randonnée"
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />}
                </LineChart>
              </ResponsiveContainer>
                    </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}