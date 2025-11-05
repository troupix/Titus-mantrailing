import React, { useEffect, useState } from 'react';
import { Command, CommandInput, CommandItem, CommandList } from "./ui/command";
import { OpenStreetMapProvider } from 'leaflet-geosearch';

interface LocationSearchProps {
    onLocationSelect: (lat: number | undefined, lng: number | undefined, label: string) => void;
    defaultLocation?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect, defaultLocation }) => {
    const [searchText, setSearchText] = useState(defaultLocation ? defaultLocation : '');
    const [results, setResults] = useState<any[]>([]);
    const provider = new OpenStreetMapProvider();

    useEffect(() => {
        const delay = setTimeout(() => {
            provider.search({ query: searchText }).then((results: any) => {
                setResults(results);
            });
        }, 250);
        return () => clearTimeout(delay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    return (
        <Command>
            <CommandInput
                placeholder="Search location..."
                value={searchText}
                onValueChange={setSearchText}
            />
            <CommandList>
                {results.map((result) => (
                    <CommandItem
                        key={result.raw.place_id}
                        onSelect={() => {
                            onLocationSelect(result.y, result.x, result.label);
                            setSearchText(result.label);
                        }}
                    >
                        {result.label}
                    </CommandItem>
                ))}
            </CommandList>
        </Command>
    );
};

export default LocationSearch;
