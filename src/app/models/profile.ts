export interface Profile {
  username: string;
  displayName: string;
  image?: string;
  followersCount: number;
  followingCount: number;
  following: boolean;
  bio?: string;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  isMain: boolean;
}

export interface UserActivity {
  id: string;
  title: string;
  category: string;
  date: string;
}
