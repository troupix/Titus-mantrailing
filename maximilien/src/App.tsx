import React, {useState,useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';
import Authentication from './components/authentication';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import CustomTabPanel from './components/CustomTabPanel';
import AuthWrapper from './components/authwrapper';
import { Link } from 'react-router-dom';
import AvatarComponent from './components/Avatar';
import AuthContext from './context/AuthContext';
import SmokeLogger from './components/SmokeLogger';
import {useSwipeable} from 'react-swipeable';



function App() {
  const [location, setLocation] = useState<string>('/');
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const handlers = useSwipeable({
    onSwipedLeft: () => setLocation('/three'),
    onSwipedRight: () => setLocation('/'),
    
    trackMouse: true
  });

  useEffect(() => {
    if(localStorage.getItem('lastLocation')){
      setLocation(localStorage.getItem('lastLocation') as string);
    }
  },[]);

  useEffect(() => {
    //load the components when the user is authenticated
    if(isAuthenticated){
      console.log('authenticated');
      setIsAuthenticated(true);
    }
  },[isAuthenticated]);


  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    localStorage.setItem('lastLocation',newValue);
    setLocation(newValue);
  }

  return (
    <div className='app' {...handlers}>
      
      <Router>
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <AuthWrapper>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={location} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Smoke" value={'/'} />
            {/* <Tab sx={{display:'none'}} label="Two" component={Link} to={"/login"}/> */}
            <Tab label="Three" value={'/three'}/>
            <AvatarComponent initial={'M'} isAuthenticated={true}/>
        </Tabs>
        <CustomTabPanel value={location} index={'/'} >
          <SmokeLogger ></SmokeLogger>
        </CustomTabPanel>
      </Box>
      
        <Routes>
          {/* {isAuthenticated && <Route path="/" element={<SmokeLogger swipeableHandlers={handlers} ></SmokeLogger>} />} */}
          {/* {isAuthenticated && <Route path="/three" Component={MainPage} />} */}
          {/* {isAuthenticated && <Route path="/login" Component={MainPage} />} */}
          {!isAuthenticated && <Route path="*" Component={Authentication} />}
        </Routes>

        </AuthWrapper>
        </AuthContext.Provider>
      </Router>
      
    </div>
  );
}

export default App;
