import { create } from 'zustand'

export const useFitnessStore = create((set) => ({
    // states
    userID: "90aeb288-01fe-43ef-b536-c202a3176a78",
    isDrawerOpen: false,
    activeDrawer: "weight",
    drawerAnchor: "right",
    selectedSearchItem: null,

    // Deprecated profile 
    profile: {},
    setProfile: (profile) => set(() => ({ profile })),

    // profile lives in fitnessTables
    fitnessTables: {},
    setFitnessTables: (fitnessTables) => set(() => ({ fitnessTables })),

    // actions
    toggleDrawer: (options) => set((state) => ({ 
        isDrawerOpen: options?.open ? options.open : !state.isDrawerOpen, 
        drawerAnchor: options?.anchor ? options.anchor : "right" 
    })),
    setActiveDrawer: (activeDrawer) => set(() => ({ activeDrawer })),
    setSelectedSearchItem: (selectedSearchItem) => set(() => ({ selectedSearchItem })),
}));

// docker run -p 3000:3000 --mount type=volume,src=53f3389d9c51747d807dbd4a6e5f4f8c982eacab83770667d7dfbbcd5dbf9d74,target=/etc/openfitness -v "$(pwd):/app" -v /app/node_modules openfitness