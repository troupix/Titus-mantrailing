import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { Trail, MantrailingTrail, isMantrailingTrail } from '../types/trail';
import Header from './Header';
import { MapContainer, Marker, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon } from 'leaflet'
import { compareTraces, durationInMinutesSeconds } from '../utils/utils';
import { useMediaQuery } from '@mui/material';

interface SessionDisplayProps {
    trailInfo: Trail;
}

const SessionDisplay: React.FC<SessionDisplayProps> = ({ trailInfo }) => {
    const mapRef = React.useRef(null);

    if (!isMantrailingTrail(trailInfo)) {
        return null; // Or some fallback UI
    }

    const runnerTrace = trailInfo.runnerTrace?.trk[0]?.trkseg[0]?.trkpt ? trailInfo.runnerTrace.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]) : undefined;
    const dogTrace = trailInfo.dogTrace?.trk[0]?.trkseg[0]?.trkpt ? trailInfo.dogTrace.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]) : undefined;
    const isMobile = useMediaQuery('(max-width:600px)');

    const trailTypeToFrench = (startType: string) => {
        switch (startType) {
            case 'blind':
                return 'Départ à l\'aveugle';
            case 'double blind':
                return 'Double aveugle';
            case 'knowing':
                return 'Départ à vue';
            default:
                return 'Inconnu';
        }
    }

    React.useEffect(() => {
        if (mapRef.current && trailInfo.locationCoordinate) {
            (mapRef.current as any).setView(trailInfo.locationCoordinate, 16);
        }
    }, [trailInfo, mapRef]);
    
    return (
        <Grid container spacing={2} sx={{ textAlign: 'left' }}>
            <Grid item md={12} xs={12}>
                <Header title={`Piste de ${trailInfo.dogName} du ${new Date(trailInfo.date).toLocaleDateString([], { dateStyle: 'long' })}`} trail_id={trailInfo._id} allowEdit={localStorage.getItem('isAllowedToCreate') === 'true'} allowDelete={localStorage.getItem('isAllowedToCreate') === 'true'} />
            </Grid>
            <Grid item md={6} xs={11}>
                <Grid container spacing={2} sx={{ marginLeft: '1%' }}>
                    <Grid item md={12}>
                        <Typography variant="h5">Informations sur la session</Typography>
                    </Grid>
                    <Grid item md={12}  xs={11}>
                        <Typography variant="body1" sx={{textWrap:'balance'}}>Location: {trailInfo.location}</Typography>
                    </Grid>

                    {trailInfo.handlerName && (
                        <Grid item md={4}  xs={11}>
                            <Typography variant="body1">Nom du conducteur: {trailInfo.handlerName}</Typography>
                        </Grid>
                    )}
                    {trailInfo.trainer && (
                        <Grid item md={6}  xs={11}>
                            <Typography variant="body1">Nom de l'entraineur: {trailInfo.trainer}</Typography>
                        </Grid>
                    )}
                    <Grid item md={12}  xs={11}>
                        <Typography variant="h5">Informations sur la piste</Typography>
                    </Grid>
                    <Grid item md={12}  xs={11}>
                        <Typography variant="body1">Type de piste: {trailInfo.trailType}</Typography>
                    </Grid>
                    <Grid item md={12}  xs={11}>
                        {trailInfo.startType &&
                            <Typography variant="body1">Type de départ: {trailTypeToFrench(trailInfo.startType)}</Typography>
                        }
                    </Grid>
                    {trailInfo.duration && (
                        <Grid item md={4}  xs={11}>
                            <Typography variant="body1">Durée: {durationInMinutesSeconds(trailInfo.duration)}</Typography>
                        </Grid>
                    )}
                    {trailInfo.distance && (
                        <Grid item md={6}  xs={11}>
                            <Typography variant="body1" >Distance: {trailInfo.distance} m</Typography>
                        </Grid>
                    )}
                    {trailInfo.runnerTrace && trailInfo.dogTrace && (
                        <Grid item md={6}  xs={11}>
                            <Typography variant="body1">Deviation: {compareTraces(trailInfo.dogTrace.trk[0].trkseg[0].trkpt, trailInfo.runnerTrace.trk[0].trkseg[0].trkpt)} m</Typography>
                            </Grid>
                    )}
                </Grid>
            </Grid>
            <Grid item md={4}  xs={11}>
                {trailInfo.locationCoordinate && trailInfo.locationCoordinate.length === 2 &&
                    <MapContainer style={{ height: "100%", width: "100%", minHeight: isMobile ? '300px': '', marginLeft: isMobile ? '10px' : '' }} center={trailInfo.locationCoordinate} zoom={16} scrollWheelZoom={true} ref={mapRef}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {dogTrace && <Polyline pathOptions={{ color: 'red' }} positions={dogTrace} />}
                        {runnerTrace && <Marker position={runnerTrace[runnerTrace.length - 1]} icon={new Icon({ iconUrl: require('../assets/flag.png'), iconAnchor: [8, 16] })} />}
                        {runnerTrace && <Polyline pathOptions={{ color: 'blue' }} positions={runnerTrace} />}
                        <Marker position={trailInfo.locationCoordinate} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}>
                        </Marker>
                    </MapContainer>}
            </Grid>
            <Grid item md={12} sx={{ marginLeft: isMobile ? '10px' :'1%', marginBottom: '10px' }}  xs={11}>
                <TextField
                    id="notes"
                    type="text"
                    label="Notes"
                    value={trailInfo.notes}
                    name="notes"
                    multiline
                    rows={5}
                    variant="outlined"
                    disabled
                    fullWidth
                    sx={{
                        '& .MuiOutlinedInput-root.Mui-disabled': {
                            '& fieldset': {

                                borderColor: 'blue',
                            },
                        },
                        '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: 'black',
                        },
                    }}
                />
            </Grid>
        </Grid>
    );
};
export default SessionDisplay;