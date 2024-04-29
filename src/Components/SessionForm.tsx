import React, { useContext, useEffect, useState } from 'react';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Typography } from '@mui/material';
import { Trail } from '../Utils/types';
import { saveTrail, updateTrail } from '../Utils/api';
import { SelectChangeEvent } from '@mui/material';
import Header from './Header';
import LocationSearch from './LocationSearch';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon } from 'leaflet'
import GPX from 'gpx-parser-builder';
import FileUploadIcon from '@mui/icons-material/FileUpload';


import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import { LocationContext } from './Context/Location';


interface SessionFormProps {
    edit_trail?: Trail;
}



const SessionForm: React.FC<SessionFormProps> = (props) => {
    const { edit_trail } = props;
    const { triggerGetTrails, setTriggerGetTrails } = useContext(LocationContext);
    const mapRef = React.useRef(null);
    const [markerLocation, setMarkerLocation] = useState<[number, number]>(edit_trail?.locationCoordinate ? edit_trail.locationCoordinate : [45.7578137, 4.8320114]); // [lat, lng
    const [runnerTrace, setRunnerTrace] = useState<[]>(edit_trail?.runnerTrace?.trk[0]?.trkseg[0]?.trkpt ? edit_trail.runnerTrace.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]) : undefined);
    const [dogTrace, setDogTrace] = useState<[]>(edit_trail?.dogTrace?.trk[0]?.trkseg[0]?.trkpt ? edit_trail.dogTrace.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]) : undefined);
    const [trail, setTrail] = useState<Trail>(edit_trail ? edit_trail : {
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
            (mapRef.current as any).flyTo(trail.locationCoordinate, 17);
            setMarkerLocation(trail.locationCoordinate);
        }
    }, [trail.locationCoordinate]);

    const handleSave = () => {
        if (edit_trail?._id) {
            updateTrail(edit_trail._id, trail);
        }
        else {
            if (trail) {
                saveTrail(trail);
            }
        }
        setTriggerGetTrails(!triggerGetTrails);
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
        });
        if (lat && lng) {
            setTrail({
                ...trail,
                location: label,
                locationCoordinate: [lat, lng]
            });
        }
    }
    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180)
    }

    //calculate distance between points with lat and lon
    const calculateDistance = (points: [number, number][]) => {
        let distance = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const lat1 = points[i][0];
            const lon1 = points[i][1];
            const lat2 = points[i + 1][0];
            const lon2 = points[i + 1][1];
            const R = 6371; // Rayon de la Terre en kilomètres
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distance += R * c; // Distance en kilomètres
        }
        return parseFloat((distance * 1000).toFixed(0));
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

    const handleFileUpload = (files: FileList | null, type: string) => {
        if (files) {
            const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const gpx = GPX.parse(e.target?.result);
                    console.log(gpx, type);
                    if (type === 'dog') {
                        setDogTrace(gpx.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]));
                        setTrail({
                            ...trail,
                            dogTrace: gpx,
                            duration: (gpx.trk[0].trkseg[0].trkpt[gpx.trk[0].trkseg[0].trkpt.length - 1].time - gpx.trk[0].trkseg[0].trkpt[0].time) / 1000
                        });
                    }
                    if (type === 'runner') {
                        setRunnerTrace(gpx.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]));
                        setTrail({
                            ...trail,
                            runnerTrace: gpx,
                            distance: calculateDistance(gpx.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]))

                        });
                    }
                }
                reader.readAsText(file);
            }
        }
    }

    return (
        <Grid container spacing={3} sx={{ textAlign: 'left' }}>
            <Grid item xs={12} >
                <Header title="Enregistrer une nouvelle piste" />
            </Grid>
            <Grid item xs={6}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h4">Informations sur la session</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            sx={{ width: '65%' }}
                            id="date"
                            label="Date"
                            type="date"
                            value={new Date(trail.date).toISOString().split('T')[0]}
                            defaultValue={new Date().toISOString().split('T')[0]}
                            onChange={handleDateChange}
                            name="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <LocationSearch onLocationSelect={handleLocationChange} defaultLocation={edit_trail?.location} />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl sx={{ width: '65%' }}>
                            <InputLabel id="dogName-label">Handler Name</InputLabel>
                            <Select
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
                            sx={{ width: '65%' }}
                            id="trainer"
                            label="Trainer"
                            value={trail.trainer}
                            type="text"
                            onChange={handleChange}
                            name="trainer" />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h4">Trail Details</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            sx={{ width: '65%' }}
                            id="trailType"
                            label="Trail Type"
                            value={trail.trailType}
                            type="text"
                            onChange={handleChange}
                            name="trailType" />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl sx={{ width: '65%' }}>
                            <InputLabel id="startType-label">type de départ</InputLabel>
                            <Select
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
                            sx={{ width: '65%' }}
                            id="distance"
                            label="Distance (meters)"
                            defaultValue={0}
                            type="number"
                            value={trail.distance}
                            onChange={handleChange}
                            name="distance" />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            sx={{ width: '65%' }}
                            id="duration"
                            label="Duration (seconds)"
                            defaultValue={0}
                            value={trail.duration}
                            type="number"
                            onChange={handleChange}
                            name="duration" />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4}>
                <MapContainer style={{ height: "100%", width: "100%" }} center={edit_trail?.locationCoordinate ? edit_trail.locationCoordinate : [45.7578137, 4.8320114]} zoom={16} scrollWheelZoom={true} ref={mapRef}  >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={markerLocation} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })} />
                    {dogTrace && <Polyline pathOptions={{ color: 'red' }} positions={dogTrace} />}
                    {runnerTrace && <Marker position={runnerTrace[runnerTrace.length - 1]} icon={new Icon({ iconUrl: require('../assets/flag.png'), iconAnchor: [8, 16] })} />}
                    {runnerTrace && <Polyline pathOptions={{ color: 'blue' }} positions={runnerTrace} />}
                    <OnClickMap />
                </MapContainer>
            </Grid>
            <Grid item xs={2} sx={{ alignContent: 'center' }}>
                <input
                    accept=".gpx"
                    id="gpx-upload-runner"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files, 'runner')}
                />
                <label htmlFor="gpx-upload-runner">
                    <Button component="span" variant="contained" color="error" sx={{ width: '80%' }} startIcon={<FileUploadIcon />}>
                        Runner GPX file
                    </Button>
                </label>
                <input
                    accept=".gpx"
                    id="gpx-upload-dog"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files, 'dog')}
                />
                <label htmlFor="gpx-upload-dog">
                    <Button sx={{ marginTop: '20px', width: '80%' }} component="span" variant="contained" color="secondary" startIcon={<FileUploadIcon />}>
                        Dog GPX file
                    </Button>
                </label>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h4">Additional Information</Typography>
            </Grid>
            <Grid item xs={12}>
                <TextField
                    id="notes"
                    label="Notes"
                    type="text"
                    value={trail.notes}
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