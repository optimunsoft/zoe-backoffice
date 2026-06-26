import * as Joi from 'joi';

// Enums para validación
const ReportType = Joi.string().valid('Balance de Comprobación', 'Libro Mayor y Balance');
const GroupedBy = Joi.string().valid('', 'Por Tercero', 'Por Centro de Costo');

export const trialBalanceBody = Joi.object({
    data: Joi.array().items(
        Joi.object({
            codigo: Joi.string().required().description('Código de la cuenta contable'),
            nombre: Joi.string().required().description('Nombre de la cuenta contable'),
            naturaleza: Joi.string().valid('D', 'C').required().description('Naturaleza de la cuenta (D/C)'),
            auxiliar: Joi.boolean().required().description('Indica si la cuenta es auxiliar'),
            saldo_anterior: Joi.string().required().description('Saldo anterior de la cuenta'),
            debito: Joi.string().required().description('Total de débitos del período'),
            credito: Joi.string().required().description('Total de créditos del período'),
            saldo_actual: Joi.string().required().description('Saldo actual de la cuenta')
        })
    ).required().min(1).description('Array de cuentas con sus movimientos y saldos'),

    metadata: Joi.object({
        company: Joi.object({
            businessName: Joi.string().required().description('Razón social de la empresa'),
            documentNumber: Joi.string().required().description('Número de documento de la empresa')
        }).required().description('Información de la empresa'),

        thirdParty: Joi.object({
            businessName: Joi.string().required().description('Razón social del tercero'),
            documentNumber: Joi.string().required().description('Número de documento del tercero')
        }).optional().description('Información del tercero (solo cuando groupedBy es "Por Tercero")'),

        costCenter: Joi.object({
            name: Joi.string().required().description('Nombre del centro de costo')
        }).optional().description('Información del centro de costo (solo cuando groupedBy es "Por Centro de Costo")'),

        fiscalYear: Joi.number().integer().positive().required().description('Año fiscal del reporte'),
        month: Joi.number().integer().min(1).max(12).optional().description('Mes del reporte'),
        startMonth: Joi.number().integer().min(1).max(12).optional().description('Mes de inicio del período'),
        endMonth: Joi.number().integer().min(1).max(12).optional().description('Mes de fin del período'),
        startCode: Joi.number().integer().min(0).optional().description('Código de inicio del rango de cuentas'),
        endCode: Joi.number().integer().min(0).optional().description('Código de fin del rango de cuentas'),
        onlyAuxiliary: Joi.boolean().required().description('Indica si solo se incluyen cuentas auxiliares'),
        reportType: ReportType.required().description('Tipo de reporte: Balance de Comprobación o Libro Mayor y Balance'),
        groupedBy: GroupedBy.required().description('Tipo de agrupación: General (vacío), Por Tercero, o Por Centro de Costo')
    })
    .required()
    .description('Metadatos del reporte')
    .xor('month', 'startMonth')
    .with('startMonth', 'endMonth')
    .with('endMonth', 'startMonth')
    .with('startCode', 'endCode')
    .with('endCode', 'startCode')
});
