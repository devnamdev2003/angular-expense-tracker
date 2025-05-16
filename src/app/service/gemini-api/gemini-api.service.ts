import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { firstValueFrom } from 'rxjs';
import { GlobalLoaderService } from '../global-loader/global-loader.service';
import { ExpenseService, Expense } from '../localStorage/expense.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${environment.geminiApiKey}`;

  constructor(private http: HttpClient, private globalLoaderService: GlobalLoaderService, private expenseService: ExpenseService) { }

  async getResponse(prompt: string): Promise<string> {

    this.globalLoaderService.show("thinking..");
    const expenses = this.getLast15DaysExpenses();
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
      return 'Error fetching response';
    }
  }

  getLast15DaysExpenses(): Pick<Expense, 'amount' | 'note' | 'payment_mode' | 'location' | 'date' | 'category_name'>[] {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 14);
    
    const results = this.expenseService.searchByDateRange(fromDate.toISOString(), toDate.toISOString());

    return results.map(exp => ({
      amount: exp.amount,
      note: exp.note,
      payment_mode: exp.payment_mode,
      location: exp.location,
      date: exp.date,
      category_name: exp.category_name,
    }));
  }

  generateExpenseAnalysisPrompt(
    userQuery: string,
    last15DaysExpenses: Pick<Expense, 'amount' | 'note' | 'payment_mode' | 'location' | 'date' | 'category_name'>[]
  ): string {
    const baseInstructions = `
You are a polite and helpful financial assistant AI. Your job is to help the user analyze their last 15 days of expense data.

🎯 Your Responsibilities:
- Use ONLY the provided expense data for any analysis or answers.
- Politely respond to greetings like "Hi", "Hello", or "How are you?"
- DO NOT answer any questions unrelated to the expense data.

🚫 If the user asks something completely unrelated (e.g., weather, politics, personal advice), respond with:
"❌ I'm here only to help with your expense data. Please ask something related to your recent expenses."
and any other warning message according you.
---

Here is the user's last 15 days of expense data:
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
