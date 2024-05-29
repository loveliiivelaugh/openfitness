import axios from 'axios'


const hostname = (process.env.VITE_HOSTNAME || import.meta.env.VITE_HOSTNAME);
// const hostname = "http://localhost:5001";


const client = axios.create({
  baseURL: hostname,
  timeout: 5000
});

export const fitnessQueries = ({
    readDatabaseQuery: () => ({
        queryKey: ['readDatabase'],
        queryFn: async () => (await client.get(`/api/system/read_schema`)).data,
    }),
    readTableQuery: (schema: any) => ({
        queryKey: ['readTableData'],
        queryFn: async () => (await client.get(`/api/system/read_db?table=${schema.table}`)).data,
    }),
    writeTableQuery: () => ({
        mutationKey: ['mutateDb'],
        mutationFn: async (data: any) => (await client.post(`/api/system/write_db?table=${data.table}`, data.data)).data
    }),
    fitnessTablesQuery: () => ({
        queryKey: ['fitnessTables'],
        queryFn: async () => (await client.get(`/api/system/fitness_tables`)).data
    }),
    exercisesQuery: () => ({
        queryKey: ['exercisedb'],
        queryFn: async () => (await client.get(`/api/exercises/get-exercises?name=press`)).data,
        enabled: false
    }),
    foodsQuery: () => ({
        queryKey: ['fooddb'],
        mutationFn: async (params: any) => {
            console.log('foodsQuery.mutationFn: ', params)
            return (await client.get(`/api/foods/get-foods?food=${params.query}`)).data},
        enabled: false
    }),
});