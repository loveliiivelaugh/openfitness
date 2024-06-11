import { Suspense, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
// import Keycloak from 'keycloak-js';

// import { SmoothScroll } from './theme/SmoothScroll.jsx';
import { KeycloakProvider } from './Keycloak/KeycloakProvider';
import { PageTransitionWrapper, ThemeProvider } from './theme/ThemeProvider';
import { client, paths } from './pages/Fitness/api';
import './index.css'


const queryClient = new QueryClient();

// On Apps First Load
const InitConfigProvider = ({ children }: { children: any }) => {
    // Get Theme Config
    const themeConfigQuery = useQuery(({
        queryKey: ["themeConfig"],
        queryFn: async () => (await client.get(paths.theme)).data,
    }));
    // Get content from CMS
    const contentQuery = useQuery(({
        queryKey: ["content"],
        queryFn: async () => (await client.get(paths.content)).data,
        select: (data) => {
            window.appContent = data ? data : {};
            
            return data;
        }
    }));

    console.log({contentQuery})


    // Set global access to server client
    window.client = client;

    // Initialize Keycloak
    const [keycloakInstance, setKeycloakInstance] = useState(null as any);
    // useEffect(() => {
    //     const instance = new Keycloak(JSON.parse(import.meta.env.VITE_KEYCLOAK_CONFIG));
    //     setKeycloakInstance(instance);
    // }, []);

    return ({
        pending: "Uninitialized...",
        loading: "Loading App Theme Configuration...",
        success: children(themeConfigQuery.data, keycloakInstance),
        error: "Something went wrong..."
    }[themeConfigQuery.status]);
};


export const Providers = ({ children }: { children: any }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <Suspense fallback="Loading App Configuration...">
                <InitConfigProvider>
                    {(themeConfig: any, keycloakInstance: any | null) => (
                        <ThemeProvider themeConfig={themeConfig}>
                            <PageTransitionWrapper>
                                {/* <SmoothScroll></SmoothScroll> */}
                                    {children}
                                {/* <KeycloakProvider keycloakInstance={keycloakInstance}>
                                </KeycloakProvider> */}
                            </PageTransitionWrapper>
                        </ThemeProvider>
                    )}
                </InitConfigProvider>
            </Suspense>
        </QueryClientProvider>
    )
}