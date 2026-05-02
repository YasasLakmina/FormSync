
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Schema
 * 
 */
export type Schema = $Result.DefaultSelection<Prisma.$SchemaPayload>
/**
 * Model FormTemplate
 * 
 */
export type FormTemplate = $Result.DefaultSelection<Prisma.$FormTemplatePayload>
/**
 * Model SrsProject
 * 
 */
export type SrsProject = $Result.DefaultSelection<Prisma.$SrsProjectPayload>
/**
 * Model UserStory
 * 
 */
export type UserStory = $Result.DefaultSelection<Prisma.$UserStoryPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.schema`: Exposes CRUD operations for the **Schema** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Schemata
    * const schemata = await prisma.schema.findMany()
    * ```
    */
  get schema(): Prisma.SchemaDelegate<ExtArgs>;

  /**
   * `prisma.formTemplate`: Exposes CRUD operations for the **FormTemplate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FormTemplates
    * const formTemplates = await prisma.formTemplate.findMany()
    * ```
    */
  get formTemplate(): Prisma.FormTemplateDelegate<ExtArgs>;

  /**
   * `prisma.srsProject`: Exposes CRUD operations for the **SrsProject** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SrsProjects
    * const srsProjects = await prisma.srsProject.findMany()
    * ```
    */
  get srsProject(): Prisma.SrsProjectDelegate<ExtArgs>;

  /**
   * `prisma.userStory`: Exposes CRUD operations for the **UserStory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserStories
    * const userStories = await prisma.userStory.findMany()
    * ```
    */
  get userStory(): Prisma.UserStoryDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Schema: 'Schema',
    FormTemplate: 'FormTemplate',
    SrsProject: 'SrsProject',
    UserStory: 'UserStory'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "schema" | "formTemplate" | "srsProject" | "userStory"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Schema: {
        payload: Prisma.$SchemaPayload<ExtArgs>
        fields: Prisma.SchemaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SchemaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchemaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SchemaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchemaPayload>
          }
          findFirst: {
            args: Prisma.SchemaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchemaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SchemaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchemaPayload>
          }
          findMany: {
            args: Prisma.SchemaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchemaPayload>[]
          }
          create: {
            args: Prisma.SchemaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchemaPayload>
          }
          createMany: {
            args: Prisma.SchemaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SchemaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchemaPayload>[]
          }
          delete: {
            args: Prisma.SchemaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchemaPayload>
          }
          update: {
            args: Prisma.SchemaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchemaPayload>
          }
          deleteMany: {
            args: Prisma.SchemaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SchemaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SchemaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchemaPayload>
          }
          aggregate: {
            args: Prisma.SchemaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSchema>
          }
          groupBy: {
            args: Prisma.SchemaGroupByArgs<ExtArgs>
            result: $Utils.Optional<SchemaGroupByOutputType>[]
          }
          count: {
            args: Prisma.SchemaCountArgs<ExtArgs>
            result: $Utils.Optional<SchemaCountAggregateOutputType> | number
          }
        }
      }
      FormTemplate: {
        payload: Prisma.$FormTemplatePayload<ExtArgs>
        fields: Prisma.FormTemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FormTemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormTemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FormTemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormTemplatePayload>
          }
          findFirst: {
            args: Prisma.FormTemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormTemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FormTemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormTemplatePayload>
          }
          findMany: {
            args: Prisma.FormTemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormTemplatePayload>[]
          }
          create: {
            args: Prisma.FormTemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormTemplatePayload>
          }
          createMany: {
            args: Prisma.FormTemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FormTemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormTemplatePayload>[]
          }
          delete: {
            args: Prisma.FormTemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormTemplatePayload>
          }
          update: {
            args: Prisma.FormTemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormTemplatePayload>
          }
          deleteMany: {
            args: Prisma.FormTemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FormTemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FormTemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormTemplatePayload>
          }
          aggregate: {
            args: Prisma.FormTemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFormTemplate>
          }
          groupBy: {
            args: Prisma.FormTemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<FormTemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.FormTemplateCountArgs<ExtArgs>
            result: $Utils.Optional<FormTemplateCountAggregateOutputType> | number
          }
        }
      }
      SrsProject: {
        payload: Prisma.$SrsProjectPayload<ExtArgs>
        fields: Prisma.SrsProjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SrsProjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SrsProjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SrsProjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SrsProjectPayload>
          }
          findFirst: {
            args: Prisma.SrsProjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SrsProjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SrsProjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SrsProjectPayload>
          }
          findMany: {
            args: Prisma.SrsProjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SrsProjectPayload>[]
          }
          create: {
            args: Prisma.SrsProjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SrsProjectPayload>
          }
          createMany: {
            args: Prisma.SrsProjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SrsProjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SrsProjectPayload>[]
          }
          delete: {
            args: Prisma.SrsProjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SrsProjectPayload>
          }
          update: {
            args: Prisma.SrsProjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SrsProjectPayload>
          }
          deleteMany: {
            args: Prisma.SrsProjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SrsProjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SrsProjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SrsProjectPayload>
          }
          aggregate: {
            args: Prisma.SrsProjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSrsProject>
          }
          groupBy: {
            args: Prisma.SrsProjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<SrsProjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.SrsProjectCountArgs<ExtArgs>
            result: $Utils.Optional<SrsProjectCountAggregateOutputType> | number
          }
        }
      }
      UserStory: {
        payload: Prisma.$UserStoryPayload<ExtArgs>
        fields: Prisma.UserStoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserStoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserStoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStoryPayload>
          }
          findFirst: {
            args: Prisma.UserStoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserStoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStoryPayload>
          }
          findMany: {
            args: Prisma.UserStoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStoryPayload>[]
          }
          create: {
            args: Prisma.UserStoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStoryPayload>
          }
          createMany: {
            args: Prisma.UserStoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserStoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStoryPayload>[]
          }
          delete: {
            args: Prisma.UserStoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStoryPayload>
          }
          update: {
            args: Prisma.UserStoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStoryPayload>
          }
          deleteMany: {
            args: Prisma.UserStoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserStoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserStoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserStoryPayload>
          }
          aggregate: {
            args: Prisma.UserStoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserStory>
          }
          groupBy: {
            args: Prisma.UserStoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserStoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserStoryCountArgs<ExtArgs>
            result: $Utils.Optional<UserStoryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    schemas: number
    templates: number
    srsProjects: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schemas?: boolean | UserCountOutputTypeCountSchemasArgs
    templates?: boolean | UserCountOutputTypeCountTemplatesArgs
    srsProjects?: boolean | UserCountOutputTypeCountSrsProjectsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSchemasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SchemaWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTemplatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FormTemplateWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSrsProjectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SrsProjectWhereInput
  }


  /**
   * Count Type SrsProjectCountOutputType
   */

  export type SrsProjectCountOutputType = {
    userStories: number
  }

  export type SrsProjectCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userStories?: boolean | SrsProjectCountOutputTypeCountUserStoriesArgs
  }

  // Custom InputTypes
  /**
   * SrsProjectCountOutputType without action
   */
  export type SrsProjectCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProjectCountOutputType
     */
    select?: SrsProjectCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SrsProjectCountOutputType without action
   */
  export type SrsProjectCountOutputTypeCountUserStoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserStoryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    password: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    password: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schemas?: boolean | User$schemasArgs<ExtArgs>
    templates?: boolean | User$templatesArgs<ExtArgs>
    srsProjects?: boolean | User$srsProjectsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schemas?: boolean | User$schemasArgs<ExtArgs>
    templates?: boolean | User$templatesArgs<ExtArgs>
    srsProjects?: boolean | User$srsProjectsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      schemas: Prisma.$SchemaPayload<ExtArgs>[]
      templates: Prisma.$FormTemplatePayload<ExtArgs>[]
      srsProjects: Prisma.$SrsProjectPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      password: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    schemas<T extends User$schemasArgs<ExtArgs> = {}>(args?: Subset<T, User$schemasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "findMany"> | Null>
    templates<T extends User$templatesArgs<ExtArgs> = {}>(args?: Subset<T, User$templatesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "findMany"> | Null>
    srsProjects<T extends User$srsProjectsArgs<ExtArgs> = {}>(args?: Subset<T, User$srsProjectsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.schemas
   */
  export type User$schemasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
    where?: SchemaWhereInput
    orderBy?: SchemaOrderByWithRelationInput | SchemaOrderByWithRelationInput[]
    cursor?: SchemaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SchemaScalarFieldEnum | SchemaScalarFieldEnum[]
  }

  /**
   * User.templates
   */
  export type User$templatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
    where?: FormTemplateWhereInput
    orderBy?: FormTemplateOrderByWithRelationInput | FormTemplateOrderByWithRelationInput[]
    cursor?: FormTemplateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FormTemplateScalarFieldEnum | FormTemplateScalarFieldEnum[]
  }

  /**
   * User.srsProjects
   */
  export type User$srsProjectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
    where?: SrsProjectWhereInput
    orderBy?: SrsProjectOrderByWithRelationInput | SrsProjectOrderByWithRelationInput[]
    cursor?: SrsProjectWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SrsProjectScalarFieldEnum | SrsProjectScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Schema
   */

  export type AggregateSchema = {
    _count: SchemaCountAggregateOutputType | null
    _avg: SchemaAvgAggregateOutputType | null
    _sum: SchemaSumAggregateOutputType | null
    _min: SchemaMinAggregateOutputType | null
    _max: SchemaMaxAggregateOutputType | null
  }

  export type SchemaAvgAggregateOutputType = {
    version: number | null
  }

  export type SchemaSumAggregateOutputType = {
    version: number | null
  }

  export type SchemaMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    sourceFormat: string | null
    status: string | null
    userId: string | null
    version: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SchemaMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    sourceFormat: string | null
    status: string | null
    userId: string | null
    version: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SchemaCountAggregateOutputType = {
    id: number
    name: number
    description: number
    content: number
    sourceFormat: number
    tags: number
    status: number
    userId: number
    version: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SchemaAvgAggregateInputType = {
    version?: true
  }

  export type SchemaSumAggregateInputType = {
    version?: true
  }

  export type SchemaMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    sourceFormat?: true
    status?: true
    userId?: true
    version?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SchemaMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    sourceFormat?: true
    status?: true
    userId?: true
    version?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SchemaCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    content?: true
    sourceFormat?: true
    tags?: true
    status?: true
    userId?: true
    version?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SchemaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Schema to aggregate.
     */
    where?: SchemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schemata to fetch.
     */
    orderBy?: SchemaOrderByWithRelationInput | SchemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SchemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schemata from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schemata.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Schemata
    **/
    _count?: true | SchemaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SchemaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SchemaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SchemaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SchemaMaxAggregateInputType
  }

  export type GetSchemaAggregateType<T extends SchemaAggregateArgs> = {
        [P in keyof T & keyof AggregateSchema]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSchema[P]>
      : GetScalarType<T[P], AggregateSchema[P]>
  }




  export type SchemaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SchemaWhereInput
    orderBy?: SchemaOrderByWithAggregationInput | SchemaOrderByWithAggregationInput[]
    by: SchemaScalarFieldEnum[] | SchemaScalarFieldEnum
    having?: SchemaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SchemaCountAggregateInputType | true
    _avg?: SchemaAvgAggregateInputType
    _sum?: SchemaSumAggregateInputType
    _min?: SchemaMinAggregateInputType
    _max?: SchemaMaxAggregateInputType
  }

  export type SchemaGroupByOutputType = {
    id: string
    name: string
    description: string | null
    content: JsonValue
    sourceFormat: string
    tags: string[]
    status: string
    userId: string
    version: number
    createdAt: Date
    updatedAt: Date
    _count: SchemaCountAggregateOutputType | null
    _avg: SchemaAvgAggregateOutputType | null
    _sum: SchemaSumAggregateOutputType | null
    _min: SchemaMinAggregateOutputType | null
    _max: SchemaMaxAggregateOutputType | null
  }

  type GetSchemaGroupByPayload<T extends SchemaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SchemaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SchemaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SchemaGroupByOutputType[P]>
            : GetScalarType<T[P], SchemaGroupByOutputType[P]>
        }
      >
    >


  export type SchemaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    content?: boolean
    sourceFormat?: boolean
    tags?: boolean
    status?: boolean
    userId?: boolean
    version?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["schema"]>

  export type SchemaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    content?: boolean
    sourceFormat?: boolean
    tags?: boolean
    status?: boolean
    userId?: boolean
    version?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["schema"]>

  export type SchemaSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    content?: boolean
    sourceFormat?: boolean
    tags?: boolean
    status?: boolean
    userId?: boolean
    version?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SchemaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SchemaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SchemaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Schema"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      content: Prisma.JsonValue
      sourceFormat: string
      tags: string[]
      status: string
      userId: string
      version: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["schema"]>
    composites: {}
  }

  type SchemaGetPayload<S extends boolean | null | undefined | SchemaDefaultArgs> = $Result.GetResult<Prisma.$SchemaPayload, S>

  type SchemaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SchemaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SchemaCountAggregateInputType | true
    }

  export interface SchemaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Schema'], meta: { name: 'Schema' } }
    /**
     * Find zero or one Schema that matches the filter.
     * @param {SchemaFindUniqueArgs} args - Arguments to find a Schema
     * @example
     * // Get one Schema
     * const schema = await prisma.schema.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SchemaFindUniqueArgs>(args: SelectSubset<T, SchemaFindUniqueArgs<ExtArgs>>): Prisma__SchemaClient<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Schema that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SchemaFindUniqueOrThrowArgs} args - Arguments to find a Schema
     * @example
     * // Get one Schema
     * const schema = await prisma.schema.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SchemaFindUniqueOrThrowArgs>(args: SelectSubset<T, SchemaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SchemaClient<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Schema that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchemaFindFirstArgs} args - Arguments to find a Schema
     * @example
     * // Get one Schema
     * const schema = await prisma.schema.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SchemaFindFirstArgs>(args?: SelectSubset<T, SchemaFindFirstArgs<ExtArgs>>): Prisma__SchemaClient<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Schema that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchemaFindFirstOrThrowArgs} args - Arguments to find a Schema
     * @example
     * // Get one Schema
     * const schema = await prisma.schema.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SchemaFindFirstOrThrowArgs>(args?: SelectSubset<T, SchemaFindFirstOrThrowArgs<ExtArgs>>): Prisma__SchemaClient<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Schemata that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchemaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Schemata
     * const schemata = await prisma.schema.findMany()
     * 
     * // Get first 10 Schemata
     * const schemata = await prisma.schema.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const schemaWithIdOnly = await prisma.schema.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SchemaFindManyArgs>(args?: SelectSubset<T, SchemaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Schema.
     * @param {SchemaCreateArgs} args - Arguments to create a Schema.
     * @example
     * // Create one Schema
     * const Schema = await prisma.schema.create({
     *   data: {
     *     // ... data to create a Schema
     *   }
     * })
     * 
     */
    create<T extends SchemaCreateArgs>(args: SelectSubset<T, SchemaCreateArgs<ExtArgs>>): Prisma__SchemaClient<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Schemata.
     * @param {SchemaCreateManyArgs} args - Arguments to create many Schemata.
     * @example
     * // Create many Schemata
     * const schema = await prisma.schema.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SchemaCreateManyArgs>(args?: SelectSubset<T, SchemaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Schemata and returns the data saved in the database.
     * @param {SchemaCreateManyAndReturnArgs} args - Arguments to create many Schemata.
     * @example
     * // Create many Schemata
     * const schema = await prisma.schema.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Schemata and only return the `id`
     * const schemaWithIdOnly = await prisma.schema.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SchemaCreateManyAndReturnArgs>(args?: SelectSubset<T, SchemaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Schema.
     * @param {SchemaDeleteArgs} args - Arguments to delete one Schema.
     * @example
     * // Delete one Schema
     * const Schema = await prisma.schema.delete({
     *   where: {
     *     // ... filter to delete one Schema
     *   }
     * })
     * 
     */
    delete<T extends SchemaDeleteArgs>(args: SelectSubset<T, SchemaDeleteArgs<ExtArgs>>): Prisma__SchemaClient<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Schema.
     * @param {SchemaUpdateArgs} args - Arguments to update one Schema.
     * @example
     * // Update one Schema
     * const schema = await prisma.schema.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SchemaUpdateArgs>(args: SelectSubset<T, SchemaUpdateArgs<ExtArgs>>): Prisma__SchemaClient<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Schemata.
     * @param {SchemaDeleteManyArgs} args - Arguments to filter Schemata to delete.
     * @example
     * // Delete a few Schemata
     * const { count } = await prisma.schema.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SchemaDeleteManyArgs>(args?: SelectSubset<T, SchemaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Schemata.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchemaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Schemata
     * const schema = await prisma.schema.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SchemaUpdateManyArgs>(args: SelectSubset<T, SchemaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Schema.
     * @param {SchemaUpsertArgs} args - Arguments to update or create a Schema.
     * @example
     * // Update or create a Schema
     * const schema = await prisma.schema.upsert({
     *   create: {
     *     // ... data to create a Schema
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Schema we want to update
     *   }
     * })
     */
    upsert<T extends SchemaUpsertArgs>(args: SelectSubset<T, SchemaUpsertArgs<ExtArgs>>): Prisma__SchemaClient<$Result.GetResult<Prisma.$SchemaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Schemata.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchemaCountArgs} args - Arguments to filter Schemata to count.
     * @example
     * // Count the number of Schemata
     * const count = await prisma.schema.count({
     *   where: {
     *     // ... the filter for the Schemata we want to count
     *   }
     * })
    **/
    count<T extends SchemaCountArgs>(
      args?: Subset<T, SchemaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SchemaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Schema.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchemaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SchemaAggregateArgs>(args: Subset<T, SchemaAggregateArgs>): Prisma.PrismaPromise<GetSchemaAggregateType<T>>

    /**
     * Group by Schema.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchemaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SchemaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SchemaGroupByArgs['orderBy'] }
        : { orderBy?: SchemaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SchemaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSchemaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Schema model
   */
  readonly fields: SchemaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Schema.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SchemaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Schema model
   */ 
  interface SchemaFieldRefs {
    readonly id: FieldRef<"Schema", 'String'>
    readonly name: FieldRef<"Schema", 'String'>
    readonly description: FieldRef<"Schema", 'String'>
    readonly content: FieldRef<"Schema", 'Json'>
    readonly sourceFormat: FieldRef<"Schema", 'String'>
    readonly tags: FieldRef<"Schema", 'String[]'>
    readonly status: FieldRef<"Schema", 'String'>
    readonly userId: FieldRef<"Schema", 'String'>
    readonly version: FieldRef<"Schema", 'Int'>
    readonly createdAt: FieldRef<"Schema", 'DateTime'>
    readonly updatedAt: FieldRef<"Schema", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Schema findUnique
   */
  export type SchemaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
    /**
     * Filter, which Schema to fetch.
     */
    where: SchemaWhereUniqueInput
  }

  /**
   * Schema findUniqueOrThrow
   */
  export type SchemaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
    /**
     * Filter, which Schema to fetch.
     */
    where: SchemaWhereUniqueInput
  }

  /**
   * Schema findFirst
   */
  export type SchemaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
    /**
     * Filter, which Schema to fetch.
     */
    where?: SchemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schemata to fetch.
     */
    orderBy?: SchemaOrderByWithRelationInput | SchemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Schemata.
     */
    cursor?: SchemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schemata from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schemata.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Schemata.
     */
    distinct?: SchemaScalarFieldEnum | SchemaScalarFieldEnum[]
  }

  /**
   * Schema findFirstOrThrow
   */
  export type SchemaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
    /**
     * Filter, which Schema to fetch.
     */
    where?: SchemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schemata to fetch.
     */
    orderBy?: SchemaOrderByWithRelationInput | SchemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Schemata.
     */
    cursor?: SchemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schemata from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schemata.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Schemata.
     */
    distinct?: SchemaScalarFieldEnum | SchemaScalarFieldEnum[]
  }

  /**
   * Schema findMany
   */
  export type SchemaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
    /**
     * Filter, which Schemata to fetch.
     */
    where?: SchemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schemata to fetch.
     */
    orderBy?: SchemaOrderByWithRelationInput | SchemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Schemata.
     */
    cursor?: SchemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schemata from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schemata.
     */
    skip?: number
    distinct?: SchemaScalarFieldEnum | SchemaScalarFieldEnum[]
  }

  /**
   * Schema create
   */
  export type SchemaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
    /**
     * The data needed to create a Schema.
     */
    data: XOR<SchemaCreateInput, SchemaUncheckedCreateInput>
  }

  /**
   * Schema createMany
   */
  export type SchemaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Schemata.
     */
    data: SchemaCreateManyInput | SchemaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Schema createManyAndReturn
   */
  export type SchemaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Schemata.
     */
    data: SchemaCreateManyInput | SchemaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Schema update
   */
  export type SchemaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
    /**
     * The data needed to update a Schema.
     */
    data: XOR<SchemaUpdateInput, SchemaUncheckedUpdateInput>
    /**
     * Choose, which Schema to update.
     */
    where: SchemaWhereUniqueInput
  }

  /**
   * Schema updateMany
   */
  export type SchemaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Schemata.
     */
    data: XOR<SchemaUpdateManyMutationInput, SchemaUncheckedUpdateManyInput>
    /**
     * Filter which Schemata to update
     */
    where?: SchemaWhereInput
  }

  /**
   * Schema upsert
   */
  export type SchemaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
    /**
     * The filter to search for the Schema to update in case it exists.
     */
    where: SchemaWhereUniqueInput
    /**
     * In case the Schema found by the `where` argument doesn't exist, create a new Schema with this data.
     */
    create: XOR<SchemaCreateInput, SchemaUncheckedCreateInput>
    /**
     * In case the Schema was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SchemaUpdateInput, SchemaUncheckedUpdateInput>
  }

  /**
   * Schema delete
   */
  export type SchemaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
    /**
     * Filter which Schema to delete.
     */
    where: SchemaWhereUniqueInput
  }

  /**
   * Schema deleteMany
   */
  export type SchemaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Schemata to delete
     */
    where?: SchemaWhereInput
  }

  /**
   * Schema without action
   */
  export type SchemaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Schema
     */
    select?: SchemaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchemaInclude<ExtArgs> | null
  }


  /**
   * Model FormTemplate
   */

  export type AggregateFormTemplate = {
    _count: FormTemplateCountAggregateOutputType | null
    _min: FormTemplateMinAggregateOutputType | null
    _max: FormTemplateMaxAggregateOutputType | null
  }

  export type FormTemplateMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FormTemplateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FormTemplateCountAggregateOutputType = {
    id: number
    name: number
    description: number
    content: number
    userId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FormTemplateMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FormTemplateMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FormTemplateCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    content?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FormTemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FormTemplate to aggregate.
     */
    where?: FormTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FormTemplates to fetch.
     */
    orderBy?: FormTemplateOrderByWithRelationInput | FormTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FormTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FormTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FormTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FormTemplates
    **/
    _count?: true | FormTemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FormTemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FormTemplateMaxAggregateInputType
  }

  export type GetFormTemplateAggregateType<T extends FormTemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateFormTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFormTemplate[P]>
      : GetScalarType<T[P], AggregateFormTemplate[P]>
  }




  export type FormTemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FormTemplateWhereInput
    orderBy?: FormTemplateOrderByWithAggregationInput | FormTemplateOrderByWithAggregationInput[]
    by: FormTemplateScalarFieldEnum[] | FormTemplateScalarFieldEnum
    having?: FormTemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FormTemplateCountAggregateInputType | true
    _min?: FormTemplateMinAggregateInputType
    _max?: FormTemplateMaxAggregateInputType
  }

  export type FormTemplateGroupByOutputType = {
    id: string
    name: string
    description: string | null
    content: JsonValue
    userId: string
    createdAt: Date
    updatedAt: Date
    _count: FormTemplateCountAggregateOutputType | null
    _min: FormTemplateMinAggregateOutputType | null
    _max: FormTemplateMaxAggregateOutputType | null
  }

  type GetFormTemplateGroupByPayload<T extends FormTemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FormTemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FormTemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FormTemplateGroupByOutputType[P]>
            : GetScalarType<T[P], FormTemplateGroupByOutputType[P]>
        }
      >
    >


  export type FormTemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    content?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["formTemplate"]>

  export type FormTemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    content?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["formTemplate"]>

  export type FormTemplateSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    content?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FormTemplateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FormTemplateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $FormTemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FormTemplate"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      content: Prisma.JsonValue
      userId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["formTemplate"]>
    composites: {}
  }

  type FormTemplateGetPayload<S extends boolean | null | undefined | FormTemplateDefaultArgs> = $Result.GetResult<Prisma.$FormTemplatePayload, S>

  type FormTemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FormTemplateFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FormTemplateCountAggregateInputType | true
    }

  export interface FormTemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FormTemplate'], meta: { name: 'FormTemplate' } }
    /**
     * Find zero or one FormTemplate that matches the filter.
     * @param {FormTemplateFindUniqueArgs} args - Arguments to find a FormTemplate
     * @example
     * // Get one FormTemplate
     * const formTemplate = await prisma.formTemplate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FormTemplateFindUniqueArgs>(args: SelectSubset<T, FormTemplateFindUniqueArgs<ExtArgs>>): Prisma__FormTemplateClient<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FormTemplate that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FormTemplateFindUniqueOrThrowArgs} args - Arguments to find a FormTemplate
     * @example
     * // Get one FormTemplate
     * const formTemplate = await prisma.formTemplate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FormTemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, FormTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FormTemplateClient<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FormTemplate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormTemplateFindFirstArgs} args - Arguments to find a FormTemplate
     * @example
     * // Get one FormTemplate
     * const formTemplate = await prisma.formTemplate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FormTemplateFindFirstArgs>(args?: SelectSubset<T, FormTemplateFindFirstArgs<ExtArgs>>): Prisma__FormTemplateClient<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FormTemplate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormTemplateFindFirstOrThrowArgs} args - Arguments to find a FormTemplate
     * @example
     * // Get one FormTemplate
     * const formTemplate = await prisma.formTemplate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FormTemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, FormTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__FormTemplateClient<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FormTemplates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormTemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FormTemplates
     * const formTemplates = await prisma.formTemplate.findMany()
     * 
     * // Get first 10 FormTemplates
     * const formTemplates = await prisma.formTemplate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const formTemplateWithIdOnly = await prisma.formTemplate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FormTemplateFindManyArgs>(args?: SelectSubset<T, FormTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FormTemplate.
     * @param {FormTemplateCreateArgs} args - Arguments to create a FormTemplate.
     * @example
     * // Create one FormTemplate
     * const FormTemplate = await prisma.formTemplate.create({
     *   data: {
     *     // ... data to create a FormTemplate
     *   }
     * })
     * 
     */
    create<T extends FormTemplateCreateArgs>(args: SelectSubset<T, FormTemplateCreateArgs<ExtArgs>>): Prisma__FormTemplateClient<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FormTemplates.
     * @param {FormTemplateCreateManyArgs} args - Arguments to create many FormTemplates.
     * @example
     * // Create many FormTemplates
     * const formTemplate = await prisma.formTemplate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FormTemplateCreateManyArgs>(args?: SelectSubset<T, FormTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FormTemplates and returns the data saved in the database.
     * @param {FormTemplateCreateManyAndReturnArgs} args - Arguments to create many FormTemplates.
     * @example
     * // Create many FormTemplates
     * const formTemplate = await prisma.formTemplate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FormTemplates and only return the `id`
     * const formTemplateWithIdOnly = await prisma.formTemplate.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FormTemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, FormTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FormTemplate.
     * @param {FormTemplateDeleteArgs} args - Arguments to delete one FormTemplate.
     * @example
     * // Delete one FormTemplate
     * const FormTemplate = await prisma.formTemplate.delete({
     *   where: {
     *     // ... filter to delete one FormTemplate
     *   }
     * })
     * 
     */
    delete<T extends FormTemplateDeleteArgs>(args: SelectSubset<T, FormTemplateDeleteArgs<ExtArgs>>): Prisma__FormTemplateClient<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FormTemplate.
     * @param {FormTemplateUpdateArgs} args - Arguments to update one FormTemplate.
     * @example
     * // Update one FormTemplate
     * const formTemplate = await prisma.formTemplate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FormTemplateUpdateArgs>(args: SelectSubset<T, FormTemplateUpdateArgs<ExtArgs>>): Prisma__FormTemplateClient<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FormTemplates.
     * @param {FormTemplateDeleteManyArgs} args - Arguments to filter FormTemplates to delete.
     * @example
     * // Delete a few FormTemplates
     * const { count } = await prisma.formTemplate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FormTemplateDeleteManyArgs>(args?: SelectSubset<T, FormTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FormTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormTemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FormTemplates
     * const formTemplate = await prisma.formTemplate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FormTemplateUpdateManyArgs>(args: SelectSubset<T, FormTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FormTemplate.
     * @param {FormTemplateUpsertArgs} args - Arguments to update or create a FormTemplate.
     * @example
     * // Update or create a FormTemplate
     * const formTemplate = await prisma.formTemplate.upsert({
     *   create: {
     *     // ... data to create a FormTemplate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FormTemplate we want to update
     *   }
     * })
     */
    upsert<T extends FormTemplateUpsertArgs>(args: SelectSubset<T, FormTemplateUpsertArgs<ExtArgs>>): Prisma__FormTemplateClient<$Result.GetResult<Prisma.$FormTemplatePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FormTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormTemplateCountArgs} args - Arguments to filter FormTemplates to count.
     * @example
     * // Count the number of FormTemplates
     * const count = await prisma.formTemplate.count({
     *   where: {
     *     // ... the filter for the FormTemplates we want to count
     *   }
     * })
    **/
    count<T extends FormTemplateCountArgs>(
      args?: Subset<T, FormTemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FormTemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FormTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormTemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FormTemplateAggregateArgs>(args: Subset<T, FormTemplateAggregateArgs>): Prisma.PrismaPromise<GetFormTemplateAggregateType<T>>

    /**
     * Group by FormTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormTemplateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FormTemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FormTemplateGroupByArgs['orderBy'] }
        : { orderBy?: FormTemplateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FormTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFormTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FormTemplate model
   */
  readonly fields: FormTemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FormTemplate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FormTemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FormTemplate model
   */ 
  interface FormTemplateFieldRefs {
    readonly id: FieldRef<"FormTemplate", 'String'>
    readonly name: FieldRef<"FormTemplate", 'String'>
    readonly description: FieldRef<"FormTemplate", 'String'>
    readonly content: FieldRef<"FormTemplate", 'Json'>
    readonly userId: FieldRef<"FormTemplate", 'String'>
    readonly createdAt: FieldRef<"FormTemplate", 'DateTime'>
    readonly updatedAt: FieldRef<"FormTemplate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FormTemplate findUnique
   */
  export type FormTemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
    /**
     * Filter, which FormTemplate to fetch.
     */
    where: FormTemplateWhereUniqueInput
  }

  /**
   * FormTemplate findUniqueOrThrow
   */
  export type FormTemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
    /**
     * Filter, which FormTemplate to fetch.
     */
    where: FormTemplateWhereUniqueInput
  }

  /**
   * FormTemplate findFirst
   */
  export type FormTemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
    /**
     * Filter, which FormTemplate to fetch.
     */
    where?: FormTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FormTemplates to fetch.
     */
    orderBy?: FormTemplateOrderByWithRelationInput | FormTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FormTemplates.
     */
    cursor?: FormTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FormTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FormTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FormTemplates.
     */
    distinct?: FormTemplateScalarFieldEnum | FormTemplateScalarFieldEnum[]
  }

  /**
   * FormTemplate findFirstOrThrow
   */
  export type FormTemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
    /**
     * Filter, which FormTemplate to fetch.
     */
    where?: FormTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FormTemplates to fetch.
     */
    orderBy?: FormTemplateOrderByWithRelationInput | FormTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FormTemplates.
     */
    cursor?: FormTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FormTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FormTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FormTemplates.
     */
    distinct?: FormTemplateScalarFieldEnum | FormTemplateScalarFieldEnum[]
  }

  /**
   * FormTemplate findMany
   */
  export type FormTemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
    /**
     * Filter, which FormTemplates to fetch.
     */
    where?: FormTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FormTemplates to fetch.
     */
    orderBy?: FormTemplateOrderByWithRelationInput | FormTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FormTemplates.
     */
    cursor?: FormTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FormTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FormTemplates.
     */
    skip?: number
    distinct?: FormTemplateScalarFieldEnum | FormTemplateScalarFieldEnum[]
  }

  /**
   * FormTemplate create
   */
  export type FormTemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
    /**
     * The data needed to create a FormTemplate.
     */
    data: XOR<FormTemplateCreateInput, FormTemplateUncheckedCreateInput>
  }

  /**
   * FormTemplate createMany
   */
  export type FormTemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FormTemplates.
     */
    data: FormTemplateCreateManyInput | FormTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FormTemplate createManyAndReturn
   */
  export type FormTemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FormTemplates.
     */
    data: FormTemplateCreateManyInput | FormTemplateCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FormTemplate update
   */
  export type FormTemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
    /**
     * The data needed to update a FormTemplate.
     */
    data: XOR<FormTemplateUpdateInput, FormTemplateUncheckedUpdateInput>
    /**
     * Choose, which FormTemplate to update.
     */
    where: FormTemplateWhereUniqueInput
  }

  /**
   * FormTemplate updateMany
   */
  export type FormTemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FormTemplates.
     */
    data: XOR<FormTemplateUpdateManyMutationInput, FormTemplateUncheckedUpdateManyInput>
    /**
     * Filter which FormTemplates to update
     */
    where?: FormTemplateWhereInput
  }

  /**
   * FormTemplate upsert
   */
  export type FormTemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
    /**
     * The filter to search for the FormTemplate to update in case it exists.
     */
    where: FormTemplateWhereUniqueInput
    /**
     * In case the FormTemplate found by the `where` argument doesn't exist, create a new FormTemplate with this data.
     */
    create: XOR<FormTemplateCreateInput, FormTemplateUncheckedCreateInput>
    /**
     * In case the FormTemplate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FormTemplateUpdateInput, FormTemplateUncheckedUpdateInput>
  }

  /**
   * FormTemplate delete
   */
  export type FormTemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
    /**
     * Filter which FormTemplate to delete.
     */
    where: FormTemplateWhereUniqueInput
  }

  /**
   * FormTemplate deleteMany
   */
  export type FormTemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FormTemplates to delete
     */
    where?: FormTemplateWhereInput
  }

  /**
   * FormTemplate without action
   */
  export type FormTemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormTemplate
     */
    select?: FormTemplateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormTemplateInclude<ExtArgs> | null
  }


  /**
   * Model SrsProject
   */

  export type AggregateSrsProject = {
    _count: SrsProjectCountAggregateOutputType | null
    _min: SrsProjectMinAggregateOutputType | null
    _max: SrsProjectMaxAggregateOutputType | null
  }

  export type SrsProjectMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SrsProjectMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SrsProjectCountAggregateOutputType = {
    id: number
    name: number
    description: number
    userId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SrsProjectMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SrsProjectMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SrsProjectCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SrsProjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SrsProject to aggregate.
     */
    where?: SrsProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SrsProjects to fetch.
     */
    orderBy?: SrsProjectOrderByWithRelationInput | SrsProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SrsProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SrsProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SrsProjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SrsProjects
    **/
    _count?: true | SrsProjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SrsProjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SrsProjectMaxAggregateInputType
  }

  export type GetSrsProjectAggregateType<T extends SrsProjectAggregateArgs> = {
        [P in keyof T & keyof AggregateSrsProject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSrsProject[P]>
      : GetScalarType<T[P], AggregateSrsProject[P]>
  }




  export type SrsProjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SrsProjectWhereInput
    orderBy?: SrsProjectOrderByWithAggregationInput | SrsProjectOrderByWithAggregationInput[]
    by: SrsProjectScalarFieldEnum[] | SrsProjectScalarFieldEnum
    having?: SrsProjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SrsProjectCountAggregateInputType | true
    _min?: SrsProjectMinAggregateInputType
    _max?: SrsProjectMaxAggregateInputType
  }

  export type SrsProjectGroupByOutputType = {
    id: string
    name: string
    description: string | null
    userId: string
    createdAt: Date
    updatedAt: Date
    _count: SrsProjectCountAggregateOutputType | null
    _min: SrsProjectMinAggregateOutputType | null
    _max: SrsProjectMaxAggregateOutputType | null
  }

  type GetSrsProjectGroupByPayload<T extends SrsProjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SrsProjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SrsProjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SrsProjectGroupByOutputType[P]>
            : GetScalarType<T[P], SrsProjectGroupByOutputType[P]>
        }
      >
    >


  export type SrsProjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    userStories?: boolean | SrsProject$userStoriesArgs<ExtArgs>
    _count?: boolean | SrsProjectCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["srsProject"]>

  export type SrsProjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["srsProject"]>

  export type SrsProjectSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SrsProjectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    userStories?: boolean | SrsProject$userStoriesArgs<ExtArgs>
    _count?: boolean | SrsProjectCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SrsProjectIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SrsProjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SrsProject"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      userStories: Prisma.$UserStoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      userId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["srsProject"]>
    composites: {}
  }

  type SrsProjectGetPayload<S extends boolean | null | undefined | SrsProjectDefaultArgs> = $Result.GetResult<Prisma.$SrsProjectPayload, S>

  type SrsProjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SrsProjectFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SrsProjectCountAggregateInputType | true
    }

  export interface SrsProjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SrsProject'], meta: { name: 'SrsProject' } }
    /**
     * Find zero or one SrsProject that matches the filter.
     * @param {SrsProjectFindUniqueArgs} args - Arguments to find a SrsProject
     * @example
     * // Get one SrsProject
     * const srsProject = await prisma.srsProject.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SrsProjectFindUniqueArgs>(args: SelectSubset<T, SrsProjectFindUniqueArgs<ExtArgs>>): Prisma__SrsProjectClient<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SrsProject that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SrsProjectFindUniqueOrThrowArgs} args - Arguments to find a SrsProject
     * @example
     * // Get one SrsProject
     * const srsProject = await prisma.srsProject.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SrsProjectFindUniqueOrThrowArgs>(args: SelectSubset<T, SrsProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SrsProjectClient<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SrsProject that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SrsProjectFindFirstArgs} args - Arguments to find a SrsProject
     * @example
     * // Get one SrsProject
     * const srsProject = await prisma.srsProject.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SrsProjectFindFirstArgs>(args?: SelectSubset<T, SrsProjectFindFirstArgs<ExtArgs>>): Prisma__SrsProjectClient<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SrsProject that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SrsProjectFindFirstOrThrowArgs} args - Arguments to find a SrsProject
     * @example
     * // Get one SrsProject
     * const srsProject = await prisma.srsProject.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SrsProjectFindFirstOrThrowArgs>(args?: SelectSubset<T, SrsProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__SrsProjectClient<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SrsProjects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SrsProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SrsProjects
     * const srsProjects = await prisma.srsProject.findMany()
     * 
     * // Get first 10 SrsProjects
     * const srsProjects = await prisma.srsProject.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const srsProjectWithIdOnly = await prisma.srsProject.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SrsProjectFindManyArgs>(args?: SelectSubset<T, SrsProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SrsProject.
     * @param {SrsProjectCreateArgs} args - Arguments to create a SrsProject.
     * @example
     * // Create one SrsProject
     * const SrsProject = await prisma.srsProject.create({
     *   data: {
     *     // ... data to create a SrsProject
     *   }
     * })
     * 
     */
    create<T extends SrsProjectCreateArgs>(args: SelectSubset<T, SrsProjectCreateArgs<ExtArgs>>): Prisma__SrsProjectClient<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SrsProjects.
     * @param {SrsProjectCreateManyArgs} args - Arguments to create many SrsProjects.
     * @example
     * // Create many SrsProjects
     * const srsProject = await prisma.srsProject.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SrsProjectCreateManyArgs>(args?: SelectSubset<T, SrsProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SrsProjects and returns the data saved in the database.
     * @param {SrsProjectCreateManyAndReturnArgs} args - Arguments to create many SrsProjects.
     * @example
     * // Create many SrsProjects
     * const srsProject = await prisma.srsProject.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SrsProjects and only return the `id`
     * const srsProjectWithIdOnly = await prisma.srsProject.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SrsProjectCreateManyAndReturnArgs>(args?: SelectSubset<T, SrsProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SrsProject.
     * @param {SrsProjectDeleteArgs} args - Arguments to delete one SrsProject.
     * @example
     * // Delete one SrsProject
     * const SrsProject = await prisma.srsProject.delete({
     *   where: {
     *     // ... filter to delete one SrsProject
     *   }
     * })
     * 
     */
    delete<T extends SrsProjectDeleteArgs>(args: SelectSubset<T, SrsProjectDeleteArgs<ExtArgs>>): Prisma__SrsProjectClient<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SrsProject.
     * @param {SrsProjectUpdateArgs} args - Arguments to update one SrsProject.
     * @example
     * // Update one SrsProject
     * const srsProject = await prisma.srsProject.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SrsProjectUpdateArgs>(args: SelectSubset<T, SrsProjectUpdateArgs<ExtArgs>>): Prisma__SrsProjectClient<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SrsProjects.
     * @param {SrsProjectDeleteManyArgs} args - Arguments to filter SrsProjects to delete.
     * @example
     * // Delete a few SrsProjects
     * const { count } = await prisma.srsProject.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SrsProjectDeleteManyArgs>(args?: SelectSubset<T, SrsProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SrsProjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SrsProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SrsProjects
     * const srsProject = await prisma.srsProject.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SrsProjectUpdateManyArgs>(args: SelectSubset<T, SrsProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SrsProject.
     * @param {SrsProjectUpsertArgs} args - Arguments to update or create a SrsProject.
     * @example
     * // Update or create a SrsProject
     * const srsProject = await prisma.srsProject.upsert({
     *   create: {
     *     // ... data to create a SrsProject
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SrsProject we want to update
     *   }
     * })
     */
    upsert<T extends SrsProjectUpsertArgs>(args: SelectSubset<T, SrsProjectUpsertArgs<ExtArgs>>): Prisma__SrsProjectClient<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SrsProjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SrsProjectCountArgs} args - Arguments to filter SrsProjects to count.
     * @example
     * // Count the number of SrsProjects
     * const count = await prisma.srsProject.count({
     *   where: {
     *     // ... the filter for the SrsProjects we want to count
     *   }
     * })
    **/
    count<T extends SrsProjectCountArgs>(
      args?: Subset<T, SrsProjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SrsProjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SrsProject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SrsProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SrsProjectAggregateArgs>(args: Subset<T, SrsProjectAggregateArgs>): Prisma.PrismaPromise<GetSrsProjectAggregateType<T>>

    /**
     * Group by SrsProject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SrsProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SrsProjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SrsProjectGroupByArgs['orderBy'] }
        : { orderBy?: SrsProjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SrsProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSrsProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SrsProject model
   */
  readonly fields: SrsProjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SrsProject.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SrsProjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    userStories<T extends SrsProject$userStoriesArgs<ExtArgs> = {}>(args?: Subset<T, SrsProject$userStoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SrsProject model
   */ 
  interface SrsProjectFieldRefs {
    readonly id: FieldRef<"SrsProject", 'String'>
    readonly name: FieldRef<"SrsProject", 'String'>
    readonly description: FieldRef<"SrsProject", 'String'>
    readonly userId: FieldRef<"SrsProject", 'String'>
    readonly createdAt: FieldRef<"SrsProject", 'DateTime'>
    readonly updatedAt: FieldRef<"SrsProject", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SrsProject findUnique
   */
  export type SrsProjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
    /**
     * Filter, which SrsProject to fetch.
     */
    where: SrsProjectWhereUniqueInput
  }

  /**
   * SrsProject findUniqueOrThrow
   */
  export type SrsProjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
    /**
     * Filter, which SrsProject to fetch.
     */
    where: SrsProjectWhereUniqueInput
  }

  /**
   * SrsProject findFirst
   */
  export type SrsProjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
    /**
     * Filter, which SrsProject to fetch.
     */
    where?: SrsProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SrsProjects to fetch.
     */
    orderBy?: SrsProjectOrderByWithRelationInput | SrsProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SrsProjects.
     */
    cursor?: SrsProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SrsProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SrsProjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SrsProjects.
     */
    distinct?: SrsProjectScalarFieldEnum | SrsProjectScalarFieldEnum[]
  }

  /**
   * SrsProject findFirstOrThrow
   */
  export type SrsProjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
    /**
     * Filter, which SrsProject to fetch.
     */
    where?: SrsProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SrsProjects to fetch.
     */
    orderBy?: SrsProjectOrderByWithRelationInput | SrsProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SrsProjects.
     */
    cursor?: SrsProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SrsProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SrsProjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SrsProjects.
     */
    distinct?: SrsProjectScalarFieldEnum | SrsProjectScalarFieldEnum[]
  }

  /**
   * SrsProject findMany
   */
  export type SrsProjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
    /**
     * Filter, which SrsProjects to fetch.
     */
    where?: SrsProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SrsProjects to fetch.
     */
    orderBy?: SrsProjectOrderByWithRelationInput | SrsProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SrsProjects.
     */
    cursor?: SrsProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SrsProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SrsProjects.
     */
    skip?: number
    distinct?: SrsProjectScalarFieldEnum | SrsProjectScalarFieldEnum[]
  }

  /**
   * SrsProject create
   */
  export type SrsProjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
    /**
     * The data needed to create a SrsProject.
     */
    data: XOR<SrsProjectCreateInput, SrsProjectUncheckedCreateInput>
  }

  /**
   * SrsProject createMany
   */
  export type SrsProjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SrsProjects.
     */
    data: SrsProjectCreateManyInput | SrsProjectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SrsProject createManyAndReturn
   */
  export type SrsProjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SrsProjects.
     */
    data: SrsProjectCreateManyInput | SrsProjectCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SrsProject update
   */
  export type SrsProjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
    /**
     * The data needed to update a SrsProject.
     */
    data: XOR<SrsProjectUpdateInput, SrsProjectUncheckedUpdateInput>
    /**
     * Choose, which SrsProject to update.
     */
    where: SrsProjectWhereUniqueInput
  }

  /**
   * SrsProject updateMany
   */
  export type SrsProjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SrsProjects.
     */
    data: XOR<SrsProjectUpdateManyMutationInput, SrsProjectUncheckedUpdateManyInput>
    /**
     * Filter which SrsProjects to update
     */
    where?: SrsProjectWhereInput
  }

  /**
   * SrsProject upsert
   */
  export type SrsProjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
    /**
     * The filter to search for the SrsProject to update in case it exists.
     */
    where: SrsProjectWhereUniqueInput
    /**
     * In case the SrsProject found by the `where` argument doesn't exist, create a new SrsProject with this data.
     */
    create: XOR<SrsProjectCreateInput, SrsProjectUncheckedCreateInput>
    /**
     * In case the SrsProject was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SrsProjectUpdateInput, SrsProjectUncheckedUpdateInput>
  }

  /**
   * SrsProject delete
   */
  export type SrsProjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
    /**
     * Filter which SrsProject to delete.
     */
    where: SrsProjectWhereUniqueInput
  }

  /**
   * SrsProject deleteMany
   */
  export type SrsProjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SrsProjects to delete
     */
    where?: SrsProjectWhereInput
  }

  /**
   * SrsProject.userStories
   */
  export type SrsProject$userStoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
    where?: UserStoryWhereInput
    orderBy?: UserStoryOrderByWithRelationInput | UserStoryOrderByWithRelationInput[]
    cursor?: UserStoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserStoryScalarFieldEnum | UserStoryScalarFieldEnum[]
  }

  /**
   * SrsProject without action
   */
  export type SrsProjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SrsProject
     */
    select?: SrsProjectSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SrsProjectInclude<ExtArgs> | null
  }


  /**
   * Model UserStory
   */

  export type AggregateUserStory = {
    _count: UserStoryCountAggregateOutputType | null
    _avg: UserStoryAvgAggregateOutputType | null
    _sum: UserStorySumAggregateOutputType | null
    _min: UserStoryMinAggregateOutputType | null
    _max: UserStoryMaxAggregateOutputType | null
  }

  export type UserStoryAvgAggregateOutputType = {
    confidence: number | null
  }

  export type UserStorySumAggregateOutputType = {
    confidence: number | null
  }

  export type UserStoryMinAggregateOutputType = {
    id: string | null
    title: string | null
    role: string | null
    action: string | null
    benefit: string | null
    featureArea: string | null
    confidence: number | null
    status: string | null
    generatedSchemaId: string | null
    rawText: string | null
    projectId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserStoryMaxAggregateOutputType = {
    id: string | null
    title: string | null
    role: string | null
    action: string | null
    benefit: string | null
    featureArea: string | null
    confidence: number | null
    status: string | null
    generatedSchemaId: string | null
    rawText: string | null
    projectId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserStoryCountAggregateOutputType = {
    id: number
    title: number
    role: number
    action: number
    benefit: number
    acceptanceCriteria: number
    suggestedFields: number
    featureArea: number
    confidence: number
    status: number
    generatedSchemaId: number
    rawText: number
    projectId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserStoryAvgAggregateInputType = {
    confidence?: true
  }

  export type UserStorySumAggregateInputType = {
    confidence?: true
  }

  export type UserStoryMinAggregateInputType = {
    id?: true
    title?: true
    role?: true
    action?: true
    benefit?: true
    featureArea?: true
    confidence?: true
    status?: true
    generatedSchemaId?: true
    rawText?: true
    projectId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserStoryMaxAggregateInputType = {
    id?: true
    title?: true
    role?: true
    action?: true
    benefit?: true
    featureArea?: true
    confidence?: true
    status?: true
    generatedSchemaId?: true
    rawText?: true
    projectId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserStoryCountAggregateInputType = {
    id?: true
    title?: true
    role?: true
    action?: true
    benefit?: true
    acceptanceCriteria?: true
    suggestedFields?: true
    featureArea?: true
    confidence?: true
    status?: true
    generatedSchemaId?: true
    rawText?: true
    projectId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserStoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserStory to aggregate.
     */
    where?: UserStoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserStories to fetch.
     */
    orderBy?: UserStoryOrderByWithRelationInput | UserStoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserStoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserStories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserStories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserStories
    **/
    _count?: true | UserStoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserStoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserStorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserStoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserStoryMaxAggregateInputType
  }

  export type GetUserStoryAggregateType<T extends UserStoryAggregateArgs> = {
        [P in keyof T & keyof AggregateUserStory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserStory[P]>
      : GetScalarType<T[P], AggregateUserStory[P]>
  }




  export type UserStoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserStoryWhereInput
    orderBy?: UserStoryOrderByWithAggregationInput | UserStoryOrderByWithAggregationInput[]
    by: UserStoryScalarFieldEnum[] | UserStoryScalarFieldEnum
    having?: UserStoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserStoryCountAggregateInputType | true
    _avg?: UserStoryAvgAggregateInputType
    _sum?: UserStorySumAggregateInputType
    _min?: UserStoryMinAggregateInputType
    _max?: UserStoryMaxAggregateInputType
  }

  export type UserStoryGroupByOutputType = {
    id: string
    title: string
    role: string
    action: string
    benefit: string
    acceptanceCriteria: string[]
    suggestedFields: JsonValue
    featureArea: string
    confidence: number
    status: string
    generatedSchemaId: string | null
    rawText: string
    projectId: string
    createdAt: Date
    updatedAt: Date
    _count: UserStoryCountAggregateOutputType | null
    _avg: UserStoryAvgAggregateOutputType | null
    _sum: UserStorySumAggregateOutputType | null
    _min: UserStoryMinAggregateOutputType | null
    _max: UserStoryMaxAggregateOutputType | null
  }

  type GetUserStoryGroupByPayload<T extends UserStoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserStoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserStoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserStoryGroupByOutputType[P]>
            : GetScalarType<T[P], UserStoryGroupByOutputType[P]>
        }
      >
    >


  export type UserStorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    role?: boolean
    action?: boolean
    benefit?: boolean
    acceptanceCriteria?: boolean
    suggestedFields?: boolean
    featureArea?: boolean
    confidence?: boolean
    status?: boolean
    generatedSchemaId?: boolean
    rawText?: boolean
    projectId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    project?: boolean | SrsProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userStory"]>

  export type UserStorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    role?: boolean
    action?: boolean
    benefit?: boolean
    acceptanceCriteria?: boolean
    suggestedFields?: boolean
    featureArea?: boolean
    confidence?: boolean
    status?: boolean
    generatedSchemaId?: boolean
    rawText?: boolean
    projectId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    project?: boolean | SrsProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userStory"]>

  export type UserStorySelectScalar = {
    id?: boolean
    title?: boolean
    role?: boolean
    action?: boolean
    benefit?: boolean
    acceptanceCriteria?: boolean
    suggestedFields?: boolean
    featureArea?: boolean
    confidence?: boolean
    status?: boolean
    generatedSchemaId?: boolean
    rawText?: boolean
    projectId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserStoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | SrsProjectDefaultArgs<ExtArgs>
  }
  export type UserStoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | SrsProjectDefaultArgs<ExtArgs>
  }

  export type $UserStoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserStory"
    objects: {
      project: Prisma.$SrsProjectPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      role: string
      action: string
      benefit: string
      acceptanceCriteria: string[]
      suggestedFields: Prisma.JsonValue
      featureArea: string
      confidence: number
      status: string
      generatedSchemaId: string | null
      rawText: string
      projectId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userStory"]>
    composites: {}
  }

  type UserStoryGetPayload<S extends boolean | null | undefined | UserStoryDefaultArgs> = $Result.GetResult<Prisma.$UserStoryPayload, S>

  type UserStoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserStoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserStoryCountAggregateInputType | true
    }

  export interface UserStoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserStory'], meta: { name: 'UserStory' } }
    /**
     * Find zero or one UserStory that matches the filter.
     * @param {UserStoryFindUniqueArgs} args - Arguments to find a UserStory
     * @example
     * // Get one UserStory
     * const userStory = await prisma.userStory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserStoryFindUniqueArgs>(args: SelectSubset<T, UserStoryFindUniqueArgs<ExtArgs>>): Prisma__UserStoryClient<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserStory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserStoryFindUniqueOrThrowArgs} args - Arguments to find a UserStory
     * @example
     * // Get one UserStory
     * const userStory = await prisma.userStory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserStoryFindUniqueOrThrowArgs>(args: SelectSubset<T, UserStoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserStoryClient<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserStory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStoryFindFirstArgs} args - Arguments to find a UserStory
     * @example
     * // Get one UserStory
     * const userStory = await prisma.userStory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserStoryFindFirstArgs>(args?: SelectSubset<T, UserStoryFindFirstArgs<ExtArgs>>): Prisma__UserStoryClient<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserStory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStoryFindFirstOrThrowArgs} args - Arguments to find a UserStory
     * @example
     * // Get one UserStory
     * const userStory = await prisma.userStory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserStoryFindFirstOrThrowArgs>(args?: SelectSubset<T, UserStoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserStoryClient<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserStories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserStories
     * const userStories = await prisma.userStory.findMany()
     * 
     * // Get first 10 UserStories
     * const userStories = await prisma.userStory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userStoryWithIdOnly = await prisma.userStory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserStoryFindManyArgs>(args?: SelectSubset<T, UserStoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserStory.
     * @param {UserStoryCreateArgs} args - Arguments to create a UserStory.
     * @example
     * // Create one UserStory
     * const UserStory = await prisma.userStory.create({
     *   data: {
     *     // ... data to create a UserStory
     *   }
     * })
     * 
     */
    create<T extends UserStoryCreateArgs>(args: SelectSubset<T, UserStoryCreateArgs<ExtArgs>>): Prisma__UserStoryClient<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserStories.
     * @param {UserStoryCreateManyArgs} args - Arguments to create many UserStories.
     * @example
     * // Create many UserStories
     * const userStory = await prisma.userStory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserStoryCreateManyArgs>(args?: SelectSubset<T, UserStoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserStories and returns the data saved in the database.
     * @param {UserStoryCreateManyAndReturnArgs} args - Arguments to create many UserStories.
     * @example
     * // Create many UserStories
     * const userStory = await prisma.userStory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserStories and only return the `id`
     * const userStoryWithIdOnly = await prisma.userStory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserStoryCreateManyAndReturnArgs>(args?: SelectSubset<T, UserStoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserStory.
     * @param {UserStoryDeleteArgs} args - Arguments to delete one UserStory.
     * @example
     * // Delete one UserStory
     * const UserStory = await prisma.userStory.delete({
     *   where: {
     *     // ... filter to delete one UserStory
     *   }
     * })
     * 
     */
    delete<T extends UserStoryDeleteArgs>(args: SelectSubset<T, UserStoryDeleteArgs<ExtArgs>>): Prisma__UserStoryClient<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserStory.
     * @param {UserStoryUpdateArgs} args - Arguments to update one UserStory.
     * @example
     * // Update one UserStory
     * const userStory = await prisma.userStory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserStoryUpdateArgs>(args: SelectSubset<T, UserStoryUpdateArgs<ExtArgs>>): Prisma__UserStoryClient<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserStories.
     * @param {UserStoryDeleteManyArgs} args - Arguments to filter UserStories to delete.
     * @example
     * // Delete a few UserStories
     * const { count } = await prisma.userStory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserStoryDeleteManyArgs>(args?: SelectSubset<T, UserStoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserStories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserStories
     * const userStory = await prisma.userStory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserStoryUpdateManyArgs>(args: SelectSubset<T, UserStoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserStory.
     * @param {UserStoryUpsertArgs} args - Arguments to update or create a UserStory.
     * @example
     * // Update or create a UserStory
     * const userStory = await prisma.userStory.upsert({
     *   create: {
     *     // ... data to create a UserStory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserStory we want to update
     *   }
     * })
     */
    upsert<T extends UserStoryUpsertArgs>(args: SelectSubset<T, UserStoryUpsertArgs<ExtArgs>>): Prisma__UserStoryClient<$Result.GetResult<Prisma.$UserStoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserStories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStoryCountArgs} args - Arguments to filter UserStories to count.
     * @example
     * // Count the number of UserStories
     * const count = await prisma.userStory.count({
     *   where: {
     *     // ... the filter for the UserStories we want to count
     *   }
     * })
    **/
    count<T extends UserStoryCountArgs>(
      args?: Subset<T, UserStoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserStoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserStory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserStoryAggregateArgs>(args: Subset<T, UserStoryAggregateArgs>): Prisma.PrismaPromise<GetUserStoryAggregateType<T>>

    /**
     * Group by UserStory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserStoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserStoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserStoryGroupByArgs['orderBy'] }
        : { orderBy?: UserStoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserStoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserStoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserStory model
   */
  readonly fields: UserStoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserStory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserStoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    project<T extends SrsProjectDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SrsProjectDefaultArgs<ExtArgs>>): Prisma__SrsProjectClient<$Result.GetResult<Prisma.$SrsProjectPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserStory model
   */ 
  interface UserStoryFieldRefs {
    readonly id: FieldRef<"UserStory", 'String'>
    readonly title: FieldRef<"UserStory", 'String'>
    readonly role: FieldRef<"UserStory", 'String'>
    readonly action: FieldRef<"UserStory", 'String'>
    readonly benefit: FieldRef<"UserStory", 'String'>
    readonly acceptanceCriteria: FieldRef<"UserStory", 'String[]'>
    readonly suggestedFields: FieldRef<"UserStory", 'Json'>
    readonly featureArea: FieldRef<"UserStory", 'String'>
    readonly confidence: FieldRef<"UserStory", 'Float'>
    readonly status: FieldRef<"UserStory", 'String'>
    readonly generatedSchemaId: FieldRef<"UserStory", 'String'>
    readonly rawText: FieldRef<"UserStory", 'String'>
    readonly projectId: FieldRef<"UserStory", 'String'>
    readonly createdAt: FieldRef<"UserStory", 'DateTime'>
    readonly updatedAt: FieldRef<"UserStory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserStory findUnique
   */
  export type UserStoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
    /**
     * Filter, which UserStory to fetch.
     */
    where: UserStoryWhereUniqueInput
  }

  /**
   * UserStory findUniqueOrThrow
   */
  export type UserStoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
    /**
     * Filter, which UserStory to fetch.
     */
    where: UserStoryWhereUniqueInput
  }

  /**
   * UserStory findFirst
   */
  export type UserStoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
    /**
     * Filter, which UserStory to fetch.
     */
    where?: UserStoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserStories to fetch.
     */
    orderBy?: UserStoryOrderByWithRelationInput | UserStoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserStories.
     */
    cursor?: UserStoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserStories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserStories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserStories.
     */
    distinct?: UserStoryScalarFieldEnum | UserStoryScalarFieldEnum[]
  }

  /**
   * UserStory findFirstOrThrow
   */
  export type UserStoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
    /**
     * Filter, which UserStory to fetch.
     */
    where?: UserStoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserStories to fetch.
     */
    orderBy?: UserStoryOrderByWithRelationInput | UserStoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserStories.
     */
    cursor?: UserStoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserStories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserStories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserStories.
     */
    distinct?: UserStoryScalarFieldEnum | UserStoryScalarFieldEnum[]
  }

  /**
   * UserStory findMany
   */
  export type UserStoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
    /**
     * Filter, which UserStories to fetch.
     */
    where?: UserStoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserStories to fetch.
     */
    orderBy?: UserStoryOrderByWithRelationInput | UserStoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserStories.
     */
    cursor?: UserStoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserStories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserStories.
     */
    skip?: number
    distinct?: UserStoryScalarFieldEnum | UserStoryScalarFieldEnum[]
  }

  /**
   * UserStory create
   */
  export type UserStoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
    /**
     * The data needed to create a UserStory.
     */
    data: XOR<UserStoryCreateInput, UserStoryUncheckedCreateInput>
  }

  /**
   * UserStory createMany
   */
  export type UserStoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserStories.
     */
    data: UserStoryCreateManyInput | UserStoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserStory createManyAndReturn
   */
  export type UserStoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserStories.
     */
    data: UserStoryCreateManyInput | UserStoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserStory update
   */
  export type UserStoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
    /**
     * The data needed to update a UserStory.
     */
    data: XOR<UserStoryUpdateInput, UserStoryUncheckedUpdateInput>
    /**
     * Choose, which UserStory to update.
     */
    where: UserStoryWhereUniqueInput
  }

  /**
   * UserStory updateMany
   */
  export type UserStoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserStories.
     */
    data: XOR<UserStoryUpdateManyMutationInput, UserStoryUncheckedUpdateManyInput>
    /**
     * Filter which UserStories to update
     */
    where?: UserStoryWhereInput
  }

  /**
   * UserStory upsert
   */
  export type UserStoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
    /**
     * The filter to search for the UserStory to update in case it exists.
     */
    where: UserStoryWhereUniqueInput
    /**
     * In case the UserStory found by the `where` argument doesn't exist, create a new UserStory with this data.
     */
    create: XOR<UserStoryCreateInput, UserStoryUncheckedCreateInput>
    /**
     * In case the UserStory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserStoryUpdateInput, UserStoryUncheckedUpdateInput>
  }

  /**
   * UserStory delete
   */
  export type UserStoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
    /**
     * Filter which UserStory to delete.
     */
    where: UserStoryWhereUniqueInput
  }

  /**
   * UserStory deleteMany
   */
  export type UserStoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserStories to delete
     */
    where?: UserStoryWhereInput
  }

  /**
   * UserStory without action
   */
  export type UserStoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserStory
     */
    select?: UserStorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserStoryInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    password: 'password',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SchemaScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    content: 'content',
    sourceFormat: 'sourceFormat',
    tags: 'tags',
    status: 'status',
    userId: 'userId',
    version: 'version',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SchemaScalarFieldEnum = (typeof SchemaScalarFieldEnum)[keyof typeof SchemaScalarFieldEnum]


  export const FormTemplateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    content: 'content',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FormTemplateScalarFieldEnum = (typeof FormTemplateScalarFieldEnum)[keyof typeof FormTemplateScalarFieldEnum]


  export const SrsProjectScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SrsProjectScalarFieldEnum = (typeof SrsProjectScalarFieldEnum)[keyof typeof SrsProjectScalarFieldEnum]


  export const UserStoryScalarFieldEnum: {
    id: 'id',
    title: 'title',
    role: 'role',
    action: 'action',
    benefit: 'benefit',
    acceptanceCriteria: 'acceptanceCriteria',
    suggestedFields: 'suggestedFields',
    featureArea: 'featureArea',
    confidence: 'confidence',
    status: 'status',
    generatedSchemaId: 'generatedSchemaId',
    rawText: 'rawText',
    projectId: 'projectId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserStoryScalarFieldEnum = (typeof UserStoryScalarFieldEnum)[keyof typeof UserStoryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    schemas?: SchemaListRelationFilter
    templates?: FormTemplateListRelationFilter
    srsProjects?: SrsProjectListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    schemas?: SchemaOrderByRelationAggregateInput
    templates?: FormTemplateOrderByRelationAggregateInput
    srsProjects?: SrsProjectOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    schemas?: SchemaListRelationFilter
    templates?: FormTemplateListRelationFilter
    srsProjects?: SrsProjectListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type SchemaWhereInput = {
    AND?: SchemaWhereInput | SchemaWhereInput[]
    OR?: SchemaWhereInput[]
    NOT?: SchemaWhereInput | SchemaWhereInput[]
    id?: StringFilter<"Schema"> | string
    name?: StringFilter<"Schema"> | string
    description?: StringNullableFilter<"Schema"> | string | null
    content?: JsonFilter<"Schema">
    sourceFormat?: StringFilter<"Schema"> | string
    tags?: StringNullableListFilter<"Schema">
    status?: StringFilter<"Schema"> | string
    userId?: StringFilter<"Schema"> | string
    version?: IntFilter<"Schema"> | number
    createdAt?: DateTimeFilter<"Schema"> | Date | string
    updatedAt?: DateTimeFilter<"Schema"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type SchemaOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrder
    sourceFormat?: SortOrder
    tags?: SortOrder
    status?: SortOrder
    userId?: SortOrder
    version?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SchemaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SchemaWhereInput | SchemaWhereInput[]
    OR?: SchemaWhereInput[]
    NOT?: SchemaWhereInput | SchemaWhereInput[]
    name?: StringFilter<"Schema"> | string
    description?: StringNullableFilter<"Schema"> | string | null
    content?: JsonFilter<"Schema">
    sourceFormat?: StringFilter<"Schema"> | string
    tags?: StringNullableListFilter<"Schema">
    status?: StringFilter<"Schema"> | string
    userId?: StringFilter<"Schema"> | string
    version?: IntFilter<"Schema"> | number
    createdAt?: DateTimeFilter<"Schema"> | Date | string
    updatedAt?: DateTimeFilter<"Schema"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id">

  export type SchemaOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrder
    sourceFormat?: SortOrder
    tags?: SortOrder
    status?: SortOrder
    userId?: SortOrder
    version?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SchemaCountOrderByAggregateInput
    _avg?: SchemaAvgOrderByAggregateInput
    _max?: SchemaMaxOrderByAggregateInput
    _min?: SchemaMinOrderByAggregateInput
    _sum?: SchemaSumOrderByAggregateInput
  }

  export type SchemaScalarWhereWithAggregatesInput = {
    AND?: SchemaScalarWhereWithAggregatesInput | SchemaScalarWhereWithAggregatesInput[]
    OR?: SchemaScalarWhereWithAggregatesInput[]
    NOT?: SchemaScalarWhereWithAggregatesInput | SchemaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Schema"> | string
    name?: StringWithAggregatesFilter<"Schema"> | string
    description?: StringNullableWithAggregatesFilter<"Schema"> | string | null
    content?: JsonWithAggregatesFilter<"Schema">
    sourceFormat?: StringWithAggregatesFilter<"Schema"> | string
    tags?: StringNullableListFilter<"Schema">
    status?: StringWithAggregatesFilter<"Schema"> | string
    userId?: StringWithAggregatesFilter<"Schema"> | string
    version?: IntWithAggregatesFilter<"Schema"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Schema"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Schema"> | Date | string
  }

  export type FormTemplateWhereInput = {
    AND?: FormTemplateWhereInput | FormTemplateWhereInput[]
    OR?: FormTemplateWhereInput[]
    NOT?: FormTemplateWhereInput | FormTemplateWhereInput[]
    id?: StringFilter<"FormTemplate"> | string
    name?: StringFilter<"FormTemplate"> | string
    description?: StringNullableFilter<"FormTemplate"> | string | null
    content?: JsonFilter<"FormTemplate">
    userId?: StringFilter<"FormTemplate"> | string
    createdAt?: DateTimeFilter<"FormTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"FormTemplate"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type FormTemplateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type FormTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FormTemplateWhereInput | FormTemplateWhereInput[]
    OR?: FormTemplateWhereInput[]
    NOT?: FormTemplateWhereInput | FormTemplateWhereInput[]
    name?: StringFilter<"FormTemplate"> | string
    description?: StringNullableFilter<"FormTemplate"> | string | null
    content?: JsonFilter<"FormTemplate">
    userId?: StringFilter<"FormTemplate"> | string
    createdAt?: DateTimeFilter<"FormTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"FormTemplate"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id">

  export type FormTemplateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FormTemplateCountOrderByAggregateInput
    _max?: FormTemplateMaxOrderByAggregateInput
    _min?: FormTemplateMinOrderByAggregateInput
  }

  export type FormTemplateScalarWhereWithAggregatesInput = {
    AND?: FormTemplateScalarWhereWithAggregatesInput | FormTemplateScalarWhereWithAggregatesInput[]
    OR?: FormTemplateScalarWhereWithAggregatesInput[]
    NOT?: FormTemplateScalarWhereWithAggregatesInput | FormTemplateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FormTemplate"> | string
    name?: StringWithAggregatesFilter<"FormTemplate"> | string
    description?: StringNullableWithAggregatesFilter<"FormTemplate"> | string | null
    content?: JsonWithAggregatesFilter<"FormTemplate">
    userId?: StringWithAggregatesFilter<"FormTemplate"> | string
    createdAt?: DateTimeWithAggregatesFilter<"FormTemplate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FormTemplate"> | Date | string
  }

  export type SrsProjectWhereInput = {
    AND?: SrsProjectWhereInput | SrsProjectWhereInput[]
    OR?: SrsProjectWhereInput[]
    NOT?: SrsProjectWhereInput | SrsProjectWhereInput[]
    id?: StringFilter<"SrsProject"> | string
    name?: StringFilter<"SrsProject"> | string
    description?: StringNullableFilter<"SrsProject"> | string | null
    userId?: StringFilter<"SrsProject"> | string
    createdAt?: DateTimeFilter<"SrsProject"> | Date | string
    updatedAt?: DateTimeFilter<"SrsProject"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    userStories?: UserStoryListRelationFilter
  }

  export type SrsProjectOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    userStories?: UserStoryOrderByRelationAggregateInput
  }

  export type SrsProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SrsProjectWhereInput | SrsProjectWhereInput[]
    OR?: SrsProjectWhereInput[]
    NOT?: SrsProjectWhereInput | SrsProjectWhereInput[]
    name?: StringFilter<"SrsProject"> | string
    description?: StringNullableFilter<"SrsProject"> | string | null
    userId?: StringFilter<"SrsProject"> | string
    createdAt?: DateTimeFilter<"SrsProject"> | Date | string
    updatedAt?: DateTimeFilter<"SrsProject"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    userStories?: UserStoryListRelationFilter
  }, "id">

  export type SrsProjectOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SrsProjectCountOrderByAggregateInput
    _max?: SrsProjectMaxOrderByAggregateInput
    _min?: SrsProjectMinOrderByAggregateInput
  }

  export type SrsProjectScalarWhereWithAggregatesInput = {
    AND?: SrsProjectScalarWhereWithAggregatesInput | SrsProjectScalarWhereWithAggregatesInput[]
    OR?: SrsProjectScalarWhereWithAggregatesInput[]
    NOT?: SrsProjectScalarWhereWithAggregatesInput | SrsProjectScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SrsProject"> | string
    name?: StringWithAggregatesFilter<"SrsProject"> | string
    description?: StringNullableWithAggregatesFilter<"SrsProject"> | string | null
    userId?: StringWithAggregatesFilter<"SrsProject"> | string
    createdAt?: DateTimeWithAggregatesFilter<"SrsProject"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SrsProject"> | Date | string
  }

  export type UserStoryWhereInput = {
    AND?: UserStoryWhereInput | UserStoryWhereInput[]
    OR?: UserStoryWhereInput[]
    NOT?: UserStoryWhereInput | UserStoryWhereInput[]
    id?: StringFilter<"UserStory"> | string
    title?: StringFilter<"UserStory"> | string
    role?: StringFilter<"UserStory"> | string
    action?: StringFilter<"UserStory"> | string
    benefit?: StringFilter<"UserStory"> | string
    acceptanceCriteria?: StringNullableListFilter<"UserStory">
    suggestedFields?: JsonFilter<"UserStory">
    featureArea?: StringFilter<"UserStory"> | string
    confidence?: FloatFilter<"UserStory"> | number
    status?: StringFilter<"UserStory"> | string
    generatedSchemaId?: StringNullableFilter<"UserStory"> | string | null
    rawText?: StringFilter<"UserStory"> | string
    projectId?: StringFilter<"UserStory"> | string
    createdAt?: DateTimeFilter<"UserStory"> | Date | string
    updatedAt?: DateTimeFilter<"UserStory"> | Date | string
    project?: XOR<SrsProjectRelationFilter, SrsProjectWhereInput>
  }

  export type UserStoryOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    role?: SortOrder
    action?: SortOrder
    benefit?: SortOrder
    acceptanceCriteria?: SortOrder
    suggestedFields?: SortOrder
    featureArea?: SortOrder
    confidence?: SortOrder
    status?: SortOrder
    generatedSchemaId?: SortOrderInput | SortOrder
    rawText?: SortOrder
    projectId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    project?: SrsProjectOrderByWithRelationInput
  }

  export type UserStoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserStoryWhereInput | UserStoryWhereInput[]
    OR?: UserStoryWhereInput[]
    NOT?: UserStoryWhereInput | UserStoryWhereInput[]
    title?: StringFilter<"UserStory"> | string
    role?: StringFilter<"UserStory"> | string
    action?: StringFilter<"UserStory"> | string
    benefit?: StringFilter<"UserStory"> | string
    acceptanceCriteria?: StringNullableListFilter<"UserStory">
    suggestedFields?: JsonFilter<"UserStory">
    featureArea?: StringFilter<"UserStory"> | string
    confidence?: FloatFilter<"UserStory"> | number
    status?: StringFilter<"UserStory"> | string
    generatedSchemaId?: StringNullableFilter<"UserStory"> | string | null
    rawText?: StringFilter<"UserStory"> | string
    projectId?: StringFilter<"UserStory"> | string
    createdAt?: DateTimeFilter<"UserStory"> | Date | string
    updatedAt?: DateTimeFilter<"UserStory"> | Date | string
    project?: XOR<SrsProjectRelationFilter, SrsProjectWhereInput>
  }, "id">

  export type UserStoryOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    role?: SortOrder
    action?: SortOrder
    benefit?: SortOrder
    acceptanceCriteria?: SortOrder
    suggestedFields?: SortOrder
    featureArea?: SortOrder
    confidence?: SortOrder
    status?: SortOrder
    generatedSchemaId?: SortOrderInput | SortOrder
    rawText?: SortOrder
    projectId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserStoryCountOrderByAggregateInput
    _avg?: UserStoryAvgOrderByAggregateInput
    _max?: UserStoryMaxOrderByAggregateInput
    _min?: UserStoryMinOrderByAggregateInput
    _sum?: UserStorySumOrderByAggregateInput
  }

  export type UserStoryScalarWhereWithAggregatesInput = {
    AND?: UserStoryScalarWhereWithAggregatesInput | UserStoryScalarWhereWithAggregatesInput[]
    OR?: UserStoryScalarWhereWithAggregatesInput[]
    NOT?: UserStoryScalarWhereWithAggregatesInput | UserStoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserStory"> | string
    title?: StringWithAggregatesFilter<"UserStory"> | string
    role?: StringWithAggregatesFilter<"UserStory"> | string
    action?: StringWithAggregatesFilter<"UserStory"> | string
    benefit?: StringWithAggregatesFilter<"UserStory"> | string
    acceptanceCriteria?: StringNullableListFilter<"UserStory">
    suggestedFields?: JsonWithAggregatesFilter<"UserStory">
    featureArea?: StringWithAggregatesFilter<"UserStory"> | string
    confidence?: FloatWithAggregatesFilter<"UserStory"> | number
    status?: StringWithAggregatesFilter<"UserStory"> | string
    generatedSchemaId?: StringNullableWithAggregatesFilter<"UserStory"> | string | null
    rawText?: StringWithAggregatesFilter<"UserStory"> | string
    projectId?: StringWithAggregatesFilter<"UserStory"> | string
    createdAt?: DateTimeWithAggregatesFilter<"UserStory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserStory"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    schemas?: SchemaCreateNestedManyWithoutUserInput
    templates?: FormTemplateCreateNestedManyWithoutUserInput
    srsProjects?: SrsProjectCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    schemas?: SchemaUncheckedCreateNestedManyWithoutUserInput
    templates?: FormTemplateUncheckedCreateNestedManyWithoutUserInput
    srsProjects?: SrsProjectUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schemas?: SchemaUpdateManyWithoutUserNestedInput
    templates?: FormTemplateUpdateManyWithoutUserNestedInput
    srsProjects?: SrsProjectUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schemas?: SchemaUncheckedUpdateManyWithoutUserNestedInput
    templates?: FormTemplateUncheckedUpdateManyWithoutUserNestedInput
    srsProjects?: SrsProjectUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SchemaCreateInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    sourceFormat?: string
    tags?: SchemaCreatetagsInput | string[]
    status?: string
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutSchemasInput
  }

  export type SchemaUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    sourceFormat?: string
    tags?: SchemaCreatetagsInput | string[]
    status?: string
    userId: string
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SchemaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    sourceFormat?: StringFieldUpdateOperationsInput | string
    tags?: SchemaUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSchemasNestedInput
  }

  export type SchemaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    sourceFormat?: StringFieldUpdateOperationsInput | string
    tags?: SchemaUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SchemaCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    sourceFormat?: string
    tags?: SchemaCreatetagsInput | string[]
    status?: string
    userId: string
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SchemaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    sourceFormat?: StringFieldUpdateOperationsInput | string
    tags?: SchemaUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SchemaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    sourceFormat?: StringFieldUpdateOperationsInput | string
    tags?: SchemaUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormTemplateCreateInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutTemplatesInput
  }

  export type FormTemplateUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormTemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutTemplatesNestedInput
  }

  export type FormTemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormTemplateCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormTemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormTemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SrsProjectCreateInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutSrsProjectsInput
    userStories?: UserStoryCreateNestedManyWithoutProjectInput
  }

  export type SrsProjectUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userStories?: UserStoryUncheckedCreateNestedManyWithoutProjectInput
  }

  export type SrsProjectUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSrsProjectsNestedInput
    userStories?: UserStoryUpdateManyWithoutProjectNestedInput
  }

  export type SrsProjectUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userStories?: UserStoryUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type SrsProjectCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SrsProjectUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SrsProjectUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserStoryCreateInput = {
    id?: string
    title: string
    role: string
    action: string
    benefit: string
    acceptanceCriteria?: UserStoryCreateacceptanceCriteriaInput | string[]
    suggestedFields: JsonNullValueInput | InputJsonValue
    featureArea?: string
    confidence?: number
    status?: string
    generatedSchemaId?: string | null
    rawText?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    project: SrsProjectCreateNestedOneWithoutUserStoriesInput
  }

  export type UserStoryUncheckedCreateInput = {
    id?: string
    title: string
    role: string
    action: string
    benefit: string
    acceptanceCriteria?: UserStoryCreateacceptanceCriteriaInput | string[]
    suggestedFields: JsonNullValueInput | InputJsonValue
    featureArea?: string
    confidence?: number
    status?: string
    generatedSchemaId?: string | null
    rawText?: string
    projectId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserStoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    benefit?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: UserStoryUpdateacceptanceCriteriaInput | string[]
    suggestedFields?: JsonNullValueInput | InputJsonValue
    featureArea?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    generatedSchemaId?: NullableStringFieldUpdateOperationsInput | string | null
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: SrsProjectUpdateOneRequiredWithoutUserStoriesNestedInput
  }

  export type UserStoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    benefit?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: UserStoryUpdateacceptanceCriteriaInput | string[]
    suggestedFields?: JsonNullValueInput | InputJsonValue
    featureArea?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    generatedSchemaId?: NullableStringFieldUpdateOperationsInput | string | null
    rawText?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserStoryCreateManyInput = {
    id?: string
    title: string
    role: string
    action: string
    benefit: string
    acceptanceCriteria?: UserStoryCreateacceptanceCriteriaInput | string[]
    suggestedFields: JsonNullValueInput | InputJsonValue
    featureArea?: string
    confidence?: number
    status?: string
    generatedSchemaId?: string | null
    rawText?: string
    projectId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserStoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    benefit?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: UserStoryUpdateacceptanceCriteriaInput | string[]
    suggestedFields?: JsonNullValueInput | InputJsonValue
    featureArea?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    generatedSchemaId?: NullableStringFieldUpdateOperationsInput | string | null
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserStoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    benefit?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: UserStoryUpdateacceptanceCriteriaInput | string[]
    suggestedFields?: JsonNullValueInput | InputJsonValue
    featureArea?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    generatedSchemaId?: NullableStringFieldUpdateOperationsInput | string | null
    rawText?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SchemaListRelationFilter = {
    every?: SchemaWhereInput
    some?: SchemaWhereInput
    none?: SchemaWhereInput
  }

  export type FormTemplateListRelationFilter = {
    every?: FormTemplateWhereInput
    some?: FormTemplateWhereInput
    none?: FormTemplateWhereInput
  }

  export type SrsProjectListRelationFilter = {
    every?: SrsProjectWhereInput
    some?: SrsProjectWhereInput
    none?: SrsProjectWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SchemaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FormTemplateOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SrsProjectOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SchemaCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    content?: SortOrder
    sourceFormat?: SortOrder
    tags?: SortOrder
    status?: SortOrder
    userId?: SortOrder
    version?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SchemaAvgOrderByAggregateInput = {
    version?: SortOrder
  }

  export type SchemaMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    sourceFormat?: SortOrder
    status?: SortOrder
    userId?: SortOrder
    version?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SchemaMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    sourceFormat?: SortOrder
    status?: SortOrder
    userId?: SortOrder
    version?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SchemaSumOrderByAggregateInput = {
    version?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FormTemplateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    content?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormTemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormTemplateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserStoryListRelationFilter = {
    every?: UserStoryWhereInput
    some?: UserStoryWhereInput
    none?: UserStoryWhereInput
  }

  export type UserStoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SrsProjectCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SrsProjectMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SrsProjectMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type SrsProjectRelationFilter = {
    is?: SrsProjectWhereInput
    isNot?: SrsProjectWhereInput
  }

  export type UserStoryCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    role?: SortOrder
    action?: SortOrder
    benefit?: SortOrder
    acceptanceCriteria?: SortOrder
    suggestedFields?: SortOrder
    featureArea?: SortOrder
    confidence?: SortOrder
    status?: SortOrder
    generatedSchemaId?: SortOrder
    rawText?: SortOrder
    projectId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserStoryAvgOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type UserStoryMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    role?: SortOrder
    action?: SortOrder
    benefit?: SortOrder
    featureArea?: SortOrder
    confidence?: SortOrder
    status?: SortOrder
    generatedSchemaId?: SortOrder
    rawText?: SortOrder
    projectId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserStoryMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    role?: SortOrder
    action?: SortOrder
    benefit?: SortOrder
    featureArea?: SortOrder
    confidence?: SortOrder
    status?: SortOrder
    generatedSchemaId?: SortOrder
    rawText?: SortOrder
    projectId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserStorySumOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type SchemaCreateNestedManyWithoutUserInput = {
    create?: XOR<SchemaCreateWithoutUserInput, SchemaUncheckedCreateWithoutUserInput> | SchemaCreateWithoutUserInput[] | SchemaUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SchemaCreateOrConnectWithoutUserInput | SchemaCreateOrConnectWithoutUserInput[]
    createMany?: SchemaCreateManyUserInputEnvelope
    connect?: SchemaWhereUniqueInput | SchemaWhereUniqueInput[]
  }

  export type FormTemplateCreateNestedManyWithoutUserInput = {
    create?: XOR<FormTemplateCreateWithoutUserInput, FormTemplateUncheckedCreateWithoutUserInput> | FormTemplateCreateWithoutUserInput[] | FormTemplateUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FormTemplateCreateOrConnectWithoutUserInput | FormTemplateCreateOrConnectWithoutUserInput[]
    createMany?: FormTemplateCreateManyUserInputEnvelope
    connect?: FormTemplateWhereUniqueInput | FormTemplateWhereUniqueInput[]
  }

  export type SrsProjectCreateNestedManyWithoutUserInput = {
    create?: XOR<SrsProjectCreateWithoutUserInput, SrsProjectUncheckedCreateWithoutUserInput> | SrsProjectCreateWithoutUserInput[] | SrsProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SrsProjectCreateOrConnectWithoutUserInput | SrsProjectCreateOrConnectWithoutUserInput[]
    createMany?: SrsProjectCreateManyUserInputEnvelope
    connect?: SrsProjectWhereUniqueInput | SrsProjectWhereUniqueInput[]
  }

  export type SchemaUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SchemaCreateWithoutUserInput, SchemaUncheckedCreateWithoutUserInput> | SchemaCreateWithoutUserInput[] | SchemaUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SchemaCreateOrConnectWithoutUserInput | SchemaCreateOrConnectWithoutUserInput[]
    createMany?: SchemaCreateManyUserInputEnvelope
    connect?: SchemaWhereUniqueInput | SchemaWhereUniqueInput[]
  }

  export type FormTemplateUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<FormTemplateCreateWithoutUserInput, FormTemplateUncheckedCreateWithoutUserInput> | FormTemplateCreateWithoutUserInput[] | FormTemplateUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FormTemplateCreateOrConnectWithoutUserInput | FormTemplateCreateOrConnectWithoutUserInput[]
    createMany?: FormTemplateCreateManyUserInputEnvelope
    connect?: FormTemplateWhereUniqueInput | FormTemplateWhereUniqueInput[]
  }

  export type SrsProjectUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SrsProjectCreateWithoutUserInput, SrsProjectUncheckedCreateWithoutUserInput> | SrsProjectCreateWithoutUserInput[] | SrsProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SrsProjectCreateOrConnectWithoutUserInput | SrsProjectCreateOrConnectWithoutUserInput[]
    createMany?: SrsProjectCreateManyUserInputEnvelope
    connect?: SrsProjectWhereUniqueInput | SrsProjectWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SchemaUpdateManyWithoutUserNestedInput = {
    create?: XOR<SchemaCreateWithoutUserInput, SchemaUncheckedCreateWithoutUserInput> | SchemaCreateWithoutUserInput[] | SchemaUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SchemaCreateOrConnectWithoutUserInput | SchemaCreateOrConnectWithoutUserInput[]
    upsert?: SchemaUpsertWithWhereUniqueWithoutUserInput | SchemaUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SchemaCreateManyUserInputEnvelope
    set?: SchemaWhereUniqueInput | SchemaWhereUniqueInput[]
    disconnect?: SchemaWhereUniqueInput | SchemaWhereUniqueInput[]
    delete?: SchemaWhereUniqueInput | SchemaWhereUniqueInput[]
    connect?: SchemaWhereUniqueInput | SchemaWhereUniqueInput[]
    update?: SchemaUpdateWithWhereUniqueWithoutUserInput | SchemaUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SchemaUpdateManyWithWhereWithoutUserInput | SchemaUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SchemaScalarWhereInput | SchemaScalarWhereInput[]
  }

  export type FormTemplateUpdateManyWithoutUserNestedInput = {
    create?: XOR<FormTemplateCreateWithoutUserInput, FormTemplateUncheckedCreateWithoutUserInput> | FormTemplateCreateWithoutUserInput[] | FormTemplateUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FormTemplateCreateOrConnectWithoutUserInput | FormTemplateCreateOrConnectWithoutUserInput[]
    upsert?: FormTemplateUpsertWithWhereUniqueWithoutUserInput | FormTemplateUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: FormTemplateCreateManyUserInputEnvelope
    set?: FormTemplateWhereUniqueInput | FormTemplateWhereUniqueInput[]
    disconnect?: FormTemplateWhereUniqueInput | FormTemplateWhereUniqueInput[]
    delete?: FormTemplateWhereUniqueInput | FormTemplateWhereUniqueInput[]
    connect?: FormTemplateWhereUniqueInput | FormTemplateWhereUniqueInput[]
    update?: FormTemplateUpdateWithWhereUniqueWithoutUserInput | FormTemplateUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: FormTemplateUpdateManyWithWhereWithoutUserInput | FormTemplateUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: FormTemplateScalarWhereInput | FormTemplateScalarWhereInput[]
  }

  export type SrsProjectUpdateManyWithoutUserNestedInput = {
    create?: XOR<SrsProjectCreateWithoutUserInput, SrsProjectUncheckedCreateWithoutUserInput> | SrsProjectCreateWithoutUserInput[] | SrsProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SrsProjectCreateOrConnectWithoutUserInput | SrsProjectCreateOrConnectWithoutUserInput[]
    upsert?: SrsProjectUpsertWithWhereUniqueWithoutUserInput | SrsProjectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SrsProjectCreateManyUserInputEnvelope
    set?: SrsProjectWhereUniqueInput | SrsProjectWhereUniqueInput[]
    disconnect?: SrsProjectWhereUniqueInput | SrsProjectWhereUniqueInput[]
    delete?: SrsProjectWhereUniqueInput | SrsProjectWhereUniqueInput[]
    connect?: SrsProjectWhereUniqueInput | SrsProjectWhereUniqueInput[]
    update?: SrsProjectUpdateWithWhereUniqueWithoutUserInput | SrsProjectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SrsProjectUpdateManyWithWhereWithoutUserInput | SrsProjectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SrsProjectScalarWhereInput | SrsProjectScalarWhereInput[]
  }

  export type SchemaUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SchemaCreateWithoutUserInput, SchemaUncheckedCreateWithoutUserInput> | SchemaCreateWithoutUserInput[] | SchemaUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SchemaCreateOrConnectWithoutUserInput | SchemaCreateOrConnectWithoutUserInput[]
    upsert?: SchemaUpsertWithWhereUniqueWithoutUserInput | SchemaUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SchemaCreateManyUserInputEnvelope
    set?: SchemaWhereUniqueInput | SchemaWhereUniqueInput[]
    disconnect?: SchemaWhereUniqueInput | SchemaWhereUniqueInput[]
    delete?: SchemaWhereUniqueInput | SchemaWhereUniqueInput[]
    connect?: SchemaWhereUniqueInput | SchemaWhereUniqueInput[]
    update?: SchemaUpdateWithWhereUniqueWithoutUserInput | SchemaUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SchemaUpdateManyWithWhereWithoutUserInput | SchemaUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SchemaScalarWhereInput | SchemaScalarWhereInput[]
  }

  export type FormTemplateUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<FormTemplateCreateWithoutUserInput, FormTemplateUncheckedCreateWithoutUserInput> | FormTemplateCreateWithoutUserInput[] | FormTemplateUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FormTemplateCreateOrConnectWithoutUserInput | FormTemplateCreateOrConnectWithoutUserInput[]
    upsert?: FormTemplateUpsertWithWhereUniqueWithoutUserInput | FormTemplateUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: FormTemplateCreateManyUserInputEnvelope
    set?: FormTemplateWhereUniqueInput | FormTemplateWhereUniqueInput[]
    disconnect?: FormTemplateWhereUniqueInput | FormTemplateWhereUniqueInput[]
    delete?: FormTemplateWhereUniqueInput | FormTemplateWhereUniqueInput[]
    connect?: FormTemplateWhereUniqueInput | FormTemplateWhereUniqueInput[]
    update?: FormTemplateUpdateWithWhereUniqueWithoutUserInput | FormTemplateUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: FormTemplateUpdateManyWithWhereWithoutUserInput | FormTemplateUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: FormTemplateScalarWhereInput | FormTemplateScalarWhereInput[]
  }

  export type SrsProjectUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SrsProjectCreateWithoutUserInput, SrsProjectUncheckedCreateWithoutUserInput> | SrsProjectCreateWithoutUserInput[] | SrsProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SrsProjectCreateOrConnectWithoutUserInput | SrsProjectCreateOrConnectWithoutUserInput[]
    upsert?: SrsProjectUpsertWithWhereUniqueWithoutUserInput | SrsProjectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SrsProjectCreateManyUserInputEnvelope
    set?: SrsProjectWhereUniqueInput | SrsProjectWhereUniqueInput[]
    disconnect?: SrsProjectWhereUniqueInput | SrsProjectWhereUniqueInput[]
    delete?: SrsProjectWhereUniqueInput | SrsProjectWhereUniqueInput[]
    connect?: SrsProjectWhereUniqueInput | SrsProjectWhereUniqueInput[]
    update?: SrsProjectUpdateWithWhereUniqueWithoutUserInput | SrsProjectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SrsProjectUpdateManyWithWhereWithoutUserInput | SrsProjectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SrsProjectScalarWhereInput | SrsProjectScalarWhereInput[]
  }

  export type SchemaCreatetagsInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutSchemasInput = {
    create?: XOR<UserCreateWithoutSchemasInput, UserUncheckedCreateWithoutSchemasInput>
    connectOrCreate?: UserCreateOrConnectWithoutSchemasInput
    connect?: UserWhereUniqueInput
  }

  export type SchemaUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutSchemasNestedInput = {
    create?: XOR<UserCreateWithoutSchemasInput, UserUncheckedCreateWithoutSchemasInput>
    connectOrCreate?: UserCreateOrConnectWithoutSchemasInput
    upsert?: UserUpsertWithoutSchemasInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSchemasInput, UserUpdateWithoutSchemasInput>, UserUncheckedUpdateWithoutSchemasInput>
  }

  export type UserCreateNestedOneWithoutTemplatesInput = {
    create?: XOR<UserCreateWithoutTemplatesInput, UserUncheckedCreateWithoutTemplatesInput>
    connectOrCreate?: UserCreateOrConnectWithoutTemplatesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutTemplatesNestedInput = {
    create?: XOR<UserCreateWithoutTemplatesInput, UserUncheckedCreateWithoutTemplatesInput>
    connectOrCreate?: UserCreateOrConnectWithoutTemplatesInput
    upsert?: UserUpsertWithoutTemplatesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTemplatesInput, UserUpdateWithoutTemplatesInput>, UserUncheckedUpdateWithoutTemplatesInput>
  }

  export type UserCreateNestedOneWithoutSrsProjectsInput = {
    create?: XOR<UserCreateWithoutSrsProjectsInput, UserUncheckedCreateWithoutSrsProjectsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSrsProjectsInput
    connect?: UserWhereUniqueInput
  }

  export type UserStoryCreateNestedManyWithoutProjectInput = {
    create?: XOR<UserStoryCreateWithoutProjectInput, UserStoryUncheckedCreateWithoutProjectInput> | UserStoryCreateWithoutProjectInput[] | UserStoryUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: UserStoryCreateOrConnectWithoutProjectInput | UserStoryCreateOrConnectWithoutProjectInput[]
    createMany?: UserStoryCreateManyProjectInputEnvelope
    connect?: UserStoryWhereUniqueInput | UserStoryWhereUniqueInput[]
  }

  export type UserStoryUncheckedCreateNestedManyWithoutProjectInput = {
    create?: XOR<UserStoryCreateWithoutProjectInput, UserStoryUncheckedCreateWithoutProjectInput> | UserStoryCreateWithoutProjectInput[] | UserStoryUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: UserStoryCreateOrConnectWithoutProjectInput | UserStoryCreateOrConnectWithoutProjectInput[]
    createMany?: UserStoryCreateManyProjectInputEnvelope
    connect?: UserStoryWhereUniqueInput | UserStoryWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutSrsProjectsNestedInput = {
    create?: XOR<UserCreateWithoutSrsProjectsInput, UserUncheckedCreateWithoutSrsProjectsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSrsProjectsInput
    upsert?: UserUpsertWithoutSrsProjectsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSrsProjectsInput, UserUpdateWithoutSrsProjectsInput>, UserUncheckedUpdateWithoutSrsProjectsInput>
  }

  export type UserStoryUpdateManyWithoutProjectNestedInput = {
    create?: XOR<UserStoryCreateWithoutProjectInput, UserStoryUncheckedCreateWithoutProjectInput> | UserStoryCreateWithoutProjectInput[] | UserStoryUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: UserStoryCreateOrConnectWithoutProjectInput | UserStoryCreateOrConnectWithoutProjectInput[]
    upsert?: UserStoryUpsertWithWhereUniqueWithoutProjectInput | UserStoryUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: UserStoryCreateManyProjectInputEnvelope
    set?: UserStoryWhereUniqueInput | UserStoryWhereUniqueInput[]
    disconnect?: UserStoryWhereUniqueInput | UserStoryWhereUniqueInput[]
    delete?: UserStoryWhereUniqueInput | UserStoryWhereUniqueInput[]
    connect?: UserStoryWhereUniqueInput | UserStoryWhereUniqueInput[]
    update?: UserStoryUpdateWithWhereUniqueWithoutProjectInput | UserStoryUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: UserStoryUpdateManyWithWhereWithoutProjectInput | UserStoryUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: UserStoryScalarWhereInput | UserStoryScalarWhereInput[]
  }

  export type UserStoryUncheckedUpdateManyWithoutProjectNestedInput = {
    create?: XOR<UserStoryCreateWithoutProjectInput, UserStoryUncheckedCreateWithoutProjectInput> | UserStoryCreateWithoutProjectInput[] | UserStoryUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: UserStoryCreateOrConnectWithoutProjectInput | UserStoryCreateOrConnectWithoutProjectInput[]
    upsert?: UserStoryUpsertWithWhereUniqueWithoutProjectInput | UserStoryUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: UserStoryCreateManyProjectInputEnvelope
    set?: UserStoryWhereUniqueInput | UserStoryWhereUniqueInput[]
    disconnect?: UserStoryWhereUniqueInput | UserStoryWhereUniqueInput[]
    delete?: UserStoryWhereUniqueInput | UserStoryWhereUniqueInput[]
    connect?: UserStoryWhereUniqueInput | UserStoryWhereUniqueInput[]
    update?: UserStoryUpdateWithWhereUniqueWithoutProjectInput | UserStoryUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: UserStoryUpdateManyWithWhereWithoutProjectInput | UserStoryUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: UserStoryScalarWhereInput | UserStoryScalarWhereInput[]
  }

  export type UserStoryCreateacceptanceCriteriaInput = {
    set: string[]
  }

  export type SrsProjectCreateNestedOneWithoutUserStoriesInput = {
    create?: XOR<SrsProjectCreateWithoutUserStoriesInput, SrsProjectUncheckedCreateWithoutUserStoriesInput>
    connectOrCreate?: SrsProjectCreateOrConnectWithoutUserStoriesInput
    connect?: SrsProjectWhereUniqueInput
  }

  export type UserStoryUpdateacceptanceCriteriaInput = {
    set?: string[]
    push?: string | string[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SrsProjectUpdateOneRequiredWithoutUserStoriesNestedInput = {
    create?: XOR<SrsProjectCreateWithoutUserStoriesInput, SrsProjectUncheckedCreateWithoutUserStoriesInput>
    connectOrCreate?: SrsProjectCreateOrConnectWithoutUserStoriesInput
    upsert?: SrsProjectUpsertWithoutUserStoriesInput
    connect?: SrsProjectWhereUniqueInput
    update?: XOR<XOR<SrsProjectUpdateToOneWithWhereWithoutUserStoriesInput, SrsProjectUpdateWithoutUserStoriesInput>, SrsProjectUncheckedUpdateWithoutUserStoriesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type SchemaCreateWithoutUserInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    sourceFormat?: string
    tags?: SchemaCreatetagsInput | string[]
    status?: string
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SchemaUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    sourceFormat?: string
    tags?: SchemaCreatetagsInput | string[]
    status?: string
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SchemaCreateOrConnectWithoutUserInput = {
    where: SchemaWhereUniqueInput
    create: XOR<SchemaCreateWithoutUserInput, SchemaUncheckedCreateWithoutUserInput>
  }

  export type SchemaCreateManyUserInputEnvelope = {
    data: SchemaCreateManyUserInput | SchemaCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type FormTemplateCreateWithoutUserInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormTemplateUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormTemplateCreateOrConnectWithoutUserInput = {
    where: FormTemplateWhereUniqueInput
    create: XOR<FormTemplateCreateWithoutUserInput, FormTemplateUncheckedCreateWithoutUserInput>
  }

  export type FormTemplateCreateManyUserInputEnvelope = {
    data: FormTemplateCreateManyUserInput | FormTemplateCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SrsProjectCreateWithoutUserInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userStories?: UserStoryCreateNestedManyWithoutProjectInput
  }

  export type SrsProjectUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userStories?: UserStoryUncheckedCreateNestedManyWithoutProjectInput
  }

  export type SrsProjectCreateOrConnectWithoutUserInput = {
    where: SrsProjectWhereUniqueInput
    create: XOR<SrsProjectCreateWithoutUserInput, SrsProjectUncheckedCreateWithoutUserInput>
  }

  export type SrsProjectCreateManyUserInputEnvelope = {
    data: SrsProjectCreateManyUserInput | SrsProjectCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SchemaUpsertWithWhereUniqueWithoutUserInput = {
    where: SchemaWhereUniqueInput
    update: XOR<SchemaUpdateWithoutUserInput, SchemaUncheckedUpdateWithoutUserInput>
    create: XOR<SchemaCreateWithoutUserInput, SchemaUncheckedCreateWithoutUserInput>
  }

  export type SchemaUpdateWithWhereUniqueWithoutUserInput = {
    where: SchemaWhereUniqueInput
    data: XOR<SchemaUpdateWithoutUserInput, SchemaUncheckedUpdateWithoutUserInput>
  }

  export type SchemaUpdateManyWithWhereWithoutUserInput = {
    where: SchemaScalarWhereInput
    data: XOR<SchemaUpdateManyMutationInput, SchemaUncheckedUpdateManyWithoutUserInput>
  }

  export type SchemaScalarWhereInput = {
    AND?: SchemaScalarWhereInput | SchemaScalarWhereInput[]
    OR?: SchemaScalarWhereInput[]
    NOT?: SchemaScalarWhereInput | SchemaScalarWhereInput[]
    id?: StringFilter<"Schema"> | string
    name?: StringFilter<"Schema"> | string
    description?: StringNullableFilter<"Schema"> | string | null
    content?: JsonFilter<"Schema">
    sourceFormat?: StringFilter<"Schema"> | string
    tags?: StringNullableListFilter<"Schema">
    status?: StringFilter<"Schema"> | string
    userId?: StringFilter<"Schema"> | string
    version?: IntFilter<"Schema"> | number
    createdAt?: DateTimeFilter<"Schema"> | Date | string
    updatedAt?: DateTimeFilter<"Schema"> | Date | string
  }

  export type FormTemplateUpsertWithWhereUniqueWithoutUserInput = {
    where: FormTemplateWhereUniqueInput
    update: XOR<FormTemplateUpdateWithoutUserInput, FormTemplateUncheckedUpdateWithoutUserInput>
    create: XOR<FormTemplateCreateWithoutUserInput, FormTemplateUncheckedCreateWithoutUserInput>
  }

  export type FormTemplateUpdateWithWhereUniqueWithoutUserInput = {
    where: FormTemplateWhereUniqueInput
    data: XOR<FormTemplateUpdateWithoutUserInput, FormTemplateUncheckedUpdateWithoutUserInput>
  }

  export type FormTemplateUpdateManyWithWhereWithoutUserInput = {
    where: FormTemplateScalarWhereInput
    data: XOR<FormTemplateUpdateManyMutationInput, FormTemplateUncheckedUpdateManyWithoutUserInput>
  }

  export type FormTemplateScalarWhereInput = {
    AND?: FormTemplateScalarWhereInput | FormTemplateScalarWhereInput[]
    OR?: FormTemplateScalarWhereInput[]
    NOT?: FormTemplateScalarWhereInput | FormTemplateScalarWhereInput[]
    id?: StringFilter<"FormTemplate"> | string
    name?: StringFilter<"FormTemplate"> | string
    description?: StringNullableFilter<"FormTemplate"> | string | null
    content?: JsonFilter<"FormTemplate">
    userId?: StringFilter<"FormTemplate"> | string
    createdAt?: DateTimeFilter<"FormTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"FormTemplate"> | Date | string
  }

  export type SrsProjectUpsertWithWhereUniqueWithoutUserInput = {
    where: SrsProjectWhereUniqueInput
    update: XOR<SrsProjectUpdateWithoutUserInput, SrsProjectUncheckedUpdateWithoutUserInput>
    create: XOR<SrsProjectCreateWithoutUserInput, SrsProjectUncheckedCreateWithoutUserInput>
  }

  export type SrsProjectUpdateWithWhereUniqueWithoutUserInput = {
    where: SrsProjectWhereUniqueInput
    data: XOR<SrsProjectUpdateWithoutUserInput, SrsProjectUncheckedUpdateWithoutUserInput>
  }

  export type SrsProjectUpdateManyWithWhereWithoutUserInput = {
    where: SrsProjectScalarWhereInput
    data: XOR<SrsProjectUpdateManyMutationInput, SrsProjectUncheckedUpdateManyWithoutUserInput>
  }

  export type SrsProjectScalarWhereInput = {
    AND?: SrsProjectScalarWhereInput | SrsProjectScalarWhereInput[]
    OR?: SrsProjectScalarWhereInput[]
    NOT?: SrsProjectScalarWhereInput | SrsProjectScalarWhereInput[]
    id?: StringFilter<"SrsProject"> | string
    name?: StringFilter<"SrsProject"> | string
    description?: StringNullableFilter<"SrsProject"> | string | null
    userId?: StringFilter<"SrsProject"> | string
    createdAt?: DateTimeFilter<"SrsProject"> | Date | string
    updatedAt?: DateTimeFilter<"SrsProject"> | Date | string
  }

  export type UserCreateWithoutSchemasInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    templates?: FormTemplateCreateNestedManyWithoutUserInput
    srsProjects?: SrsProjectCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSchemasInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    templates?: FormTemplateUncheckedCreateNestedManyWithoutUserInput
    srsProjects?: SrsProjectUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSchemasInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSchemasInput, UserUncheckedCreateWithoutSchemasInput>
  }

  export type UserUpsertWithoutSchemasInput = {
    update: XOR<UserUpdateWithoutSchemasInput, UserUncheckedUpdateWithoutSchemasInput>
    create: XOR<UserCreateWithoutSchemasInput, UserUncheckedCreateWithoutSchemasInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSchemasInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSchemasInput, UserUncheckedUpdateWithoutSchemasInput>
  }

  export type UserUpdateWithoutSchemasInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    templates?: FormTemplateUpdateManyWithoutUserNestedInput
    srsProjects?: SrsProjectUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSchemasInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    templates?: FormTemplateUncheckedUpdateManyWithoutUserNestedInput
    srsProjects?: SrsProjectUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutTemplatesInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    schemas?: SchemaCreateNestedManyWithoutUserInput
    srsProjects?: SrsProjectCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTemplatesInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    schemas?: SchemaUncheckedCreateNestedManyWithoutUserInput
    srsProjects?: SrsProjectUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTemplatesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTemplatesInput, UserUncheckedCreateWithoutTemplatesInput>
  }

  export type UserUpsertWithoutTemplatesInput = {
    update: XOR<UserUpdateWithoutTemplatesInput, UserUncheckedUpdateWithoutTemplatesInput>
    create: XOR<UserCreateWithoutTemplatesInput, UserUncheckedCreateWithoutTemplatesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTemplatesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTemplatesInput, UserUncheckedUpdateWithoutTemplatesInput>
  }

  export type UserUpdateWithoutTemplatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schemas?: SchemaUpdateManyWithoutUserNestedInput
    srsProjects?: SrsProjectUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTemplatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schemas?: SchemaUncheckedUpdateManyWithoutUserNestedInput
    srsProjects?: SrsProjectUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutSrsProjectsInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    schemas?: SchemaCreateNestedManyWithoutUserInput
    templates?: FormTemplateCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSrsProjectsInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    schemas?: SchemaUncheckedCreateNestedManyWithoutUserInput
    templates?: FormTemplateUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSrsProjectsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSrsProjectsInput, UserUncheckedCreateWithoutSrsProjectsInput>
  }

  export type UserStoryCreateWithoutProjectInput = {
    id?: string
    title: string
    role: string
    action: string
    benefit: string
    acceptanceCriteria?: UserStoryCreateacceptanceCriteriaInput | string[]
    suggestedFields: JsonNullValueInput | InputJsonValue
    featureArea?: string
    confidence?: number
    status?: string
    generatedSchemaId?: string | null
    rawText?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserStoryUncheckedCreateWithoutProjectInput = {
    id?: string
    title: string
    role: string
    action: string
    benefit: string
    acceptanceCriteria?: UserStoryCreateacceptanceCriteriaInput | string[]
    suggestedFields: JsonNullValueInput | InputJsonValue
    featureArea?: string
    confidence?: number
    status?: string
    generatedSchemaId?: string | null
    rawText?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserStoryCreateOrConnectWithoutProjectInput = {
    where: UserStoryWhereUniqueInput
    create: XOR<UserStoryCreateWithoutProjectInput, UserStoryUncheckedCreateWithoutProjectInput>
  }

  export type UserStoryCreateManyProjectInputEnvelope = {
    data: UserStoryCreateManyProjectInput | UserStoryCreateManyProjectInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutSrsProjectsInput = {
    update: XOR<UserUpdateWithoutSrsProjectsInput, UserUncheckedUpdateWithoutSrsProjectsInput>
    create: XOR<UserCreateWithoutSrsProjectsInput, UserUncheckedCreateWithoutSrsProjectsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSrsProjectsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSrsProjectsInput, UserUncheckedUpdateWithoutSrsProjectsInput>
  }

  export type UserUpdateWithoutSrsProjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schemas?: SchemaUpdateManyWithoutUserNestedInput
    templates?: FormTemplateUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSrsProjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schemas?: SchemaUncheckedUpdateManyWithoutUserNestedInput
    templates?: FormTemplateUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserStoryUpsertWithWhereUniqueWithoutProjectInput = {
    where: UserStoryWhereUniqueInput
    update: XOR<UserStoryUpdateWithoutProjectInput, UserStoryUncheckedUpdateWithoutProjectInput>
    create: XOR<UserStoryCreateWithoutProjectInput, UserStoryUncheckedCreateWithoutProjectInput>
  }

  export type UserStoryUpdateWithWhereUniqueWithoutProjectInput = {
    where: UserStoryWhereUniqueInput
    data: XOR<UserStoryUpdateWithoutProjectInput, UserStoryUncheckedUpdateWithoutProjectInput>
  }

  export type UserStoryUpdateManyWithWhereWithoutProjectInput = {
    where: UserStoryScalarWhereInput
    data: XOR<UserStoryUpdateManyMutationInput, UserStoryUncheckedUpdateManyWithoutProjectInput>
  }

  export type UserStoryScalarWhereInput = {
    AND?: UserStoryScalarWhereInput | UserStoryScalarWhereInput[]
    OR?: UserStoryScalarWhereInput[]
    NOT?: UserStoryScalarWhereInput | UserStoryScalarWhereInput[]
    id?: StringFilter<"UserStory"> | string
    title?: StringFilter<"UserStory"> | string
    role?: StringFilter<"UserStory"> | string
    action?: StringFilter<"UserStory"> | string
    benefit?: StringFilter<"UserStory"> | string
    acceptanceCriteria?: StringNullableListFilter<"UserStory">
    suggestedFields?: JsonFilter<"UserStory">
    featureArea?: StringFilter<"UserStory"> | string
    confidence?: FloatFilter<"UserStory"> | number
    status?: StringFilter<"UserStory"> | string
    generatedSchemaId?: StringNullableFilter<"UserStory"> | string | null
    rawText?: StringFilter<"UserStory"> | string
    projectId?: StringFilter<"UserStory"> | string
    createdAt?: DateTimeFilter<"UserStory"> | Date | string
    updatedAt?: DateTimeFilter<"UserStory"> | Date | string
  }

  export type SrsProjectCreateWithoutUserStoriesInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutSrsProjectsInput
  }

  export type SrsProjectUncheckedCreateWithoutUserStoriesInput = {
    id?: string
    name: string
    description?: string | null
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SrsProjectCreateOrConnectWithoutUserStoriesInput = {
    where: SrsProjectWhereUniqueInput
    create: XOR<SrsProjectCreateWithoutUserStoriesInput, SrsProjectUncheckedCreateWithoutUserStoriesInput>
  }

  export type SrsProjectUpsertWithoutUserStoriesInput = {
    update: XOR<SrsProjectUpdateWithoutUserStoriesInput, SrsProjectUncheckedUpdateWithoutUserStoriesInput>
    create: XOR<SrsProjectCreateWithoutUserStoriesInput, SrsProjectUncheckedCreateWithoutUserStoriesInput>
    where?: SrsProjectWhereInput
  }

  export type SrsProjectUpdateToOneWithWhereWithoutUserStoriesInput = {
    where?: SrsProjectWhereInput
    data: XOR<SrsProjectUpdateWithoutUserStoriesInput, SrsProjectUncheckedUpdateWithoutUserStoriesInput>
  }

  export type SrsProjectUpdateWithoutUserStoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSrsProjectsNestedInput
  }

  export type SrsProjectUncheckedUpdateWithoutUserStoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SchemaCreateManyUserInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    sourceFormat?: string
    tags?: SchemaCreatetagsInput | string[]
    status?: string
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormTemplateCreateManyUserInput = {
    id?: string
    name: string
    description?: string | null
    content: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SrsProjectCreateManyUserInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SchemaUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    sourceFormat?: StringFieldUpdateOperationsInput | string
    tags?: SchemaUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SchemaUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    sourceFormat?: StringFieldUpdateOperationsInput | string
    tags?: SchemaUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SchemaUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    sourceFormat?: StringFieldUpdateOperationsInput | string
    tags?: SchemaUpdatetagsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormTemplateUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormTemplateUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormTemplateUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SrsProjectUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userStories?: UserStoryUpdateManyWithoutProjectNestedInput
  }

  export type SrsProjectUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userStories?: UserStoryUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type SrsProjectUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserStoryCreateManyProjectInput = {
    id?: string
    title: string
    role: string
    action: string
    benefit: string
    acceptanceCriteria?: UserStoryCreateacceptanceCriteriaInput | string[]
    suggestedFields: JsonNullValueInput | InputJsonValue
    featureArea?: string
    confidence?: number
    status?: string
    generatedSchemaId?: string | null
    rawText?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserStoryUpdateWithoutProjectInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    benefit?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: UserStoryUpdateacceptanceCriteriaInput | string[]
    suggestedFields?: JsonNullValueInput | InputJsonValue
    featureArea?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    generatedSchemaId?: NullableStringFieldUpdateOperationsInput | string | null
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserStoryUncheckedUpdateWithoutProjectInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    benefit?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: UserStoryUpdateacceptanceCriteriaInput | string[]
    suggestedFields?: JsonNullValueInput | InputJsonValue
    featureArea?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    generatedSchemaId?: NullableStringFieldUpdateOperationsInput | string | null
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserStoryUncheckedUpdateManyWithoutProjectInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    benefit?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: UserStoryUpdateacceptanceCriteriaInput | string[]
    suggestedFields?: JsonNullValueInput | InputJsonValue
    featureArea?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    generatedSchemaId?: NullableStringFieldUpdateOperationsInput | string | null
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SrsProjectCountOutputTypeDefaultArgs instead
     */
    export type SrsProjectCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SrsProjectCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SchemaDefaultArgs instead
     */
    export type SchemaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SchemaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FormTemplateDefaultArgs instead
     */
    export type FormTemplateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FormTemplateDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SrsProjectDefaultArgs instead
     */
    export type SrsProjectArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SrsProjectDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserStoryDefaultArgs instead
     */
    export type UserStoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserStoryDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}