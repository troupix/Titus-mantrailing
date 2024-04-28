import React, { useContext, useEffect, useState } from 'react';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { Trail } from '../Utils/types';
import { saveTrail } from '../Utils/api';
import { SelectChangeEvent } from '@mui/material';
import Header from './Header';
import LocationSearch from './LocationSearch';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon } from 'leaflet'


import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMapEvents } from 'react-leaflet';
import { LocationContext } from './Context/Location';

interface SessionFormProps {
    triggerGetTrails: boolean;
    setTriggerGetTrails: (triggerGetTrails: boolean) => void;
}



const SessionForm: React.FC<SessionFormProps> = () => {
    const {triggerGetTrails, setTriggerGetTrails} = useContext(LocationContext);
    const mapRef = React.useRef(null);
    const [markerLocation, setMarkerLocation] = useState<[number, number]>([45.7578137, 4.8320114]); // [lat, lng
    const [trail, setTrail] = useState<Trail>({
        dogName: 'Titus',
        date: new Date(),
        handlerName: 'Malie',
    } as Trail);

    const OnClickMap = (e: any) => {
        const map = useMapEvents(
           {
             click: (e) => {
                setMarkerLocation([e.latlng.lat, e.latlng.lng])
                setTrail({
                    ...trail,
                    locationCoordinate: [e.latlng.lat, e.latlng.lng]
                });
             },
           }
            );
           return null;
       }
       

    useEffect(() => {
        if (mapRef.current && trail.locationCoordinate) {
            (mapRef.current as any).flyTo(trail.locationCoordinate, 14);
            setMarkerLocation(trail.locationCoordinate);
        }
    }, [trail.locationCoordinate]);



    const handleSave = () => {
        if (trail) {
            saveTrail(trail);
            setTriggerGetTrails(!triggerGetTrails);
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value);
        setTrail({
            ...trail,
            [event.target.name]: event.target.value,
        });
    };
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value);
        setTrail({
            ...trail,
            [event.target.name]: new Date(event.target.value),
        });
    };


    const handleLocationChange = (lat?: number, lng?: number, label?: string) => {
        console.log(lat, lng, label);
        setTrail({
            ...trail,
            location: label,
            // locationCoordinate: '[' + lat + ',' + lng + ']',
        });
        if (lat && lng) {
            setTrail({
                ...trail,
                location: label,
                locationCoordinate: [lat, lng]
            });
        }
    }


    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        console.log(event.target.value);
        setTrail({
            ...trail,
            handlerName: event.target.value,
        });
    }

    useEffect(() => {
        console.log(trail);
    }, [trail]);

    const handleStartType = (event: SelectChangeEvent<string>) => {
        setTrail({
            ...trail,
            startType: event.target.value,
        });
    }


    return (
        <Grid container spacing={3} sx={{ marginLeft: '13%', width: '85%' }}>

            <Grid item xs={12} sx={{ textAlign: 'left' }}>
                <Header title="Enregistrer une nouvelle piste" />
            </Grid>

            <Grid item xs={6}>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h4">Session Details</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            id="date"
                            label="Date"
                            type="date"
                            defaultValue={new Date().toISOString().split('T')[0]}
                            onChange={handleDateChange}
                            name="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <LocationSearch onLocationSelect={handleLocationChange} />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl>
                            <InputLabel id="dogName-label">Handler Name</InputLabel>
                            <Select
                                sx={{ minWidth: '200px' }}
                                labelId="dogName-label"
                                id="HandlerName"
                                value={trail.handlerName}
                                defaultValue='Malie'
                                label="Handler Name"
                                onChange={handleSelectChange}
                                name="handlerName"
                            >
                                <MenuItem value={"Malie"}>Malie</MenuItem>
                                <MenuItem value={"Max"}>Max</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            id="trainer"
                            label="Trainer"
                            type="text"
                            onChange={handleChange}
                            name="trainer" />
                    </Grid>




                    <Grid item xs={12}>
                        <Typography variant="h4">Trail Details</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            id="trailType"
                            label="Trail Type"
                            type="text"
                            onChange={handleChange}
                            name="trailType" />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl>
                            <InputLabel id="startType-label">type de départ</InputLabel>
                            <Select
                                sx={{ minWidth: '200px' }}
                                labelId="startType-label"
                                id="startType"
                                value={trail.startType}
                                defaultValue='knowing'
                                label="type de départ"
                                onChange={handleStartType}
                                name="startType"
                            >
                                <MenuItem value={"knowing"}>Départ à vue</MenuItem>
                                <MenuItem value={"blind"}>Départ à l'aveugle</MenuItem>
                                <MenuItem value={"double blind"}>Double aveugle</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            id="distance"
                            label="Distance (meters)"
                            type="number"
                            onChange={handleChange}
                            name="distance" />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            id="duration"
                            label="Duration (seconds)"
                            type="number"
                            onChange={handleChange}
                            name="duration" />
                    </Grid>

                </Grid>
            </Grid>
            <Grid item xs={6}>
                <MapContainer style={{ height: "100%", width: "100%" }} center={[45.7578137, 4.8320114]} zoom={13} scrollWheelZoom={true} ref={mapRef}  >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={markerLocation} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}>

                    </Marker>
                    <OnClickMap />
                </MapContainer>
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h4">Additional Information</Typography>
            </Grid>
            <Grid item xs={7}>
                <TextField
                    id="notes"
                    label="Notes"
                    type="text"
                    onChange={handleChange}
                    name="notes"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth />
            </Grid>



            <Grid item xs={12}>
                <Button type="submit" onClick={() => handleSave()}>Submit</Button>
            </Grid>

        </Grid>
    );
};

export default SessionForm;