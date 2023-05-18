// deno-lint-ignore-file no-explicit-any
interface Details {
    name: string;
    description: string;
    errors: string[];
    notifications: boolean;
    percentFull: number;
    baskets: Basket[];
}

interface Basket {
    name: string;
    ttl: number;
}

/**
 * Pantry is a free service that provides perishable data storage for small projects. Data is securely stored for as long as you and your users need it and is deleted after a period of inactivity. Simply use the restful API to post JSON objects and we'll take care of the rest.

 * It was built to provide a simple, re-usable storage solution for smaller sized projects. It was created by developers for developers, to be there when you need it and to help you rapidly prototype your next project.
 */
export default class Pantry {
    #pantryID: string;
    #fetch: typeof globalThis.fetch;
    constructor(pantryID: string, fetch?: typeof globalThis.fetch) {
        this.#pantryID = pantryID;
        this.#fetch = fetch || globalThis.fetch;
    }
    get #fetchJSON() {
        return async <T>(input: RequestInfo | URL, init?: RequestInit | undefined) => {
            const res = await this.#fetch(input, init);
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
    async createBasket<T = any>(basketName: string, body: T): Promise<T> {
        return await this.#fetchJSON(`https://getpantry.cloud/apiv1/pantry/${this.#pantryID}/basket/${basketName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    }

    /**
     * Given a basket name, this will update the existing contents and return the contents of the newly updated basket. This operation performs a deep merge and will overwrite the values of any existing keys, or append values to nested objects or arrays.
     */
    async updateBasket<T = any>(basketName: string, body: T): Promise<T> {
        return await this.#fetchJSON(`https://getpantry.cloud/apiv1/pantry/${this.#pantryID}/basket/${basketName}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    }

    /**
     * Given a basket name, return the full contents of the basket.
     */
    async getBasket<T = any>(basketName: string): Promise<T> {
        return await this.#fetchJSON(`https://getpantry.cloud/apiv1/pantry/${this.#pantryID}/basket/${basketName}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Delete the entire basket. Warning, this action cannot be undone.
     */
    async deleteBasket(basketName: string): Promise<string> {
        return await this.#fetchJSON(`https://getpantry.cloud/apiv1/pantry/${this.#pantryID}/basket/${basketName}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    useBasket(basketName: string) {
        return {
            create: <T>(body: T) => this.createBasket(basketName, body),
            update: <T>(body: T) => this.updateBasket(basketName, body),
            delete: () => this.deleteBasket(basketName),
            get: () => this.getBasket(basketName),
        };
    }
}
