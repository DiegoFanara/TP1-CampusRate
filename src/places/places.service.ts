import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Place } from './entities/place.entity';
import { PlaceStatus } from './enums/place-status.enum';

@Injectable()
export class PlacesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreatePlaceDto): Promise<Place> {
    const data = await this.databaseService.read();

    const newPlace: Place = {
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
      category: dto.category,
      address: dto.address,
      services: dto.services ?? [],
      status: dto.status ?? PlaceStatus.ACTIVE,
      averageRating: null,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.places.push(newPlace);
    await this.databaseService.write(data);
    return newPlace;
  }

  async findAll(): Promise<Place[]> {
    const data = await this.databaseService.read();
    return data.places;
  }

  async findOne(id: string): Promise<Place> {
    const data = await this.databaseService.read();
    const place = data.places.find((p) => p.id === id);
    if (!place) throw new NotFoundException(`Place ${id} introuvable`);
    return place;
  }

  async update(id: string, dto: UpdatePlaceDto): Promise<Place> {
    const data = await this.databaseService.read();
    const index = data.places.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException(`Place ${id} introuvable`);

    const updated: Place = {
      ...data.places[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    data.places[index] = updated;
    await this.databaseService.write(data);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const data = await this.databaseService.read();
    const index = data.places.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException(`Place ${id} introuvable`);

    data.places.splice(index, 1);
    data.reviews = data.reviews.filter((r) => r.placeId !== id);
    await this.databaseService.write(data);
  }
}
