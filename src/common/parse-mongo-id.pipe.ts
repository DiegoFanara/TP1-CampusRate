import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isObjectIdOrHexString(value)) {
      throw new BadRequestException('Identifiant invalide');
    }
    return value;
  }
}