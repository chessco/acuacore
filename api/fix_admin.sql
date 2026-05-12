UPDATE User SET tenantId = (SELECT id FROM Tenant WHERE name LIKE '%Acuaequipos%' LIMIT 1) WHERE email = 'admin@pitayacode.io';
