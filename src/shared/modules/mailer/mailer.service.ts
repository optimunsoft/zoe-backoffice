import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { envs } from 'src/config/env.config';

@Injectable()
export class MailerService {

    private get baseUrl(): string {
        return envs.mailer_host_address?.replace(/\/$/, '') || '';
    }

    private get apiKey(): string {
        return envs.mailer_api_key;
    }

    async requestTrialBalancePdf(body: any): Promise<Buffer> {
        const url = `${this.baseUrl}/api/v1/reports/trial-balance`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }
        

        if (!response.ok) {
            const text = await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch(() => null);
        if (!data) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 02');
        }

        // Se espera base64; soportar estructura { status, message, response: { pdfBase64 } }
        // y alternativas { file | base64 | data } o string directa
        const base64: string = typeof data === 'string'
            ? data
            : (data.response?.pdfBase64 || data.file || data.base64 || data.data);
        if (!base64) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        // Normalizar por si viene como data URI (data:application/pdf;base64,....)
        const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(cleaned, 'base64');
        return buffer;
    }

    async requestTrialBalanceGroupedPdf(body: any): Promise<Buffer> {
        const url = `${this.baseUrl}/api/v1/reports/trial-balance-grouped`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }

        if (!response.ok) {
            await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch(() => null);
        if (!data) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 02');
        }

        const base64: string = typeof data === 'string'
            ? data
            : (data.response?.pdfBase64 || data.file || data.base64 || data.data);
        if (!base64) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(cleaned, 'base64');
        return buffer;
    }

    async requestAnnexReportPdf(body: any): Promise<Buffer> {
        // Determinar el tipo de reporte desde los metadatos
        const reportType = body?.metadata?.reportType;
        const endpoint = reportType === 'ANEXOS_DETAILED' ? 'annex-detailed' : 'annex-grouped';
        const url = `${this.baseUrl}/api/v1/reports/${endpoint}`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }
        

        if (!response.ok) {
            const text = await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch(() => null);
        if (!data) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 02');
        }

        // Se espera base64; soportar estructura { status, message, response: { pdfBase64 } }
        // y alternativas { file | base64 | data } o string directa
        const base64: string = typeof data === 'string'
            ? data
            : (data.response?.pdfBase64 || data.file || data.base64 || data.data);
        if (!base64) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        // Normalizar por si viene como data URI (data:application/pdf;base64,....)
        const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(cleaned, 'base64');
        return buffer;
    }

    async requestAuxiliaryBookPdf(body: any): Promise<Buffer> {
        const url = `${this.baseUrl}/api/v1/reports/auxiliary-book`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }

        if (!response.ok) {
            const text = await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02-1`);
            }

            if (response.status === 404) {
                throw new InternalServerErrorException(`Servicio no disponible: Ruta no encontrada`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch((error) => console.log(error));
        if (!data) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 02-2');
        }

        const base64: string = typeof data === 'string'
            ? data
            : (data.response?.pdfBase64 || data.file || data.base64 || data.data);
        if (!base64) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(cleaned, 'base64');
        return buffer;
    }

    async requestEntryPdf(body: any): Promise<Buffer> {
        const url = `${this.baseUrl}/api/v1/reports/entry`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }
        

        if (!response.ok) {
            const text = await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch(() => null);
        if (!data) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 02');
        }

        // Se espera base64; soportar estructura { status, message, response: { pdfBase64 } }
        // y alternativas { file | base64 | data } o string directa
        const base64: string = typeof data === 'string'
            ? data
            : (data.response?.pdfBase64 || data.file || data.base64 || data.data);
        if (!base64) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        // Normalizar por si viene como data URI (data:application/pdf;base64,....)
        const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(cleaned, 'base64');
        return buffer;
    }

    async requestAnnexConfigReportPdf(body: any): Promise<Buffer> {
        const url = `${this.baseUrl}/api/v1/reports/annex-config`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }
        

        if (!response.ok) {
            const text = await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch(() => null);
        if (!data) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 02');
        }

        // Se espera base64; soportar estructura { status, message, response: { pdfBase64 } }
        // y alternativas { file | base64 | data } o string directa
        const base64: string = typeof data === 'string'
            ? data
            : (data.response?.pdfBase64 || data.file || data.base64 || data.data);
        if (!base64) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        // Normalizar por si viene como data URI (data:application/pdf;base64,....)
        const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(cleaned, 'base64');
        return buffer;
    }

    async requestCertificatePdf(body: any, certificateType: string): Promise<Buffer> {
        const url = `${this.baseUrl}/api/v1/reports/certificate/${certificateType}`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }

        if (!response.ok) {
            const text = await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch(() => null);
        if (!data) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 02');
        }

        const base64: string = typeof data === 'string'
            ? data
            : (data.response?.pdfBase64 || data.file || data.base64 || data.data);
        if (!base64) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(cleaned, 'base64');
        return buffer;
    }

    async requestIncomeStatementPdf(body: any): Promise<Buffer> {
        const url = `${this.baseUrl}/api/v1/reports/income-statement`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }
        

        if (!response.ok) {
            const text = await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch(() => null);
        if (!data) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 02');
        }

        // Se espera base64; soportar estructura { status, message, response: { pdfBase64 } }
        // y alternativas { file | base64 | data } o string directa
        const base64: string = typeof data === 'string'
            ? data
            : (data.response?.pdfBase64 || data.file || data.base64 || data.data);
        if (!base64) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        // Normalizar por si viene como data URI (data:application/pdf;base64,....)
        const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(cleaned, 'base64');
        return buffer;
    }

    async requestDailyCashPdf(body: any): Promise<Buffer> {
        const url = `${this.baseUrl}/api/v1/reports/daily-cash`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }
        

        if (!response.ok) {
            const text = await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch(() => null);
        if (!data) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 02');
        }

        // Se espera base64; soportar estructura { status, message, response: { pdfBase64 } }
        // y alternativas { file | base64 | data } o string directa
        const base64: string = typeof data === 'string'
            ? data
            : (data.response?.pdfBase64 || data.file || data.base64 || data.data);
        if (!base64) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        // Normalizar por si viene como data URI (data:application/pdf;base64,....)
        const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(cleaned, 'base64');
        return buffer;
    }

    async requestBalanceSheetPdf(body: any): Promise<Buffer> {
        const url = `${this.baseUrl}/api/v1/reports/balance-sheet`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }
        

        if (!response.ok) {
            const text = await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch(() => null);
        if (!data) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 02');
        }

        // Se espera base64; soportar estructura { status, message, response: { pdfBase64 } }
        // y alternativas { file | base64 | data } o string directa
        const base64: string = typeof data === 'string'
            ? data
            : (data.response?.pdfBase64 || data.file || data.base64 || data.data);
        if (!base64) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        // Normalizar por si viene como data URI (data:application/pdf;base64,....)
        const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(cleaned, 'base64');
        return buffer;
    }

    async requestEntriesZipEmail(body: any): Promise<{ jobId: string }> {
        const url = `${this.baseUrl}/api/v1/reports/entries-zip-email`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `ApiKey ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (error) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 00');
        }

        if (!response.ok) {
            await response.json().catch(() => '');
            if (response.status === 400) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 01`);
            }

            if (response.status === 401) {
                throw new InternalServerErrorException(`Servicio no disponible: Tipo 02`);
            }

            throw new InternalServerErrorException(`Servicio no disponible: Tipo 03`);
        }

        const data = await response.json().catch(() => null);
        const jobId: string | undefined = data?.response?.jobId || data?.jobId;
        if (!jobId) {
            throw new InternalServerErrorException('Servicio no disponible: Tipo 03');
        }

        return { jobId };
    }
}


