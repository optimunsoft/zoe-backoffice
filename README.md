# 📋 Manual de Desarrollo - ERP API Nest

## 🎯 Directivas Fundamentales del Proyecto

### **1. Responsabilidad de Mapeo en Controladores**
- **Los servicios van a recibir y devolver tipos internos de la aplicación**
- **Los mapeos de entrada y salida son responsabilidad de los controladores**
- **Los servicios trabajan exclusivamente con entidades y tipos internos**

### **2. Estructura de DTOs**
- **Los controladores tendrán que recibir un DTO y responder un DTO**
- **Cada DTO debe estar definido en su propio archivo**
- **La lógica de mapeo en los controladores es indiferente; se puede utilizar una librería como class-validator o se puede mapear manualmente**

### **3. Importación Explícita de Entidades**
- **Aunque no sea estrictamente necesario, se debe importar con `TypeOrmModule.forFeature` para las entidades**
- **Hacer explícita la importación de entidades en cada módulo**
- **Mantener claridad sobre qué entidades usa cada módulo**

### **4. Ubicación de Entidades de Tablas Intermedias**
- **Las entidades de tablas intermedias vivirán en uno de los módulos que conecta**
- **No crear módulos separados para tablas intermedias**
- **Mantener la coherencia del dominio de negocio**

## 🚀 Directivas Adicionales Recomendadas

### **5. Gestión de Transacciones**
- **Los controladores que modifican datos deben usar `@UseInterceptors(TransactionInterceptor)`**
- **Los repositorios deben extender `BaseRepository` para manejo automático de transacciones**
- **Las operaciones de escritura (CREATE, UPDATE, DELETE) siempre deben estar dentro de transacciones**

### **6. Estructura de Respuestas**
- **Todas las respuestas de la API deben seguir el formato estándar: `{ status: boolean, message: string, response: any }`**
- **Los controladores no deben transformar manualmente las respuestas, el `TransformInterceptor` se encarga de esto**
- **Los servicios deben devolver datos puros, sin envolver en estructura de respuesta**

### **7. Manejo de Errores**
- **Usar excepciones nativas de NestJS: `BadRequestException`, `NotFoundException`, `ConflictException`, etc.**
- **Los mensajes de error deben ser descriptivos y en español**
- **No usar códigos de error personalizados, solo mensajes claros**
- **El `AllExceptionsFilter` se encarga de formatear todas las excepciones**

### **8. Validación de Datos**
- **Usar `class-validator` con decoradores en todos los DTOs**
- **Configurar `ValidationPipe` global con `whitelist: true` y `forbidNonWhitelisted: true`**
- **Validar UUIDs con `@IsUUID()` y emails con `@IsEmail()`**
- **Los DTOs de entrada deben validar todos los campos requeridos**

### **9. Estructura de Módulos**
- **Cada módulo debe importar explícitamente `TypeOrmModule.forFeature([Entity])` para sus entidades**
- **Los módulos deben exportar solo los servicios que otros módulos necesiten**
- **Los repositorios deben ser `REQUEST` scope para manejo de transacciones**
- **Usar `SharedModule` para componentes reutilizables entre dominios**

### **10. Nomenclatura y Convenciones**
- **Entidades: PascalCase singular (`Company`, `User`)**
- **DTOs: PascalCase con sufijo `Dto` (`CreateCompanyDto`, `CompanySummaryDto`)**
- **Servicios: PascalCase con sufijo `Service` (`CompanyService`)**
- **Repositorios: PascalCase con sufijo `Repository` (`CompanyRepository`)**
- **Controladores: PascalCase con sufijo `Controller` (`CompanyController`)**
- **Módulos: PascalCase con sufijo `Module` (`CompanyModule`)**

### **11. Relaciones entre Entidades**
- **Usar `eager: true` para relaciones que siempre se necesitan**
- **Las entidades de tablas intermedias deben vivir en el módulo del dominio principal**
- **Definir relaciones bidireccionales cuando sea necesario para consultas eficientes**
- **Usar `@JoinColumn` para especificar nombres de columnas personalizados**

### **12. Configuración y Variables de Entorno**
- **Usar `envs` del archivo `env.config.ts` para toda configuración**
- **Validar variables de entorno al inicio de la aplicación**
- **No hardcodear valores de configuración en el código**

### **13. Documentación API**
- **Usar Swagger/OpenAPI con decoradores en controladores**
- **Documentar todos los endpoints con `@ApiOperation`, `@ApiResponse`**
- **Los DTOs deben incluir `@ApiProperty` para documentación automática**

### **14. Seguridad y Autenticación**
- **Usar `@UseGuards(AuthGuard('jwt'))` en endpoints protegidos**
- **Implementar versionado de API con `@Controller({ path: 'resource', version: '1' })`**
- **Usar Helmet para headers de seguridad**
- **Configurar CORS apropiadamente para el entorno**

