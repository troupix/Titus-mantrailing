import React from 'react';
import Header from './Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Trail, isMantrailingTrail } from '../types/trail';

interface SessionDisplayProps {
    trailInfo: Trail;
}

const SessionDisplay: React.FC<SessionDisplayProps> = ({ trailInfo }) => {
    return (
        <div>
            <Header title={`Piste de ${isMantrailingTrail(trailInfo) ? trailInfo.dog.name : ''} du ${new Date(trailInfo.date).toLocaleDateString([], { dateStyle: 'long' })}`} trail_id={trailInfo._id} allowEdit={localStorage.getItem('isAllowedToCreate') === 'true'} allowDelete={localStorage.getItem('isAllowedToCreate') === 'true'} />
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Distance: {trailInfo.distance}m</p>
                        <p>Duration: {trailInfo.duration}s</p>
                        <p>Notes: {trailInfo.notes}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default SessionDisplay;
