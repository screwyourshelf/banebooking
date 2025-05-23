export type KlubbDetaljer = {
    slug: string;
    navn: string;
    kontaktEpost?: string;
    banereglement?: string;
    bookingRegel: {
        maksPerDag: number;
        maksTotalt: number;
        dagerFremITid: number;
        slotLengdeMinutter: number;
    };
};
