import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv'

dotenv.config();
const client = new Client({config:process.env.FLY_POSTGRES_CONNECTION_STRING});
await client.connect();
 
const res = await client.query('SELECT $1::text as message', ['Hello world!'])
console.log(res.rows[0].message) // Hello world!
await client.end()