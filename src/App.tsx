import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { create } from 'zustand';

import { Grid, ListItemText, Stack, Typography } from '@mui/material';

import { fitnessQueries } from './pages/Fitness/api';

import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';


const DefaultContent = () => {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>OpenFitness Coming Soon!</h1>
      <h1>OpenFitness Coming Soon!</h1>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p> Something new! </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
};
const ChartsContainer = (props: any) => {
  console.log(props);
  return (
    <>
    </>
  )
}

const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
};

const useAppStore = () => create((set) => ({
  count: 0,
  increment: () => set((state: any) => ({ count: state.count + 1 })),
}))

const useFitnessStore = () => create((set) => ({
  count: 0,
  increment: () => set((state: any) => ({ count: state.count + 1 })),
}));

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

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
  });

  console.log(
    "Queries: ", 
    readDatabaseQuery,
    fitnessTablesQuery,
    // exercisesQuery,
    // foodsQuery,
    // form
  );

  return (
    <Grid container my={8} p={2} spacing={2}>
      <Grid item sm={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <Typography variant="h4">Fitness Dashboard</Typography>
        {/* <DateTimeLabel /> */}
      </Grid>
      <Grid item sm={12}>
        {/* <ChartsContainer charts={fitnessTablesQuery.data.charts.profile} disableChartButtons disableFilterButtons /> */}
      </Grid>
      {/* Macro KPI's */}
      <Grid item xs={12} sm={4}>
        <Typography variant="h4">Macronutrient's</Typography>
        <Stack m={1} p={1}>
            {/* {fitnessTablesQuery.data.macros
                .map((kpi: any, index: number) => (
                    <ListItemText key={index} primary={kpi.label} secondary={!kpi.value ? `No data logged yet for ${kpi.label}` : kpi.value} />
                ))
            } */}
        </Stack>
      </Grid>
      <Grid item xs={12} sm={8}>
          {/* <ChartsContainer charts={fitnessTablesQuery.data.charts.food} defaultChart='bar' /> */}
      </Grid>
      <Grid item xs={12} sm={6}>
          {/* <ChartsContainer charts={fitnessTablesQuery.data.charts.sleep} defaultChart='line'/> */}
      </Grid>
      <Grid item xs={12} sm={6}>
          {/* <ChartsContainer charts={fitnessTablesQuery.data.charts.steps} defaultChart='line'/> */}
      </Grid>
      <Grid item sm={12}>
          {/* <ChartsContainer charts={fitnessTablesQuery.data.charts.exercise} defaultChart='bar'/> */}
      </Grid>
      <Grid item sm={12}>
          {/* <ChartsContainer charts={fitnessTablesQuery.data.charts.weight} defaultChart='bar'/> */}
      </Grid>
      <Grid item sm={12} md={12} lg={12}>
          {/* <MyCalendar /> */}
      </Grid>
    </Grid>
  )
};

function App() {
  return (
    <Providers>
      {/* <DefaultContent /> */}
      <Fitness />
    </Providers>
  )
};

export default App
