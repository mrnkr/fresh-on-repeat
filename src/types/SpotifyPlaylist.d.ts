export interface SpotifyPlaylist {
  id: string;
  collaborative: boolean;
  description: string;
  external_urls: any[];
  href: string;
  images: any[];
  name: string;
  owner: any[];
  primary_color: string | null;
  public: boolean;
  snapshot_id: string;
  tracks: any[];
  type: 'playlist';
  uri: string;
}