### **15. Testing**
- **Cada servicio debe tener tests unitarios**
- **Los controladores deben tener tests de integración**
- **Usar mocks para dependencias externas**
- **Mantener cobertura de código alta**

### **16. Logging y Monitoreo**
- **Usar el Logger de NestJS para logs estructurados**
- **Loggear errores con stack traces completos**
- **Implementar health checks para monitoreo**

### **17. Performance**
- **Usar `eager: true` solo cuando sea necesario**
- **Implementar paginación en endpoints que devuelven listas**
- **Usar índices apropiados en la base de datos**
- **Evitar N+1 queries con `relations` en TypeORM**

### **18. Migración y Seeds**
- **Mantener scripts SQL en `docs/db/` para estructura y datos iniciales**
- **Usar `synchronize: false` en producción**
- **Implementar migraciones para cambios de esquema**

### **19. Deployment**
- **Usar Docker para containerización**
- **Configurar variables de entorno para diferentes entornos**
- **Implementar health checks para orquestadores**
- **Usar PM2 o similar para gestión de procesos en producción**

## 📝 Ejemplos de Implementación

### Ejemplo de Controlador con Mapeo
```typescript
@Controller({ path: 'companies', version: '1' })
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @Post('create')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(TransactionInterceptor)
    async create(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanySummaryDto> {
        // El servicio recibe y devuelve tipos internos
        const company = await this.companyService.create(createCompanyDto);
        // El controlador mapea a DTO de respuesta
        return this.mapToCompanySummaryDto(company);
    }

    private mapToCompanySummaryDto(company: Company): CompanySummaryDto {
        return {
            id: company.id,
            businessName: company.businessName,
            // ... mapeo completo
        };
    }
}
```

### Ejemplo de Servicio con Inyección de Repositorio (Recomendado para operaciones CRUD)
```typescript
@Injectable()
export class EntryTypeService {
    constructor(
        private readonly entryTypeRepository: EntryTypeRepository,
        private readonly companyRepository: CompanyRepository, // Inyección directa del repositorio
        private readonly userRepository: UserRepository
    ) {}

    async create(createEntryTypeDto: CreateEntryTypeDto): Promise<EntryType> {
        // Usar el repositorio directamente para validaciones simples
        const company = await this.companyRepository.findById(createEntryTypeDto.companyId);
        if (!company) {
            throw new BadRequestException('La empresa especificada no existe.');
        }

        const user = await this.userRepository.findById(createEntryTypeDto.userId);
        if (!user) {
            throw new BadRequestException('El usuario especificado no existe.');
        }

        // ... resto de la lógica
    }
}
```

### Ejemplo de Servicio con Inyección de Otro Servicio (Para lógica de negocio compleja)
```typescript
@Injectable()
export class CompanyService {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly businessNatureService: BusinessNatureService // Inyección de servicio para lógica compleja
    ) {}

    async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
        // Usar el servicio cuando se necesita lógica de negocio compleja
        const businessNature = await this.businessNatureService.validateAndProcess(createCompanyDto.businessNatureId);
        
        // ... resto de la lógica
    }
}
```

### Ejemplo de Módulo con Importación Explícita
```typescript
@Module({
    imports: [
        TypeOrmModule.forFeature([Company]), // Importación explícita
        SharedModule
    ],
    providers: [CompanyService, CompanyRepository],
    controllers: [CompanyController],
    exports: [CompanyService] // Solo exportar servicios necesarios
})
export class CompanyModule {}
```

## 🔧 Checklist de Desarrollo

### Antes de Crear un Nuevo Endpoint
- [ ] ¿El DTO de entrada está validado con class-validator?
- [ ] ¿El DTO de respuesta está definido en archivo separado?
- [ ] ¿El servicio recibe y devuelve tipos internos?
- [ ] ¿El controlador maneja el mapeo entrada/salida?
- [ ] ¿Se usa TransactionInterceptor para operaciones de escritura?
- [ ] ¿Se inyectan repositorios para operaciones CRUD básicas?
- [ ] ¿Se inyectan servicios solo cuando se necesita lógica de negocio compleja?
- [ ] ¿La entidad está importada con TypeOrmModule.forFeature?

### Antes de Crear un Nuevo Módulo
- [ ] ¿Las entidades están en el dominio correcto?
- [ ] ¿Las tablas intermedias están en el módulo principal?
- [ ] ¿Se exportan solo los servicios necesarios?
- [ ] ¿Los repositorios son REQUEST scope?
- [ ] ¿Se siguen las convenciones de nomenclatura?

### Antes de Hacer Commit
- [ ] ¿Los tests pasan?
- [ ] ¿El código está formateado con Prettier?
- [ ] ¿No hay errores de ESLint?
- [ ] ¿La documentación Swagger está actualizada?
- [ ] ¿Los mensajes de error están en español? 