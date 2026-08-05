import { Component } from '@angular/core';

import { I18nService } from './core/services/i18n.service';
import { LoadingService } from './core/services/loading.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

  isDark$ = this.themeService.isDark$;
  isLoading$ = this.loadingService.isLoading$;
  language$ = this.i18nService.language$;

  constructor(
    private themeService: ThemeService,
    private loadingService: LoadingService,
    private i18nService: I18nService
  ) {}

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleLanguage(): void {
    this.i18nService.toggleLanguage();
  }
}
