import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getFibonacci(n: number): number {
    if (n <= 1) {
      return n;
    }
    return this.getFibonacci(n - 1) + this.getFibonacci(n - 2);
  }
}
