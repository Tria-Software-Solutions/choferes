/**
 * Minimal Sequelize v3 type declarations.
 *
 * Replaces @types/sequelize v4.28.1 which defines Model as an interface
 * (incompatible with `class extends Model` pattern).
 * Sequelize v3 runtime exports Model as a constructor function with
 * static methods. This declaration matches the runtime behavior.
 */

declare module "sequelize" {
  // ─── Model class ───────────────────────────────────────────────────────────
  export class Model {
    constructor(values?: any, options?: any);

    // Static: lifecycle
    static init(attributes: any, options: any): void;

    // Static: queries
    static findAll(options?: any): Promise<any[]>;
    static findOne(options?: any): Promise<any | null>;
    static findById(id: any, options?: any): Promise<any | null>;
    static findByPk(id: any, options?: any): Promise<any | null>;
    static findAndCountAll(options?: any): Promise<{ count: number; rows: any[] }>;

    // Static: CUD
    static create(values: any, options?: any): Promise<any>;
    static update(values: any, options?: any): Promise<[number, any[]]>;
    static destroy(options?: any): Promise<number>;
    static upsert(values: any, options?: any): Promise<any>;
    static bulkCreate(records: any[], options?: any): Promise<any[]>;

    // Static: associations
    static belongsTo(target: any, options?: any): void;
    static hasMany(target: any, options?: any): void;
    static belongsToMany(target: any, options?: any): void;

    // Instance
    reload(): Promise<this>;
    save(): Promise<this>;
    destroy(): Promise<void>;
  }

  // ─── DataTypes ─────────────────────────────────────────────────────────────
  export const DataTypes: {
    INTEGER: any;
    STRING: any;
    BOOLEAN: any;
    DATE: any;
    ARRAY: (type: any) => any;
    NOW: any;
    TEXT: any;
    FLOAT: any;
    DOUBLE: any;
    DECIMAL: any;
    ENUM: (...values: string[]) => any;
    UUID: any;
    UUIDV1: any;
    UUIDV4: any;
    VIRTUAL: any;
    JSON: any;
    JSONB: any;
    [key: string]: any;
  };

  // ─── Association types (for type annotations) ──────────────────────────────
  export interface Association<T = any, U = any> {
    [key: string]: any;
  }

  // ─── Default export (Sequelize constructor) ──────────────────────────────
  export default class Sequelize {
    constructor(database: string, username: string, password: string, options?: any);
    constructor(url: string, options?: any);
    constructor(options?: any);

    static Model: typeof Model;
    static DataTypes: typeof DataTypes;

    define(modelName: string, attributes: any, options?: any): typeof Model;
    model(modelName: string): typeof Model;
    sync(options?: any): Promise<any>;
    authenticate(): Promise<any>;
    close(): Promise<void>;
    [key: string]: any;
  }
}
