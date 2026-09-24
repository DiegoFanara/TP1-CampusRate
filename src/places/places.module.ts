import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { DatabaseModule } from '../database/database.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [DatabaseModule, ReviewsModule],
  controllers: [PlacesController],
  providers: [PlacesService]
})
export class PlacesModule {}
