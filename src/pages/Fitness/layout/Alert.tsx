import { useState, } from 'react'
import { Snackbar, Alert, Typography } from '@mui/material'

interface AlertOrigin {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
}

const Alerts = ({ message }: { message: string }) => {
    const [open] = useState(true)

    const origin = { vertical: 'bottom', horizontal: 'right' } as AlertOrigin;

    return (
        <>
            <Alert severity={'error'}>
                <Typography variant="h6">
                    {message}
                </Typography>
            </Alert>
        </>
    )
};

export default Alerts
