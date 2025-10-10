import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Represents the supported screen/device types.
 *
 * - **mobile**  → Devices with a width ≤ 768px
 * - **tablet**  → Devices with a width between 769px and 1024px
 * - **desktop** → Devices with a width > 1024px
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Service to detect the current screen type (mobile, tablet, or desktop)
 * and broadcast updates across the application in real time.
 *
 * This service:
 * - Monitors the browser `window.innerWidth`.
 * - Emits a {@link DeviceType} value whenever the viewport is resized.
 * - Provides helper methods for quick checks (`isMobile`, `isTablet`, `isDesktop`).
 *
 * Example usage:
 * ```typescript
 * constructor(private screenType: ScreenTypeService) {
 *   this.screenType.deviceType$.subscribe(type => console.log(type));
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ScreenTypeService {

  /**
   * Internal BehaviorSubject that stores the latest detected {@link DeviceType}.
   * Initialized with the current screen type on service creation.
   */
  private deviceTypeSubject: BehaviorSubject<DeviceType>;

  /**
   * Observable stream that emits the latest {@link DeviceType} whenever
   * the browser window is resized and the screen type changes.
   *
   * Subscribe to this observable to reactively update UI components:
   * ```typescript
   * this.screenTypeService.deviceType$.subscribe(type => { ... });
   * ```
   */
  deviceType$;

  /**
   * Creates an instance of ScreenTypeService.
   *
   * @param ngZone Angular {@link NgZone} used to ensure change detection
   *        runs when the resize event triggers.
   */
  constructor(private ngZone: NgZone) {
    // Listen to window resize events inside Angular zone
    const initialType = this.isBrowser() ? this.getDeviceType() : 'desktop';
    this.deviceTypeSubject = new BehaviorSubject<DeviceType>(initialType);
    this.deviceType$ = this.deviceTypeSubject.asObservable();

    if (this.isBrowser()) {
      window.addEventListener('resize', () => {
        this.ngZone.run(() => {
          this.deviceTypeSubject.next(this.getDeviceType());
        });
      });
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Determines the current {@link DeviceType} based on the window width.
   *
   * @returns The device type:
   * - `'mobile'` if width ≤ 768px
   * - `'tablet'` if width between 769px and 1024px
   * - `'desktop'` if width > 1024px
   */
  getDeviceType(): DeviceType {
    if (!this.isBrowser()) return 'desktop';
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Checks if the current screen is classified as **mobile**.
   *
   * @returns `true` if the device is mobile, otherwise `false`.
   */
  isMobile(): boolean {
    return this.getDeviceType() === 'mobile';
  }

  /**
   * Checks if the current screen is classified as **tablet**.
   *
   * @returns `true` if the device is tablet, otherwise `false`.
   */
  isTablet(): boolean {
    return this.getDeviceType() === 'tablet';
  }

  /**
   * Checks if the current screen is classified as **desktop**.
   *
   * @returns `true` if the device is desktop, otherwise `false`.
   */
  isDesktop(): boolean {
    return this.getDeviceType() === 'desktop';
  }
}