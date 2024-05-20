import React, { useContext } from 'react';
import { Typography, Box, Grid, Checkbox } from '@mui/material';
import Header from './Header';
import { LocationContext } from './Context/Location';
import { changeOfDirection, compareTime } from '../Utils/utils';
import { Assessment } from '@mui/icons-material';

interface AssessmentCriteriaMantrailingGlobal {
    [key: string]: Level;
}

interface Level {
    name: string;
    criteria: Criteria[];
}

interface Criteria {
    id: string;
    criteria: string;
    pass: boolean;
}

interface CriteriaLyonK9 {
    id: string;
    criteria: string;
}

interface LevelLyonK9 {
    name: string;
    criteria: CriteriaLyonK9[];
    terrain: string;
    pass: boolean;
    passedAt?: Date
}


const Level = () => {
    const { allTrails } = useContext(LocationContext);
    const assessmentCriteriaMantrailingGlobal: AssessmentCriteriaMantrailingGlobal = {
        entryLevel: {
            name: 'Niveau d\'entrée',
            criteria: [
                { id: 'Single blind', criteria: 'Départ à l\'aveugle', pass: allTrails.find((trail: any) => trail.startType === 'blind') ? true : false },
                { id: 'trailLength', criteria: 'longueur de piste: 200-400m', pass: allTrails.find((trail: any) => trail.distance >= 200) ? true : false },
                { id: 'changeofdirection', criteria: '1 changement de direction (90 degrées)', pass: allTrails.find((trail: any) => trail.runnerTrace && changeOfDirection(trail.runnerTrace?.trk[0]?.trkseg[0]?.trkpt) === true) ? true : false },
                { id: 'Age of trail', criteria: 'Age de la piste: 30 min - 1hr Max.', pass: allTrails.find((trail: any) => trail.dogTrace && trail.runnerTrace && compareTime(trail.dogTrace?.trk[0]?.trkseg[0]?.trkpt, trail.runnerTrace?.trk[0]?.trkseg[0]?.trkpt) > 1800) ? true : false },
                { id: 'Trail duration', criteria: 'Max. 30 min pour trouver la victime', pass: allTrails.find((trail: any) => trail.duration < 1800) ? true : false },
                { id: 'Terrain', criteria: ' Terrain: Rural', pass: allTrails.find((trail: any) => trail.trailType.toLowerCase().includes('verdure') || trail.trailType.toLowerCase().includes('sable') || trail.trailType.toLowerCase().includes('gravier')) ? true : false },
                { id: 'Trail layer position', criteria: 'position de la victime - assis/couché/debout', pass: true },
                { id: 'Indication', criteria: ' Pas d\'indication de piste de la part du conducteur', pass: true },
                { id: 'Flankers', criteria: '1 assistant autorisé', pass: true },
                // Add more assessment criteria here
            ]
        },
        intermediateLevel: {
            name: 'Niveau intermédiaire',
            criteria: [
                { id: "1", criteria: 'Criteria 1', pass: true },
                { id: "2", criteria: 'Criteria 2', pass: false },
                { id: "3", criteria: 'Criteria 3', pass: true },
                // Add more assessment criteria here
            ]
        },
    };


    return (
        <Grid container spacing={2} >
            <Grid item xs={12} sx={{ textAlign: 'left' }}>
                <Header title="Niveau (En Construction)" />
            </Grid>
            {Object.keys(assessmentCriteriaMantrailingGlobal).map((level) => {
                return (
                    <>
                        <Grid item xs={12} key={level}>
                            <Typography variant="h5">{assessmentCriteriaMantrailingGlobal[level].name}</Typography>
                        </Grid>
                        {assessmentCriteriaMantrailingGlobal[level].criteria.map((item) => (
                            <Grid item xs={12} md={6} key={item.id}>
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
                        ))
                        }
                    </>
                    )
            })}
        </Grid>
    );
};

export default Level;