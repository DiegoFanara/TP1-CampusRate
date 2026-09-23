import { IsString, IsNotEmpty, IsInt, IsOptional, IsArray, Max, Min, MinLength, MaxLength } from 'class-validator';

//const rating

export class CreateReviewDto {
    @IsString()
    @IsNotEmpty()
    authorsName: string;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @MinLength(10)
    @MaxLength(500)
    comment: string;
}