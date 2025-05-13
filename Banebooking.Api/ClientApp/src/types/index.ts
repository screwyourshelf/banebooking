export type Bane = {
    id: string;
    navn: string;
};

export type BookingSlot = {
    startTid: string;
    sluttTid: string;
    booketAv?: string | null;
};