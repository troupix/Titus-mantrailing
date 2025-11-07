# Plan de Refonte - Profil Éducateur avec Basculement

## 📋 Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs ayant le rôle "trainer" de basculer entre deux modes de visualisation :
1. **Mode Utilisateur Classique** : Vue standard avec leurs propres chiens et pistes
2. **Mode Éducateur** : Vue centrée sur les chiens étudiants avec organisation par catégories d'activités

---

## 🎯 Objectifs

### Objectif Principal
Permettre aux éducateurs de gérer efficacement leur double casquette :
- Utilisateur avec ses propres chiens personnels
- Éducateur supervisant les chiens de leurs élèves

### Objectifs Secondaires
- Améliorer la navigation et l'UX pour les trainers
- Organiser les pistes par type d'activité (mantrailing, hiking, canicross)
- Faciliter le suivi de progression des chiens étudiants
- Maintenir une interface cohérente et intuitive

---

## 🏗️ Architecture Proposée

### 1. Nouveau Composant : ProfileSwitcher

**Fichier** : `/components/ProfileSwitcher.tsx`

**Responsabilités** :
- Toggle switch pour basculer entre mode "Utilisateur" et "Éducateur"
- Stockage de la préférence en local storage
- Context ou state management pour partager le mode actif
- Visuel clair avec icônes différenciées

**Props** :
```typescript
interface ProfileSwitcherProps {
  currentMode: "user" | "trainer";
  onModeChange: (mode: "user" | "trainer") => void;
}
```

**Position** :
- Dans l'AppHeader (coin supérieur droit), dans le menu de profile
- Uniquement visible pour les utilisateurs role="trainer"

---

### 2. Refonte : TrainerDashboard

**Fichier** : `/components/TrainerDashboard.tsx` (remplace EducatorView.tsx)

**Structure** :
```typescript
interface TrainerDashboardProps {
  trails: Trail[];
}

type ViewMode = "overview" | "dog-detail" | "activity-detail";

interface TrainerDashboardState {
  viewMode: ViewMode;
  selectedDogId: string | null;
  selectedActivityType: ActivityType | null;
  selectedTrailId: string | null;
}
```

**Fonctionnalités** :

#### Vue Overview
- **Header** : Statistiques globales (chiens, élèves, pistes totales)
- **Cards de Chiens** : Grille avec tous les chiens étudiants
  - Photo du chien
  - Nom, race, âge
  - Propriétaires (handlers)
  - Statistiques rapides par type d'activité
  - Badges de progression
  - Indicateur d'activité récente

#### Vue Dog Detail
- **Header** : Informations complètes du chien
- **Tabs par Type d'Activité** :
  - Mantrailing
  - Canicross (future)
- **Statistiques par Activité** :
  - Nombre de pistes
- **Liste des Pistes** : Filtrées par type d'activité
  - Tri chronologique
  - Cards cliquables pour détails

#### Vue Activity Detail (Trail)
- Réutilise le composant `TrailDetail`
- Mode lecture seule sauf pour trainerComment
- Bouton retour vers dog detail

---

### 3. Amélioration : ProfilePage

**Fichier** : `/components/ProfilePage.tsx`

**Nouvelles Sections** (pour trainers) :

```typescript
// Section supplémentaire si role === "trainer"
{
  titre: "Profil Éducateur",
  contenu: {
    - Nom du trainer
    - Spécialités
    - ID trainer (pour partage)
    - Nombre de chiens en formation
    - Nombre d'élèves
    - Lien rapide vers TrainerDashboard
  }
}
```

---

### 4. Context de Navigation : ViewModeContext

**Fichier** : `/contexts/ViewModeContext.tsx`

**Responsabilités** :
- Gérer le mode actif (user/trainer)
- Persister le choix en localStorage
- Fournir le state à toute l'application

```typescript
interface ViewModeContextType {
  viewMode: "user" | "trainer";
  setViewMode: (mode: "user" | "trainer") => void;
  isTrainerMode: boolean;
  isUserMode: boolean;
}

// Provider à wrapper autour de l'app
export function ViewModeProvider({ children }: { children: ReactNode })
```

---

### 5. Modification : App.tsx

**Changements** :
- Import et wrap du `ViewModeProvider`
- Logique conditionnelle pour afficher TrainerDashboard vs pages normales
- Navigation adaptée selon le mode

---

## 🎨 Design et UX

### Codes Couleurs par Activité

Réutiliser `ACTIVITY_CONFIGS` de `/types/activityConfig.ts` :

