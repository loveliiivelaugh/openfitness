// Packages
import React from 'react'
import { 
    InputAdornment, IconButton,
    Box, Drawer, Grid, List, ListItemText, 
    Stack, TextField, Typography,
    Chip,
    Container,
    Tabs, 
} from '@mui/material'
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery } from '@tanstack/react-query'

// Components
import ChartsContainer from './layout/charts/ChartsContainer';
import FormContainer from './layout/forms/FormContainer';
import ListContent from './layout/ListContent';

// Mocks
import foodsQueryMockJson from './api/nutritionix_mock.json';
import exercisesMockJson from './api/exercisesMock.json';

// Services
import { DateTimeLabel, useAppStore } from '../../App';
import { useFitnessStore } from './store';
import { fitnessQueries } from './api';
import Chat from '../Chat/Chat';
import MyCalendar from './layout/Calendar';


const topics = [
    "Weight",
    "Food",
    "Exercise",
    "Profile",
    "Sleep",
    "Steps",
    "Planning",
    "Settings"
];

const Fitness = () => {
    const appStore = useAppStore();
    const fitnessStore = useFitnessStore();
    // Get Database Schema -- Builds fields for the forms
    const readDatabaseQuery = useQuery(fitnessQueries.readDatabaseQuery());
    // Get All Fitness Tables -- Data for the charts / visualizations
    const fitnessTablesQuery = useQuery(fitnessQueries.fitnessTablesQuery());
    // Exercises and Foods Search Queries -- Search for Exercises and Foods for logging
    const exercisesQuery = useQuery(fitnessQueries.exercisesQuery());
    const foodsQuery = useMutation(fitnessQueries.foodsQuery());

    console.log("readDatabaseQuery: ", fitnessTablesQuery);

    const form = useForm({
        defaultValues: {
            exercisesInput: "",
            foodsInput: ""
        },
        onSubmit: ({ value }) => {
            console.log("values: ", value);

            if (value?.foodsInput) foodsQuery.mutate({ query: value.foodsInput });

            if (value?.exercisesInput) exercisesQuery.mutate({ query: value.exercisesInput });
        },
    });

    React.useEffect(() => {

        if (fitnessTablesQuery.isSuccess) {
            // Need access to the tables data throughout the fitness app 
            // ... and dont want to requery everytime
            fitnessStore.setFitnessTables(fitnessTablesQuery.data);

            const macrosLineFormatter = (data) => {
                console.log("macrosLineFormatter: ", data);
            }

            macrosLineFormatter(fitnessTablesQuery.data.food);
        }
    }, [fitnessTablesQuery.isSuccess, fitnessTablesQuery.data]);

    
    return fitnessTablesQuery.isLoading ? <div>Loading...</div> : (
        <Grid container my={8} p={2} spacing={2}>
            <Grid item sm={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <Typography variant="h4">Fitness Dashboard</Typography>
                <DateTimeLabel />
            </Grid>

            <Grid item sm={12}>
                <ChartsContainer charts={fitnessTablesQuery.data.charts.profile} disableChartButtons disableFilterButtons />
            </Grid>

            {/* Macro KPI's */}
            <Grid item xs={12} sm={4}>
                <Typography variant="h4">Macronutrient's</Typography>
                <Stack m={1} p={1}>
                    {fitnessTablesQuery.data.macros
                        .map((kpi, index) => (
                            <ListItemText key={index} primary={kpi.label} secondary={!kpi.value ? `No data logged yet for ${kpi.label}` : kpi.value} />
                        ))
                    }
                </Stack>
            </Grid>
            <Grid item xs={12} sm={8}>
                <ChartsContainer charts={fitnessTablesQuery.data.charts.food} defaultChart='bar' />
            </Grid>
            <Grid item xs={12} sm={6}>
                <ChartsContainer charts={fitnessTablesQuery.data.charts.sleep} defaultChart='line'/>
            </Grid>
            <Grid item xs={12} sm={6}>
                <ChartsContainer charts={fitnessTablesQuery.data.charts.steps} defaultChart='line'/>
            </Grid>
            <Grid item sm={12}>
                <ChartsContainer charts={fitnessTablesQuery.data.charts.exercise} defaultChart='bar'/>
            </Grid>
            <Grid item sm={12}>
                <ChartsContainer charts={fitnessTablesQuery.data.charts.weight} defaultChart='bar'/>
            </Grid>
            <Grid item sm={12} md={12} lg={12}>
                <MyCalendar />
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
                            ...topics.map((topic, index) => ({ 
                                [topic.toLowerCase()]: (
                                    <FormContainer 
                                        key={index} 
                                        schema={readDatabaseQuery?.data.find(({ table }) => (table === topic.toLowerCase()))}
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
                                <IconButton variant="outlined" color="error" onClick={() => fitnessStore.toggleDrawer({ open: false, anchor: "bottom" })}>
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
                            <Box component={form.Form} onSubmit={form.handleSubmit} sx={{ mb: 4 }}>
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
                                                        <IconButton p={1} type="submit" sx={{ color: "#fff" }} onClick={form.handleSubmit}>
                                                            <SearchIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton id="qr-scan-button" onClick={() => appStore.setAppView("camera")} sx={{ color: "#fff" }}>
                                                            <QrCodeScannerIcon />
                                                        </IconButton>
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
                    {topics.map((item, index) => (
                        <BottomNavigationAction
                            key={index} 
                            label={item} 
                            icon={topics[item]}
                            onClick={() => {
                                fitnessStore.setActiveDrawer(item.toLowerCase());
                                fitnessStore.toggleDrawer(['Food', 'Exercise'].includes(item) && { open: true, anchor: "bottom" });
                            }}
                        />
                    ))}
                </BottomNavigation>
            </Box>

        </Grid>
    )
}

export default Fitness;
