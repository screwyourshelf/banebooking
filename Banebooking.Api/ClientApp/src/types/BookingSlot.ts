export type BookingSlot = {
    startTid: string;
    sluttTid: string;
    booketAv?: string | null;
    kanBookes: boolean;
    kanAvbestille: boolean;
    kanSlette: boolean;
    kanRapportereFravaer: boolean;

    vææSymbol?: string;
    temperatur?: number;
    vind?: number;
};
