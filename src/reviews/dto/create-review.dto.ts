import { IsString, IsNotEmpty, IsInt, Max, Min, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { trim } from '../../common/trim.transform';

export class CreateReviewDto {
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    authorsName: string;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @Transform(trim)
    @IsString()
    @MinLength(10)
    @MaxLength(500)
    comment: string;
}