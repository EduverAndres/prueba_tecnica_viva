import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private messageService: MessageService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
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
        summary: 'Connection error',
        detail: 'The API server is unreachable.'
      });
      return;
    }

    const apiMessage = error.error?.message as string | undefined;
    const details = error.error?.details as string[] | undefined;
    let detail = apiMessage ?? 'An unexpected error occurred.';
    if (details?.length) {
      detail += ' — ' + details.slice(0, 3).join(' • ');
    }

    this.messageService.add({
      severity: 'error',
      summary: `Error ${error.status}`,
      detail
    });
  }
}
