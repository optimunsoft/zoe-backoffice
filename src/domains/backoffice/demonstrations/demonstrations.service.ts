import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResult } from 'src/shared/interfaces/PaginatedResult';
import { CreateDemonstrationDto } from './dto/create-demonstration.dto';
import { UpdateDemonstrationDto } from './dto/update-demonstration.dto';
import { Demonstration, DemonstrationStatus } from './entities/demonstration.entity';
import { DemonstrationRepository } from './repositories/DemonstrationRepository';

@Injectable()
export class DemonstrationsService {
    private readonly productInterestSeparator = ';';

    constructor(private readonly demonstrationRepository: DemonstrationRepository) {}

    async create(data: CreateDemonstrationDto): Promise<Demonstration> {
        return this.demonstrationRepository.save(
            this.demonstrationRepository.create({
                name: data.name.trim(),
                email: data.email.trim().toLowerCase(),
                phone: data.phone?.trim() || null,
                scheduledAt: new Date(data.scheduledAt),
                productInterest: this.serializeProductInterest(data.productInterest),
                status: DemonstrationStatus.PENDING,
            }),
        );
    }

    async list(page = 1, amount = 10, search?: string): Promise<PaginatedResult<Demonstration>> {
        if (!Number.isInteger(page) || page < 1 || !Number.isInteger(amount) || amount < 1) {
            throw new BadRequestException('Los parámetros de paginación no son válidos.');
        }

        const query = this.demonstrationRepository
            .qb('demonstration')
            .orderBy('demonstration.createdAt', 'DESC');

        if (search?.trim()) {
            query.where(
                `(
        unaccent(demonstration.name) ILIKE unaccent(:search)
        OR unaccent(demonstration.email) ILIKE unaccent(:search)
        OR unaccent(COALESCE(demonstration.productInterest, '')) ILIKE unaccent(:search)
      )`,
                { search: `%${search.trim()}%` },
            );
        }

        const [data, total] = await Promise.all([
            query
                .skip((page - 1) * amount)
                .take(amount)
                .getMany(),
            query.getCount(),
        ]);

        return { data, total, page, amount };
    }

    async find(id: string): Promise<Demonstration> {
        const demonstration = await this.demonstrationRepository.findById(id);
        if (!demonstration) {
            throw new NotFoundException('La demostración solicitada no existe.');
        }
        return demonstration;
    }

    async update(id: string, data: UpdateDemonstrationDto): Promise<Demonstration> {
        await this.find(id);
        return this.demonstrationRepository.update(id, {
            ...(data.name !== undefined && { name: data.name.trim() }),
            ...(data.email !== undefined && { email: data.email.trim().toLowerCase() }),
            ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
            ...(data.scheduledAt !== undefined && { scheduledAt: new Date(data.scheduledAt) }),
            ...(data.productInterest !== undefined && {
                productInterest: this.serializeProductInterest(data.productInterest),
            }),
            ...(data.status !== undefined && { status: data.status }),
        });
    }

    async delete(id: string): Promise<void> {
        await this.demonstrationRepository.remove(await this.find(id));
    }

    serializeProductInterest(productInterest?: string | string[] | null): string | null {
        const products = Array.isArray(productInterest)
            ? productInterest
            : productInterest
              ? [productInterest]
              : [];

        const normalizedProducts = products.map(product => product.trim()).filter(Boolean);

        return normalizedProducts.length
            ? normalizedProducts.join(this.productInterestSeparator)
            : null;
    }

    deserializeProductInterest(productInterest?: string | null): string[] {
        return productInterest
            ? productInterest
                  .split(this.productInterestSeparator)
                  .map(product => product.trim())
                  .filter(Boolean)
            : [];
    }
}
