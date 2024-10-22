import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';  // 유저 스키마 임포트

@Schema()
export class WorkOut extends Document {
  @Prop({ required: true })
  exercise: string;  // 운동 종목 (스쿼트, 푸시업, 플랭크 등)

  @Prop()
  duration: number;  // 운동 시간 (분 단위)

  @Prop()
  count: number;  // 운동 횟수

  @Prop()
  date: Date;  // 운동 날짜

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })  // 유저와의 참조
  userId: User;
}

export const WorkOutSchema = SchemaFactory.createForClass(WorkOut);
