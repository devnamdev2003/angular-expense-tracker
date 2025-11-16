import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class NativeAppServiceService {

  /**
   * Checks whether the application is running as a native app
   * (Android or iOS) using Capacitor.
   *
   * @returns `true` if the app is running on a native platform, otherwise `false`.
   */
  isNativeApp(): boolean {
    return Capacitor.isNativePlatform();
  }
}
