/**
 * @file ProfileSwitcher.tsx
 * @description A component that allows users with the 'trainer' role to switch between
 * a classic user view and a dedicated trainer view. The selected mode is managed
 * via the `ViewModeContext` and persisted in `localStorage`.
 */

import React from 'react';
import { useViewMode } from '../contexts/ViewModeContext';
import { Button } from '../components/ui/button';
import { User, GraduationCap } from 'lucide-react';

/**
 * @interface ProfileSwitcherProps
 * @description Defines the props for the ProfileSwitcher component.
 * Currently, no specific props are needed as it primarily interacts with the context.
 */
interface ProfileSwitcherProps {
  // No specific props needed as it uses context
}

/**
 * @function ProfileSwitcher
 * @description React functional component that renders a toggle button to switch
 * between "user" and "trainer" view modes. It uses the `useViewMode` hook
 * to access and update the global view mode state.
 * @param {ProfileSwitcherProps} props - The component props.
 */
export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = () => {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="flex w-full" role="group">
      <Button
        variant={viewMode === 'user' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('user')}
        className={`flex-1 justify-center rounded-r-none transition-colors duration-300
          ${viewMode === 'user' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-blue-600 hover:bg-blue-50/20'}
        `}
      >
        <User className="mr-2 h-4 w-4" />
        Utilisateur
      </Button>
      <Button
        variant={viewMode === 'trainer' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('trainer')}
        className={`flex-1 justify-center rounded-l-none transition-colors duration-300
          ${viewMode === 'trainer' ? 'bg-green-600 text-white hover:bg-green-700' : 'text-green-600 hover:bg-green-50/20'}
        `}
      >
        <GraduationCap className="mr-2 h-4 w-4" />
        Éducateur
      </Button>
    </div>
  );
};
