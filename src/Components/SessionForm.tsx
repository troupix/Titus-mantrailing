import React, { useEffect, useState } from 'react';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { Trail } from '../Utils/types';
import { saveTrail } from '../Utils/api';
import { SelectChangeEvent } from '@mui/material';
import Header from './Header';
import LocationSearch from './LocationSearch';

const SessionForm: React.FC = () => {
     const [checked, setChecked] = useState(false);
    const [trail, setTrail] = useState<Trail>({
        dogName: 'Titus',
        date: new Date(),
    } as Trail);

    const handleSave = () => {
        if (trail)
            saveTrail(trail);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value);
        setTrail({
            ...trail,
            [event.target.name]:event.target.value,
        });
    };
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value);
        setTrail({
            ...trail,
            [event.target.name]: new Date(event.target.value),
        });
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.checked);
        setTrail({
            ...trail,
            [event.target.name]: event.target.checked,
        });
    }

    const handleLocationChange = (lat?: number, lng?: number, label?: string) => {
        console.log(lat, lng, label);
        setTrail({
            ...trail,
            location: label,
            // locationCoordinate: '[' + lat + ',' + lng + ']',
        });
        if(lat && lng){
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
        <Grid container spacing={3} sx={{marginLeft:'13%', width:'85%'}}>
            
            <Grid item xs={12} sx={{textAlign:'left'}}>
                <Header title="Enregistrer une nouvelle piste" />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h4">Session Details</Typography>
            </Grid>
             <Grid item xs={4}>
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
            <Grid item xs={4}>
            <LocationSearch onLocationSelect={handleLocationChange}/>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h4">Handler Details</Typography>
            </Grid>
            <Grid item xs={4}>
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
            <Grid item xs={4}>
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
            <Grid item xs={4}>
                <TextField
                    id="distance"
                    label="Distance (meters)"
                    type="number"
                    onChange={handleChange}
                    name="distance" />
            </Grid>
            <Grid item xs={4}>
                <TextField
                    id="duration"
                    label="Duration (seconds)"
                    type="number"
                    onChange={handleChange}
                    name="duration" />
            </Grid>
            <Grid item xs={4}>
                <TextField
                    id="trailType"
                    label="Trail Type"
                    type="text"
                    onChange={handleChange}
                    name="trailType" />
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
            <Grid item xs={3}>
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
           
            <Grid item xs={12}>
                <Button type="submit" onClick={() => handleSave()}>Submit</Button>
            </Grid>

        </Grid>
    );
};

export default SessionForm;