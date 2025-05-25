import { Component, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaavnService } from '../../service/saavan-api/saavan.service';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music.component.html',
  styleUrl: './music.component.css'
})
export class MusicComponent implements OnDestroy {
  query = '';
  songs = signal<any[]>([]);
  audio = new Audio();
  currentSong: any = null;
  progress = signal(0);
  duration = signal(0);
  interval: any = null;

  constructor(private saavnService: SaavnService) { }

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
    if (!this.audio) {
      this.audio = new Audio();
    }

    if (this.currentSong?.url === url) {
      if (this.audio.paused) {
        this.audio.play();
      } else {
        this.audio.pause();
      }
    } else {
      this.audio.src = url;
      this.audio.play();
      this.currentSong = { ...song, url };
      this.duration.set(song.duration);
    }

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.audio) {
        this.progress.set(this.audio.currentTime);
      }
    }, 500);

    this.audio.onended = () => {
      this.currentSong = null;
      this.progress.set(0);
      clearInterval(this.interval);
    };
  }

  formatTime(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  onSeek(event: Event) {
    const target = event.target as HTMLInputElement;
    const seekTime = Number(target.value);
    if (this.audio) {
      this.audio.currentTime = seekTime;
      this.progress.set(seekTime);
    }
  }


}
