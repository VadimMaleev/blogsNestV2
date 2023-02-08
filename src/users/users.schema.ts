import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  codeExpirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
