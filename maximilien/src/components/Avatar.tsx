import React,{useEffect, useState} from 'react';
import { Avatar, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { deepPurple } from '@mui/material/colors';

const AvatarComponent: React.FC<{ initial: string,isAuthenticated: boolean }> = ({ initial,isAuthenticated }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [open,setOpen] = useState<boolean>(false);
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if(isAuthenticated){
        setOpen(!open);
      setAnchorEl(event.currentTarget);
    }else{
        window.location.href = '/login'; // Replace this with the actual redirect function from your router library
    }
    };
    const handleClose = () => {
        setOpen(false);
      
    };
    
useEffect(() => {
    if(!open){
                setAnchorEl(null);
    }
}
,[open])

    return (
        <>
        <IconButton sx={{display:'flex', float: 'right', right: '10px' ,position: 'absolute'}} onClick={handleClick}>
        <Avatar sx={{ bgcolor: deepPurple[500], alignSelf: 'center', display: 'flex',  width: '30px', height: '30px', fontSize: '1rem' }}>
        {initial}
        </Avatar>
        <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setOpen(false)}
        
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={()=>{
            handleClose();
            localStorage.removeItem('token');
            window.location.href = '/login'; // Replace this with the actual redirect function from your router library}
        }}>Logout</MenuItem>
      </Menu>
      </IconButton>
        </>
    );
};

export default AvatarComponent;
