export interface Event {
  capacity: number;
  date: { end: unknown; start: unknown };
  description: string;
  id: string;
  image: string;
  location: { name: string; geolocation: unknown };
  name: string;
}
