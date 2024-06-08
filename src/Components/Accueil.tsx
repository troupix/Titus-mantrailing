import React from 'react';
import { Typography, Grid } from '@mui/material';
import Header from './Header';

const Accueil: React.FC = () => {
    return (
        <Grid container spacing={2} >
            <Grid item xs={12} sx={{ textAlign: 'left' }}>
                <Header title="Bienvenue" />
            </Grid>
            <Grid item xs={12}>

                <Typography variant="h4" align="center" gutterBottom>
                    Titus
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" align="left">
                    Titus est notre épagneul breton né le 02/05/2021. Il adore travailler avec son nez et donc nous l'avons inscrit au Mantrailing avec <a href="https://www.lyonk9.fr/"> LyonK9</a>
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <img
                    src="/Titus-mantrailing/Photos Titus retouchées -1.jpg"
                    alt="Titus"
                    style={{ width: 'auto', height: '400px' }}
                />
                  <figcaption><i>Credits photo: Claudia</i></figcaption>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h4" align="center" gutterBottom>
                    Mantrailing
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="body1" align="left">
                    Le Mantrailing est une discipline canine qui consiste à retrouver une personne disparue en suivant sa trace olfactive. Titus adore ça et nous aussi.
                </Typography>
            </Grid>
        </Grid>
    );
};

export default Accueil;