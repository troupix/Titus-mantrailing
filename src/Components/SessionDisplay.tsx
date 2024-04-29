import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { Trail } from '../Utils/types';
import Header from './Header';
import { MapContainer, Marker, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon } from 'leaflet'

interface SessionDisplayProps {
    trailInfo: Trail;
}

const SessionDisplay: React.FC<SessionDisplayProps> = ({ trailInfo }) => {
    const mapRef = React.useRef(null);
    const runnerTrace = trailInfo.runnerTrace?.trk[0]?.trkseg[0]?.trkpt ? trailInfo.runnerTrace.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]) : undefined;
    const dogTrace = trailInfo.dogTrace?.trk[0]?.trkseg[0]?.trkpt ? trailInfo.dogTrace.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]) : undefined;
    const durationInMinutesSeconds = (duration: number) => {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes} minutes ${seconds} seconds`;
    }

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
        if (mapRef.current) {
            (mapRef.current as any).setView(trailInfo.locationCoordinate, 16);
        }
    }, [trailInfo, mapRef]);
    
    return (
        <Grid container spacing={2} sx={{ textAlign: 'left' }}>
            <Grid item xs={12}>
                <Header title={`Piste de ${trailInfo.dogName} du ${new Date(trailInfo.date).toLocaleDateString([], { dateStyle: 'long' })}`} trail_id={trailInfo._id} />
            </Grid>
            <Grid item xs={6}>
                <Grid container spacing={2} sx={{ marginLeft: '1%' }}>
                    <Grid item xs={12}>
                        <Typography variant="h5">Informations sur la session</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">Location: {trailInfo.location}</Typography>
                    </Grid>

                    {trailInfo.handlerName && (
                        <Grid item xs={4}>
                            <Typography variant="body1">Nom du conducteur: {trailInfo.handlerName}</Typography>
                        </Grid>
                    )}
                    {trailInfo.trainer && (
                        <Grid item xs={6}>
                            <Typography variant="body1">Nom de l'entraineur: {trailInfo.trainer}</Typography>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <Typography variant="h5">Informations sur la piste</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">Type de piste: {trailInfo.trailType}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {trailInfo.startType &&
                            <Typography variant="body1">Type de départ: {trailTypeToFrench(trailInfo.startType)}</Typography>
                        }
                    </Grid>
                    {trailInfo.duration && (
                        <Grid item xs={4}>
                            <Typography variant="body1">Durée: {durationInMinutesSeconds(trailInfo.duration)}</Typography>
                        </Grid>
                    )}
                    {trailInfo.distance && (
                        <Grid item xs={6}>
                            <Typography variant="body1" >Distance: {trailInfo.distance} m</Typography>
                        </Grid>
                    )}
                </Grid>
            </Grid>
            <Grid item xs={4} >
                {trailInfo.locationCoordinate && trailInfo.locationCoordinate.length === 2 &&
                    <MapContainer style={{ height: "100%", width: "100%" }} center={trailInfo.locationCoordinate} zoom={16} scrollWheelZoom={true} ref={mapRef}>
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
            <Grid item xs={12} sx={{ marginLeft: '1%' }}>
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