
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalLoaderService } from '../../service/global-loader/global-loader.service';
import { map, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SaavnService {
  private baseUrl = 'https://saavn.dev/api/search/songs';

  constructor(private http: HttpClient, private globalLoaderService: GlobalLoaderService) { }

  searchSongs(query: string) {
    console.log("serching song;")
    this.globalLoaderService.show("Searching songs...");

    return this.http.get<any>(`${this.baseUrl}?query=${query}&limit=10&page=0`).pipe(
      finalize(() => {
        console.log("finish serching song;")
        this.globalLoaderService.hide()
      })
    );
  }
}
