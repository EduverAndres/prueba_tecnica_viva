import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastModule } from 'primeng/toast';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [NoopAnimationsModule, ToastModule, RouterTestingModule]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
  });

  it('should render the app shell', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.app-title').textContent).toContain('Patients');
  });
});
