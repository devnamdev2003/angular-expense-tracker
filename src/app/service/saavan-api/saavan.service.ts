import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalLoaderService } from '../../service/global-loader/global-loader.service';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { firstValueFrom } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
@Injectable({
  providedIn: 'root'
})
export class SaavnService {
  private history: ChatMessage[] = [];
  private baseUrl = 'https://saavn.dev/api/search/songs';
  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${environment.geminiApiKey}`;

  constructor(private http: HttpClient, private globalLoaderService: GlobalLoaderService) { }

  searchSongs(query: string) {
    this.globalLoaderService.show("Searching songs...");

    return this.http.get<any>(`${this.baseUrl}?query=${query}&limit=10&page=0`).pipe(
      finalize(() => {
        this.globalLoaderService.hide();
      })
    );
  }

  async suggestNextSong(currentSong: any) {
    
    this.globalLoaderService.show("Suggesting next song...");

    const formatField = (fieldName: string, value: any) => {
      if (value === null || value === undefined || value === '') {
        return '';
      }
      if (fieldName === 'Duration') {
        return `${fieldName}: ${value} seconds\n`;
      }
      return `${fieldName}: ${value}\n`;
    };

    // Safely extract album name
    const albumName = currentSong.album?.name || '';

    // Safely extract artists names as comma separated string
    const artistsName = (currentSong.artists?.all && currentSong.artists.all.length > 0)
      ? currentSong.artists.all.map((artist: any) => artist.name).join(', ')
      : '';

    // Build prompt string by concatenating only valid fields
    const prompt = `
You are a smart music recommendation assistant. Your job is to analyze the mood and style of the current song the user is listening to and suggest the most accurate next song that fits or enhances the user's mood and listening experience.

Given the current song details:
${formatField('Name', currentSong.name)}${formatField('Type', currentSong.type)}${formatField('Year', currentSong.year)}${formatField('Duration', currentSong.duration)}${formatField('Label', currentSong.label)}${formatField('Language', currentSong.language)}${formatField('Copyright', currentSong.copyright)}${formatField('Album Name', albumName)}${formatField('Artist Name', artistsName)}

🎯 Responsibilities:
- Analyze the mood and style of the current song based on the given details(name, album name, language, artist, year, etc.).
- Suggest the next song that is the most accurate match in mood, vibe, and style to provide a smooth and positive user experience.
- Use only the current song’s metadata to infer the best next song.
- Do not include any additional text, explanation, or formatting in your response.

Provide only the JSON object and no extra text, no backticks, no markdown formatting:
{
  "songName": "string",
  "artistsName": "string"
}
`;
    console.log(prompt)
    this.history.push({ role: 'user', parts: [{ text: prompt }] });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      contents: this.history
    };

    try {
      const res: any = await firstValueFrom(this.http.post(this.apiUrl, body, { headers }));
      const parts = res?.candidates?.[0]?.content?.parts;
      const modelReply = parts?.map((p: any) => p.text).join('\n\n') || 'No response';

      this.history.push({ role: 'model', parts: [{ text: modelReply }] });

      return modelReply;
    } catch (err) {
      console.error('Error:', err);
      return 'Error fetching response';
    }

  }

  getHistory(): ChatMessage[] {
    return this.history;
  }

}
