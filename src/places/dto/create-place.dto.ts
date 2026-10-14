import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { PlaceCategory } from '../enums/place-category.enum';
import { PlaceStatus } from '../enums/place-status.enum';
import { Transform } from 'class-transformer';
import { trim } from '../../common/trim.transform';

export class CreatePlaceDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(PlaceCategory)
  category: PlaceCategory;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @IsOptional()
  @IsEnum(PlaceStatus)
  status?: PlaceStatus;
}