// Norsk ukedagsrekkefølge
export const ukedager = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

// Mapping fra norsk kortform til DayOfWeek-verdi som backend forventer
export const dagNavnTilEnum: Record<string, string> = {
    Man: 'Monday',
    Tir: 'Tuesday',
    Ons: 'Wednesday',
    Tor: 'Thursday',
    Fre: 'Friday',
    Lør: 'Saturday',
    Søn: 'Sunday'
};

// Hvis du trenger motsatt vei i fremtiden
export const enumTilDagNavn: Record<string, string> = {
    Monday: 'Man',
    Tuesday: 'Tir',
    Wednesday: 'Ons',
    Thursday: 'Tor',
    Friday: 'Fre',
    Saturday: 'Lør',
    Sunday: 'Søn'
};