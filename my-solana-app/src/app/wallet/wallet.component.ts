import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Connection, PublicKey, Transaction, TransactionInstruction, LAMPORTS_PER_SOL, SystemProgram, VersionedTransactionResponse } from '@solana/web3.js';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
    };
  }
}

@Component({
  standalone: true,
  selector: 'app-wallet',
  template: `
    <div class="p-4">
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        (click)="connectWallet()"
        [disabled]="isConnected"
      >
        {{ isConnected ? 'Wallet Connected' : 'Connect Wallet' }}
      </button>
      <div *ngIf="publicKey" class="mt-2 text-gray-700">
        Connected: {{ publicKey }}
      </div>
      <button
        *ngIf="isConnected"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
        (click)="makePayment()"
      >
        Make Payment
      </button>
      <button
        *ngIf="isConnected"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-2"
        (click)="disconnectWallet()"
      >
        Disconnect
      </button>
    </div>
  `,
  imports: [CommonModule],
})
export class WalletComponent {
  isConnected: boolean = false;
  publicKey: string | null = null;
  private connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  constructor(private http: HttpClient) {}

  async connectWallet() {
    try {
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom Wallet not found. Please install Phantom Wallet.');
      }
      const response = await window.solana.connect();
      this.publicKey = response.publicKey.toString();
      this.isConnected = true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async disconnectWallet() {
    try {
      if (!window.solana) {
        throw new Error('Phantom Wallet not found');
      }
      await window.solana.disconnect();
      this.isConnected = false;
      this.publicKey = null;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      alert('Failed to disconnect wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async makePayment() {
    try {
      if (!window.solana || !this.publicKey) {
        throw new Error('Wallet not connected');
      }

      const programId = new PublicKey('EabynKLkw2Jb2N8AYzP5XuR3whVmz3hhoic5eSoBUk48'); // Replace with actual Program ID
      const expertPublicKey = new PublicKey('CQV3QSMYRF8P87ioHVmBHcvP94WaoV4JoB4NVn62KXjY'); // Replace with expert's public key
      const studentPublicKey = new PublicKey(this.publicKey);
      const amount = 0.5 * LAMPORTS_PER_SOL; // 0.1 SOL for testing

      const data = Buffer.alloc(8);
      data.writeBigUInt64LE(BigInt(amount), 0);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: studentPublicKey, isSigner: true, isWritable: true }, // Payer
          { pubkey: expertPublicKey, isSigner: false, isWritable: true }, // Recipient
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // System Program
        ],
        programId,
        data,
      });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = studentPublicKey;
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await window.solana.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      await this.connection.confirmTransaction(signature, 'confirmed');

      // Fetch transaction details to get logs
      const transactionDetails = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
      const logs = transactionDetails?.meta?.logMessages || [];
      console.log('Transaction logs:', logs);

      alert('Payment successful! Signature: ' + signature);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}