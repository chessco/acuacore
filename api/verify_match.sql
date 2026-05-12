SELECT u.email, u.tenantId as user_tenant, t.id as tenant_id, t.name 
FROM User u 
JOIN Tenant t ON u.tenantId = t.id 
WHERE u.email = 'admin@pitayacode.io';
