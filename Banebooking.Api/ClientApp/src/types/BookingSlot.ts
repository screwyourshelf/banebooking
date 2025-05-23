export type BookingSlot = {
    baneNavn: string;
    startTid: string;
    sluttTid: string;
    booketAv?: string | null;
    kanBookes: boolean;
    kanAvbestille: boolean;
    kanSlette: boolean;
    erPassert: boolean;

    værSymbol?: string;
    temperatur?: number;
    vind?: number;
};
