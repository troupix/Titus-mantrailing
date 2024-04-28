import React from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

interface NewSessionButtonProps {
    onClick: () => void;
}

const NewSessionButton: React.FC<NewSessionButtonProps> = ({ onClick }) => {
    return (
        <Button  sx={{marginLeft:'10%'}} variant="contained" color="primary" onClick={onClick} startIcon={<AddIcon />}>
            Create new trail
        </Button>
    );
}

export default NewSessionButton;