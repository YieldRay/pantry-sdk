# pantry-sdk

A helper library for interacting with the [Pantry](https://getpantry.cloud/) JSON storage API  
works in both node and deno

> **Notice:** _inactive baskets will be removed after 30 days_

# usage

```js
import Pantry from "pantry-sdk";

const client = new Pantry("xxxx-xxxx-xxxx-xxxx-xxxx-xxxx");

// Get account detail information
const accountDetails = await client.getDetails();

// The second parameter is the payload that you want your basket to have
await client.createBasket("ToDoList", {
    one: "Task one",
    two: "Task two",
});

// This action will do a merge, rather than simply replace
await client.updateBasket("ToDoList", {
    one: "Task one DONE!",
    three: "Task three",
});

// Get the entire JSON as a parsed javascript value
const myToDoList = await client.getBasket("ToDoList");

// Delete the basket, cannot be undone
await client.deleteBasket("ToDoList");
```

Or you can use a shortcut to operate on a specific basket

```js
const basket = client.useBasket("ToDoList2");

await basket.create({
    one: "Task one",
    two: "Task two",
});

await basket.update({
    one: "Task one DONE!",
    three: "Task three",
});

const myToDoList = await basket.get();

await basket.delete();
```
