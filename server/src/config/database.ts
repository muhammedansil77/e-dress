import mongoose from 'mongoose';
import { env } from './env.config';

export class Database {
  private static isConnected = false;

  public static async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('⚡ MongoDB already connected.');
      return;
    }

    try {
      mongoose.set('strictQuery', true);
      const conn = await mongoose.connect(env.MONGO_URI, {
        autoIndex: env.NODE_ENV !== 'production',
      });

      this.isConnected = true;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected. Attempting reconnect...');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected successfully.');
        this.isConnected = true;
      });
    } catch (error) {
      console.error('❌ MongoDB initial connection failed:', error);
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    await mongoose.connection.close();
    this.isConnected = false;
    console.log('🔌 MongoDB connection closed gracefully.');
  }
}
