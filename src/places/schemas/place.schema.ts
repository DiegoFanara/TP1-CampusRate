import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PlaceCategory } from '../enums/place-category.enum';
import { PlaceStatus } from '../enums/place-status.enum';
import { toPublicJson } from '../../common/to-public-json';

export type PlaceDocument = HydratedDocument<Place>;

@Schema({ timestamps: true })
export class Place {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  description: string;

  @Prop({ type: String, enum: Object.values(PlaceCategory), required: true })
  category: PlaceCategory;

  @Prop({ type: String, required: true, trim: true })
  address: string;

  @Prop({ type: [String], default: [] })
  services: string[];

  @Prop({
    type: String,
    enum: Object.values(PlaceStatus),
    default: PlaceStatus.ACTIVE,
  })
  status: PlaceStatus;

  @Prop({ type: Number, default: null })
  averageRating: number | null;

  @Prop({ type: Number, default: 0 })
  reviewCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);
PlaceSchema.set('toJSON', toPublicJson);