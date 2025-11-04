import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface StatsCardProps {
    title: string;
    subtitle?: string;
    value: string;
    unit?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, subtitle, value, unit }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{value} {unit}</p>
                {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default StatsCard;
