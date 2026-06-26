import * as Joi from 'joi';

// Enums para validación (alineados a los strings que produce el API Nest)
const ReportType = Joi.string().valid('Balance de Comprobación');
const GroupedBy = Joi.string().valid('Por Tercero', 'Por Centro de Costo');

export const trialBalanceGroupedBody = Joi.object({
    data: Joi.array()
        .items(
            Joi.object({
                codigo: Joi.string().required(),
                nombre: Joi.string().required(),
                naturaleza: Joi.string().valid('D', 'C').required(),
                comp: Joi.alternatives().try(Joi.string(), Joi.valid(null), Joi.valid('')).required(),
                agrupador: Joi.alternatives().try(Joi.string(), Joi.valid(null)).required(),
                saldo_anterior: Joi.string().required(),
                debito: Joi.string().required(),
                credito: Joi.string().required(),
                saldo_actual: Joi.string().required(),
            })
        )
        .min(1)
        .required(),
    metadata: Joi.object({
        company: Joi.object({
            businessName: Joi.string().required(),
            documentNumber: Joi.string().required(),
        }).required(),
        fiscalYear: Joi.number().integer().positive().required(),
        month: Joi.number().integer().min(1).max(12).optional(),
        startMonth: Joi.number().integer().min(1).max(12).optional(),
        endMonth: Joi.number().integer().min(1).max(12).optional(),
        startCode: Joi.number().integer().min(0).optional(),
        endCode: Joi.number().integer().min(0).optional(),
        reportType: ReportType.required(),
        groupedBy: GroupedBy.required(),
    })
        .required()
        .xor('month', 'startMonth')
        .with('startMonth', 'endMonth')
        .with('endMonth', 'startMonth')
        .with('startCode', 'endCode')
        .with('endCode', 'startCode'),
});


