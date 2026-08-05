import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private pending = 0;
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  isLoading$ = this.loadingSubject.asObservable();

  show(): void {
    this.pending++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.pending = Math.max(0, this.pending - 1);
    this.loadingSubject.next(this.pending > 0);
  }
}
