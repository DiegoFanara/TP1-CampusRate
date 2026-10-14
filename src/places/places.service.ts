import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { QueryPlacesDto } from './dto/query-places.dto';
import { PlaceCategory } from './enums/place-category.enum';
import { Place, PlaceDocument } from './schemas/place.schema';
import { Review } from '../reviews/schemas/review.schema';

@Injectable()
export class PlacesService {
  constructor(
    @InjectModel(Place.name) private readonly placeModel: Model<Place>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}

  async create(dto: CreatePlaceDto): Promise<PlaceDocument> {
    return this.placeModel.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      address: dto.address,
      services: dto.services,
      status: dto.status,
    });
  }

  async findAll(query: QueryPlacesDto) {
    const filter: { category?: PlaceCategory } = {};
    if (query.category) filter.category = query.category;

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [data, total] = await Promise.all([
      this.placeModel
        .find(filter)
        .sort({ createdAt: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.placeModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    };
  }

  async findOne(id: string): Promise<PlaceDocument> {
    const place = await this.placeModel.findById(id).exec();
    if (!place) throw new NotFoundException(`Place ${id} introuvable`);
    return place;
  }

  async update(id: string, dto: UpdatePlaceDto): Promise<PlaceDocument> {
    const allowed = {
      name: dto.name,
      description: dto.description,
      category: dto.category,
      address: dto.address,
      services: dto.services,
      status: dto.status,
    };
    const changes = Object.fromEntries(
      Object.entries(allowed).filter(([, value]) => value !== undefined),
    );

    const place = await this.placeModel
      .findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true })
      .exec();
    if (!place) throw new NotFoundException(`Place ${id} introuvable`);
    return place;
  }

  async remove(id: string): Promise<void> {
    const place = await this.placeModel.findByIdAndDelete(id).exec();
    if (!place) throw new NotFoundException(`Place ${id} introuvable`);
    await this.reviewModel.deleteMany({ placeId: id }).exec();
  }
}