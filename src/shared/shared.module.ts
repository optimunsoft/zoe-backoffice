import { Module } from '@nestjs/common';
import { MailerModule } from './modules/mailer/mailer.module';

@Module({
    imports: [MailerModule],
    exports: [MailerModule]
})
export class SharedModule {} 