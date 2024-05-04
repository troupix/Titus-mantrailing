import * as React from 'react';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import NewSessionButton from './NewSessionButton';
import { useContext } from 'react';
import { LocationContext } from './Context/Location';
import { Grid, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import Bouton from '@mui/material/Button';


const item = {
  py: '2px',
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover, &:focus': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
  },
};

const itemCategory = {
  boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
  py: 1.5,
  px: 3,
};


interface NavProps {
  sx?: object;
  categories: category[];
}


interface category {
  id: string;
  children: trailSummary[];

}

interface trailSummary {
  id: string;
  date: string;
  trail_id: number;
  icon: any;
  active: boolean;
}


export const Navigator: React.FC<NavProps> = (props) => {
  const { categories } = props;
  const { ...other } = props;
  const { setLocation } = useContext(LocationContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorElTrail, setAnchorElTrail] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const open = Boolean(anchorEl);
  const openTrail = Boolean(anchorElTrail);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickTrail = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElTrail(event.currentTarget);
  };
  const handleCloseTrail = () => {
    setAnchorElTrail(null);
  };
  return (
    <Drawer variant="permanent" {...other} sx={{
      '& .MuiDrawer-paperAnchorDockedLeft': {
        position: 'relative',
        height: '100vh',
        backgroundColor: '#101F33',
      },
      '& .MuiDrawer-paperAnchorDockedTop': {
        position: 'relative',
        height: 70,
        width: '100%',
        backgroundColor: '#101F33',
      }
    }}

      anchor={isMobile ? 'top' : 'left'} >
      {!isMobile &&
        <List disablePadding sx={{ backgroundColor: '#101F33' }}>
          <ListItem sx={{ ...item, ...itemCategory, textAlign: 'center', alignItems: 'center' }}>
            {setLocation && (
              <NewSessionButton onClick={() => { setLocation('newsession') }} />
            )}
          </ListItem>
          {categories.map(({ id, children }) => (
            <Box key={id} sx={{ bgcolor: '#101F33' }}>
              <ListItem sx={{ py: 2, px: 3 }} >
                <ListItemText sx={{ color: '#fff' }}>{id}</ListItemText>
              </ListItem>
              {children.map(({ id: childId, icon, active, trail_id }) => (
                <ListItem disablePadding key={childId} onClick={() => setLocation(trail_id.toString())}>
                  <ListItemButton selected={active} sx={item}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText>{childId}</ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </List>}
      {isMobile &&
        <Grid container spacing={2} sx={{ textAlign: 'center', marginTop: '5px' }}>
          <Grid item xs={3}>
            <NewSessionButton onClick={() => { setLocation('newsession') }} />
          </Grid>
         {categories[0] &&  <Grid item xs={4}>
            <Bouton
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >{categories[0].id }</Bouton>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              {true || console.log(categories[0])}
              {categories[0].children.map(({ id: childId, icon, active, trail_id }) => (
                <MenuItem key={childId} onClick={() => { handleCloseTrail(); setLocation(trail_id.toString()) }}>
                  {childId}
                </MenuItem>
              ))}
            </Menu>
          </Grid>}
          {categories[1] && <Grid item xs={4}>
            <Bouton 
            id='basic-button-trail'
            aria-controls={openTrail ? 'basic-menu-trail' : undefined}
            aria-haspopup="true"
            aria-expanded={openTrail ? 'true' : undefined}
            onClick={handleClickTrail}
            >{categories[1].id}</Bouton>

            <Menu 
              id="basic-menu-trail"
              anchorEl={anchorElTrail}
              open={openTrail}
              onClose={handleCloseTrail}
              MenuListProps={{
                'aria-labelledby': 'basic-button-trail',
              }}
            >
              {categories[1].children.map(({ id: childId, icon, active, trail_id }) => (
                <MenuItem key={childId} onClick={() => { handleCloseTrail(); setLocation(trail_id.toString()) }}>
                  {childId}
                </MenuItem>
              ))}
            </Menu>
          </Grid>}
        </Grid>
      }
    </Drawer>
  );
}

export default Navigator;