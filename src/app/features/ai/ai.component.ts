import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.css'
})
export class AiComponent {
  constructor(
    private http: HttpClient, private sanitizer: DomSanitizer) {

  }
  
  userInput = '';
  responseHtml: SafeHtml | null = null;

  async send() {
    if (!this.userInput.trim()) return;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${environment.geminiApiKey}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      contents: [{
        parts: [{ text: this.userInput }]
      }]
    };

    try {
      const res = await this.http.post<any>(url, body, { headers }).toPromise();
      const parts = res?.candidates?.[0]?.content?.parts;
      const markdown = parts?.map((p: any) => p.text).join('\n\n') || 'No response';

      const html = await marked.parse(markdown);
      this.responseHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (err) {
      this.responseHtml = this.sanitizer.bypassSecurityTrustHtml('<p>Error fetching response</p>');
    }
  }

}




