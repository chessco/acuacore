SELECT email, tenantId, role FROM User WHERE tenantId = (SELECT tenantId FROM User WHERE email = 'admin@pitayacode.io');
