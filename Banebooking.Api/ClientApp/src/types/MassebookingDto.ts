export type MassebookingDto = {
    startDato: string;           // yyyy-MM-dd
    sluttDato: string;
    ukedager: string[];          // f.eks. ["Monday", "Wednesday"]
    tidspunkter: string[];       // "08:00"
    baneIder: string[];          // GUIDs
    bookingtype: string;         // "kurs"
    kommentar: string;
};
