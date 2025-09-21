import { Component, signal, effect, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaavnService } from '../../service/saavan-api/saavan.service';
import { ConfigService } from '../../service/config/config.service';
import { isPlatformBrowser } from '@angular/common';

/**
 * Component to search, play, and suggest songs using Saavn API and AI suggestions.
 *
 * Features:
 * - Search for songs by query.
 * - Play, pause, and track song progress.
 * - Automatically suggest next song based on AI suggestion.
 * - Handles time formatting and seeking within a song.
 */
@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.css']
})
export class MusicComponent implements OnDestroy {

  /** Current search query for songs */
  query = '';

  /** List of songs retrieved from search results */
  songs = signal<any[]>([]);

  /** HTML audio element for playing songs */
  audio: HTMLAudioElement | null = null;

  /** Currently playing song object */
  currentSong: any = null;

  /** Progress of the current song in seconds */
  progress = signal(0);

  /** Total duration of the current song in seconds */
  duration = signal(0);

  /** Interval ID for updating song progress */
  interval: any = null;

  /** Current application version */
  appVersion: string;

  /** Flag to indicate if running in browser environment */
  isBrowser: boolean;

  /** Set to store URLs of liked songs */
  isCurrentSongLiked: boolean = false;

  /**
   * Creates an instance of MusicComponent.
   *
   * @param saavnService Service to interact with Saavn API.
   * @param configService Service to retrieve application configuration.
   * @param platformId Angular platform ID to detect browser/server environment.
   */
  constructor(
    private saavnService: SaavnService,
    private configService: ConfigService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.appVersion = this.configService.getVersion();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Searches for songs based on the current query.
   */
  searchSong(): void {
    const q = this.query.trim();
    if (q) {
      this.saavnService.searchSongs(q).subscribe((res) => {
        this.songs.set(res.data.results || []);
      });
    }
  }

  /**
   * Returns the highest quality 320kbps download URL of a song.
   *
   * @param song Song object
   * @returns URL string or empty string if not available
   */
  getSongUrl(song: any): string {
    return song.downloadUrl?.find((d: any) => d.quality === '320kbps')?.url || '';
  }

  /**
   * Plays or pauses a song. If a new song is selected, plays it from the beginning.
   *
   * @param url URL of the song to play
   * @param song Song object
   */
  playSong(url: string, song: any): void {
    if (!this.isBrowser) return;
    if (!this.audio) this.audio = new Audio();

    if (this.currentSong?.url === url) {
      this.audio.paused ? this.audio.play() : this.audio.pause();
    } else {
      this.audio.src = url;
      this.audio.play();
      this.currentSong = { ...song, url };
      this.duration.set(song.duration);
    }

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.audio) this.progress.set(this.audio.currentTime);
    }, 500);

    this.audio.onended = () => this.onSongFinished();
  }

  /**
   * Handles the end of a song. Suggests the next song using AI and automatically plays it.
   */
  async onSongFinished(): Promise<void> {
    if (!this.isBrowser) return;
    try {
      const transformedData = this.transformSongData(this.currentSong, this.isCurrentSongLiked);
      const nextSong = await this.saavnService.suggestNextSong(transformedData);

      if (!nextSong || typeof nextSong !== 'string' || nextSong.trim() === '') return;

      let cleanedSong = nextSong.trim()
        .replace(/^```json/, '').replace(/^```/, '')
        .replace(/```$/, '').trim();

      let songDetails: { songName: string; artistsName: string };
      try {
        songDetails = JSON.parse(cleanedSong);
      } catch {
        console.warn('Failed to parse AI response as JSON');
        return;
      }

      const { songName, artistsName } = songDetails || {};
      const mainArtist = artistsName ? artistsName.split(',')[0].trim() : '';
      if (!songName || !mainArtist) return;

      this.saavnService.searchSongs(`${songName} ${mainArtist}`).subscribe({
        next: (res) => {
          const results = res.data?.results || [];
          if (results.length > 0) {
            const firstSong = results[0];
            const newUrl = this.getSongUrl(firstSong);
            this.playSong(newUrl, firstSong);
          }
        },
        error: (err) => console.error('Error during song search:', err)
      });
    } finally {
      this.currentSong = null;
      this.progress.set(0);
      clearInterval(this.interval);
      this.isCurrentSongLiked = false;
    }
  }

  /**
   * Formats seconds into MM:SS string for display.
   *
   * @param seconds Number of seconds
   * @returns Formatted time string
   */
  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  /**
   * Seeks the audio playback to a specific time.
   *
   * @param event Input change event from the seek bar
   */
  onSeek(event: Event): void {
    if (!this.isBrowser || !this.audio) return;
    const target = event.target as HTMLInputElement;
    const seekTime = Number(target.value);
    this.audio.currentTime = seekTime;
    this.progress.set(seekTime);
  }

  /**
   * Transforms a song object to the expected format for AI suggestion.
   *
   * @param data Original song object
   * @returns Transformed object with relevant song metadata
   */
  transformSongData(data: any, isLiked: boolean): any {
    return {
      name: data.name,
      type: data.type,
      year: data.year,
      duration: data.duration,
      label: data.label,
      playCount: data.playCount,
      language: data.language,
      copyright: data.copyright,
      album: { name: data.album?.name || '' },
      artists: {
        all: (data.artists?.primary || []).map((a: any) => ({ name: a.name }))
      },
      isLiked: isLiked
    };
  }

  /** Angular lifecycle hook called on component destruction */
  ngOnDestroy(): void {
    clearInterval(this.interval);
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }

  /** Toggles the like status of a song */
  toggleLike() {
    if (this.isCurrentSongLiked) {
      this.isCurrentSongLiked = false;
    } else {
      this.isCurrentSongLiked = true;
    }
  }

  /** Checks if a song is liked */
  isLiked(): boolean {
    return this.isCurrentSongLiked;
  }

  /** Downloads a song */
  async downloadSong(song: any) {
    if (!song?.url) return;

    try {
      const res = await fetch(song.url);
      if (!res.ok) throw new Error('Failed to fetch song');

      const blob = await res.blob(); // Convert response to Blob
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${song.name || 'song'}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error('Download failed:', err);
    }
  }
}
