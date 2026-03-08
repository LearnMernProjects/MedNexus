import { createContext } from 'react';

export const UserDetailContext = createContext<{
  _id?: string;
  name: string;
  email: string;
  imageUrl: string;
  token: number;
  clerkUserId?: string;
} | null>(null);