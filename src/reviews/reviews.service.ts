import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Place } from '../places/schemas/place.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Place.name) private readonly placeModel: Model<Place>,
  ) {}

  async create(placeId: string, dto: CreateReviewDto): Promise<ReviewDocument> {
    await this.ensurePlaceExists(placeId);

    const review = await this.reviewModel.create({
      placeId,
      authorsName: dto.authorsName,
      rating: dto.rating,
      comment: dto.comment,
    });

    await this.recalculatePlaceRating(placeId);
    return review;
  }

  async findAllForPlace(placeId: string): Promise<ReviewDocument[]> {
    await this.ensurePlaceExists(placeId);
    return this.reviewModel
      .find({ placeId })
      .sort({ createdAt: 1, _id: 1 })
      .exec();
  }

  async findOne(id: string): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException(`Review ${id} introuvable`);
    return review;
  }

  async update(id: string, dto: UpdateReviewDto): Promise<ReviewDocument> {
    const allowed = {
      authorsName: dto.authorsName,
      rating: dto.rating,
      comment: dto.comment,
    };
    const changes = Object.fromEntries(
      Object.entries(allowed).filter(([, value]) => value !== undefined),
    );

    const review = await this.reviewModel
      .findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true })
      .exec();
    if (!review) throw new NotFoundException(`Review ${id} introuvable`);

    await this.recalculatePlaceRating(review.placeId);
    return review;
  }

  async remove(id: string): Promise<void> {
    const review = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!review) throw new NotFoundException(`Review ${id} introuvable`);

    await this.recalculatePlaceRating(review.placeId);
  }

  private async ensurePlaceExists(placeId: string): Promise<void> {
    const exists = await this.placeModel.exists({ _id: placeId });
    if (!exists) throw new NotFoundException(`Place ${placeId} introuvable`);
  }

  private async recalculatePlaceRating(placeId: string): Promise<void> {
    const [stats] = await this.reviewModel.aggregate<{
      count: number;
      average: number;
    }>([
      { $match: { placeId } },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: '$rating' } } },
    ]);

    await this.placeModel
      .findByIdAndUpdate(placeId, {
        $set: {
          reviewCount: stats?.count ?? 0,
          averageRating: stats?.average ?? null,
        },
      })
      .exec();
  }
}