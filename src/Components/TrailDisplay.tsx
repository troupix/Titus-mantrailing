import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface Trail {
    dogName: string;
    handlerName?: string;
    distance?: number;
    location?: string;
    date?: Date;
    duration?: number;
    notes?: string;
    trailType?: string;
    blindStart?: boolean;
    trainer?: string;
}

interface TrailDisplayProps {
    trail: Trail;
}

const TrailDisplay: React.FC<TrailDisplayProps> = ({ trail }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="h2">
                    {trail.dogName}
                </Typography>
                <Typography color="textSecondary">
                    {trail.handlerName}
                </Typography>
                <Typography color="textSecondary">
                    {trail.distance} km
                </Typography>
                <Typography color="textSecondary">
                    {trail.location}
                </Typography>
                <Typography color="textSecondary">
                    {trail.date?.toLocaleDateString()}
                </Typography>
                <Typography color="textSecondary">
                    {trail.duration} minutes
                </Typography>
                <Typography color="textSecondary">
                    {trail.notes}
                </Typography>
                <Typography color="textSecondary">
                    {trail.trailType}
                </Typography>
                <Typography color="textSecondary">
                    {trail.blindStart ? 'Blind Start' : 'Not a Blind Start'}
                </Typography>
                <Typography color="textSecondary">
                    {trail.trainer}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default TrailDisplay;
