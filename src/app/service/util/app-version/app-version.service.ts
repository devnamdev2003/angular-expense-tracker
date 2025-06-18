import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppVersionService {
  private readonly version: string = "25.6.18";

  constructor() { }

  getVersion(): string {
    return this.version;
  }
}