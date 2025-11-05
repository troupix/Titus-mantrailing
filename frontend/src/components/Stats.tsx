import React, { useContext } from 'react';
import Header from './Header';
import { LocationContext } from './context/Location';
import StatsCard from './StatsCard';
import { durationInMinutesSeconds } from '../utils/utils';
import { calculatePaceMax, calculatePaceAverage, calculatePaceMin } from '../utils/utils';
import { Trail } from '../types/trail';

interface StatsProps {
    title?: string;
    value?: number;
}

const Stats: React.FC<StatsProps> = (props) => {
    const { trails } = useContext(LocationContext);
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
        <div className="container mx-auto p-4">
            <Header title='Statistiques' />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="Nombre de piste enregistrées"
                    value={trails.length.toString()}
                />
                <StatsCard
                    title="Distance totale enregistrée"
                    value={trails.reduce((acc, trail) => trail.distance ? acc + trail.distance : acc, 0).toString()}
                    unit="m"
                />
                <StatsCard
                    title="Durée totale enregistrée"
                    value={durationInMinutesSeconds(trails.reduce((acc, trail) => trail.duration ? acc + trail.duration : acc, 0))}
                />
                <StatsCard
                    title="Piste la plus longue enregistrée"
                    value={trails.reduce((acc, trail) => trail.distance && acc > trail.distance ? acc : trail.distance || 0, 0).toString()}
                    unit='m'
                    subtitle={`le ${new Date(trails.find(trail => trail.distance === trails.reduce((acc, trail) => trail.distance && acc > trail.distance ? acc : trail.distance || 0, 0))?.date.toString() || '').toLocaleDateString() || ''}`}
                />
                <StatsCard
                    title="Durée la plus courte enregistrée"
                    value={`${durationInMinutesSeconds(trails.reduce((acc, trail) => trail.duration && acc < trail.duration && acc !== 0 ? acc : trail.duration || 0, 0))}`}
                    subtitle={`le ${new Date(trails.find(t => t.duration === trails.reduce((acc, trail) => trail.duration && acc > trail.duration ? acc : trail.duration || 0, 0))?.date ?? 0).toLocaleDateString()}`}
                />
                <StatsCard
                    title="Vitesse maximale enregistrée"
                    value={`${determinePaceMax(trails).paceMax.toFixed(1)} m/s`}
                    subtitle={`le ${new Date(determinePaceMax(trails).dateOfPaceMax).toLocaleDateString()}`}
                />
                <StatsCard
                    title="Vitesse minimale enregistrée"
                    value={`${determinePaceMin(trails).paceMin.toFixed(1)} m/s`}
                    subtitle={`le ${new Date(determinePaceMin(trails).dateOfPaceMin).toLocaleDateString()}`}
                />
                <StatsCard
                    title="Vitesse moyenne enregistrée"
                    value={`${determinePaceAverage(trails).toFixed(1)}`}
                    unit='m/s'
                />
            </div>
        </div>
    );
};

export default Stats;
