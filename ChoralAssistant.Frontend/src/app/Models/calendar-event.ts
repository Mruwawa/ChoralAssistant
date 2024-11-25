export interface CalendarEvent {
    title: string;
    description: string;
    start: string;
    end: string;
    location: string;
    pieces: {
        id: string,
        title: string
    }[];
    id?: string;
}