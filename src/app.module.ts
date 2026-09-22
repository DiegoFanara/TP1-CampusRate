import { Module } from '@nestjs/common';
import { PlacesModule } from './places/places.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [PlacesModule, ReviewsModule],
})
export class AppModule {}