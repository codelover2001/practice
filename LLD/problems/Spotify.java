import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Queue;
import java.util.LinkedList;

/*
 * DESIGN: SPOTIFY (hard)
 * =======================
 *
 * WHAT IT DOES:
 *   - Users can browse/search songs, albums, artists
 *   - Create and manage playlists
 *   - Play songs with queue management (play, pause, next, previous, shuffle)
 *   - Subscription tiers: FREE (with ads) and PREMIUM (no ads, offline)
 *
 * NOUNS: User, Song, Album, Artist, Playlist, MusicPlayer, Subscription
 * VERBS: play(), pause(), next(), previous(), shuffle(), createPlaylist(),
 *        addToPlaylist(), search(), subscribe()
 *
 * PATTERNS USED:
 *   - Strategy → different play modes (sequential, shuffle, repeat-one, repeat-all)
 *   - Observer → notify when song changes (update UI, scrobble)
 *   - State → player states (PLAYING, PAUSED, STOPPED)
 *   - Factory → create subscription tiers
 *
 * SIMPLIFY FOR PRACTICE — Focus on:
 *   1. Song, Album, Artist data model
 *   2. Playlist management (create, add, remove, reorder)
 *   3. Music player with queue (play, pause, next, previous)
 *   4. Play modes (sequential, shuffle, repeat)
 *   Skip: subscription, ads, offline, recommendations
 *
 * CLASSES TO BUILD:
 *   1. Artist — id, name, List<Album>
 *   2. Album — id, title, artist, List<Song>, releaseYear
 *   3. Song — id, title, artist, album, durationSeconds
 *   4. Playlist — id, name, owner, List<Song>
 *   5. PlayMode (interface/strategy) — getNextSong(List<Song>, currentIndex)
 *   6. SequentialMode, ShuffleMode, RepeatOneMode — concrete modes
 *   7. MusicPlayer — currentSong, queue, playMode, state (PLAYING/PAUSED/STOPPED)
 *   8. SpotifyService — manages library, playlists, player, search
 *
 * API:
 *   service.createPlaylist("alice", "Road Trip")
 *   service.addToPlaylist(playlistId, songId)
 *   service.play(playlistId)  → starts playing first song
 *   service.next()            → plays next song based on play mode
 *   service.setPlayMode(new ShuffleMode())
 *   service.next()            → plays random song
 *   service.search("bohemian") → returns matching songs
 */

// YOUR CODE HERE — build step by step

public class Spotify {
    public static void main(String[] args) {
        // TODO: Create artists, albums, songs
        // TODO: Create playlist, add songs
        // TODO: Play playlist in sequential mode
        // TODO: next(), next() — track which songs play
        // TODO: Switch to shuffle mode, next() — random song
        // TODO: Search by song title
        System.out.println("Spotify - implement me!");
    }
}
