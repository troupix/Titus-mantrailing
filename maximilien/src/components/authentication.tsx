import React, { useState,useContext } from 'react';
import { Button, Container, TextField, Typography, Box } from '@mui/material';
import { API_URL } from '../env/environnement';import axios from 'axios';
import { redirect } from 'react-router-dom';
import AuthContext from '../context/AuthContext';


const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCreateAccountForm, setShowCreateAccountForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {isAuthenticated, setIsAuthenticated} = useContext(AuthContext);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  };

  const handleLogin = () => {
    // Perform login logic here
    axios.post(`${API_URL}/login`, { email, password }).then(response => {
      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      // Redirect to main page
      // window.location.href = window.location.href; // Replace this with the actual redirect function from your router library
    }).catch(error => {
      console.error('Error logging in:', error);
     

      // Show error message to user
      
    });
  };

  const handleCreateAccount = () => {
      // Perform create account logic here
      axios.post(`${API_URL}/register`, { email, password }).then(response => {
        console.log('Account created successfully:', response.data);
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        // Redirect to main page
        // window.location.href = '/'; // Remove the argument from the useNavigate function call
      }).catch(error => {
        console.error('Error creating account:', error);
        // Show error message to user
      });
  }


  const switchCreateAccount = () => {
    setShowCreateAccountForm(!showCreateAccountForm);
  };

  return (
    <>
      {!showCreateAccountForm ?
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          <Box component='div' sx={{ width: '100%', mt: 1 }} >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleLogin}
            >
              Sign In
            </Button>


          </Box>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={switchCreateAccount}
          >
            Create Account
          </Button>
        </Container>
        :
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
          <Typography component="h1" variant="h5">
            Create Account
          </Typography>
          <Box component="div" sx={{ width: '100%', mt: 1 }} >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="current-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleCreateAccount}
            >
              Create Account
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              onClick={switchCreateAccount}
            >
              Back to Sign In
            </Button>
          </Box>

        </Container>
      }

    </>

  );
}


export default Authentication;
