import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, Observable, take, throwError } from 'rxjs';
import { GlobalLoaderService } from '../../global-loader/global-loader.service';
import { ConfigService } from '../../config/config.service';
import { UserService } from '../../localStorage/user.service';

@Injectable({
  providedIn: 'root'
})
export class RestoreDataService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private userService: UserService,
    private globalLoaderService: GlobalLoaderService
  ) { }

  getBackupData(key: string): Observable<any> {
    const userId = this.userService.getValue<string>('id');

    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }
    const url =
      this.configService.getapiUrl() +
      `/api/all/${key}/`;

    this.globalLoaderService.show('☁️ Restoring backup data...');

    return this.http.get(url).pipe(
      take(1),
      catchError((error: HttpErrorResponse) => {

        if (error.status === 0) {
          return throwError(() => new Error('Network error. Please check internet.'));
        }

        if (error.status === 404) {
          return throwError(() => new Error('Invalid backup key.'));
        }

        if (error.status >= 500) {
          return throwError(() => new Error('Server error. Try again later.'));
        }

        return throwError(() => new Error('Something went wrong.'));
      }),
      finalize(() => this.globalLoaderService.hide())
    );
  }
}