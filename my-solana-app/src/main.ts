import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { Buffer } from 'buffer';

// Polyfill Buffer for browser
(window as any).Buffer = Buffer;

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
  ],
}).catch((err) => console.error(err));