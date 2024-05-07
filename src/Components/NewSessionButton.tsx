import React from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { useMediaQuery, useTheme } from '@mui/material';


interface NewSessionButtonProps {
    onClick: () => void;
}

const NewSessionButton: React.FC<NewSessionButtonProps> = ({ onClick }) => {
    const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

    return (
        <Button variant="contained" color="primary" onClick={onClick} startIcon={<AddIcon /> } sx={{paddingRight:isMobile ? '5%' : ''}}>
           { isMobile ? '' :'Create new trail'}
        </Button>
    );
}

export default NewSessionButton;