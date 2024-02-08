import React, {useState,useEffect} from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Box, Grid, Paper, Typography, FilledTextFieldProps, OutlinedTextFieldProps, StandardTextFieldProps, TextFieldVariants, Card, CardContent } from '@mui/material';




const SmokeLogger: React.FC = () => {
    // Your component logic here
    const [totalSmoked, setTotalSmoked] = useState<number>(0);
    const [smokedAtSelected, setSmokedAtSelected] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

    useEffect(() => {
        console.log(selectedDate);
    },[selectedDate]);


    return (
<Box
  sx={{
    display: 'flex',
    // flexDirection: 'column',
    verticalAlign: 'middle',
    justifyContent: 'center',
    gap: 2,
    p: 2,
    backgroundColor: '#f5f5f5',
  }}
>
    <Grid container spacing={2}>
        <Grid item xs={5} md={2} sx={{display:'flex'}}>
        <DatePicker
    value={selectedDate}
    onChange={(date) => date && setSelectedDate(dayjs(date))}
    
    sx={{ width: '100%',marginTop: 'auto', marginBottom: 'auto'}}
  />
        </Grid>
        <Grid item xs={12} md={10}>
  <Card sx={{ width: '100%', mt: 2 }}>
    <CardContent>
      <Typography sx={{fontSize:'1em'}} gutterBottom>
        Total Smoked: {totalSmoked}
      </Typography>
      <Typography sx={{fontSize:'1em'}}>
        Smoked at Selected Date: {smokedAtSelected}
      </Typography>
    </CardContent>
  </Card>
  </Grid>
  </Grid>
</Box>
);
}

export default SmokeLogger;