import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post('reviews')
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: { userId: string; role: UserRole }) {
    return this.reviewsService.create(dto, user);
  }

  // Public — shown on a provider's profile page, no auth required
  @Get('providers/:providerId/reviews')
  findByProvider(@Param('providerId') providerId: string) {
    return this.reviewsService.findByProvider(providerId);
  }

  @Get('providers/:providerId/reviews/summary')
  getProviderRatingSummary(@Param('providerId') providerId: string) {
    return this.reviewsService.getProviderRatingSummary(providerId);
  }

  @Get('specialists/:specialistId/reviews')
  findBySpecialist(@Param('specialistId') specialistId: string) {
    return this.reviewsService.findBySpecialist(specialistId);
  }
}
