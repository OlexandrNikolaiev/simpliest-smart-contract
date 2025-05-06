import { Component } from '@angular/core';
import { WalletComponent } from './wallet/wallet.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [WalletComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Solana Wallet Auth';
}