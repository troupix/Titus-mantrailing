import React, { useContext, useEffect } from 'react';
import SessionDrawer from './Components/SessionDrawer';
import './App.css';
import { useState } from 'react';
import { LocationContext } from './Components/Context/Location';
import SessionForm from './Components/SessionForm';
import { getAllTrail } from './Utils/api';
import SessionDisplay from './Components/SessionDisplay';
import { Trail } from './Utils/types';
import { Grid } from '@mui/material';
import PointingDogIcon from './Components/PointingDogIcon';
import BadgesIcon from './Components/BadgesIcon';
import ScoreIcon from '@mui/icons-material/Score';
import Stats from './Components/Stats';
import { useMediaQuery, useTheme } from '@mui/material';
import Level from './Components/Level';

interface category {
  id: string;
  children: any[];

}


function App() {
  const { location } = useContext(LocationContext) || {};
  const [categories, setCategories] = useState<category[]>([]);
  const {allTrails, setAllTrails} = useContext(LocationContext);
  const { triggerGetTrails, setTriggerGetTrails } = useContext(LocationContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  useEffect(() => {
    getAllTrail().then((data) => {
      setAllTrails(data);
      const newCategories = [{ id: 'Statistiques', children: [{ id: 'Pistes', icon: <ScoreIcon sx={{fill:'#FFFFFF'}}/>, trail_id: 'Stats' },{ id: 'Badges', icon: <BadgesIcon />, trail_id: 'Badges' } ] }, { id: 'Piste', children: [] }]
      newCategories[1].children = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((trail: any) => {
        return {
          id: new Date(trail.date).toLocaleDateString(),
          icon: <PointingDogIcon />,
          trail_id: trail._id
        }
      });
      setCategories(newCategories);
    })
  }, [triggerGetTrails]);

  return (
    <div className="App">
      <Grid container spacing={isMobile ? 0 : 2}>
        <Grid item xs={12} md={2}>
          <SessionDrawer sx={{ width: '100%', height: '100%' }} categories={categories} />
        </Grid>
        <Grid item md={10} xs={12}>
          {location.split('/')[0] === 'newsession' &&
            <SessionForm edit_trail={allTrails.find(t => t._id === location.split('/')[1]) ? allTrails.find(t => t._id === location.split('/')[1]) as Trail : undefined} />}
          {allTrails.length !== 0 && allTrails.find((trail) => trail._id === location) && (
            <SessionDisplay trailInfo={allTrails.find((trail) => trail._id === location) as Trail} />
          )}
          {location === 'Stats' && (
            <Stats />
          )}
          {location === 'Badges' && (
            <Level />)}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
