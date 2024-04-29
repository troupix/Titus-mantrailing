import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {deleteTrail} from '../Utils/api';
import { LocationContext } from './Context/Location';
import { Box } from '@mui/material';



interface HeaderProps {
    title?: string;
    trail_id?: string;
    
}

const Header: React.FC<HeaderProps> = (props) => {
    const { title,trail_id } = props;
    const { setLocation} = React.useContext(LocationContext);
    const {triggerGetTrails, setTriggerGetTrails} = React.useContext(LocationContext);
    const deleteAction = () => {
        if(trail_id)
        {
            deleteTrail(trail_id);
            setLocation('')
            setTriggerGetTrails(!triggerGetTrails);
        }
    }

    const editAction = () => {
        if(trail_id)
        {
            setLocation('newsession/'+trail_id)
        }
    }

  return (
    <React.Fragment >
      <AppBar color="primary" position="sticky" elevation={0} >
        <Toolbar>
          <Grid container spacing={1} alignItems="center">
            <Grid sx={{ display: { sm: 'none', xs: 'block' } }} item>
            </Grid>
            <Grid item xs >
              <Box
                  component="img"
                  sx={{ width: 100, height: 100 }}
                  alt="logo"
                  src="/TitusLogo.png"
                  onClick={() => setLocation('')}
                />
            </Grid>
              
            <Grid item>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                sx={{ mr: 2 }}
                >
                    <Tooltip title="Imprimer">
                    <PrintIcon />
                    </Tooltip>
                </IconButton>
            </Grid>
            <Grid item>
            <IconButton
                onClick={deleteAction}
                color="inherit"
                aria-label="open drawer"
                edge="start"
                sx={{ mr: 2 }}
                >
                    <Tooltip title="Supprimer">
                    <DeleteIcon />
                    </Tooltip>
                </IconButton>
            </Grid>
            <Grid item>
            <IconButton
                color="inherit"
                onClick={editAction}
                aria-label="open drawer"
                edge="start"
                sx={{ mr: 2 }}
                >
                    <Tooltip title="Editer">
                    <EditIcon />
                    </Tooltip>
                </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar
        component="div"
        color="primary"
        position="static"
        elevation={0}
        sx={{ zIndex: 0, borderBottomLeftRadius: 15, borderBottomRightRadius: 15}}
      >
        <Toolbar>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs >
              <Typography color="inherit" variant="h5" component="h1" >
                 {title}
              </Typography>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

export default Header;