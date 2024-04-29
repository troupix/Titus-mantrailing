import React, { useEffect, useState } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

interface LocationSearchProps {
    onLocationSelect: (lat: number | undefined, lng: number | undefined, label: string) => void;
    defaultLocation?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect, defaultLocation }) => {
    const [searchText, setSearchText] = useState(defaultLocation ? defaultLocation : '');
    const [results, setResults] = useState<any[]>([]);
    const provider = new OpenStreetMapProvider();
    
    const handleSelectChange = (event: any) => {
        console.log(results.find(r => r.label === event.target.value));
        if (results.find(r => r.label === event.target.value))
            onLocationSelect(results.find(r => r.label === event.target.value).y, results.find(r => r.label === event.target.value).x, event.target.value);
        else
            onLocationSelect(undefined, undefined, event.target.value);
    }

    useEffect(() => {
        const delay = setTimeout(() => {
            console.log('Performing search...');
            provider.search({ query: searchText }).then((results: any) => {
                setResults(results);
            });
        }, 250);
        return () => clearTimeout(delay);
    }, [searchText]);

    return (
        <Autocomplete
            freeSolo
            sx={{ width: '65%' }}
            options={results}
            value={searchText}
            defaultValue={defaultLocation ? defaultLocation : ''}
            onSelect={(e: any) => handleSelectChange(e)}
            renderInput={(params: any) => (
                <TextField
                    {...params}
                    label="Search Location"
                    value={searchText}
                    defaultValue={defaultLocation ? defaultLocation : ''}
                    onChange={(e) => setSearchText(e.target.value)}

                />
            )}
        />
    );
};

export default LocationSearch;