import * as React from 'react';
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { deleteTrail } from '../utils/api';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
    title?: string;
    trail_id?: string;
    allowEdit?: boolean;
    allowDelete?: boolean;
    allowSave?: boolean;
    onSaveAction?: () => void;
}

const Header: React.FC<HeaderProps> = (props) => {
    const { title, trail_id, allowDelete, allowEdit, allowSave, onSaveAction } = props;
    const location = useLocation();

    const deleteAction = () => {
        if (trail_id) {
            deleteTrail(trail_id);
            // You might want to redirect or update the UI after deletion
        }
    }

    const editAction = () => {
        if (trail_id) {
            // Navigate to the edit page
        }
    }

    return (
        <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <img src="/Titus-mantrailing/TitusLogo.png" alt="logo" className="w-12 h-12" />
                <h1 className="text-xl font-bold">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <PrintIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Imprimer</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                {allowDelete && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={deleteAction}>
                                    <DeleteIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Supprimer</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {allowEdit && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={editAction}>
                                    <EditIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Editer</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {allowSave && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={onSaveAction}>
                                    <SaveIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Sauvegarder</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </header>
    );
}

export default Header;