- **Mantrailing** : Bleu (#3B82F6)
- **Randonnée** : Vert (#10B981)
- **Canicross** : Orange (#F59E0B)

### Composants UI

#### ProfileSwitcher
```
┌────────────────────────────┐
│  👤 Utilisateur  │  🎓 Éducateur  │  ← Toggle Switch
└────────────────────────────┘
```

#### TrainerDashboard - Overview
```
┌──────────────────────────────────────┐
│  🎓 Tableau de Bord Éducateur       │
│  Suivez la progression de vos chiens │
├──────────────────────────────────────┤
│  📊 Stats Globales (Cards)          │
│  [Chiens] [Élèves] [Pistes] [Km]   │
├──────────────────────────────────────┤
│  🐕 Grille de Chiens                │
│  ┌────────┐  ┌────────┐  ┌────────┐│
│  │  Titus │  │  Luna  │  │  Max   ││
│  │  🔵2🟢3 │  │  🔵5🟠1 │  │  🔵1   ││
│  │        │  │       │  │ ││
│  └────────┘  └────────┘  └────────┘│
└──────────────────────────────────────┘
```

#### TrainerDashboard - Dog Detail
```
┌──────────────────────────────────────┐
│  ← Retour    🐕 Titus               │
│  Berger Allemand • 3 ans            │
│  Handler: Max Dupont                │
├──────────────────────────────────────┤
│  Tabs: [Mantrailing] [Rando] [Cani]│
├──────────────────────────────────────┤
│  📊 Stats Mantrailing               │
│  [12 pistes] [45 km] [8h total]    │
├──────────────────────────────────────┤
│  📋 Liste des Pistes                │
│  • 15/01/2024 - Oyonnax (450m)     │
│  • 10/01/2024 - Bellegarde (320m)  │
│  • ...                              │
└──────────────────────────────────────┘
```

---

## 📝 Plan d'Implémentation

### Phase 1 : Infrastructure (Foundation)

**Tâches** :
1. ✅ Créer `/contexts/ViewModeContext.tsx`
   - State management pour viewMode
   - Persistance localStorage
   - Hooks useViewMode()

2. ✅ Créer `/components/ProfileSwitcher.tsx`
   - Toggle UI avec icônes
   - Connection au ViewModeContext
   - Responsive design

3. ✅ Mettre à jour `/App.tsx`
   - Wrapper ViewModeProvider
   - Logique conditionnelle de rendu

**Temps estimé** : 2-3 heures

---

### Phase 2 : TrainerDashboard - Structure de Base

**Tâches** :
1. ✅ Adapter `/components/TrainerDashboard.tsx` pour notre application
   - Structure de base avec routing interne
   - State management (viewMode, selections)
   - Header avec gradient

2. ✅ Implémenter Vue Overview
   - Stats globales (cards)
   - Fonction pour calculer stats par chien
   - Grille de chiens basique

3. ✅ Créer composant `/components/TrainerDogCard.tsx`
   - Card réutilisable pour chaque chien
   - Affichage stats par activité
   - Badges et indicateurs visuels

**Temps estimé** : 4-5 heures

---

### Phase 3 : TrainerDashboard - Vue Dog Detail

**Tâches** :
1. ✅ Implémenter Vue Dog Detail
   - Header avec infos complètes du chien
   - Tabs pour filtrer par type d'activité

2. ✅ Créer `/components/ActivityStatsCard.tsx`
   - Stats spécifiques à chaque type d'activité
   - Utilisation de activityConfig pour couleurs

3. ✅ Affichage liste pistes filtrées
   - Tri par date
   - Cards cliquables
   - Gestion navigation vers détail

4. ✅ Intégrer TrailDetail
   - Mode lecture seule
   - Boutons de navigation

**Temps estimé** : 5-6 heures

---

### Phase 4 : Amélioration ProfilePage

**Tâches** :
1. ✅ Ajouter section "Profil Éducateur"
   - Conditionnel si role === "trainer"
   - Affichage infos trainer
   - Lien vers TrainerDashboard

2. ✅ Améliorer affichage des IDs
   - Section copyable pour ID trainer
   - Instructions pour partage

**Temps estimé** : 2 heures

---

### Phase 5 : Intégration et Polish

**Tâches** :
1. ✅ Mettre à jour AppHeader
   - Intégrer ProfileSwitcher
   - Logique d'affichage conditionnel

2. ✅ Tests et ajustements
   - Tester tous les parcours utilisateur
   - Vérifier persistance du mode
   - Responsive design

3. ✅ Documentation
   - Mise à jour README
   - Commentaires dans le code
   - Guide utilisateur

**Temps estimé** : 3-4 heures

---

## 🧪 Scénarios de Test

### Scénario 1 : Basculement de Mode
1. User avec role="trainer" se connecte
2. Voit le ProfileSwitcher dans le header
3. Clique pour passer en mode "Éducateur"
4. La vue change vers TrainerDashboard
5. Rafraîchit la page → le mode est conservé
6. Rebascule en mode "Utilisateur" → retour à la vue normale

### Scénario 2 : Navigation Éducateur
1. En mode Éducateur
2. Voit la liste de tous les chiens étudiants
3. Clique sur un chien (ex: Titus)
4. Arrive sur la vue détaillée avec tabs
5. Clique sur tab "Randonnée"
6. Voit les stats et pistes de randonnée
7. Clique sur une piste
8. Voit le détail en lecture seule
9. Retour arrière → revient aux pistes
10. Retour arrière → revient à la liste de chiens

### Scénario 3 : Filtrage par Activité
1. Chien avec pistes mixtes (2 mantrailing, 3 randonnées, 1 canicross)
2. Tab Mantrailing → affiche 2 pistes
3. Tab Randonnée → affiche 3 pistes
4. Tab Canicross → affiche 1 piste
5. Stats cohérentes pour chaque tab

### Scénario 4 : User Non-Trainer
1. User avec role="handler" se connecte
2. Ne voit PAS le ProfileSwitcher
3. Accès uniquement à la vue utilisateur classique

---
## 🔄 Migration et Rétrocompatibilité

### Routes et Navigation
- Ajouter logique conditionnelle basée sur viewMode
- Enlever dans le header les options utilisateur classic
- Ajouter en mode trainer un bouton Dashboard dans le header
- Pas de breaking changes pour les utilisateurs existants

---

## 📈 Évolutions Futures

### Court Terme (après implémentation)
- [ ] Filtres avancés dans TrainerDashboard
- [ ] Export des données par chien
- [ ] Graphiques de progression

### Moyen Terme
- [ ] Mode comparaison entre chiens
- [ ] Objectifs et planification de formation
- [ ] Notifications de progression

### Long Terme
- [ ] Mode multi-trainer (co-formation)
- [ ] Messagerie intégrée avec les handlers
- [ ] Système de badges/certifications

---

## 🎨 Ressources Design

### Icônes (lucide-react)
- **Utilisateur** : `User`
- **Éducateur** : `GraduationCap`
- **Mantrailing** : `Dog`
- **Randonnée** : `Mountain`
- **Canicross** : `Zap`
- **Statistiques** : `BarChart3`, `TrendingUp`
- **Navigation** : `ArrowLeft`, `ChevronRight`

### Composants ShadCN Utilisés
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Card`, `CardHeader`, `CardContent`
- `Badge`
- `Button`
- `Avatar`, `AvatarFallback`
- `Progress`
- `ScrollArea`

---

## ✅ Checklist Finale

### Avant Implémentation
- [x] Plan validé et documenté
- [ ] Design mockups créés (optionnel)
- [ ] User stories rédigées
- [ ] Priorisation des phases

### Pendant Implémentation
- [ ] Tests unitaires pour ViewModeContext
- [ ] Tests d'intégration pour navigation
- [ ] Vérification responsive
- [ ] Code review

### Après Implémentation
- [ ] Documentation utilisateur mise à jour
- [ ] Guide migration pour users existants
- [ ] Monitoring des performances
- [ ] Collecte de feedback

---

## 📞 Points de Discussion



1.  **Gestion des Permissions** : 

    - Les trainers doivent-ils pouvoir éditer les pistes en mode lecture seule ? **Décision: Juste le trainerComment**



2.  **Statistiques** :

    - Quelles métriques sont prioritaires pour les éducateurs ? **Décision: le nombre de piste, un tableau des types de départ (aveugle/double aveugle/visuel) et le délai de départ.**

    - Besoin de comparaisons entre chiens ?



3.  **Navigation** :

    - Le ProfileSwitcher doit-il être dans le header ou dans le menu ? **Décision: dans le menu**

    - Faut-il un indicateur visuel permanent du mode actif ? **Décision: non**

---

**Date de création** : 6 novembre 2025  
**Version** : 1.0  
**Statut** : 📝 Plan détaillé - En attente de validation
