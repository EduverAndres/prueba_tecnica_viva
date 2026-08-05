import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  const currentValue = (): boolean => {
    let value = false;
    service.isLoading$.subscribe((v) => (value = v)).unsubscribe();
    return value;
  };

  beforeEach(() => {
    service = TestBed.inject(LoadingService);
  });

  it('should emit true while at least one request is pending', () => {
    service.show();

    expect(currentValue()).toBe(true);
  });

  it('should emit false once every request finishes', () => {
    service.show();
    service.hide();

    expect(currentValue()).toBe(false);
  });

  it('should stay loading while multiple requests are pending', () => {
    service.show();
    service.show();
    service.hide();

    expect(currentValue()).toBe(true);

    service.hide();

    expect(currentValue()).toBe(false);
  });

  it('should not go negative when hide is called without show', () => {
    service.hide();
    service.hide();

    expect(currentValue()).toBe(false);
  });
});
