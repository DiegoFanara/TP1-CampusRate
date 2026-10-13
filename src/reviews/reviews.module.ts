import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Place, PlaceSchema } from '../places/schemas/place.schema';

@Module({
  imports: [
  MongooseModule.forFeature([
    { name: Review.name, schema: ReviewSchema },
    { name: Place.name, schema: PlaceSchema },
  ]),
],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService]
})
export class ReviewsModule {}
