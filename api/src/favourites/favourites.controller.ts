import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FavouritesService } from './favourites.service';
import { AddFavouriteDto } from './dto/add-favourite.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('favourites')
export class FavouritesController {
  constructor(private favouritesService: FavouritesService) {}

  @Get()
  list(@CurrentUser() user: { userId: string }) {
    return this.favouritesService.list(user.userId);
  }

  @Post()
  add(@Body() dto: AddFavouriteDto, @CurrentUser() user: { userId: string }) {
    return this.favouritesService.add(user.userId, dto.serviceProviderId);
  }

  @Delete(':serviceProviderId')
  remove(
    @Param('serviceProviderId') serviceProviderId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.favouritesService.remove(user.userId, serviceProviderId);
  }
}
