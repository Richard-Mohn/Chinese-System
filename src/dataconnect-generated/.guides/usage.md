# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateNewUser, useGetRestaurantById, useListAvailableDishesByRestaurant, usePlaceNewOrder } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateNewUser(createNewUserVars);

const { data, isPending, isSuccess, isError, error } = useGetRestaurantById(getRestaurantByIdVars);

const { data, isPending, isSuccess, isError, error } = useListAvailableDishesByRestaurant(listAvailableDishesByRestaurantVars);

const { data, isPending, isSuccess, isError, error } = usePlaceNewOrder(placeNewOrderVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createNewUser, getRestaurantById, listAvailableDishesByRestaurant, placeNewOrder } from '@dataconnect/generated';


// Operation CreateNewUser:  For variables, look at type CreateNewUserVars in ../index.d.ts
const { data } = await CreateNewUser(dataConnect, createNewUserVars);

// Operation GetRestaurantByID:  For variables, look at type GetRestaurantByIdVars in ../index.d.ts
const { data } = await GetRestaurantById(dataConnect, getRestaurantByIdVars);

// Operation ListAvailableDishesByRestaurant:  For variables, look at type ListAvailableDishesByRestaurantVars in ../index.d.ts
const { data } = await ListAvailableDishesByRestaurant(dataConnect, listAvailableDishesByRestaurantVars);

// Operation PlaceNewOrder:  For variables, look at type PlaceNewOrderVars in ../index.d.ts
const { data } = await PlaceNewOrder(dataConnect, placeNewOrderVars);


```