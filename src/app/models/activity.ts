import { Profile } from "./profile";

export interface Activity {
  id: string;
  title: string;
  date: string | null;
  description: string;
  category: string;
  city: string;
  venue: string;
  hostUsername: string;
  isCancelled: boolean;
  isGoing: boolean;
  isHost: boolean;
  host?: Profile;
  attendees: Profile[];
}

export interface ActivityFormValues {
  id?: string;
  title: string;
  category: string;
  description: string;
  date: string | null;
  city: string;
  venue: string;
}
