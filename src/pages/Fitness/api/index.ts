import axios from 'axios';


const hostname = import.meta.env.VITE_HOSTNAME;

const paths = {
    "theme": "/api/theme/themeConfig",
    "content": "/api/cms/content",
    "appDepot": import.meta.env.VITE_HOME_APP
};

const client = axios.create({
    baseURL: import.meta.env.MODE === "development"
        ? "http://localhost:5001"
        : hostname,
    timeout: 5000,
    headers: {},
    auth: {
        username: import.meta.env.VITE_BASIC_AUTH_USERNAME,
        password: import.meta.env.VITE_BASIC_AUTH_PASSWORD
    },
});

const fitnessQueries = ({
    readDatabaseQuery: () => ({
        queryKey: ['readDatabase'],
        queryFn: async () => (await client.get(`/database/read_schema`)).data,
    }),
    readTableQuery: (schema: any) => ({
        queryKey: ['readTableData'],
        queryFn: async () => (await client.get(`/database/read_db?table=${schema.table}`)).data,
    }),
    writeTableQuery: () => ({
        mutationKey: ['mutateDb'],
        mutationFn: async (data: any) => (await client.post(`/database/write_db?table=${data.table}`, data.data)).data
    }),
    fitnessTablesQuery: () => ({
        queryKey: ['fitnessTables'],
        queryFn: async () => (await client.get(`/api/openfitness/fitness_tables`)).data
    }),
    exercisesQuery: () => ({
        queryKey: ['exercisedb'],
        mutationFn: async (params: any) => (await client.get(`/api/exercises/get-exercises?name=${params.query}`)).data,
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

export { client, paths, fitnessQueries}