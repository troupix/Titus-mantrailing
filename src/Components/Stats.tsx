import React, { useContext } from 'react';
import { Grid, Typography } from '@mui/material';
import Header from './Header';
import { LocationContext } from './Context/Location';
import StatsCard from './StatsCard';
import { durationInMinutesSeconds } from '../Utils/utils';
import { calculatePaceMax, calculatePaceAverage, calculatePaceMin } from '../Utils/utils';



interface StatsProps {
    title?: string;
    value?: number;
}

const Stats: React.FC<StatsProps> = (props) => {
    // const { title, value } = props;
    const { allTrails } = useContext(LocationContext);
    const determinePaceMax = (trails: any) => {
        let paceMax = 0;
        let dateOfPaceMax = '';
        trails.forEach((trail: any) => {
            if (trail.dogTrace?.trk[0]?.trkseg[0]?.trkpt) {
                const pace = calculatePaceMax(trail.dogTrace?.trk[0]?.trkseg[0]?.trkpt);
                if (pace > paceMax) {
                    paceMax = pace;
                    dateOfPaceMax = trail.date;
                }
            }
        });
        return { paceMax, dateOfPaceMax };
    }
    const determinePaceMin = (trails: any) => {
        let paceMin = Infinity;
        let dateOfPaceMin = '';
        trails.forEach((trail: any) => {
            if (trail.dogTrace?.trk[0]?.trkseg[0]?.trkpt) {
                const pace = calculatePaceMin(trail.dogTrace?.trk[0]?.trkseg[0]?.trkpt);
                if (pace < paceMin) {
                    paceMin = pace;
                    dateOfPaceMin = trail.date;
                }
            }
        });
        return { paceMin, dateOfPaceMin };
    }

    const determinePaceAverage = (trails: any) => {
        let paceSum = 0;
        let paceAverage = 0;
        trails.forEach((trail: any) => {
            if (trail.dogTrace?.trk[0]?.trkseg[0]?.trkpt) {
                if (calculatePaceAverage(trail.dogTrace?.trk[0]?.trkseg[0]?.trkpt) !== 0) {
                    const pace = calculatePaceAverage(trail.dogTrace?.trk[0]?.trkseg[0]?.trkpt);
                    paceSum += pace;
                }
            }
        });
        paceAverage = paceSum / trails.length;
        return paceAverage;
    }


    return (
        <Grid container spacing={2} sx={{ textAlign: 'left' }}>
            <Grid item md={12} xs={12}>
                <Header title='Statistiques' />
            </Grid>
            <Grid item md={11} xs={11}>
                <Typography variant="h5">Globales</Typography>    
            </Grid>
            <Grid item md={3} xs={11}>
                <StatsCard
                    title="Nombre de piste enregistrées"
                    value={allTrails.length.toString()}
                />
            </Grid>
            <Grid item md={3} xs={11}>
                <StatsCard
                    title="Distance totale enregistrée"
                    value={allTrails.reduce((acc, trail) => trail.distance ? acc + trail.distance : acc + 0, 0).toString()}
                    unit="m"
                />
            </Grid>
            <Grid item md={3} xs={11}>
                <StatsCard
                    title="Durée totale enregistrée"
                    value={durationInMinutesSeconds(allTrails.reduce((acc, trail) => trail.duration ? acc + trail.duration : acc + 0, 0))}
                />
            </Grid>
            <Grid item md={11} xs={11}>
                <Typography variant="h5">Piste</Typography>
            </Grid>
            <Grid item md={3} xs={11}>
                <StatsCard
                    title="Piste la plus longue enregistrée"
                    value={allTrails.reduce((acc, trail) => trail.distance ? acc > trail.distance ? acc : trail.distance : acc + 0, 0).toString()}
                    unit='m'
                    subtitle={`le ${new Date(allTrails.find(trail => trail.distance === allTrails.reduce((acc, trail) => trail.distance ? acc > trail.distance ? acc : trail.distance : acc + 0, 0))?.date.toString() || '').toLocaleDateString() || ''}`}
                />
            </Grid>
            <Grid item md={3} xs={11}>
                <StatsCard
                    title="Durée la plus courte enregistrée"
                    value={`${durationInMinutesSeconds(allTrails.reduce((acc, trail) => trail.duration ? acc < trail.duration && acc !==  0 ? acc : trail.duration : acc + 0, 0))}`}
                    // unit='s'
                    subtitle={`le ${new Date(allTrails.find(t => t.duration === allTrails.reduce((acc,trail) => trail.duration ? acc > trail.duration ? acc : trail.duration : acc + 0, 0))?.date ?? 0).toLocaleDateString()}`}
                />
            </Grid>
            <Grid item md={11} xs={11}>
                <Typography variant="h5">Vitesse</Typography>
            </Grid>
            <Grid item md={3} xs={11}>
                <StatsCard
                    title="Vitesse maximale enregistrée"
                    value={`${determinePaceMax(allTrails).paceMax.toFixed(1)} m/s`}
                    subtitle={`le ${new Date(determinePaceMax(allTrails).dateOfPaceMax).toLocaleDateString()}`}
                />
            </Grid>
            <Grid item md={3} xs={11}>
                <StatsCard
                    title="Vitesse minimale enregistrée"
                    value={`${determinePaceMin(allTrails).paceMin.toFixed(1)} m/s`}
                    subtitle={`le ${new Date(determinePaceMin(allTrails).dateOfPaceMin).toLocaleDateString()}`}
                />
            </Grid>
            <Grid item md={3} xs={11}>
                <StatsCard
                    title="Vitesse moyenne enregistrée"
                    value={`${determinePaceAverage(allTrails).toFixed(1)}`}
                    unit='m/s'
                />
            </Grid>
           
        </Grid>
    );
};

export default Stats;