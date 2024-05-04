import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface StatsCardProps {
    title: string;
    subtitle?: string;
    value: string;
    unit?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, subtitle, value, unit }) => {
    return (
        <Card sx={{height:'100%'}}>
            <CardContent>
                <Typography variant="h6" component="h2">
                    {title}
                </Typography>
                <Typography variant="h4" component="p">
                    {value} {unit}
                </Typography>
                {subtitle && (
                    <Typography variant="subtitle1" component="p">
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default StatsCard;