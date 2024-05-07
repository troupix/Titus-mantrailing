import React, { useContext } from 'react';
import { Typography, Box, Paper, Grid, Checkbox } from '@mui/material';
import Header from './Header';
import { LocationContext } from './Context/Location';
import { changeOfDirection, compareTime } from '../Utils/utils';

const Level = () => {
    const { allTrails } = useContext(LocationContext);
    const assessmentCriteria = {
        entryLevel: {
            name: 'Entry Level',
            criteria: [
                { id: 'Single blind', criteria: 'Départ à l\'aveugle', pass: allTrails.find((trail: any) => trail.startType === 'blind') ? true : false },
                { id: 'trailLength', criteria: 'Trail length: 200-400m', pass: allTrails.find((trail: any) => trail.distance >= 200) ? true : false },
                { id: 'changeofdirection', criteria: '1 change of direction (90 degrees)', pass: allTrails.find((trail: any) => trail.runnerTrace && changeOfDirection(trail.runnerTrace?.trk[0]?.trkseg[0]?.trkpt) === true) ? true : false },
                { id: 'Age of trail', criteria: 'Age of trail: 30 min - 1hr Max.', pass: allTrails.find((trail: any) => trail.dogTrace && trail.runnerTrace && compareTime(trail.dogTrace?.trk[0]?.trkseg[0]?.trkpt, trail.runnerTrace?.trk[0]?.trkseg[0]?.trkpt) > 1800) ? true : false },
                { id: 'Trail duration', criteria: 'Max. 30 min to find Trail Layer', pass: allTrails.find((trail: any) => trail.duration < 1800) ? true : false },
                { id: 'Terrain', criteria: ' Terrain: Rural', pass: allTrails.find((trail: any) => trail.trailType.toLowerCase().includes('verdure') || trail.trailType.toLowerCase().includes('sable') || trail.trailType.toLowerCase().includes('gravier')) ? true : false },
                { id: 'Trail layer position', criteria: '1 Trail Layer - sitting/laying/standing', pass: true },
                { id: 'Indication', criteria: ' No indication required', pass: true },
                { id: 'Flankers', criteria: '1 Flanker allowed', pass: true },
                // Add more assessment criteria here
            ]
        },
        intermediateLevel: {
            name: 'Intermediate Level',
            criteria: [
                { id: 1, criteria: 'Criteria 1', pass: true },
                { id: 2, criteria: 'Criteria 2', pass: false },
                { id: 3, criteria: 'Criteria 3', pass: true },
                // Add more assessment criteria here
            ]
        },
    };

    return (
        <Grid container spacing={2} >
            <Grid item xs={12} sx={{ textAlign: 'left' }}>
                <Header title="Niveau" />
            </Grid>
            {assessmentCriteria.entryLevel.criteria.map((item) => (
                <Grid item xs={12} md={12} key={item.id}>
                    <Box display="flex" alignItems="center">
                        <Checkbox checked={item.pass} disabled sx={{
                            '& .Mui-disabled': {
                                color: item.pass ? 'green' : 'red',
                                cursor: 'not-allowed',
                            },
                            '& .MuiSvgIcon-root': {
                                color: 'darkgreen',
                            },
                        }
                        }
                        />
                        <Typography>{item.criteria}</Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};

export default Level;