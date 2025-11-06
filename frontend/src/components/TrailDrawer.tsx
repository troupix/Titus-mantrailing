import React, { useContext } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import NewTrailButton from './NewTrailButton';
import { LocationContext } from './context/Location';

const TrailDrawer: React.FC = () => {
    const { setLocation } = useContext(LocationContext);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Open Menu</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Titus Mantrailing</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                    <NewTrailButton onClick={() => setLocation('newtrail')} />
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default TrailDrawer;
