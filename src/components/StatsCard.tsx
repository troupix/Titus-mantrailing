import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { useMediaQuery } from '@mui/material';

interface StatsCardProps {
    title: string;
    subtitle?: string;
    value: string;
    unit?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, subtitle, value, unit }) => {
    const isMobile = useMediaQuery('(max-width:600px)');

    return (
        <Card sx={{height:'100%',marginLeft: isMobile ? '12px' : 0}} >
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