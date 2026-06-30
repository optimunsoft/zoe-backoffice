import { RutExtractionRawDto } from 'src/domains/backoffice/administration/dto/rut-extraction-result.dto';
import { UploadedFile } from 'src/shared/interfaces/uploaded-file.interface';

export const DOCUMENT_EXTRACTION_INTEGRATION = Symbol('DOCUMENT_EXTRACTION_INTEGRATION');

export interface IDocumentExtractionIntegration {
  extractRutPrefillFromPdf(file: UploadedFile): Promise<RutExtractionRawDto>;
  extractRutFullFromPdf(file: UploadedFile): Promise<RutExtractionRawDto>;
}
