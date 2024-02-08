import React, { ReactNode, useEffect, useState } from 'react';
import { redirect } from 'react-router-dom';
import axios from 'axios';
import Authentication from './authentication';
import {API_URL} from '../env/environnement';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';


const AuthWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const {isAuthenticated, setIsAuthenticated} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    axios.interceptors.response.use(
        response => {
          // If the request succeeds, we don't have to do anything and just return the response
          return response;
        },
        error => {
          // Any status codes that falls outside the range of 2xx cause this function to trigger
          // We can check for a 403 status and redirect to the login page
          if (axios.isAxiosError(error) && error.response?.status === 403) {
            console.log('Redirecting to login page')
            setIsAuthenticated(false);
            if(window.location.pathname !== '/login')
            window.location.href = '/login';
          }
      
          return Promise.reject(error);
        }
      );

    useEffect(() => {
        // Simulating an API call to check authentication status
        const checkAuthentication = async () => {
            try {
                // Replace this with your actual API call to check authentication status
                const header = {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
                await axios.get(`${API_URL}/authentication`, header);
                setIsAuthenticated(true);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 403) {
                    setIsAuthenticated(false);
                } else {
                    console.error('Error checking authentication:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    if (isLoading) {
        // Render loading spinner or skeleton screen while checking authentication
        return <div>Loading...</div>;
    }


    return <>{children}</>;
};

export default AuthWrapper;