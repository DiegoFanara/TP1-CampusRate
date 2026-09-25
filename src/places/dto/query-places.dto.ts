import { IsOptional, IsIn, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PlaceCategory } from '../enums/place-category.enum';


export class QueryPlacesDto {
  @IsOptional()
  @IsEnum(PlaceCategory)
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}