import { Injectable, 
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
 } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { socUserCredentialDto } from './dto/socauth-credential.dto';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class SocauthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  //소셜 미디어를 통해서 로그인 했는지 여부를 확인한다. 
  async userExists(userId: string): Promise<boolean> {
    const user = await this.userModel.findOne({ username: userId });
    return !!user;
  }

  // 소셜 미디어를 활용한 로그인이 승인된 이후, JWT 토큰을 형성해 로그인한 것을 확인한다.
  async handleLogin(user: any) {
    // This function can handle the login logic (create user, generate token, etc.)
    // For now, just return the user
    const { id, email, accessToken} = user;
    
    const payload = { 
      id, 
      email,
      accessToken,
      // firstName, 
      // lastName, 
      // picture,
      // accessToken,
     }

    //Payload의 정보를 담은 JWT 토큰을 발행한다.
    const jwtToken = this.jwtService.sign(payload);
    // console.log(jwtToken)
    // console.log(payload.id);
    return {token:jwtToken};
  }

  async signUp(socUserCredentialDto: socUserCredentialDto): Promise<{message: string}>{
    const { id, email } = socUserCredentialDto;
    try{
        await this.userModel.create({
            username : id,
            email,
        });
        return { message: '회원가입 성공!'};
    } catch (error){
        console.log(error);
        if(error.code === 11000){
            throw new ConflictException('존재하는 ID입니다!');
        } else{
            throw new InternalServerErrorException();
        }
    }
}


}






//   //Constructor는 특정 클래스를 해당 코드에서 쓸 수 있도록 하기 위해 쓰인다.
//   constructor(private readonly jwtService:JwtService){}
  
//   async handleLogin(user:any){
//     const {accessToken} = user;
//     console.log('ㅋㅋ',accessToken);

//     // google에서 발행한 토큰이 유효하다는 것을 확인하면, 그 데이터에 맞는 정보를 가져온다.
//     const googleUser = await this.verifyGoogleToken(accessToken);
//     if (!googleUser){
//       throw new UnauthorizedException('Invalid Google token');
//     }
  
//   const payload = {
//     id : googleUser.id,
//     email:googleUser.email,
//     firstName:googleUser.given_name,
//     lastName:googleUser.family_name,
//   };

//   const jwtToken = this.jwtService.sign(payload);
//   console.log(jwtToken);
//   return {jwtToken};

// }


//   private async verifyGoogleToken(accessToken:string) : Promise<any>{
//     try{
//       // Opaque 토큰을 이용해서 Google 서버에서 토큰이 유효하다는 것을 확인하면, 해당되는 user 정보를 response 변수에 받는다.
//       const response = await axios.get(
//         `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
//       );
//       // console.log(response);
//       return response.data;
//     }
//     catch(error){
//       console.error('Error verifying token', error);
//       return null;
//     }

//   }