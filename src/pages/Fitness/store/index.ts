import { create } from 'zustand';

// Define the types for the state and actions
interface FitnessStoreState {
  userID: string | null;
  isDrawerOpen: boolean;
  activeDrawer: string;
  drawerAnchor: 'left' | 'right' | 'bottom';
  selectedSearchItem: any; // Replace `any` with the actual type if known
  profile: Record<string, any>; // Define a more specific type if available
  fitnessTables: Record<string, any>; // Define a more specific type if available
  setProfile: (profile: Record<string, any>) => void;
  setFitnessTables: (fitnessTables: Record<string, any>) => void;
  toggleDrawer: (options?: { open?: boolean; anchor?: 'left' | 'right' | 'bottom'  }) => void;
  setActiveDrawer: (activeDrawer: string) => void;
  setSelectedSearchItem: (selectedSearchItem: any) => void; // Replace `any` with the actual type if known
}

export const useFitnessStore = create<FitnessStoreState>((set) => ({
  // states
  userID: null,
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
    isDrawerOpen: (options?.open !== undefined) ? options.open : !state.isDrawerOpen,
    drawerAnchor: (options?.anchor || state.drawerAnchor) 
  })),
  setActiveDrawer: (activeDrawer) => set(() => ({ activeDrawer })),
  setSelectedSearchItem: (selectedSearchItem) => set(() => ({ selectedSearchItem })),
}));
