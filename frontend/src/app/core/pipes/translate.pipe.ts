import { ChangeDetectorRef, Injectable, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';

import { I18nService } from '../services/i18n.service';

@Injectable()
@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription | null = null;
  private lastKey: string | null = null;
  private lastParams: Record<string, string | number> | undefined;
  private lastValue: string | null = null;

  constructor(
    private i18nService: I18nService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  transform(key: string, params?: Record<string, string | number>): string {
    if (this.subscription === null) {
      this.subscription = this.i18nService.language$.subscribe(() => {
        this.lastValue = null;
        this.changeDetectorRef.markForCheck();
      });
    }
    if (this.lastKey === key && this.lastParams === params && this.lastValue !== null) {
      return this.lastValue;
    }
    this.lastKey = key;
    this.lastParams = params;
    this.lastValue = this.i18nService.translate(key, params);
    return this.lastValue;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }
}
