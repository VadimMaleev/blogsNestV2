import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateHashUseCase {
  async execute(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
