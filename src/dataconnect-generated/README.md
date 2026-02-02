# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetRestaurantByID*](#getrestaurantbyid)
  - [*ListAvailableDishesByRestaurant*](#listavailabledishesbyrestaurant)
- [**Mutations**](#mutations)
  - [*CreateNewUser*](#createnewuser)
  - [*PlaceNewOrder*](#placeneworder)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetRestaurantByID
You can execute the `GetRestaurantByID` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRestaurantById(vars: GetRestaurantByIdVariables): QueryPromise<GetRestaurantByIdData, GetRestaurantByIdVariables>;

interface GetRestaurantByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRestaurantByIdVariables): QueryRef<GetRestaurantByIdData, GetRestaurantByIdVariables>;
}
export const getRestaurantByIdRef: GetRestaurantByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRestaurantById(dc: DataConnect, vars: GetRestaurantByIdVariables): QueryPromise<GetRestaurantByIdData, GetRestaurantByIdVariables>;

interface GetRestaurantByIdRef {
  ...
  (dc: DataConnect, vars: GetRestaurantByIdVariables): QueryRef<GetRestaurantByIdData, GetRestaurantByIdVariables>;
}
export const getRestaurantByIdRef: GetRestaurantByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRestaurantByIdRef:
```typescript
const name = getRestaurantByIdRef.operationName;
console.log(name);
```

### Variables
The `GetRestaurantByID` query requires an argument of type `GetRestaurantByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRestaurantByIdVariables {
  restaurantId: UUIDString;
}
```
### Return Type
Recall that executing the `GetRestaurantByID` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRestaurantByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetRestaurantByIdData {
  restaurant?: {
    id: UUIDString;
    name: string;
    address: string;
    cuisineType: string;
    description?: string | null;
    imageUrl?: string | null;
    openingHours?: string | null;
    phoneNumber: string;
    rating?: number | null;
  } & Restaurant_Key;
}
```
### Using `GetRestaurantByID`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRestaurantById, GetRestaurantByIdVariables } from '@dataconnect/generated';

// The `GetRestaurantByID` query requires an argument of type `GetRestaurantByIdVariables`:
const getRestaurantByIdVars: GetRestaurantByIdVariables = {
  restaurantId: ..., 
};

// Call the `getRestaurantById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRestaurantById(getRestaurantByIdVars);
// Variables can be defined inline as well.
const { data } = await getRestaurantById({ restaurantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRestaurantById(dataConnect, getRestaurantByIdVars);

console.log(data.restaurant);

// Or, you can use the `Promise` API.
getRestaurantById(getRestaurantByIdVars).then((response) => {
  const data = response.data;
  console.log(data.restaurant);
});
```

### Using `GetRestaurantByID`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRestaurantByIdRef, GetRestaurantByIdVariables } from '@dataconnect/generated';

// The `GetRestaurantByID` query requires an argument of type `GetRestaurantByIdVariables`:
const getRestaurantByIdVars: GetRestaurantByIdVariables = {
  restaurantId: ..., 
};

// Call the `getRestaurantByIdRef()` function to get a reference to the query.
const ref = getRestaurantByIdRef(getRestaurantByIdVars);
// Variables can be defined inline as well.
const ref = getRestaurantByIdRef({ restaurantId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRestaurantByIdRef(dataConnect, getRestaurantByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.restaurant);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.restaurant);
});
```

## ListAvailableDishesByRestaurant
You can execute the `ListAvailableDishesByRestaurant` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAvailableDishesByRestaurant(vars: ListAvailableDishesByRestaurantVariables): QueryPromise<ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables>;

interface ListAvailableDishesByRestaurantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAvailableDishesByRestaurantVariables): QueryRef<ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables>;
}
export const listAvailableDishesByRestaurantRef: ListAvailableDishesByRestaurantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAvailableDishesByRestaurant(dc: DataConnect, vars: ListAvailableDishesByRestaurantVariables): QueryPromise<ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables>;

interface ListAvailableDishesByRestaurantRef {
  ...
  (dc: DataConnect, vars: ListAvailableDishesByRestaurantVariables): QueryRef<ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables>;
}
export const listAvailableDishesByRestaurantRef: ListAvailableDishesByRestaurantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAvailableDishesByRestaurantRef:
```typescript
const name = listAvailableDishesByRestaurantRef.operationName;
console.log(name);
```

### Variables
The `ListAvailableDishesByRestaurant` query requires an argument of type `ListAvailableDishesByRestaurantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAvailableDishesByRestaurantVariables {
  restaurantId: UUIDString;
}
```
### Return Type
Recall that executing the `ListAvailableDishesByRestaurant` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAvailableDishesByRestaurantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAvailableDishesByRestaurantData {
  dishes: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    category: string;
    imageUrl?: string | null;
  } & Dish_Key)[];
}
```
### Using `ListAvailableDishesByRestaurant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAvailableDishesByRestaurant, ListAvailableDishesByRestaurantVariables } from '@dataconnect/generated';

