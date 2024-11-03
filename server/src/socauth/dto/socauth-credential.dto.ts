export class socUserCredentialDto {
    providerId: string;
    email: string;
    provider: string;
}

export class ExtendedSocUserCredentialDto extends socUserCredentialDto{
    username?:string;
}
