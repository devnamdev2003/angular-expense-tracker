import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaavnService } from '../../service/saavan-api/saavan.service';

@Component({
  selector: 'app-music',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './music.component.html',
  styleUrl: './music.component.css'
})
export class MusicComponent {
  query = ''; // Normal string for template binding
  songs = signal<any[]>([]);
  audio = new Audio();
  currentPlaying: string | null = null;

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

  playSong(url: string) {
    if (this.currentPlaying === url) {
      this.audio.pause();
      this.currentPlaying = null;
    } else {
      this.audio.src = url;
      this.audio.play();
      this.currentPlaying = url;
    }
  }

  formatTime(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }
}
