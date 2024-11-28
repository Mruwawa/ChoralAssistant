export interface CalendarEvent {
    title: string;
    description: string;
    start: string;
    end: string;
    location: string;
    pieces: {
        id: number,
        title: string
    }[];
    id?: string;
}