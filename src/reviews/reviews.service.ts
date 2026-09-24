import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { Place } from '../places/entities/place.entity';

@Injectable()
export class ReviewsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(placeId: string, dto: CreateReviewDto): Promise<Review> {
    const data = await this.databaseService.read();
    const place = data.places.find((p) => p.id === placeId);
    if (!place) throw new NotFoundException(`Place ${placeId} introuvable`);

    const newReview: Review = {
      id: randomUUID(),
      placeId,
      authorsName: dto.authorsName,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.reviews.push(newReview);
    this.recalculatePlaceRating(data, placeId);
    await this.databaseService.write(data);
    return newReview;
  }

  async findAllForPlace(placeId: string): Promise<Review[]> {
    const data = await this.databaseService.read();
    const place = data.places.find((p) => p.id === placeId);
    
    if (!place) throw new NotFoundException(`Place ${placeId} introuvable`);

    return data.reviews.filter((r) => r.placeId === placeId);
  }

  async findOne(id: string): Promise<Review> {
    const data = await this.databaseService.read();
    const review = data.reviews.find((r) => r.id === id);
    if (!review) throw new NotFoundException(`Review ${id} introuvable`);
    return review;
  }

  async update(id: string, dto: UpdateReviewDto): Promise<Review> {
    const data = await this.databaseService.read();
    const index = data.reviews.findIndex((r) => r.id === id);
    if (index === -1) throw new NotFoundException(`Review ${id} introuvable`);

    const updated: Review = {
      ...data.reviews[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    data.reviews[index] = updated;
    this.recalculatePlaceRating(data, updated.placeId);
    await this.databaseService.write(data);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const data = await this.databaseService.read();
    const index = data.reviews.findIndex((r) => r.id === id);
    if (index === -1) throw new NotFoundException(`Review ${id} introuvable`);

    const placeId = data.reviews[index].placeId;
    data.reviews.splice(index, 1);
    this.recalculatePlaceRating(data, placeId);
    await this.databaseService.write(data);
  }

  private recalculatePlaceRating(
    data: { places: Place[]; reviews: Review[] },
    placeId: string,
  ): void {
    const place = data.places.find((p) => p.id === placeId);
    if (!place) return;

    const placeReviews = data.reviews.filter((r) => r.placeId === placeId);
    place.reviewCount = placeReviews.length;
    place.averageRating = placeReviews.length
      ? placeReviews.reduce((sum, r) => sum + r.rating, 0) / placeReviews.length
      : null;
    place.updatedAt = new Date().toISOString();
  }
}