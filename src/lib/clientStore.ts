import { create } from 'zustand';

type Client = {
    id: string;
    name: string;
    color: string;
    icon: string;
    active: boolean;
    company?: string;
    industry?: string;
};

interface ClientState {
    clients: Client[];
    activeContext: string;
    loaded: boolean;
    setActiveContext: (id: string) => void;
    fetchClients: () => Promise<void>;
}

export const useClientStore = create<ClientState>((set) => ({
    clients: [],
    activeContext: 'platform', // 'platform' or client UUID
    loaded: false,
    setActiveContext: (id) => set({ activeContext: id }),
    fetchClients: async () => {
        try {
            const res = await fetch('/api/clients');
            if (res.ok) {
                const data = await res.json();
                set({ clients: data, loaded: true });
            } else {
                set({ loaded: true });
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            set({ loaded: true });
        }
    }
}));
