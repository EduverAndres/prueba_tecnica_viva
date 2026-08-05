import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { I18nService } from '../services/i18n.service';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private messageService: MessageService,
    private loadingService: LoadingService,
    private i18nService: I18nService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.loadingService.show();
    return next.handle(req).pipe(
      finalize(() => this.loadingService.hide()),
      catchError((error: HttpErrorResponse) => {
        this.showError(error);
        return throwError(() => error);
      })
    );
  }

  private showError(error: HttpErrorResponse): void {
    if (error.status === 0) {
      this.messageService.add({
        severity: 'error',
        summary: this.i18nService.translate('errors.connection.summary'),
        detail: this.i18nService.translate('errors.connection.detail')
      });
      return;
    }

    const apiMessage = error.error?.message as string | undefined;
    const details = error.error?.details as string[] | undefined;
    let detail = apiMessage ?? this.i18nService.translate('errors.unexpected');
    if (details?.length) {
      detail += ' — ' + details.slice(0, 3).join(' • ');
    }

    this.messageService.add({
      severity: 'error',
      summary: this.i18nService.translate('errors.status', { status: error.status }),
      detail
    });
  }
}
