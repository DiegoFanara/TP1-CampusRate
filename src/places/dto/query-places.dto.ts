import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

const CATEGORIES = ['STUDY_SPACE', 'LIBRARY', 'FOOD_SERVICE', 'SPORTS', 'STUDENT_SERVICE', 'COMPUTER_LAB', 'OTHER'];

export class QueryPlacesDto {
  @IsOptional()
  @IsIn(CATEGORIES)
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