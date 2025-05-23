import type { BookingSlot } from '../types'; 

export type Bruker = {
    id: string;
    epost: string;
    bookinger: BookingSlot[]; 
};
