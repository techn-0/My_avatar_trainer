import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';  // Import ConfigService

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),  // Retrieve client ID from .env
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),  // Retrieve client secret from .env
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),  // Retrieve callback URL from .env
      scope: ['email', 'profile'],  // Scope defines what we want to access from the user
    });
  }

  // The validate method is called after a successful Google login
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const objectId = profile.id
    // Extract user information from the profile
    const user = {
      id:objectId,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      provider:'google'
    };

    // Pass user information to the request handler
    done(null, user);
  }
}
