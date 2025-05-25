export type OppdaterKlubb = {
    navn: string;
    kontaktEpost: string;
    banereglement: string;
    latitude: number;
    longitude: number;
    bookingRegel: {
        maksPerDag: number;
        maksTotalt: number;
        dagerFremITid: number;
        slotLengdeMinutter: number;
    };
};
