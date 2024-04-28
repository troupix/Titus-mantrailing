import React from 'react';
import { FormControl, Grid, InputLabel, TextField, Typography } from '@mui/material';
import { Trail } from '../Utils/types';
import Header from './Header';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'

interface SessionDisplayProps {
    trailInfo: Trail;
}

const SessionDisplay: React.FC<SessionDisplayProps> = ({ trailInfo }) => {
    const mapRef = React.useRef(null);
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
            case 'knwowing':
                return 'Départ à vue';
            default:
                return 'Inconnu';
        }
    }

    React.useEffect(() => {
        if (mapRef.current) {
          (mapRef.current as any).setView(trailInfo.locationCoordinate, 14);
        }
      }, [trailInfo, mapRef]);

    return (
        <Grid container spacing={2} >
            <Grid item xs={12}>
                <Header title={`Piste de ${trailInfo.dogName} du ${new Date(trailInfo.date).toLocaleDateString([], { dateStyle: 'long' })}`} trail_id={trailInfo._id} />
                {/* <Typography variant="h5">Piste de {trailInfo.dogName} du {new Date(trailInfo.date).toLocaleDateString([], { dateStyle: 'long' })}</Typography> */}
            </Grid>
            <Grid item xs={6}>
                <Grid container spacing={2}>
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
                {/* <div id="map" style={{height:'100%', width:'100%'}}></div> */}
                {trailInfo.locationCoordinate && trailInfo.locationCoordinate.length === 2 &&
                <MapContainer   style={{ height: "100%", width: "100%" }} center={trailInfo.locationCoordinate} zoom={14} scrollWheelZoom={true} ref={mapRef}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        <Marker position={trailInfo.locationCoordinate} icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})}>
                        </Marker>
                    </MapContainer> }
                {/* {/* <LocationSearch onLocationSelect={(lat, lng) => { }} /> */}
            </Grid>
            <Grid item xs={12}>


                <TextField
                    id="notes"
                    type="text"
                    label="Notes"
                    value={trailInfo.notes} 
                    // onChange={handleChange}
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


