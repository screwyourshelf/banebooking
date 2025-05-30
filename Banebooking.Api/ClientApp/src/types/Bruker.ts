import type { BookingSlot } from '../types/index.js'; 

export type Bruker = {
    id: string;
    epost: string;
    bookinger: BookingSlot[]; 
};
