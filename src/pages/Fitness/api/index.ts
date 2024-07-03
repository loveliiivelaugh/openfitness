import axios from 'axios';


const paths = {
    "appConfig": "/api/appConfig",
    "theme": "/api/theme/themeConfig",
    "content": "/api/cms/content",
    "getCrossPlatformState": "/api/cross-platform",
    "appDepot": (import.meta.env.MODE === "development")
        ? "http://localhost:3000"
        : import.meta.env.VITE_HOME_APP,
    "hostname": (import.meta.env.MODE === "development")
        ? "http://localhost:5001"
        : import.meta.env.VITE_HOSTNAME

};

const client = axios.create({
    baseURL: paths.hostname,
    headers: {},
    // auth: {
    //     username: import.meta.env.VITE_BASIC_AUTH_USERNAME,
    //     password: import.meta.env.VITE_BASIC_AUTH_PASSWORD
    // },
});

type RequestMethods = "get" | "post" | "put" | "patch" | "delete";

type WriteTableReqData = {
    method?: RequestMethods
    table: string
    data: any
}

type SearchQueryReq = {
    query: string
}

const fitnessQueries = ({
    readDatabaseQuery: () => ({
        queryKey: ['readDatabase'],
        queryFn: async () => (await client.get(`/database/read_schema`)).data,
    }),
    readTableQuery: (schema: any) => ({
        queryKey: ['readTableData', schema],
        queryFn: async () => (await client.get(`/database/read_db?table=${schema.table}`)).data,
    }),
    writeTableQuery: () => ({
        mutationKey: ['mutateDb'],
        mutationFn: async (data: WriteTableReqData) => (await client.post(`/database/write_db?table=${data.table}`, data.data)).data
    }),
    updateTableQuery: () => ({
        mutationKey: ['mutateDb'],
        mutationFn: async (data: WriteTableReqData) => (await client.put(`/database/write_db?table=${data.table}`, data.data)).data
    }),
    fitnessTablesQuery: () => ({
        queryKey: ['fitnessTables'],
        queryFn: async () => (await client.get(`/api/openfitness/fitness_tables`)).data
    }),
    exercisesQuery: () => ({
        queryKey: ['exercisedb'],
        mutationFn: async (params: SearchQueryReq) => (await client.get(`/api/openfitness/get-exercises?name=${params.query}`)).data,
        enabled: false
    }),
    foodsQuery: () => ({
        queryKey: ['fooddb'],
        mutationFn: async (params: SearchQueryReq) => {
            console.log('foodsQuery.mutationFn: ', params)
            return (await client.get(`/api/openfitness/get-foods?food=${params.query}`)).data},
        enabled: false
    }),
});

// general app queries
const queries = ({
    appConfigQuery: ({
        queryKey: ['appConfig'],
        queryFn: async () => (await client.get(paths.appConfig)).data
    }),
    getContent: () => ({
        queryKey: ['getContent'],
        queryFn: async () => (await client.get(paths.content)).data
    }),
})

export { client, paths, fitnessQueries, queries }