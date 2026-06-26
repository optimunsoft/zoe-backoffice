# 🏗️ Estructura del Proyecto ERP API

## 📁 Organización General

```
src/
├── main.ts                    # Punto de entrada + configuración versionado
├── app.module.ts              # Módulo raíz que importa dominios
├── config/
│   └── env.config.ts          # Configuración de variables de entorno
├── shared/                    # Componentes compartidos entre dominios
│   ├── index.ts              # Exportaciones principales
│   ├── entities/
│   │   └── base.entity.ts    # Entidad base para todas las entidades
│   ├── utils/
│   │   └── validators.ts     # Utilidades de validación
│   ├── filters/              # Filtros globales de excepciones
│   ├── interceptors/         # Interceptors de transformación
│   ├── pipes/                # Pipes personalizados
│   ├── guards/               # Guards de autenticación/autorización
│   └── modules/              # Módulos compartidos entre dominios
├── infrastructure/           # Capa de infraestructura
│   └── psql/
│       ├── database.module.ts
│       ├── BaseRepository.ts  # Repositorio base con getRepository()
│       └── DatabaseException.ts
└── domains/                  # Dominios de negocio
    └── core/                 # Dominio principal (auth, users)
        ├── core.module.ts    # Módulo que exporta todo el dominio
        ├── auth/             # Módulo de autenticación (v1)
        └── users/            # Módulo de usuarios (v1)
```

## 🎯 Principios de la Arquitectura

### **1. Versionado de API**
- **URI Versioning**: `/api/v1/auth`, `/api/v2/users`
- **Versión por defecto**: v1
- **Soporte Swagger**: Documentación automática por versión
- **Fácil migración**: Controladores independientes por versión

### **2. Separación por Dominios**
- Cada dominio es autocontenido y exporta un módulo principal
- Los dominios pueden comunicarse a través de interfaces bien definidas
- Fácil escalabilidad agregando nuevos dominios (sales, inventory, etc.)

### **3. Shared para Reutilización**
- Componentes que se usan en múltiples dominios
- Utilidades, validadores y entidades base
- Filtros, interceptors y guards globales

### **4. Infrastructure Separada**
- Preparada para múltiples bases de datos
- Abstracciones de acceso a datos
- Servicios externos (APIs, storage, etc.)

### **5. Configuración Simplificada**
- Un solo archivo de configuración
- Validación con Joi
- Soporte para múltiples entornos

### **6. BaseRepository Simple**
- Solo proporciona `getRepository()` con contexto transaccional
- Los repositorios usan métodos nativos de TypeORM
- Mantiene consistencia y simplicidad

### **7. Manejo de Errores Directo**
- Mensajes personalizados en cada punto específico
- Sin códigos de error complejos o diccionarios
- Excepciones nativas de NestJS (`BadRequestException`, `ConflictException`, etc.)

### **8. Linting y Formateo Automático**
- **ESLint** con reglas TypeScript y NestJS
- **Prettier** para formateo consistente
- **Naming conventions** estrictas para interfaces, clases, etc.

## 🚀 Ventajas de esta Estructura

✅ **Escalabilidad**: Fácil agregar nuevos dominios y versiones  
✅ **Mantenibilidad**: Responsabilidades claras y código consistente  
✅ **Reutilización**: Componentes compartidos centralizados  
✅ **Desarrollo Ágil**: Menos burocracia, más productividad  
✅ **Testabilidad**: Módulos independientes y bien definidos  
✅ **Simplicidad**: BaseRepository minimalista, TypeORM nativo  
✅ **Calidad de Código**: Linting y formateo con scripts NPM  
✅ **Versionado Claro**: APIs versionadas automáticamente  

## 📝 Cómo Agregar un Nuevo Dominio

1. Crear directorio en `src/domains/nuevo-dominio/`
2. Crear `nuevo-dominio.module.ts` que exporte todos los módulos
3. Agregar módulos específicos con versionado
4. Importar en `app.module.ts`

```typescript
// app.module.ts
@Module({
  imports: [
    CoreModule,
    SalesModule,     // Nuevo dominio
    InventoryModule, // Otro dominio
  ],
})
export class AppModule {}

// sales.controller.ts
@Controller({ path: 'sales', version: '1' })
export class SalesController {
  // Automáticamente disponible en /api/v1/sales
}
```

## 🛠️ Utilidades Disponibles

### Versionado de Controladores
```typescript
@Controller({ path: 'users', version: '1' })  // /api/v1/users
@Controller({ path: 'users', version: '2' })  // /api/v2/users
export class UsersController {
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

### Validadores
```typescript
import { isValidUUID, isValidEmail } from './shared';

if (!isValidEmail(email)) {
  throw new BadRequestException('El email debe tener un formato válido');
}
```

### Manejo de Errores Simple
```typescript
// En servicios
if (await this.userExists(email)) {
  throw new ConflictException('Ya existe un usuario con este email');
}

if (!isValidUUID(id)) {
  throw new BadRequestException('El ID debe ser un UUID válido');
}

if (!user) {
  throw new NotFoundException('Usuario no encontrado');
}
```

### Entidad Base
```typescript
import { BaseEntity } from './shared';

@Entity()
export class User extends BaseEntity {
  // Automáticamente incluye: id, createdAt, updatedAt
}
```

### Repositorio Base
```typescript
export class UserRepository extends BaseRepository {
  async save(user: User): Promise<User> {
    // Usa getRepository() con contexto transaccional automático
    return await this.getRepository(User).save(user);
  }
  
  async findById(id: string): Promise<User | null> {
    // Métodos nativos de TypeORM con transacciones
    return await this.getRepository(User).findOne({ where: { id } });
  }
}
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev                # Inicia en modo watch
npm run start:debug        # Inicia con debugging

# Linting y formateo
npm run lint               # Ejecuta ESLint y corrige errores
npm run lint:check         # Solo verifica sin corregir
npm run format             # Formatea código con Prettier
npm run format:check       # Verifica formateo sin aplicar

# Testing
npm run test              # Tests unitarios
npm run test:e2e          # Tests end-to-end
npm run test:cov          # Tests con coverage

# Producción
npm run build             # Compila para producción
npm run start:prod        # Inicia versión compilada
```

## 🎯 URLs de la API

Con el versionado configurado, las URLs siguen este patrón:

- **Auth v1**: `POST /api/v1/auth/sendEmailVerificationCode`
- **Users v1**: `POST /api/v1/users`
- **Futuras versiones**: `GET /api/v2/users` (cuando se necesite)
