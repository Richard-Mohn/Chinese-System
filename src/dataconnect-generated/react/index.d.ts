import { CreateNewUserData, CreateNewUserVariables, GetRestaurantByIdData, GetRestaurantByIdVariables, ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables, PlaceNewOrderData, PlaceNewOrderVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewUser(options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, CreateNewUserVariables>): UseDataConnectMutationResult<CreateNewUserData, CreateNewUserVariables>;
export function useCreateNewUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, CreateNewUserVariables>): UseDataConnectMutationResult<CreateNewUserData, CreateNewUserVariables>;

export function useGetRestaurantById(vars: GetRestaurantByIdVariables, options?: useDataConnectQueryOptions<GetRestaurantByIdData>): UseDataConnectQueryResult<GetRestaurantByIdData, GetRestaurantByIdVariables>;
export function useGetRestaurantById(dc: DataConnect, vars: GetRestaurantByIdVariables, options?: useDataConnectQueryOptions<GetRestaurantByIdData>): UseDataConnectQueryResult<GetRestaurantByIdData, GetRestaurantByIdVariables>;

export function useListAvailableDishesByRestaurant(vars: ListAvailableDishesByRestaurantVariables, options?: useDataConnectQueryOptions<ListAvailableDishesByRestaurantData>): UseDataConnectQueryResult<ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables>;
export function useListAvailableDishesByRestaurant(dc: DataConnect, vars: ListAvailableDishesByRestaurantVariables, options?: useDataConnectQueryOptions<ListAvailableDishesByRestaurantData>): UseDataConnectQueryResult<ListAvailableDishesByRestaurantData, ListAvailableDishesByRestaurantVariables>;

export function usePlaceNewOrder(options?: useDataConnectMutationOptions<PlaceNewOrderData, FirebaseError, PlaceNewOrderVariables>): UseDataConnectMutationResult<PlaceNewOrderData, PlaceNewOrderVariables>;
export function usePlaceNewOrder(dc: DataConnect, options?: useDataConnectMutationOptions<PlaceNewOrderData, FirebaseError, PlaceNewOrderVariables>): UseDataConnectMutationResult<PlaceNewOrderData, PlaceNewOrderVariables>;
