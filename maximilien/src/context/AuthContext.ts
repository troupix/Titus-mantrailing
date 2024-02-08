import React from 'react';

interface IAuthContext {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = React.createContext<IAuthContext>({
    isAuthenticated: false,
    setIsAuthenticated: function (value: React.SetStateAction<boolean>): void {
        throw new Error('Function not implemented.');
    }
});

export default AuthContext;
