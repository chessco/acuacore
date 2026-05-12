const mysql = require('./api/node_modules/mysql2/promise');

async function main() {
  const connection = await mysql.createConnection('mysql://root:pitaya123@localhost:3306/acuacore');
  try {
    const [tenants] = await connection.execute("SELECT id, name FROM Tenant WHERE name LIKE '%Acuaequipos%' LIMIT 1");
    if (tenants.length > 0) {
      await connection.execute("UPDATE User SET tenantId = ? WHERE email = ?", [tenants[0].id, 'admin@pitayacode.io']);
      console.log('EXITO: admin@pitayacode.io vinculado a ' + tenants[0].name);
    } else {
      console.error('ERROR: No se encontró el inquilino');
    }
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
