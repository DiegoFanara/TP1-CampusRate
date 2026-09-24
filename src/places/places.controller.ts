import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PlacesService } from './places.service';
import { ReviewsService } from '../reviews/reviews.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';

@Controller('places')
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post()
  create(@Body() dto: CreatePlaceDto) {
    return this.placesService.create(dto);
  }

  @Get()
  findAll() {
    return this.placesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlaceDto) {
    return this.placesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.placesService.remove(id);
  }

  @Post(':placeId/reviews')
  createReview(@Param('placeId') placeId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(placeId, dto);
  }

  @Get(':placeId/reviews')
  findReviewsForPlace(@Param('placeId') placeId: string) {
    return this.reviewsService.findAllForPlace(placeId);
  }
}