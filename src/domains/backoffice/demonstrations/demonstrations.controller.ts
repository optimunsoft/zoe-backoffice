import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UseAuth } from 'src/infrastructure/security/decorators/use-auth.decorator';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';
import { TransactionInterceptor } from 'src/shared/interceptors/transactional.interceptor';
import { CreateDemonstrationDto } from './dto/create-demonstration.dto';
import { DemonstrationDto } from './dto/demonstration.dto';
import { UpdateDemonstrationDto } from './dto/update-demonstration.dto';
import { DemonstrationsService } from './demonstrations.service';
import { Throttle } from '@nestjs/throttler';
import { Demonstration } from './entities/demonstration.entity';

@Controller({ path: 'demonstrations', version: '1' })
export class DemonstrationsController {
    constructor(private readonly demonstrationsService: DemonstrationsService) {}

    // Protegido por API key mientras se habilita el formulario público.
    @Post('public/create')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @UseInterceptors(TransactionInterceptor)
    async createPublic(@Body() data: CreateDemonstrationDto): Promise<DemonstrationDto> {
        return this.toDto(await this.demonstrationsService.create(data));
    }

    @Post('create')
    @UseAuth('admin')
    @UseInterceptors(TransactionInterceptor)
    async create(@Body() data: CreateDemonstrationDto): Promise<DemonstrationDto> {
        return this.toDto(await this.demonstrationsService.create(data));
    }

    @Get('list')
    @UseAuth('admin')
    async list(
        @Query('page', new ParseIntPipe({ optional: true })) page = 1,
        @Query('amount', new ParseIntPipe({ optional: true })) amount = 10,
        @Query('search') search?: string,
    ): Promise<PaginatedResult<DemonstrationDto>> {
        const result = await this.demonstrationsService.list(page, amount, search);
        return { ...result, data: result.data.map(item => this.toDto(item)) };
    }

    @Get('specific/:id')
    @UseAuth('admin')
    async find(@Param('id', ParseUUIDPipe) id: string): Promise<DemonstrationDto> {
        return this.toDto(await this.demonstrationsService.find(id));
    }

    @Put('edit/:id')
    @UseAuth('admin')
    @UseInterceptors(TransactionInterceptor)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: UpdateDemonstrationDto,
    ): Promise<DemonstrationDto> {
        return this.toDto(await this.demonstrationsService.update(id, data));
    }

    @Delete('delete/:id')
    @UseAuth('admin')
    @UseInterceptors(TransactionInterceptor)
    async delete(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
        await this.demonstrationsService.delete(id);
        return { message: 'Demostración eliminada exitosamente' };
    }

    private toDto(data: Demonstration): DemonstrationDto {
        return plainToInstance(
            DemonstrationDto,
            {
                ...data,
                productInterest: this.demonstrationsService.deserializeProductInterest(
                    data.productInterest,
                ),
            },
            { excludeExtraneousValues: true },
        );
    }
}
