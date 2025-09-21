import { Component, signal, effect, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaavnService } from '../../service/saavan-api/saavan.service';
import { ConfigService } from '../../service/config/config.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.css']
})
export class MusicComponent implements OnDestroy {
  query = '';
  songs = signal<any[]>([]);
  audio: HTMLAudioElement | null = null;
  currentSong: any = null;
  progress = signal(0);
  duration = signal(0);
  interval: any = null;
  appVersion: string;
  isBrowser: boolean;

  constructor(
    private saavnService: SaavnService,
    private configService: ConfigService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.appVersion = this.configService.getVersion();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  searchSong() {
    const q = this.query.trim();
    if (q) {
      this.saavnService.searchSongs(q).subscribe((res) => {
        this.songs.set(res.data.results || []);
      });
    }
  }

  getSongUrl(song: any): string {
    return song.downloadUrl?.find((d: any) => d.quality === '320kbps')?.url || '';
  }

  playSong(url: string, song: any) {
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

  async onSongFinished() {
    if (!this.isBrowser) return;
    try {
      const transformedData = this.transformSongData(this.currentSong);
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
    }
  }

  formatTime(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  onSeek(event: Event) {
    if (!this.isBrowser || !this.audio) return;
    const target = event.target as HTMLInputElement;
    const seekTime = Number(target.value);
    this.audio.currentTime = seekTime;
    this.progress.set(seekTime);
  }

  transformSongData(data: any) {
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
      }
    };
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }
}
