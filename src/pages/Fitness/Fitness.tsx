// Packages
import React from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { 
    InputAdornment, IconButton,
    Box, Drawer, Grid, List, ListItemText, 
    Stack, TextField, Typography,
    Chip, Tabs, Avatar
} from '@mui/material'
import { AppBar, Toolbar } from '@mui/material'
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';

// Components
import ChartsContainer from './layout/charts/ChartsContainer';
import FormContainer from './layout/forms/FormContainer';
import ListContent from './layout/ListContent';
import Alerts from './layout/Alert';

// Mocks
import foodsQueryMockJson from './api/nutritionix_mock.json';
import exercisesMockJson from './api/exercisesMock.json';

// Services
import { useFitnessStore, useSupabaseStore } from '../../store';
import { fitnessQueries, paths, client, queries } from './api';


const Fitness = () => {
    const fitnessStore = useFitnessStore();
    const supabaseStore = useSupabaseStore();
    const contentQuery = useQuery(queries.getContent());

    // Get Database Schema -- Builds fields for the forms
    const readDatabaseQuery = useQuery(fitnessQueries.readDatabaseQuery());
    // Get All Fitness Tables -- Data for the charts / visualizations
    const fitnessTablesQuery = useQuery(fitnessQueries.fitnessTablesQuery());
    // Exercises and Foods Search Queries -- Search for Exercises and Foods for logging
    const exercisesQuery = useQuery(fitnessQueries.exercisesQuery());
    const foodsQuery = useMutation(fitnessQueries.foodsQuery());

    console.log("readDatabaseQuery: ", {contentQuery});
    let topics = contentQuery.data?.openfitness?.topics || []; // Might be buggy

    const form = useForm({
        defaultValues: {
            exercisesInput: "",
            foodsInput: ""
        },
        onSubmit: ({ value }) => {
            console.log("values: ", value);

            if (value?.foodsInput) foodsQuery.mutate({ query: value.foodsInput });

            if (value?.exercisesInput) (exercisesQuery as any).mutate({ query: value.exercisesInput });
        },
    });

    const handleBottomNavClick = async (item: string) => {
        if (item === "Ai") {
            // Need all the cross platform logic here
            // ...
            function getApp(appName: string) {
                return (contentQuery as any).data.apps
                    .find(({ name }: { name: string }) => (name === appName));
            };
    
            // Get the current app metadata
            const thisApp = getApp("Fitness");
            // Get the next app metadata
            const nextApp = getApp("AI");

            const link = (import.meta.env.MODE === "development") 
                ? nextApp.dev_url 
                : nextApp.url;

            // Format the cross platform state
            const payload = {
                appId: thisApp.name,
                source: thisApp.dev_url,
                destination_url: link,
                destination_app: nextApp.name,
                data: null, // No need to send any data -- not yet at least
                user_id: (supabaseStore.session?.user?.id || null)
            };

            // Send the cross platform state to the db
            const response = (await client.post(
                paths.getCrossPlatformState, 
                payload
            ));
            
            // Redirect to the next app
            if (response.status === 200) {
                const queryString = `${link}/cross_platform?id=${response.data[0].id}`;
                window.location.href = queryString;
            };

        } else {
            fitnessStore.setActiveDrawer(item.toLowerCase());
            fitnessStore.toggleDrawer(['Food', 'Exercise'].includes(item) ? { open: true, anchor: "bottom" } : false);
        }
    }

    React.useEffect(() => {

        if (fitnessTablesQuery.isSuccess) {
            // Need access to the tables data throughout the fitness app 
            // ... and dont want to requery everytime
            fitnessStore.setFitnessTables(fitnessTablesQuery.data);

            const macrosLineFormatter = (data: any) => {
                console.log("macrosLineFormatter: ", data);
            }

            macrosLineFormatter(fitnessTablesQuery.data.food);
        }
    }, [fitnessTablesQuery.isSuccess, fitnessTablesQuery.data]);

    return ({
        "pending": <div>Loading...</div>,
        "loading": <div>Tables are getting ready...</div>,
        "success": (
            <Grid container my={6} sx={{ maxWidth: "100vw" }}>

                <AppBar>
                    <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                        <IconButton component="a" href={paths.appDepot}>
                            <HomeIcon />
                        </IconButton>
                        <Typography variant="h6">OpenFitness</Typography> 
                        <Avatar src={"M"} sx={{ width: 40, height: 40 }} />
                    </Toolbar>
                </AppBar>
                
                <Grid item sm={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Typography variant="h4">Fitness Dashboard</Typography>
                    {/* <DateTimeLabel /> */}
                </Grid>

                <Grid item sm={12}>
                    {fitnessTablesQuery.data?.charts?.profile
                        ? (
                            <ChartsContainer 
                                charts={fitnessTablesQuery.data.charts.profile} 
                                disableChartButtons 
                                disableFilterButtons 
                            />
                        ) : <Alerts message="Missing profile data" />
                    }
                </Grid>

                {/* Macro KPI's */}
                <Grid item xs={12} sm={4}>
                    <Typography variant="h4">Macronutrient's</Typography>
                    <Stack m={1} p={1}>
                        {fitnessTablesQuery.data?.macros 
                            ? fitnessTablesQuery.data.macros
                                .map((kpi: { label: string, value: string }, index: number) => (
                                    <ListItemText key={index} primary={kpi.label} secondary={!kpi.value ? `No data logged yet for ${kpi.label}` : kpi.value} />
                                ))
                            : <Alerts message="Missing macros data" />
                        }
                    </Stack>
                </Grid>
                <Grid item xs={12} sm={8}>
                    {fitnessTablesQuery.data?.charts?.food 
                        ? (
                            <ChartsContainer charts={fitnessTablesQuery.data.charts.food} defaultChart='bar' />
                        ) : <Alerts message="Missing food data" />
                    }
                </Grid>
                <Grid item xs={12} sm={6}>
                    {fitnessTablesQuery.data?.charts?.sleep 
                        ? (
                            <ChartsContainer charts={fitnessTablesQuery.data.charts.sleep} defaultChart='line'/>
                        ) : <Alerts message="Missing sleep data" />
                    }
                </Grid>
                <Grid item xs={12} sm={6}>
                    {fitnessTablesQuery.data?.charts?.steps 
                        ? (
                            <ChartsContainer charts={fitnessTablesQuery.data.charts.steps} defaultChart='line'/>
                        ) : <Alerts message="Missing steps data" />
                    }
                </Grid>
                <Grid item sm={12}>
                    {fitnessTablesQuery.data?.charts?.exercise 
                        ? (
                            <ChartsContainer charts={fitnessTablesQuery.data.charts.exercise} defaultChart='bar'/>
                        ) : <Alerts message="Missing exercise data" />
                    }
                </Grid>
                <Grid item sm={12}>
                    {fitnessTablesQuery.data?.charts?.weight 
                        ? (
                            <ChartsContainer charts={fitnessTablesQuery.data.charts.weight} defaultChart='bar'/>
                        ) : <Alerts message="Missing weight data" />
                    }
                </Grid>
                <Grid item sm={12} md={12} lg={12}>
                    {/* <MyCalendar /> */}
                </Grid>

                <Drawer open={fitnessStore.isDrawerOpen} onClose={() => {
                    fitnessStore.setActiveDrawer("weight");
                    fitnessStore.toggleDrawer();
                }} hideBackdrop anchor={fitnessStore.drawerAnchor}>
                    <Box sx={{ 
                            width: (fitnessStore.drawerAnchor === "bottom") ? "100vw" : "80vw", 
                            height: (fitnessStore.drawerAnchor === "bottom") ? "auto" : "100vh", 
                            justifyContent: "center" 
                        }}
                    >
                        {(!readDatabaseQuery.isLoading && (fitnessStore.drawerAnchor !== "bottom")) 
                            && Object.assign(
                                {}, 
                                ...topics.map((topic: string, index: number) => ({ 
                                    [topic.toLowerCase()]: (
                                        <FormContainer 
                                            key={index} 
                                            schema={readDatabaseQuery?.data.find(({ table }: { table: string }) => (table === topic.toLowerCase()))}
                                            fitnessTablesQuery={fitnessTablesQuery}
                                        />
                                    ) 
                                }))
                            )[fitnessStore.activeDrawer]
                        }

                        {fitnessStore.drawerAnchor === "bottom" && (
                            <Grid item sm={12}>

                                {/* Bottom Drawer Header */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
                                    <Typography variant="h5">
                                        Search {fitnessStore.activeDrawer === "exercise" ? "Exercises" : "Foods"}
                                    </Typography>
                                    <IconButton color="error" onClick={() => fitnessStore.toggleDrawer({ open: false, anchor: "bottom" })}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                <Chip label="Recent" sx={{ mx: 2, mb: 2 }} />

                                {/* Foods or Exercises Search Results List */}
                                <List sx={{ maxHeight: "40vh", height: "auto", overflow: "auto" }}>
                                    <ListContent 
                                        data={(fitnessStore.activeDrawer === "exercise") 
                                            ? exercisesMockJson 
                                            : (fitnessStore.activeDrawer === "food")
                                                ? foodsQueryMockJson
                                                : []
                                        }
                                    />
                                </List>

                                {/* Bottom Drawer Search Textfield */}
                                <Box component={(form as any).Form} onSubmit={form.handleSubmit} sx={{ mb: 4 }}>
                                    <form.Field name="foodsInput">
                                        {(field) => (

                                            <TextField
                                                type="text"
                                                value={field.state.value}
                                                onChange={(event) => field.handleChange(event.target.value)}
                                                placeholder="Search for a food"
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton type="submit" sx={{ color: "#fff" }} onClick={form.handleSubmit}>
                                                                <SearchIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {/* <IconButton id="qr-scan-button" onClick={() => appStore.setAppView("camera")} sx={{ color: "#fff" }}>
                                                                <QrCodeScannerIcon />
                                                            </IconButton> */}
                                                        </InputAdornment>
                                                    ),
                                                    sx:{
                                                        borderRadius: 8,
                                                        // borderColor: "#fff"
                                                        backgroundColor: "rgba(33,33,33,0.8)"
                                                    }
                                                }}
                                            />

                                        )}
                                    </form.Field>
                                </Box>

                            </Grid> 
                        )}

                    </Box>
                </Drawer>

                <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: "100vw", overflow: "auto" }}>
                    <BottomNavigation
                        component={Tabs}
                        showLabels
                        variant="scrollable"
                        scrollButtons="auto"
                        value={0}
                        sx={{ zIndex: 1000, pt: 2 }}
                    >
                        {topics.map((item: string, index: number) => (
                            <BottomNavigationAction
                                key={index} 
                                label={item} 
                                icon={(topics as any)[item]}
                                onClick={() => handleBottomNavClick(item)}
                            />
                        ))}
                    </BottomNavigation>
                </Box>

            </Grid>
            ),
            "error": <div>Error</div>
        }[fitnessTablesQuery.status]);
}

export default Fitness;
