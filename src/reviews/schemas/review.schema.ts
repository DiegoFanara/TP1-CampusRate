import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: String, required: true, index: true })
  placeId: string;

  @Prop({ type: String, required: true, trim: true })
  authorsName: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500,
  })
  comment: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);