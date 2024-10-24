import { Injectable } from '@nestjs/common';

@Injectable()
export class SocauthService {
  async handleLogin(user: any) {
    // This function can handle the login logic (create user, generate token, etc.)
    // For now, just return the user
    return user;
  }
}
