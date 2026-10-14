import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseMongoIdPipe) id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.reviewsService.remove(id);
  }
}