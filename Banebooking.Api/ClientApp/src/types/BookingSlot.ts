export type BookingSlot = {
    baneId: string;
    baneNavn: string;
    dato: string;
    startTid: string;
    sluttTid: string;
    booketAv?: string | null;
    kanBookes: boolean;
    kanAvbestille: boolean;
    kanSlette: boolean;
    erPassert: boolean;

    bookingtype?: string;
    kommentar?: string;

    værSymbol?: string;
    temperatur?: number;
    vind?: number;
};
