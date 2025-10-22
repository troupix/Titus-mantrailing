import React from 'react';
import { Modal, Fade, Button, Typography, Paper, TextField, Grid } from '@mui/material';
import { connect } from '../utils/api';

interface ConnectionModalProps {
    open: boolean;
    onClose: () => void;
    setConnection: (value: boolean) => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ open, onClose, setConnection }) => {
    const [password, setPassword] = React.useState('');
    const [message, setMessage] = React.useState('');
    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }

    const handleConnection = () => {
        if(password)
            connect(password).then((response) => {
                setMessage('Connection réussie');
                localStorage.setItem('isAllowedToCreate', response.success);
                setConnection(response.success);
                onClose();
            }).catch((error) => {
                setMessage('Mot de passe incorrect');
            });
    }


    return (
        <Modal
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

            }}
            open={open}
            onClose={onClose}
            closeAfterTransition
        >
            <Fade in={open} >
                <Paper sx={{ padding: '20px', display: 'block' }}>
                    <Grid container justifyContent="center">
                        <Grid item xs={7}>
                            <Typography>Pour se connecter, entrer le mot de passe</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <TextField
                                fullWidth
                                id="outlined-password-input"
                                label="Password"
                                type="password"
                                value={password}
                                onChange={handlePasswordChange}
                                autoComplete="current-password"
                                variant="outlined"
                            />
                        </Grid>
                        {message && (
                            <Grid item xs={7}>
                                <Typography>{message}</Typography>
                            </Grid>
                        )}
                        <Grid item xs={7}>
                            <Button variant="contained" color="primary" sx={{ margin: '10px' }} onClick={handleConnection}>
                                Se connecter
                            </Button>
                            <Button variant="contained" color="primary" onClick={onClose}>
                                Close
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Fade>
        </Modal >
    );
};

export default ConnectionModal;