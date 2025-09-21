import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { GeminiApiService } from '../../service/gemini-api/gemini-api.service';

/**
 * Component for AI interaction using Gemini API.
 * 
 * Features:
 * - Accepts user input.
 * - Sends input to Gemini API for processing.
 * - Converts AI Markdown response to sanitized HTML for display.
 */
@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.css'
})
export class AiComponent {

  /** User input from the text box */
  userInput = '';

  /** AI response rendered as sanitized HTML */
  responseHtml: SafeHtml | null = null;

  /**
   * Constructor to inject services.
   * 
   * @param geminiApi Service that handles AI requests.
   * @param sanitizer Angular sanitizer for safe HTML rendering.
   */
  constructor(
    private geminiApi: GeminiApiService,
    private sanitizer: DomSanitizer
  ) { }

  /**
   * Sends the user input to the Gemini API.
   * - Ignores input shorter than 2 characters.
   * - Converts returned Markdown to sanitized HTML.
   */
  async send() {
    const trimmedInput = this.userInput.trim();
    if (trimmedInput.length < 2) {
      this.userInput = '';
      return;
    }

    // Fetch response from Gemini API
    const markdown = await this.geminiApi.getResponse(trimmedInput);

    // Convert Markdown to HTML
    const html = await marked.parse(markdown);

    // Sanitize HTML for safe rendering
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


