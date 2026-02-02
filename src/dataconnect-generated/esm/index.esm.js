import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'restaurant-app',
  location: 'us-east4'
};

export const createNewUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewUser', inputVars);
}
createNewUserRef.operationName = 'CreateNewUser';

export function createNewUser(dcOrVars, vars) {
  return executeMutation(createNewUserRef(dcOrVars, vars));
}

export const getRestaurantByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRestaurantByID', inputVars);
}
getRestaurantByIdRef.operationName = 'GetRestaurantByID';

export function getRestaurantById(dcOrVars, vars) {
  return executeQuery(getRestaurantByIdRef(dcOrVars, vars));
}

export const listAvailableDishesByRestaurantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailableDishesByRestaurant', inputVars);
}
listAvailableDishesByRestaurantRef.operationName = 'ListAvailableDishesByRestaurant';

export function listAvailableDishesByRestaurant(dcOrVars, vars) {
  return executeQuery(listAvailableDishesByRestaurantRef(dcOrVars, vars));
}

export const placeNewOrderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'PlaceNewOrder', inputVars);
}
placeNewOrderRef.operationName = 'PlaceNewOrder';

export function placeNewOrder(dcOrVars, vars) {
  return executeMutation(placeNewOrderRef(dcOrVars, vars));
}

