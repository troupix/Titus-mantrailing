/**
 * @file ActivityDetailView.tsx
 * @description Displays the detailed information of a specific trail in a read-only mode
 * within the Trainer Dashboard. It utilizes the existing `TrailDetail` component.
 */

import React from 'react';
import { Trail } from '../types/trail';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { TrailDetail } from './TrailDetail';

/**
 * @interface ActivityDetailViewProps
 * @description Defines the props for the ActivityDetailView component.
 * @property {Trail} trail - The trail object whose details are to be displayed.
 * @property {() => void} onBack - Callback function to navigate back to the dog detail view.
 */
interface ActivityDetailViewProps {
  trail: Trail;
  onBack: () => void;
}

/**
 * @function ActivityDetailView
 * @description React functional component that renders the detailed view of a single activity (trail).
 * It wraps the `TrailDetail` component, ensuring it's displayed in a read-only context
 * for trainers and provides a back navigation option.
 * @param {ActivityDetailViewProps} props - The component props.
 */
export const ActivityDetailView: React.FC<ActivityDetailViewProps> = ({ trail, onBack }) => {
  // Dummy functions for onEdit and onDeleteSuccess to make TrailDetail read-only in this view.
  // Editing and deletion are not intended functionalities from the trainer's activity detail view.
  const handleEdit = () => {
    console.log("Editing is not allowed in this view.");
  };

  const handleDeleteSuccess = () => {
    console.log("Deletion is not allowed in this view.");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header section with back button and title */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-xl font-bold">Détail de la Piste</h3>
      </div>

      {/* Trail Detail Content - rendered in read-only mode */}
      <div className="flex-1 overflow-auto">
        <TrailDetail trail={trail} onEdit={handleEdit} onDeleteSuccess={handleDeleteSuccess} />
      </div>
    </div>
  );
};
