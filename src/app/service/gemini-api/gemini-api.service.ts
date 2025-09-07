import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { firstValueFrom } from 'rxjs';
import { GlobalLoaderService } from '../global-loader/global-loader.service';
import { ExpenseService, Expense } from '../localStorage/expense.service';

/**
 * GeminiApiService
 *
 * This service is responsible for communicating with the
 * Google Gemini API to analyze the user's expense data.
 * It fetches the last 30 days of expenses, generates prompts,
 * and retrieves AI-generated insights for the user.
 */
@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  /**
   * API URL for the Gemini model including the environment API key.
   */
  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${environment.geminiApiKey}`;

  /**
   * Creates an instance of GeminiApiService.
   *
   * @param http Angular HttpClient for API requests.
   * @param globalLoaderService Service to show/hide global loading indicators.
   * @param expenseService Service to fetch expense data from local storage.
   */
  constructor(
    private http: HttpClient,
    private globalLoaderService: GlobalLoaderService,
    private expenseService: ExpenseService
  ) {}

  /**
   * Sends a prompt to the Gemini API and returns the generated response.
   * Enhances the prompt with the user's last 30 days of expenses.
   *
   * @param prompt The user’s query or message.
   * @returns A string response from Gemini with analysis or insights.
   */
  async getResponse(prompt: string): Promise<string> {
    this.globalLoaderService.show("📊 Analyzing your expenses..");
    const expenses = this.getLast30DaysExpenses();
    const updatedPrompt = this.generateExpenseAnalysisPrompt(prompt, expenses);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      contents: [{
        parts: [{ text: updatedPrompt }]
      }]
    };

    try {
      const res: any = await firstValueFrom(this.http.post(this.apiUrl, body, { headers }));
      const parts = res?.candidates?.[0]?.content?.parts;
      this.globalLoaderService.hide();
      return parts?.map((p: any) => p.text).join('\n\n') || 'No response';
    } catch (err) {
      this.globalLoaderService.hide();
      console.error('Gemini API error:', err);
      return 'Error fetching response' + err;
    }
  }

  /**
   * Fetches the user's expenses from the last 30 days.
   *
   * @returns An array of expense objects with selected fields:
   * amount, note, location, date, category_name, payment_mode, isExtraSpending.
   */
  getLast30DaysExpenses(): Pick<
    Expense,
    'amount' | 'note' | 'location' | 'date' | 'category_name' | 'payment_mode' | 'isExtraSpending'
  >[] {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 29);

    const results = this.expenseService.searchByDateRange(fromDate.toISOString(), toDate.toISOString());

    return results.map(exp => ({
      amount: exp.amount,
      note: exp.note,
      location: exp.location,
      date: exp.date + "T" + exp.time,
      category_name: exp.category_name,
      payment_mode: exp.payment_mode,
      isExtraSpending: exp.isExtraSpending
    }));
  }

  /**
   * Generates a structured AI prompt for expense analysis.
   * Includes instructions for the model and the last 30 days of expenses.
   *
   * @param userQuery The user’s input or question.
   * @param last15DaysExpenses Array of expense objects from the last 30 days.
   * @returns A formatted string prompt ready for Gemini API.
   */
  generateExpenseAnalysisPrompt(
    userQuery: string,
    last15DaysExpenses: Pick<
      Expense,
      'amount' | 'note' | 'location' | 'date' | 'category_name' | 'payment_mode' | 'isExtraSpending'
    >[]
  ): string {
    const baseInstructions = `
You are a polite and helpful financial assistant AI. Your sole purpose is to help the user **analyze and predict** their expenses from the last 30 days.

🎯 Responsibilities:
- Use only the provided expense data for any analysis, answers or predictions.
- Predict the user’s expenses by identifying trends, patterns, or averages from the last 30 days.
- Politely respond to greetings like “Hi”, “Hello”, or “How are you?” with a short, friendly message.
- If the user asks a question unrelated to the expense data, you must not answer it.

💬 Response Format:
- Reply in a friendly and human-like tone.
- Use emojis where helpful.
- Do NOT return raw JSON, or code blocks.
- Structure your response using bullet points, short sentences, or paragraph style that's visually appealing.
- Do not add any extra message at the beginning.

🚫 When the user asks something unrelated (e.g., weather, politics), respond with:
- "❌ I'm here only to help with your expense data. Please ask something related to your recent spending."
- "⚠️ I cannot process questions outside your expense data."
- "🛑 Let’s keep this focused on your expenses so I can assist you better."
(Include any other appropriate warning messages if the user continues asking unrelated questions.)

Here is the user's last 30 days of expense data:
`;

    const dataBlock = JSON.stringify(last15DaysExpenses, null, 2);

    const prompt = `
${baseInstructions}
Expense Data:
${dataBlock}

User Query:
"${userQuery}"
`;

    return prompt.trim();
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
