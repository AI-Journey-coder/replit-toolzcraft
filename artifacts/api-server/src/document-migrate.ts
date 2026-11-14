import { pool } from '@workspace/db';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
async function main(){try{await migrate(drizzle(pool),{migrationsFolder:'./migrations'});console.log('Document release migrations applied.');}finally{await pool.end();}}
main().catch(()=>{console.error('Migration failed. Review database connectivity and migration history.');process.exitCode=1;});
