import React from 'react';
import { FormControl, Grid, InputLabel, TextField, Typography } from '@mui/material';
import { Trail } from '../Utils/types';

interface SessionDisplayProps {
    trailInfo: Trail;
}

const SessionDisplay: React.FC<SessionDisplayProps> = ({ trailInfo }) => {
    const durationInMinutesSeconds = (duration: number) => {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes} minutes ${seconds} seconds`;
    }

    return (
        <Grid container spacing={2} sx={{ textAlign: 'left', marginLeft: '13%', width: '86%' }}>
            <Grid item xs={12}>
                <Typography variant="h5">Piste de {trailInfo.dogName} du {new Date(trailInfo.date).toLocaleDateString([], { dateStyle: 'long' })}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="body1">Location: {trailInfo.location}</Typography>
            </Grid>
            {trailInfo.blindStart ? (
                <Grid item xs={6}>
                    <Typography variant="body1">Départ à l'aveugle</Typography>
                </Grid>
            ) : (
                <Grid item xs={6}>
                    <Typography variant="body1">Départ à vue</Typography>
                </Grid>
            )}
            {trailInfo.handlerName && (
                <Grid item xs={6}>
                    <Typography variant="body1">Nom du conducteur: {trailInfo.handlerName}</Typography>
                </Grid>
            )}
            {trailInfo.trainer && (
                <Grid item xs={6}>
                    <Typography variant="body1">Nom de l'entraineur: {trailInfo.trainer}</Typography>
                </Grid>
            )}

            <Grid item xs={12}>
                <Typography variant="h5">Information sur la piste</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="body1">Type de piste: {trailInfo.trailType}</Typography>
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

            <Grid item xs={12}>
                
                
                <TextField
                    id="notes"
                    type="text"
                    label="Notes"
                    defaultValue={trailInfo.notes}
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


