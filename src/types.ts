/**
 * `undefined` is omitted in JSON, but allowed as input
 */
export type PrimitiveValue = string | number | boolean | undefined | null;

export type ArrayValue = Array<PrimitiveValue | ObjectValue | ArrayValue>;

export type ObjectValue = {
    [key: string]: PrimitiveValue | ObjectValue | ArrayValue;
};

export type ObjectNotArray<T extends object = object> = Exclude<T, unknown[]>;

export type BodyValue<StrictMode extends boolean> = ObjectNotArray<StrictMode extends true ? ObjectValue : object>;

export interface Details {
    name: string;
    description: string;
    errors: string[];
    notifications: boolean;
    percentFull: number;
    baskets: Array<{
        name: string;
        ttl: number;
    }>;
}
