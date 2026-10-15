import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

@Controller('reviews')
@ApiBadRequestResponse({
  description:
    'Requete invalide : validation, propriete inconnue ou interdite, identifiant mal forme.',
})
@ApiNotFoundResponse({ description: 'Ressource introuvable.' })
@ApiTooManyRequestsResponse({
  description: 'Trop de requetes (100 par minute maximum).',
})
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.reviewsService.remove(id);
  }
}
