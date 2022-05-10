import fetch, { Headers } from 'node-fetch';
import { CreateSpotifyPlaylistBody } from './types/CreateSpotifyPlaylistBody';
import { SpotifyPlaylist } from './types/SpotifyPlaylist';
import { SpotifyResponse } from './types/SpotifyResponse';
import { SpotifyTrack } from './types/SpotifyTrack';
import { SpotifyUserProfile } from './types/SpotifyUserProfile';
import { SpotifyUserTrack } from './types/SpotifyUserTrack';
import { UpdateSpotifyPlaylistBody } from './types/UpdateSpotifyPlaylistBody';

const headers = new Headers();
headers.append('Authorization', `Bearer ${process.env.ACCESS_TOKEN}`);

const getCurrentUser = async (): Promise<SpotifyUserProfile> => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers,
  });

  const user: SpotifyUserProfile = await response.json();
  return user;
};

const getLikedSongs = async (): Promise<SpotifyTrack[]> => {
  const response = await fetch(
    `https://api.spotify.com/v1/me/tracks?limit=${process.env.SONG_COUNT}`,
    {
      method: 'GET',
      headers,
    },
  );

  const tracks: SpotifyResponse<SpotifyUserTrack> = await response.json();
  return tracks.items.map(({ track }) => track);
};

const getFreshOnRepeatPlaylistId = async (): Promise<string | undefined> => {
  let currentUrl: string | null = 'https://api.spotify.com/v1/me/playlists';

  while (currentUrl !== null) {
    const response = await fetch(currentUrl, {
      method: 'GET',
      headers,
    });

    const playlists: SpotifyResponse<SpotifyPlaylist> = await response.json();
    const freshOnRepeatPlaylist = playlists.items.find(
      (playlist) => playlist.name.toLowerCase() === 'fresh on repeat',
    );

    if (!freshOnRepeatPlaylist) {
      currentUrl = playlists.next;
    } else {
      return freshOnRepeatPlaylist.id;
    }
  }
};

const createFreshOnRepeatPlaylist = async (userId: string): Promise<string> => {
  const body: CreateSpotifyPlaylistBody = {
    name: 'Fresh On Repeat',
    public: false,
    collaborative: false,
    description:
      'The last songs you liked, download them and listen on the plane',
  };

  const response = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    },
  );

  const playlist: SpotifyPlaylist = await response.json();
  return playlist.id;
};

const refreshFreshOnRepeatPlaylist = async (
  playlistId: string,
  likedSongsIds: string[],
): Promise<void> => {
  const body: UpdateSpotifyPlaylistBody = {
    uris: likedSongsIds,
  };

  await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
};

(async () => {
  const user = await getCurrentUser();
  console.log(`Hello ${user.display_name}`);

  console.log(`Fetching the last ${process.env.SONG_COUNT} songs you liked...`);

  const likedSongs = await getLikedSongs();
  console.log(
    'likedSongs',
    likedSongs.map((track) => track.name),
  );

  console.log('Attempting to fetch Fresh On Repeat playlist...');
  let freshOnRepeatPlaylistId = await getFreshOnRepeatPlaylistId();

  if (!freshOnRepeatPlaylistId) {
    console.log('Fresh On Repeat playlist does not exist, creating...');
    freshOnRepeatPlaylistId = await createFreshOnRepeatPlaylist(user.id);
  }

  console.log('Refreshing your playlist');
  await refreshFreshOnRepeatPlaylist(
    freshOnRepeatPlaylistId,
    likedSongs.map((track) => track.uri),
  );

  console.log('Enjoy your fresh playlist!');
})();
