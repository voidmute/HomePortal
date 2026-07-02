import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/db/schema";
import { AUTHORIZED_USERS } from "../src/generated/users";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Требуется DATABASE_URL");
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  for (const user of AUTHORIZED_USERS) {
    await db
      .insert(users)
      .values({
        name: user.name,
        role: user.role,
        isTotpSetup: false,
        totpSecret: null,
      })
      .onConflictDoNothing({ target: users.name });
    console.log(`Пользователь добавлен: ${user.name}`);
  }

  await client.end();
  console.log("Инициализация завершена.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
