const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'restaurant-app',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createNewUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewUser', inputVars);
}
createNewUserRef.operationName = 'CreateNewUser';
exports.createNewUserRef = createNewUserRef;

exports.createNewUser = function createNewUser(dcOrVars, vars) {
  return executeMutation(createNewUserRef(dcOrVars, vars));
};

const getRestaurantByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRestaurantByID', inputVars);
}
getRestaurantByIdRef.operationName = 'GetRestaurantByID';
exports.getRestaurantByIdRef = getRestaurantByIdRef;

exports.getRestaurantById = function getRestaurantById(dcOrVars, vars) {
  return executeQuery(getRestaurantByIdRef(dcOrVars, vars));
};

const listAvailableDishesByRestaurantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailableDishesByRestaurant', inputVars);
}
listAvailableDishesByRestaurantRef.operationName = 'ListAvailableDishesByRestaurant';
exports.listAvailableDishesByRestaurantRef = listAvailableDishesByRestaurantRef;

exports.listAvailableDishesByRestaurant = function listAvailableDishesByRestaurant(dcOrVars, vars) {
  return executeQuery(listAvailableDishesByRestaurantRef(dcOrVars, vars));
};

const placeNewOrderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'PlaceNewOrder', inputVars);
}
placeNewOrderRef.operationName = 'PlaceNewOrder';
exports.placeNewOrderRef = placeNewOrderRef;

exports.placeNewOrder = function placeNewOrder(dcOrVars, vars) {
  return executeMutation(placeNewOrderRef(dcOrVars, vars));
};
