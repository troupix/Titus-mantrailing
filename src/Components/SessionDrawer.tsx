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

  return (
    <Drawer variant="permanent" {...other} sx={{
      '& .MuiDrawer-paperAnchorDockedLeft': {
        position: 'relative',
        height: '100vh',
        backgroundColor: '#101F33',
      }
    }} >
      <List disablePadding sx={{ backgroundColor: '#101F33' }}>
        <ListItem sx={{ ...item, ...itemCategory, textAlign: 'center', alignItems: 'center' }}>
          {setLocation && (
            <NewSessionButton onClick={() => { setLocation('newsession') }} />
          )}
        </ListItem>
        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: '#101F33' }}>
            <ListItem sx={{ py: 2, px: 3 }}>
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
      </List>
    </Drawer>
  );
}

export default Navigator;