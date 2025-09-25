import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalLoaderService } from '../../service/global-loader/global-loader.service';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { firstValueFrom } from 'rxjs';

/**
 * ChatMessage interface
 *
 * Represents a single message exchanged between the user and the model.
 */
export interface ChatMessage {
  /** Role of the message sender (user or model). */
  role: 'user' | 'model';
  /** The text content of the message. */
  parts: { text: string }[];
}

/**
 * SaavnService
 *
 * Service for integrating with Saavn API (song search) and
 * Google Gemini API (next song recommendation).
 * It manages search, AI-based suggestions, and conversation history.
 */
@Injectable({
  providedIn: 'root'
})
export class SaavnService {
  /**
   * Conversation history between user and AI model.
   */
  private history: ChatMessage[] = [];

  /**
   * Base URL for Saavn song search API.
   */
  private savvanApiUrl = 'https://saavn.dev/api/search/songs';

  /**
   * Gemini API URL with authentication key from environment.
   */
  private geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${environment.geminiApiKey}`;

  /**
   * Creates an instance of SaavnService.
   *
   * @param http Angular HttpClient for API calls.
   * @param globalLoaderService Global loader service to show/hide loading UI.
   */
  constructor(
    private http: HttpClient,
    private globalLoaderService: GlobalLoaderService
  ) { }

  /**
   * Searches for songs using the Saavn API.
   *
   * @param query The search term provided by the user.
   * @returns An observable containing the list of matching songs.
   */
  searchSongs(query: string) {
    this.globalLoaderService.show("Searching songs...");

    return this.http.get<any>(`${this.savvanApiUrl}?query=${query}&limit=10&page=0`).pipe(
      finalize(() => {
        this.globalLoaderService.hide();
      })
    );
  }

  /**
   * Suggests the next song based on the current song metadata.
   * Uses Gemini API to infer mood and style, and returns the most suitable next track.
   *
   * @param currentSong The currently playing song object with metadata (name, album, artists, etc.).
   * @returns A JSON string with the suggested song name and artist.
   */
  async suggestNextSong(currentSong: any): Promise<string> {
    this.globalLoaderService.show("Suggesting next song...");

    /**
     * Helper function to format metadata fields safely.
     *
     * @param fieldName The name of the metadata field.
     * @param value The field value to format.
     * @returns Formatted string or empty string if invalid.
     */
    const formatField = (fieldName: string, value: any) => {
      if (value === null || value === undefined || value === '') {
        return '';
      }
      if (fieldName === 'Duration') {
        return `${fieldName}: ${value} seconds\n`;
      }
      return `${fieldName}: ${value}\n`;
    };

    // Extract album name safely
    const albumName = currentSong.album?.name || '';

    // Extract artists as a comma-separated string
    const artistsName = (currentSong.artists?.all && currentSong.artists.all.length > 0)
      ? currentSong.artists.all.map((artist: any) => artist.name).join(', ')
      : '';

    // Prompt for Gemini API
    const prompt = `
You are a smart music recommendation assistant. Your job is to analyze the mood and style of the current song the user is listening to and suggest the most accurate next song that fits or enhances the user's mood and listening experience.

Given the current song details:
${formatField('Name', currentSong.name)}${formatField('Type', currentSong.type)}${formatField('Year', currentSong.year)}${formatField('Duration', currentSong.duration)}${formatField('Label', currentSong.label)}${formatField('Language', currentSong.language)}${formatField('Copyright', currentSong.copyright)}${formatField('Album Name', albumName)}${formatField('Artist Name', artistsName)}${formatField('Is User Liked', currentSong.isLiked)}

🎯 Responsibilities:
- Analyze the mood and style of the current song based on the given details (name, album name, language, artist, year, etc.).
- Consider whether the user liked the song or not to suggest the next song accordingly. If the user liked the song, recommend something similar or enhancing the mood; if not, suggest a song that may better fit the user's preferences.
- Suggest the next song that is the most accurate match in mood, vibe, and style to provide a smooth and positive user experience.
- Use only the current song’s metadata to infer the best next song.
- Do not include any additional text, explanation, or formatting in your response.
- Do not repeat the already suggested song.

Provide only the JSON object and no extra text, no formatting:
{
  "songName": "string",
  "artistsName": "string"
}

`;

    this.history.push({ role: 'user', parts: [{ text: prompt }] });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { contents: this.history };

    try {
      const res: any = await firstValueFrom(this.http.post(this.geminiApiUrl, body, { headers }));
      const parts = res?.candidates?.[0]?.content?.parts;
      const modelReply = parts?.map((p: any) => p.text).join('\n\n') || 'No response';

      this.history.push({ role: 'model', parts: [{ text: modelReply }] });
      this.globalLoaderService.hide();
      return modelReply;
    } catch (err) {
      console.error('Error:', err);
      return 'Error fetching response';
    }
  }

  /**
   * Returns the full conversation history between user and model.
   *
   * @returns An array of ChatMessage objects.
   */
  getHistory(): ChatMessage[] {
    return this.history;
  }
}
