import { IsString } from 'class-validator';

export class AssignServiceDto {
  @IsString()
  serviceId: string;
}
