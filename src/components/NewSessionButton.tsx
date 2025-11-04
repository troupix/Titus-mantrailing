import React from 'react';
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface NewSessionButtonProps {
    onClick: () => void;
}

const NewSessionButton: React.FC<NewSessionButtonProps> = ({ onClick }) => {
    return (
        <Button onClick={onClick}>
            <Plus className="mr-2 h-4 w-4" />
            Create new trail
        </Button>
    );
}

export default NewSessionButton;
