import { Module } from '@nestjs/common';
import { DOCUMENT_EXTRACTION_INTEGRATION } from './interfaces/document-extraction.interface';
import { OpenAiDocumentExtractionService } from './services/openai-document-extraction.service';

@Module({
  providers: [
    {
      provide: DOCUMENT_EXTRACTION_INTEGRATION,
      useClass: OpenAiDocumentExtractionService,
    },
  ],
  exports: [DOCUMENT_EXTRACTION_INTEGRATION],
})
export class OpenAiModule {}
