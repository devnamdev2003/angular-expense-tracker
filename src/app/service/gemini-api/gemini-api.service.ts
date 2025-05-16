import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${environment.geminiApiKey}`;

  constructor(private http: HttpClient) { }

  async getResponse(prompt: string): Promise<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    try {
      const res: any = await firstValueFrom(this.http.post(this.apiUrl, body, { headers }));
      const parts = res?.candidates?.[0]?.content?.parts;
      return parts?.map((p: any) => p.text).join('\n\n') || 'No response';
    } catch (err) {
      console.error('Gemini API error:', err);
      return 'Error fetching response';
    }
  }
}


// for chat

// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { environment } from '../../../environments/environments';
// import { firstValueFrom } from 'rxjs';

// export interface ChatMessage {
//   role: 'user' | 'model';
//   parts: { text: string }[];
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class GeminiApiService {
//   private history: ChatMessage[] = [];

//   private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${environment.geminiApiKey}`;

//   constructor(private http: HttpClient) {}

//   async sendMessage(message: string): Promise<string> {
//     this.history.push({ role: 'user', parts: [{ text: message }] });

//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     const body = {
//       contents: this.history
//     };

//     try {
//       const res: any = await firstValueFrom(this.http.post(this.apiUrl, body, { headers }));
//       const parts = res?.candidates?.[0]?.content?.parts;
//       const modelReply = parts?.map((p: any) => p.text).join('\n\n') || 'No response';

//       this.history.push({ role: 'model', parts: [{ text: modelReply }] });

//       return modelReply;
//     } catch (err) {
//       console.error('Error:', err);
//       return 'Error fetching response';
//     }
//   }

//   getHistory(): ChatMessage[] {
//     return this.history;
//   }
// }
