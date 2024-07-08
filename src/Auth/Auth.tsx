import { useState, useEffect } from 'react'
import { Subscription } from '@supabase/supabase-js'
import { Alert, Button, Box, Typography } from '@mui/material';

import { supabase } from './supabaseConfig';
import { useSupabaseStore } from '../store';
import { adminClient, client, paths } from '../pages/Fitness/api';


export function SupabaseAuthProvider({ children }: any) {
    const supabaseStore = useSupabaseStore();

    const [sub, setSubscription] = useState<Subscription | null>(null);
    const [errors, setErrors] = useState<any[]>([]);

    useEffect(() => {
        const [, token] = document.cookie.split(`${import.meta.env.VITE_SECRET_COOKIE}=`);

        if (token || supabaseStore.session?.access_token) {
            (client as any).defaults.headers.common["Authorization"] = `Bearer ${token}`;
            (adminClient as any).defaults.headers.common["Authorization"] = `Bearer ${token}`;
            
            (async () => {    
                const existingSession = (await client.get(`/auth/v1/user`)).data;
                
                if (existingSession?.refresh_token) {
                    const data = await supabase.auth
                        .refreshSession({ 
                            refresh_token: existingSession.refresh_token as string 
                        });

                    // console.log({ data });

                    if (data?.error) setErrors([...errors, data?.error?.message]);
                }
                
                // console.log({ existingSession });
            })();
        };
            
        supabase.auth
            .getSession()
            .then((
                { data: { session } }: 
                { data: { session: any } }
            ) => {
                // console.log({ session });
                supabaseStore.setSession(session);
            });

        const { data: { subscription }} = supabase.auth
            .onAuthStateChange((_event: any, session: any) => supabaseStore
                .setSession(session)
            );

        setSubscription(subscription);

        return () => sub?.unsubscribe();

    }, [])

    // console.log("Auth", supabaseStore);
    if (!supabaseStore.session) return (
        <Box>
            <Alert severity={'error'}>
                <Typography variant="body1">
                    Problem logging in...
                </Typography>
                <Typography variant="body1" color="error">
                    {errors.join(', ')}
                </Typography>
            </Alert>
            <Button variant="outlined" sx={{ mt: 2}} onClick={() => window.open(paths.appDepot, "_self")}>
                Back to Home
            </Button>
        </Box>
    );
    else return children;
}