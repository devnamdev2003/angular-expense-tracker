/**
 * Interface representing a Song object with various attributes.
 */
export interface Song {
    /** Unique identifier for the song */
    song_id: '';

    /** Name of the song */
    song_name: '';

    /** Type of the song (e.g., song, album) */
    song_type: '';

    /** Release year of the song */
    year: '';

    /** Duration of the song */
    duration: 0;

    /** Record label of the song (e.g., Sony Music Entertainment India Pvt. Ltd.) */
    label: '';

    /** Language of the song */
    language: '';

    /** Copyright information for the song */
    copyright: '';

    /** Name of the album the song belongs to */
    albumName: '';

    /** Comma-separated names of the artists */
    artistName: '';

    /** Array of images associated with the song */
    image: '';

    /** URL to download the song */
    downloadUrl: '';

    /** Comma-separated names of the artists */
    artistNames: SongArtists[];

    /** Array of images associated with the song */
    images: SongImage[];

    /** URL to download the song */
    downloadUrls: SongDownloadUrl[];

    /** Indicates if the song is liked by the user */
    isLiked: boolean;

}

/**
 * Interface representing a download URL with quality and link.
 */
export interface SongDownloadUrl {
    /** Quality of the download (e.g., 96kbps, 320kbps) */
    quality: '';

    /** URL to download the song in the specified quality   */
    url: '';

}

/**
 * Interface representing an image associated with a song.
 */
export interface SongImage {
    /** Quality of the image (e.g., 50x50, 500x500) */
    quality: '';

    /** URL of the image */
    url: '';

}

/**
 * Interface representing song artists.
 */
export interface SongArtists {
    /** Name of the artist */
    "artist_name": ''
}