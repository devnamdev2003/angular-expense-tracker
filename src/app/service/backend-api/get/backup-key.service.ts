import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { UserService } from '../../localStorage/user.service';
import { GlobalLoaderService } from '../../global-loader/global-loader.service';

@Injectable({
  providedIn: 'root'
})
export class BackupKeyService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private userService: UserService,
    private globalLoaderService: GlobalLoaderService
  ) { }

  getBackupKey(): Observable<any> {

    const userId = this.userService.getValue<string>('id');

    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }

    const url =
      this.configService.getapiUrl() +
      `/api/data_backup_key/${userId}/`;

    this.globalLoaderService.show('🔐 Fetching backup key...');

    return this.http.get(url).pipe(
      take(1),
      catchError((error: HttpErrorResponse) => {

        if (error.status === 0) {
          return throwError(() => new Error('Network error. Please check internet.'));
        }

        if (error.status === 404) {
          return throwError(() => new Error('Backup key not found. Please sync your data to the cloud first, then try again.'));
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