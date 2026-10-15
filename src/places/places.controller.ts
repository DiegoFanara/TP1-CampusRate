import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { ReviewsService } from '../reviews/reviews.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';
import { QueryPlacesDto } from './dto/query-places.dto';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

@Controller('places')
@ApiBadRequestResponse({
  description:
    'Requete invalide : validation, propriete inconnue ou interdite, identifiant mal forme.',
})
@ApiTooManyRequestsResponse({
  description: 'Trop de requetes (100 par minute maximum).',
})
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
  findAll(@Query() query: QueryPlacesDto) {
    return this.placesService.findAll(query);
  }

  @Get(':id')
  @ApiNotFoundResponse({ description: 'Ressource introuvable.' })
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @ApiNotFoundResponse({ description: 'Ressource introuvable.' })
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdatePlaceDto,
  ) {
    return this.placesService.update(id, dto);
  }

  @Delete(':id')
  @ApiNotFoundResponse({ description: 'Ressource introuvable.' })
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.placesService.remove(id);
  }

  @Post(':placeId/reviews')
  @ApiNotFoundResponse({ description: 'Ressource introuvable.' })
  createReview(
    @Param('placeId', ParseMongoIdPipe) placeId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(placeId, dto);
  }

  @Get(':placeId/reviews')
  @ApiNotFoundResponse({ description: 'Ressource introuvable.' })
  findReviewsForPlace(@Param('placeId', ParseMongoIdPipe) placeId: string) {
    return this.reviewsService.findAllForPlace(placeId);
  }
}
