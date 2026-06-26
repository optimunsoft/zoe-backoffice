import { BadRequestException } from '@nestjs/common';

export interface LegalIdentityData {
    businessNatureCode: string;
    businessName?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    secondLastName?: string;
}

export class LegalIdentityValidator {
    /**
     * Valida y construye el businessName basado en la naturaleza empresarial
     * @param data Datos de identidad legal
     * @returns El businessName validado y construido
     */
    static validateAndBuildBusinessName(data: LegalIdentityData): string {
        const { businessNatureCode, businessName, firstName, middleName, lastName, secondLastName } = data;

        if (businessNatureCode === '2') { // Persona natural
            // Para persona natural, firstName y lastName son obligatorios
            if (!firstName || firstName.trim() === '') {
                throw new BadRequestException('Para persona natural, el campo primer nombre es obligatorio.');
            }
            
            if (!lastName || lastName.trim() === '') {
                throw new BadRequestException('Para persona natural, el campo primer apellido es obligatorio.');
            }

            // Construir businessName concatenando los nombres
            const nameParts = [firstName, middleName, lastName, secondLastName]
                .filter(part => part && part.trim() !== '');

            return nameParts.join(' ');
        } else if (businessNatureCode === '1') { // Persona jurídica
            // Para persona jurídica, businessName es obligatorio
            if (!businessName || businessName.trim() === '') {
                throw new BadRequestException('Para persona jurídica, el campo razón social es obligatorio.');
            }

            return businessName.trim();
        }

        // Si no es un código válido, retornar businessName o string vacío
        return businessName?.trim() || '';
    }

    /**
     * Valida que los campos requeridos estén presentes según la naturaleza empresarial
     * @param data Datos de identidad legal
     */
    static validateRequiredFields(data: LegalIdentityData): void {
        const { businessNatureCode, businessName, firstName, lastName } = data;

        if (businessNatureCode === '2') { // Persona natural
            if (!firstName || firstName.trim() === '') {
                throw new BadRequestException('Para persona natural, el campo primer nombre es obligatorio.');
            }
            
            if (!lastName || lastName.trim() === '') {
                throw new BadRequestException('Para persona natural, el campo primer apellido es obligatorio.');
            }
        } else if (businessNatureCode === '1') { // Persona jurídica
            if (!businessName || businessName.trim() === '') {
                throw new BadRequestException('Para persona jurídica, el campo razón social es obligatorio.');
            }
        }
    }

    /**
     * Determina si la entidad es persona natural
     * @param businessNatureCode Código de naturaleza empresarial
     * @returns true si es persona natural
     */
    static isNaturalPerson(businessNatureCode: string): boolean {
        return businessNatureCode === '2';
    }

    /**
     * Determina si la entidad es persona jurídica
     * @param businessNatureCode Código de naturaleza empresarial
     * @returns true si es persona jurídica
     */
    static isLegalPerson(businessNatureCode: string): boolean {
        return businessNatureCode === '1';
    }
} 