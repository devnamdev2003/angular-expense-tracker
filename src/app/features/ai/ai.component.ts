import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { GeminiApiService } from '../../service/gemini-api/gemini-api.service';

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.css'
})
export class AiComponent {
  userInput = '';
  responseHtml: SafeHtml | null = null;

  constructor(
    private geminiApi: GeminiApiService,
    private sanitizer: DomSanitizer
  ) { }

  async send() {
    if (!this.userInput.trim()) return;
    const markdown = await this.geminiApi.getResponse(this.userInput);
    const html = await marked.parse(markdown);
    this.responseHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

// for chat

// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';
// import { GeminiApiService, ChatMessage } from '../../service/gemini-api/gemini-api.service';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// import { marked } from 'marked';

// @Component({
//   selector: 'app-ai',
//   standalone: true,
//   imports: [CommonModule, FormsModule, HttpClientModule],
//   templateUrl: './ai.component.html',
//   styleUrl: './ai.component.css'
// })
// export class AiComponent {
//   userInput = '';
//   messages: (ChatMessage & { safeHtml?: SafeHtml })[] = [];
//   loading = false;

//   constructor(private geminiService: GeminiApiService, private sanitizer: DomSanitizer) {
//     this.loadMessages();
//   }

//   async send() {
//     const input = this.userInput.trim();
//     if (!input) return;

//     this.loading = true;
//     this.userInput = '';

//     await this.geminiService.sendMessage(input);
//     this.loadMessages();

//     this.loading = false;
//   }

//   private async loadMessages() {
//     const rawMessages = this.geminiService.getHistory();
//     const mapped = await Promise.all(rawMessages.map(async msg => {
//       if (msg.role === 'model') {
//         const raw = msg.parts[0].text;
//         const html = await marked.parse(raw); return {
//           ...msg,
//           safeHtml: this.sanitizer.bypassSecurityTrustHtml(html)
//         };
//       }
//       return msg;
//     }));

//     this.messages = mapped;
//   }

// }


