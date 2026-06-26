import { Expose } from 'class-transformer';

export class GenericSummaryDto {
    @Expose() id: string;
    @Expose() code: string;
    @Expose() name: string;
}