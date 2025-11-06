import React from 'react';
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface NewTrailButtonProps {
    onClick: () => void;
}

const NewTrailButton: React.FC<NewTrailButtonProps> = ({ onClick }) => {
    return (
        <Button onClick={onClick}>
            <Plus className="mr-2 h-4 w-4" />
            Create new trail
        </Button>
    );
}

export default NewTrailButton;
