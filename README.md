# Fresh On Repeat

Easily have this CLI create a playlist with the last songs you liked on Spotify, ideal if you're going on a plane ride and you need to download them real quick.

## How to use

1. Get an access token with the following permissions:

* user-read-private
* user-read-email
* playlist-read-private
* playlist-modify-private
* user-library-read

### Tip

Clone the [`web-api-auth-examples`](https://github.com/spotify/web-api-auth-examples) repository and use the `authorization_code` project to get the access token. Change the requested permissions in line 49 of `app.js`.

2. Setup a `.env` file

```
ACCESS_TOKEN=<paste_yours_here>
SONG_COUNT=50
```

`SONG_COUNT` is the number of songs that will be included in the playlist. Given the way this is coded and the way the Spotify API is made this number has to be <= 50.

3. Install dependencies and run the script

```
yarn
yarn start
```
