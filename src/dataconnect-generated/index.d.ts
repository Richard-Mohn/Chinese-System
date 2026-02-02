import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewUserData {
  user_insert: User_Key;
}

export interface CreateNewUserVariables {
  displayName: string;
  email: string;
  deliveryAddress?: string | null;
  phoneNumber?: string | null;
}

export interface Dish_Key {
  id: UUIDString;
  __typename?: 'Dish_Key';
}

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

export interface GetRestaurantByIdVariables {
  restaurantId: UUIDString;
}

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

export interface ListAvailableDishesByRestaurantVariables {
  restaurantId: UUIDString;
}

export interface OrderItem_Key {
  id: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface PlaceNewOrderData {
  order_insert: Order_Key;
}

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

export interface Restaurant_Key {
  id: UUIDString;
  __typename?: 'Restaurant_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
  operationName: string;
}
export const createNewUserRef: CreateNewUserRef;

export function createNewUser(vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;
export function createNewUser(dc: DataConnect, vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface GetRestaurantByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRestaurantByIdVariables): QueryRef<GetRestaurantByIdData, GetRestaurantByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRestaurantByIdVariables): QueryRef<GetRestaurantByIdData, GetRestaurantByIdVariables>;
  operationName: string;
}
export const getRestaurantByIdRef: GetRestaurantByIdRef;

export function getRestaurantById(vars: GetRestaurantByIdVariables): QueryPromise<GetRestaurantByIdData, GetRestaurantByIdVariables>;
export function getRestaurantById(dc: DataConnect, vars: GetRestaurantByIdVariables): QueryPromise<GetRestaurantByIdData, GetRestaurantByIdVariables>;

interface ListAvailableDishesByRestaurantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAvailableDishesByRestaurantVariables): QueryRef<ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAvailableDishesByRestaurantVariables): QueryRef<ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables>;
  operationName: string;
}
export const listAvailableDishesByRestaurantRef: ListAvailableDishesByRestaurantRef;

export function listAvailableDishesByRestaurant(vars: ListAvailableDishesByRestaurantVariables): QueryPromise<ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables>;
export function listAvailableDishesByRestaurant(dc: DataConnect, vars: ListAvailableDishesByRestaurantVariables): QueryPromise<ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables>;

interface PlaceNewOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: PlaceNewOrderVariables): MutationRef<PlaceNewOrderData, PlaceNewOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: PlaceNewOrderVariables): MutationRef<PlaceNewOrderData, PlaceNewOrderVariables>;
  operationName: string;
}
export const placeNewOrderRef: PlaceNewOrderRef;

export function placeNewOrder(vars: PlaceNewOrderVariables): MutationPromise<PlaceNewOrderData, PlaceNewOrderVariables>;
export function placeNewOrder(dc: DataConnect, vars: PlaceNewOrderVariables): MutationPromise<PlaceNewOrderData, PlaceNewOrderVariables>;

