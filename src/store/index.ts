import { create } from 'zustand';

// *** APP STORE ***

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
  toggleDrawer: (options?: { open?: boolean; anchor?: 'left' | 'right' | 'bottom'  } | boolean | null) => void;
  setActiveDrawer: (activeDrawer: string) => void;
  setSelectedSearchItem: (selectedSearchItem: any) => void; // Replace `any` with the actual type if known
}

const useFitnessStore = create<FitnessStoreState>((set) => ({
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
    isDrawerOpen: ((options as any)?.open !== undefined) ? (options as any).open : !state.isDrawerOpen,
    drawerAnchor: ((options as any)?.anchor || state.drawerAnchor) 
  })),
  setActiveDrawer: (activeDrawer) => set(() => ({ activeDrawer })),
  setSelectedSearchItem: (selectedSearchItem) => set(() => ({ selectedSearchItem })),
}));


// *** SUPABASE STORE ***

interface SupabaseUser {
  id: string;
  email: string;
  app_metadata: {
      provider: string;
  };
  user_metadata: {
      name: string;
  };
}

interface SupabaseSession {
  access_token: string;
  token_type: string;
  user: SupabaseUser;
}

interface SupabaseStore {
  session: SupabaseSession | null;
  setSession: (session: SupabaseSession | null) => void;
}

const useSupabaseStore = create<SupabaseStore>((set) => ({
  // states
  session: null,
  // actions
  setSession: (session: any) => set({ session }),
}));


export { useSupabaseStore, useFitnessStore };
