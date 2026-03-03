import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Application {}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
export type ApplicationDocument = HydratedDocument<Application>;
