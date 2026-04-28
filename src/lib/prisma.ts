import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client.js";
// IMPORTANT: Point this to your actual generated folder
// If this file is in src/lib/, you need to go up two levels


const connectionString = process.env.DATABASE_URL;

// 1. Create a pg Pool (Prisma 7 adapters need this)
const pool = new Pool({ connectionString });

// 2. Initialize the adapter with that pool
const adapter = new PrismaPg(pool);

// 3. Create the Prisma Client using the adapter
const prisma = new PrismaClient({ adapter });

export { prisma };