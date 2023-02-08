import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async generateHash(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
