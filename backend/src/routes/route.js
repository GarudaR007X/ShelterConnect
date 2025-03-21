import express from 'express';
import users from './Users/usersRoute.js';
import rsl from './rsl/rslRoute.js';
import staff from './staff/staffRoute.js';
import property from './Property/propertiesRoute.js';
import tenant from './Tenant/tenantRoutes.js';

const route = express.Router();

route.use('/api/users',users);
route.use('/api/rsl', rsl);
route.use('/api/staff', staff);
route.use('/api/properties', property);
route.use('/api/tenants', tenant);

export default route;