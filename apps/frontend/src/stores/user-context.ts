import { create } from 'zustand';

export type UserRole = 'director' | 'engineer' | 'buyer' | 'default';

interface UserState {
    role: UserRole;
    setRole: (role: UserRole) => void;
}

export const useUserContext = create<UserState>((set) => ({
    role: 'default',
    setRole: (role) => set({ role }),
}));
