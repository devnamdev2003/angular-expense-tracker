import { Component, signal, effect, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaavnService } from '../../service/saavan-api/saavan.service';
import { ConfigService } from '../../service/config/config.service';
import { UserLikedSongsService } from '../../service/localStorage/user-liked-song.service';
import { NgZone } from '@angular/core';

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
  isCurrentSongLiked: boolean = false;
  showPlayerModal = false;
  likedPlaylist: any[] = [];
  currentLikedIndex = -1;
  repeatCurrentSong = false;
  year: number = new Date().getFullYear();


  @ViewChild('searchSongInput') searchSongInput!: ElementRef;

  constructor(
    private saavnService: SaavnService,
    private configService: ConfigService,
    private userLikedSongsService: UserLikedSongsService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.appVersion = this.configService.getVersion();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  searchSong(): void {
    this.removeFocus();
    const q = this.query.trim();
    if (q) {
      this.saavnService.searchSongs(q).subscribe((res: any) => {
        this.songs.set(res.data.results || []);
      });
    }
  }

  getSongUrl(song: any): string {
    return song.downloadUrl?.find((d: any) => d.quality === '320kbps')?.url || song.downloadUrl?.[0]?.url || '';
  }

  playSong(url: string, song: any, isbuttonClick: boolean = false): void {
    if (!this.isBrowser) return;
    this.removeFocus();
    if (!this.audio) this.audio = new Audio();

    if (this.currentSong?.url === url) {
      if (isbuttonClick) {
        this.audio.paused ? this.audio.play() : this.audio.pause();
      } else {
        this.audio.play();
      }
    } else {
      this.audio.src = url;
      this.audio.play();
      this.likedPlaylist = this.userLikedSongsService.getAll() || [];

      this.currentLikedIndex = this.likedPlaylist.findIndex(
        s => s.song_id === song.id
      );

      this.isCurrentSongLiked = this.currentLikedIndex !== -1;
      this.currentSong = { ...song, url };
      this.duration.set(song.duration);
    }

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.audio) this.progress.set(this.audio.currentTime);
    }, 500);

    this.audio.onended = () => {
      this.ngZone.run(() => {
        this.onSongFinished();
      });
    };
  }

  onSongFinished(): void {
    if (!this.isBrowser) return;
    if (this.repeatCurrentSong && this.currentSong?.url) {
      this.playSong(this.currentSong.url, this.currentSong);
      return;
    }
    this.likedPlaylist = this.userLikedSongsService.getAll() || [];

    if (!this.likedPlaylist.length) return;

    // If song wasn't from playlist, start from 0
    if (this.currentLikedIndex === -1) {
      this.currentLikedIndex = 0;
    } else {
      // Loop safely using modulo
      this.currentLikedIndex =
        (this.currentLikedIndex + 1) % this.likedPlaylist.length;
    }

    const nextSong = this.likedPlaylist[this.currentLikedIndex];

    // 🚀 BEST: Use saved downloadUrl (no API call needed)
    if (nextSong.downloadUrl) {
      this.playSong(nextSong.downloadUrl, {
        id: nextSong.song_id,
        name: nextSong.song_name,
        duration: nextSong.duration,
        image: [{}, {}, { url: nextSong.image }],
        artists: { primary: [{ name: nextSong.artistName }] }
      });
      return;
    }

    // Fallback to search if URL missing
    const songName = nextSong.song_name || '';
    const artistName = nextSong.artistName || '';

    this.saavnService.searchSongs(`${songName} ${artistName}`).subscribe({
      next: (res: any) => {
        const results = res.data?.results || [];
        if (!results.length) return;

        const firstSong = results[0];
        const url = this.getSongUrl(firstSong);

        this.playSong(url, firstSong);
      }
    });

    this.progress.set(0);
    clearInterval(this.interval);
  }

  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  // Calculate percentage for dynamic progress bar filling
  get progressPercent(): number {
    const d = this.duration();
    if (!d) return 0;
    return (this.progress() / d) * 100;
  }

  onSeek(event: Event): void {
    if (!this.isBrowser || !this.audio) return;
    const target = event.target as HTMLInputElement;
    const seekTime = Number(target.value);
    this.audio.currentTime = seekTime;
    this.progress.set(seekTime);
  }

  onSeekMini(event: MouseEvent): void {
    if (!this.isBrowser || !this.audio) return;
    const target = event.currentTarget as HTMLElement;
    const clickX = event.offsetX;
    const width = target.clientWidth;
    const percentage = clickX / width;
    const seekTime = percentage * this.duration();
    this.audio.currentTime = seekTime;
    this.progress.set(seekTime);
  }

  transformSongData(data: any, isLiked: boolean): any {
    return {
      name: data.name,
      type: data.type,
      year: data.year,
      duration: data.duration,
      label: data.label,
      language: data.language,
      copyright: data.copyright,
      album: { name: data.album?.name || '' },
      artists: {
        all: (data.artists?.primary || []).map((a: any) => ({ name: a.name }))
      },
      isLiked: isLiked
    };
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }

  toggleLike() {
    this.removeFocus();
    if (this.isCurrentSongLiked) {
      this.userLikedSongsService.delete(this.currentSong.id);
      this
      this.isCurrentSongLiked = false;
    } else {
      this.userLikedSongsService.add(this.transformSongDataForAPI(this.currentSong));
      this.isCurrentSongLiked = true;
    }
    this.updateLikedSongList();

  }

  transformSongDataForAPI(data: any): any {
    return {
      song_id: data.id,
      song_name: data.name,
      song_type: data.type,
      year: data.year,
      duration: data.duration,
      label: data.label,
      language: data.language,
      copyright: data.copyright,
      albumName: new Date().toISOString(),
      artistName: data.artists?.primary?.[0]?.name,
      image: data.image?.[2]?.url,
      downloadUrl: this.getSongUrl(data),
      isLiked: true,
    }
  }

  isSongLiked(): boolean {
    return this.isCurrentSongLiked;
  }

  async downloadSong(song: any) {
    if (!song?.url) return;
    this.removeFocus();

    try {
      const res = await fetch(song.url);
      if (!res.ok) throw new Error('Failed to fetch song');

      const blob = await res.blob();
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

  openPlayerModal() {
    this.removeFocus();
    this.showPlayerModal = true;
  }

  closePlayerModal() {
    this.removeFocus();
    this.showPlayerModal = false;
  }

  restartSong() {
    this.removeFocus();
    if (this.audio) {
      this.audio.currentTime = 0;
      if (this.audio.paused) {
        this.audio.play();
      }
    }
  }

  nextSong() {
    this.onSongFinished();
  }

  removeFocus() {
    this.searchSongInput?.nativeElement?.blur();
  }

  showLikedSongs() {
    this.removeFocus();
    this.updateLikedSongList();
  }

  updateLikedSongList() {
    const liked = this.userLikedSongsService.getAll() || [];
    const mappedSongs = liked.map(song => ({
      id: song.song_id,
      name: song.song_name,
      duration: song.duration,
      image: [{}, {}, { url: song.image }],
      artists: { primary: [{ name: song.artistName }] },
      downloadUrl: [{ quality: '320kbps', url: song.downloadUrl }]
    }));

    this.songs.set(mappedSongs);
  }
}
