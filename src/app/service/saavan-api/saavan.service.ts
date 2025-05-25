
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SaavnService {
  private baseUrl = 'https://saavn.dev/api/search/songs';

  constructor(private http: HttpClient) { }

  searchSongs(query: string) {
    return this.http.get<any>(`https://saavn.dev/api/search/songs?query=${query}&limit=10&page=0`);
  }
}
