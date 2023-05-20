# pantry-sdk

A type-safe helper library for interacting with the [Pantry](https://getpantry.cloud/) JSON storage API  
works in both node, deno and browser

> **Notice:** _inactive baskets will be removed after 30 days_

# usage

First, import the library

```js
import Pantry from "pantry-sdk";
// if you are using deno, add `npm:` specifier
import Pantry from "npm:pantry-sdk";
```

Second, initialize the object with PantryID

```ts
const client = new Pantry("xxxx-xxxx-xxxx-xxxx-xxxx-xxxx");

// to enable a strict type check when use typescript, do this
const client = new Pantry<true>("xxxx-xxxx-xxxx-xxxx-xxxx-xxxx");
// this will disallow you to store something like Function and Date
// that cannot be represented in JSON format
```

Then, enjoy!

```js
// The second parameter is the payload that you want your basket to have, it must be an object
// warning: this cannot an array. when typescript is used, it cannot pass the type check if you pass an array
await client.createBasket("ToDoList", { pending: [], complete: [] });

// This action will do a deep merge, rather than simply replace
const mergedToDoList = await client.updateBasket("ToDoList", { pending: ["Walk the Dog"] });

// Get the entire JSON as a parsed javascript object
const myToDoList = await client.getBasket("ToDoList");

// Delete the basket, this cannot be undone
await client.deleteBasket("ToDoList");
```

Or you can use a shortcut to operate on a specific basket

```js
const basket = client.useBasket("ToDoList2");

await basket.create({ pending: [], complete: [] });
const mergedToDoList = await basket.update({ pending: ["Walk the Dog"] });
const myToDoList = await basket.get();
await basket.delete();
```

Get and set your account detail

```js
// Get account detail information
const accountDetails = await client.getDetails();

// Update account information
const updatedAccountDetails = await client.updateDetails({ name: "pantry-sdk", description: "hello, world!" });
```

# use fetch

This library requires `fetch` to work, howerever if the `fetch` function  
is not mounted in global, you can also do this:

```js
import Pantry from "pantry-sdk";
import fetch from "cross-fetch";

const client = new Pantry("xxxx-xxxx-xxxx-xxxx-xxxx-xxxx", fetch);
```
