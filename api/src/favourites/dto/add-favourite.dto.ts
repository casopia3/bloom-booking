import { IsString } from 'class-validator';

export class AddFavouriteDto {
  @IsString()
  serviceProviderId: string;
}
