import { Suspense } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
// import Keycloak from 'keycloak-js';

// import { SmoothScroll } from './theme/SmoothScroll.jsx';
// import { KeycloakProvider } from './Keycloak/KeycloakProvider';
import { SupabaseAuthProvider } from './Auth/Auth';
import { PageTransitionWrapper, ThemeProvider } from './theme/ThemeProvider';
import { client, paths } from './pages/Fitness/api';
import './index.css'

import { ReactNode } from 'react';


const queryClient = new QueryClient();

// On Apps First Load
const InitConfigProvider = ({ children, session }: { children: any, session: any }) => {
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
            (window as any).appContent = data ? data : {};
            
            return data;
        }
    }));

    console.log({ contentQuery });

    (client as any).defaults.headers.common["auth-token"] = `userAuthToken=${session?.access_token}&appId=${import.meta.env.VITE_APP_ID}`;

    // // Set global access to server client
    // (window as any).client = client;

    // Initialize Keycloak
    // const [keycloakInstance, setKeycloakInstance] = useState(null as any);
    // useEffect(() => {
    //     const instance = new Keycloak(JSON.parse(import.meta.env.VITE_KEYCLOAK_CONFIG));
    //     setKeycloakInstance(instance);
    // }, []);

    return ({
        pending: "Uninitialized...",
        loading: "Loading App Theme Configuration...",
        success: children(themeConfigQuery.data),
        error: "Something went wrong..."
    }[themeConfigQuery.status]);
};


export const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <SupabaseAuthProvider>
            {(session: any) => (
                <QueryClientProvider client={queryClient}>
                    <Suspense fallback="Loading App Configuration...">
                        <InitConfigProvider session={session}>
                            {(themeConfig: any) => (
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
            )}
        </SupabaseAuthProvider>
    )
}