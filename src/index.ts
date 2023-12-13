// deno-lint-ignore-file no-explicit-any
type ObjectNotArray<T extends object = object> = T extends unknown[] ? never : T;

type PrimitiveValue = string | number | boolean | undefined | null;

type ArrayValue = Array<PrimitiveValue | ObjectValue | ArrayValue>;

type ObjectValue = {
    [key: string]: PrimitiveValue | ObjectValue | ArrayValue;
};

type BodyValue<StrictMode extends boolean> = ObjectNotArray<StrictMode extends true ? ObjectValue : object>;

interface Details {
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

export class BasketNotExistError extends Error {
    name = "BasketNotExistError"; // new.target.name
    get basketName() {
        return this.#getBasketName();
    }
    #getBasketName: () => string;
    constructor(message: string) {
        super(message);
        this.#getBasketName = () => /Could not \w+ basket: (.+) does not exist/.exec(message)?.[1] || message;
    }
}

/**
 * Pantry is a free service that provides perishable data storage for small projects. Data is securely stored for as long as you and your users need it and is deleted after a period of inactivity. Simply use the restful API to post JSON objects and we'll take care of the rest.

 * It was built to provide a simple, re-usable storage solution for smaller sized projects. It was created by developers for developers, to be there when you need it and to help you rapidly prototype your next project.
 */
export default class Pantry<StrictMode extends boolean = false> {
    #pantryID: string;
    #fetch: typeof globalThis.fetch;
    constructor(pantryID: string, fetch?: typeof globalThis.fetch) {
        this.#pantryID = pantryID;
        this.#fetch = fetch || globalThis.fetch;
    }

    get #fetchJSON() {
        const fetch = this.#fetch;
        return async <T>(input: RequestInfo | URL, init?: RequestInit | undefined) => {
            const res = await fetch(input, init);
            if (res.ok) {
                if (res.headers.get("content-type")?.startsWith("application/json")) {
                    return (await res.json()) as T;
                } else {
                    return (await res.text()) as T;
                }
            } else {
                throw new Error(await res.text());
            }
        };
    }

    async #fetchBasket<T>(basketName: string, method: string = "GET", body?: object) {
        try {
            return await this.#fetchJSON<T>(
                `https://getpantry.cloud/apiv1/pantry/${this.#pantryID}/basket/${encodeURIComponent(basketName)}`,
                {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: method !== "GET" && method !== "HEAD" ? JSON.stringify(body) : undefined,
                }
            );
        } catch (e) {
            if (e instanceof Error && e.message.startsWith("Could not") && e.message.endsWith("does not exist")) {
                throw new BasketNotExistError(e.message);
            } else {
                throw e;
            }
        }
    }

    /**
     * Given a PantryID, return the details of the pantry, including a list of baskets currently stored inside it.
     */
    async getDetails(): Promise<Details> {
        return await this.#fetchJSON(`https://getpantry.cloud/apiv1/pantry/${this.#pantryID}`);
    }

    async updateDetails(body: Partial<{ name: string; description: string }>): Promise<Details> {
        return await this.#fetchJSON(`https://getpantry.cloud/apiv1/pantry/${this.#pantryID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    }

    /**
     * Given a basket name as provided in the url, this will either create a new basket inside your pantry, or replace an existing one.
     */
    async createBasket<Name extends string>(
        basketName: Name,
        body: BodyValue<StrictMode>
    ): Promise<`Your Pantry was updated with basket: ${Name}!`> {
        return await this.#fetchBasket(basketName, "POST", body);
    }

    /**
     * Given a basket name, this will update the existing contents and return the contents of the newly updated basket. This operation performs a deep merge and will overwrite the values of any existing keys, or append values to nested objects or arrays.
     */
    async updateBasket<Out extends BodyValue<StrictMode>>(
        basketName: string,
        body: BodyValue<StrictMode>
    ): Promise<Out> {
        return await this.#fetchBasket(basketName, "PUT", body);
    }

    /**
     * Given a basket name, return the full contents of the basket.
     */
    async getBasket<Out extends BodyValue<StrictMode>>(basketName: string): Promise<ObjectNotArray<Out>> {
        return await this.#fetchBasket(basketName);
    }

    /**
     * Delete the entire basket. Warning, this action cannot be undone.
     */
    async deleteBasket<Name extends string>(basketName: Name): Promise<`${Name} was removed from your Pantry!`> {
        return await this.#fetchBasket(basketName, "DELETE");
    }

    useBasket<Name extends string>(basketName: Name) {
        return {
            create: (body: BodyValue<StrictMode>) => this.createBasket<Name>(basketName, body),
            delete: () => this.deleteBasket<Name>(basketName),
            update: <Out extends BodyValue<StrictMode>>(body: BodyValue<StrictMode>) =>
                this.updateBasket<Out>(basketName, body),
            get: <Out extends BodyValue<StrictMode>>() => this.getBasket<Out>(basketName),
        };
    }
}
