import React, { useContext, useEffect } from 'react';
import logo from './logo.svg';
import SessionDrawer from './Components/SessionDrawer';
import './App.css';
import { useState } from 'react';
import { LocationContext } from './Components/Context/Location';
import SessionForm from './Components/SessionForm';
import { getAllTrail } from './Utils/api';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import SessionDisplay from './Components/SessionDisplay';
import { Trail } from './Utils/types';
import { Grid } from '@mui/material';


interface category {
  id: string;
  children: trailSummary[];

}

interface trailSummary {
  id: number;
  date: string;
  trail_id: number;
  icon: React.ReactNode;
  active: boolean;
}

function App() {
  const { location } = useContext(LocationContext) || {};
  const [categories, setCategories] = useState<category[]>([]);
  const [allTrails, setAllTrails] = useState<Trail[]>([]);
  const { triggerGetTrails, setTriggerGetTrails } = useContext(LocationContext);

  useEffect(() => {
    getAllTrail().then((data) => {
      setAllTrails(data);
      const newCategories = [{ id: 'Trail', children: [] }]
      newCategories[0].children = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((trail: any) => {
        return {
          id: new Date(trail.date).toLocaleDateString(),
          icon: <DnsRoundedIcon />,
          trail_id: trail._id
        }
      });
      setCategories(newCategories);
    })
  }, [triggerGetTrails]);

  return (
    <div className="App">
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <SessionDrawer sx={{width:'100%', height: '100%' }} categories={categories} />
        </Grid>
        <Grid item xs={10}>
          {location}
          {location === 'newsession' &&
            <SessionForm triggerGetTrails={triggerGetTrails} setTriggerGetTrails={setTriggerGetTrails} />}
          {allTrails.length !== 0 && allTrails.find((trail) => trail._id === location) && (
            <SessionDisplay trailInfo={allTrails.find((trail) => trail._id === location) as Trail} />
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
