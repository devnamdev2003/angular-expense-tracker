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
      this.onSongFinished();
    };
  }

  async onSongFinished() {
    try {
      const transformedData = this.transformSongData(this.currentSong);

      // Get AI suggestion
      const nextSong = await this.saavnService.suggestNextSong(transformedData);
      console.log("ai response: "+ nextSong)

      if (!nextSong || typeof nextSong !== 'string' || nextSong.trim() === '') {
        console.warn('No song suggestion received from AI.');
        return; // Stop if no suggestion
      }

      let cleanedSong = nextSong.trim();

      if (cleanedSong.startsWith("```json")) {
        cleanedSong = cleanedSong.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleanedSong.startsWith("```")) {
        cleanedSong = cleanedSong.replace(/^```/, "").replace(/```$/, "").trim();
      }

      let songDetails: { songName: string; artistsName: string };

      try {
        songDetails = JSON.parse(cleanedSong);
      } catch (jsonError) {
        console.error('Failed to parse AI response as JSON:', jsonError);
        return; // Stop if JSON parsing fails
      }

      const { songName, artistsName } = songDetails || {};
      const mainArtist = artistsName ? artistsName.split(",")[0].trim() : "";
      if (!songName || !mainArtist) {
        console.warn('Incomplete song details received from AI:', songDetails);
        return; // Stop if required fields are missing
      }

      console.log('Searching for:', songName + " " + mainArtist);

      // Search and play the song
      this.saavnService.searchSongs(`${songName} ${mainArtist}`).subscribe({
        next: (res) => {
          const results = res.data?.results || [];
          if (results.length > 0) {
            const firstSong = results[0];
            const url = this.getSongUrl(firstSong);
            this.playSong(url, firstSong);
          } else {
            console.warn('No search results found for suggested song.');
          }
        },
        error: (searchError) => {
          console.error('Error during song search:', searchError);
        }
      });
    } catch (error) {
      console.error('Error in onSongFinished:', error);
    } finally {
      // Reset progress and cleanup
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
      album: {
        name: data.album?.name || ''
      },
      artists: {
        all: (data.artists?.primary || []).map((artist: any) => ({
          name: artist.name
        }))
      }
    };
  }

}