// The `ListAvailableDishesByRestaurant` query requires an argument of type `ListAvailableDishesByRestaurantVariables`:
const listAvailableDishesByRestaurantVars: ListAvailableDishesByRestaurantVariables = {
  restaurantId: ..., 
};

// Call the `listAvailableDishesByRestaurant()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAvailableDishesByRestaurant(listAvailableDishesByRestaurantVars);
// Variables can be defined inline as well.
const { data } = await listAvailableDishesByRestaurant({ restaurantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAvailableDishesByRestaurant(dataConnect, listAvailableDishesByRestaurantVars);

console.log(data.dishes);

// Or, you can use the `Promise` API.
listAvailableDishesByRestaurant(listAvailableDishesByRestaurantVars).then((response) => {
  const data = response.data;
  console.log(data.dishes);
});
```

### Using `ListAvailableDishesByRestaurant`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAvailableDishesByRestaurantRef, ListAvailableDishesByRestaurantVariables } from '@dataconnect/generated';

// The `ListAvailableDishesByRestaurant` query requires an argument of type `ListAvailableDishesByRestaurantVariables`:
const listAvailableDishesByRestaurantVars: ListAvailableDishesByRestaurantVariables = {
  restaurantId: ..., 
};

// Call the `listAvailableDishesByRestaurantRef()` function to get a reference to the query.
const ref = listAvailableDishesByRestaurantRef(listAvailableDishesByRestaurantVars);
// Variables can be defined inline as well.
const ref = listAvailableDishesByRestaurantRef({ restaurantId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAvailableDishesByRestaurantRef(dataConnect, listAvailableDishesByRestaurantVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.dishes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.dishes);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewUser
You can execute the `CreateNewUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewUser(vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface CreateNewUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
}
export const createNewUserRef: CreateNewUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewUser(dc: DataConnect, vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface CreateNewUserRef {
  ...
  (dc: DataConnect, vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
}
export const createNewUserRef: CreateNewUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewUserRef:
```typescript
const name = createNewUserRef.operationName;
console.log(name);
```

### Variables
The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewUserVariables {
  displayName: string;
  email: string;
  deliveryAddress?: string | null;
  phoneNumber?: string | null;
}
```
### Return Type
Recall that executing the `CreateNewUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewUserData {
  user_insert: User_Key;
}
```
### Using `CreateNewUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewUser, CreateNewUserVariables } from '@dataconnect/generated';

// The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`:
const createNewUserVars: CreateNewUserVariables = {
  displayName: ..., 
  email: ..., 
  deliveryAddress: ..., // optional
  phoneNumber: ..., // optional
};

// Call the `createNewUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewUser(createNewUserVars);
// Variables can be defined inline as well.
const { data } = await createNewUser({ displayName: ..., email: ..., deliveryAddress: ..., phoneNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewUser(dataConnect, createNewUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createNewUser(createNewUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateNewUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewUserRef, CreateNewUserVariables } from '@dataconnect/generated';

// The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`:
const createNewUserVars: CreateNewUserVariables = {
  displayName: ..., 
  email: ..., 
  deliveryAddress: ..., // optional
  phoneNumber: ..., // optional
};

// Call the `createNewUserRef()` function to get a reference to the mutation.
const ref = createNewUserRef(createNewUserVars);
// Variables can be defined inline as well.
const ref = createNewUserRef({ displayName: ..., email: ..., deliveryAddress: ..., phoneNumber: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewUserRef(dataConnect, createNewUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## PlaceNewOrder
You can execute the `PlaceNewOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
placeNewOrder(vars: PlaceNewOrderVariables): MutationPromise<PlaceNewOrderData, PlaceNewOrderVariables>;

interface PlaceNewOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: PlaceNewOrderVariables): MutationRef<PlaceNewOrderData, PlaceNewOrderVariables>;
}
export const placeNewOrderRef: PlaceNewOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
placeNewOrder(dc: DataConnect, vars: PlaceNewOrderVariables): MutationPromise<PlaceNewOrderData, PlaceNewOrderVariables>;

interface PlaceNewOrderRef {
  ...
  (dc: DataConnect, vars: PlaceNewOrderVariables): MutationRef<PlaceNewOrderData, PlaceNewOrderVariables>;
}
export const placeNewOrderRef: PlaceNewOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the placeNewOrderRef:
```typescript
const name = placeNewOrderRef.operationName;
console.log(name);
```

### Variables
The `PlaceNewOrder` mutation requires an argument of type `PlaceNewOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface PlaceNewOrderVariables {
  restaurantId: UUIDString;
  orderType: string;
  deliveryAddress?: string | null;
  paymentMethod?: string | null;
  orderDate: TimestampString;
  totalAmount: number;
  deliveryFee?: number | null;
  status: string;
}
```
### Return Type
Recall that executing the `PlaceNewOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PlaceNewOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface PlaceNewOrderData {
  order_insert: Order_Key;
}
```
### Using `PlaceNewOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, placeNewOrder, PlaceNewOrderVariables } from '@dataconnect/generated';

// The `PlaceNewOrder` mutation requires an argument of type `PlaceNewOrderVariables`:
const placeNewOrderVars: PlaceNewOrderVariables = {
  restaurantId: ..., 
  orderType: ..., 
  deliveryAddress: ..., // optional
  paymentMethod: ..., // optional
  orderDate: ..., 
  totalAmount: ..., 
  deliveryFee: ..., // optional
  status: ..., 
};

// Call the `placeNewOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await placeNewOrder(placeNewOrderVars);
// Variables can be defined inline as well.
const { data } = await placeNewOrder({ restaurantId: ..., orderType: ..., deliveryAddress: ..., paymentMethod: ..., orderDate: ..., totalAmount: ..., deliveryFee: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await placeNewOrder(dataConnect, placeNewOrderVars);

console.log(data.order_insert);

// Or, you can use the `Promise` API.
placeNewOrder(placeNewOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order_insert);
});
```

### Using `PlaceNewOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, placeNewOrderRef, PlaceNewOrderVariables } from '@dataconnect/generated';

// The `PlaceNewOrder` mutation requires an argument of type `PlaceNewOrderVariables`:
const placeNewOrderVars: PlaceNewOrderVariables = {
  restaurantId: ..., 
  orderType: ..., 
  deliveryAddress: ..., // optional
  paymentMethod: ..., // optional
  orderDate: ..., 
  totalAmount: ..., 
  deliveryFee: ..., // optional
  status: ..., 
};

// Call the `placeNewOrderRef()` function to get a reference to the mutation.
const ref = placeNewOrderRef(placeNewOrderVars);
// Variables can be defined inline as well.
const ref = placeNewOrderRef({ restaurantId: ..., orderType: ..., deliveryAddress: ..., paymentMethod: ..., orderDate: ..., totalAmount: ..., deliveryFee: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = placeNewOrderRef(dataConnect, placeNewOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_insert);
});
```

