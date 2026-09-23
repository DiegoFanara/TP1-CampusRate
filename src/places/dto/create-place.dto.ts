import { IsString, IsNotEmpty, IsIn, IsOptional, IsArray } from 'class-validator';

const CATEGORIES = ['STUDY_SPACE', 'LIBRARY', 'FOOD_SERVICE', 'SPORTS', 'STUDENT_SERVICE', 'COMPUTER_LAB', 'OTHER'];
const STATUSES = ['ACTIVE', 'TEMPORARILY_CLOSED', 'INACTIVE'];

export class CreatePlaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsIn(CATEGORIES)
  category: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;
}