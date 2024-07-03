import { useEffect, useState } from "react";
import { useFitnessStore, useSupabaseStore } from "../store";
import { useCrossPlatformQueryParams } from "./useCpxQueryParams";
import { client, paths } from "../pages/Fitness/api";


export const CrossPlatformProvider = ({ children }: { children: any }) => {
    const supabaseStore = useSupabaseStore();
    const fitnessStore = useFitnessStore();
    const { 
        crossPlatformStateId, 
        // isCrossPlatform 
    } = useCrossPlatformQueryParams();

    const [isLoading, setIsLoading] = useState(true);

    // This seems to run twice?
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                
                const crossPlatformQuery = (await client.get(paths.getCrossPlatformState)).data
                
                const crossPlatformData = crossPlatformStateId
                    ? crossPlatformQuery.find((session: any) => (session.id == crossPlatformStateId))
                    : null;
                
                // (window as any).crossPlatformState = crossPlatformData;
                
                // console.log({ 
                //     crossPlatformStateId,
                //     crossPlatformQuery,
                //     crossPlatformData, 
                //     isCrossPlatform, 
                // });

                supabaseStore.setCpxData(crossPlatformData);

                const result = await client.delete(paths.getCrossPlatformState + `?id=${crossPlatformStateId}`);

                console.log("delete last cpx entry after retrieval: ", result);

                // Need to move this AppConfig stuff out of here
                const appConfigQuery = (await client.get(paths.appConfig)).data
                // console.log({ appConfigQuery });
                fitnessStore.setAppConfig(appConfigQuery);

            } catch (error) {
                
                console.error(error, "Error in CrossPlatformProvider");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return isLoading 
        ? "Loading..." 
        : children;
};