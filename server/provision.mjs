import { randomUUID } from "node:crypto";
import argon2 from "argon2";
import { studentSeeds, missionSeeds } from "./seed.mjs";

const accounts = [
  { username: "alena", role: "student", studentId: "alena", env: "ELU_ALENA_PASSWORD" },
  { username: "nastya", role: "student", studentId: "anastasia", env: "ELU_NASTYA_PASSWORD" },
  { username: "egor", role: "student", studentId: "egor", env: "ELU_EGOR_PASSWORD" },
  { username: "kirill", role: "student", studentId: "kirill", env: "ELU_KIRILL_PASSWORD" },
  { username: "teacher", role: "admin", studentId: null, env: "ELU_ADMIN_PASSWORD" },
];

export async function provision(pool, env = process.env) {
  const missing = accounts.filter((account) => !env[account.env]).map((account) => account.env);
  if (missing.length) throw new Error(`Missing provisioning secrets: ${missing.join(", ")}`);

  const client = await pool.connect();
  let createdAccounts = 0;
  try {
    await client.query("BEGIN");

    for (const student of studentSeeds) {
      await client.query(
        `INSERT INTO students(id,name,nickname,accent) VALUES($1,$2,$3,$4)
         ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,nickname=EXCLUDED.nickname,accent=EXCLUDED.accent,updated_at=CURRENT_TIMESTAMP`,
        [student.id, student.name, student.nickname, student.accent],
      );
      for (let week = 1; week <= 8; week += 1) {
        await client.query(
          `INSERT INTO week_progress(student_id,week,status) VALUES($1,$2,$3)
           ON CONFLICT(student_id,week) DO NOTHING`,
          [student.id, week, week === 1 ? "Not Started" : "Locked"],
        );
      }
    }

    for (const [week, title, description, instructions, baseXp, bonusXp, submissionType] of missionSeeds) {
      await client.query(
        `INSERT INTO missions(id,week,title,description,instructions,base_xp,bonus_xp,submission_type)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT(week) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,instructions=EXCLUDED.instructions,base_xp=EXCLUDED.base_xp,bonus_xp=EXCLUDED.bonus_xp,submission_type=EXCLUDED.submission_type,updated_at=CURRENT_TIMESTAMP`,
        [`week-${week}`, week, title, description, instructions, baseXp, bonusXp, submissionType],
      );
    }

    await client.query("INSERT INTO app_settings(key,value_json) VALUES('currentWeek','1') ON CONFLICT(key) DO NOTHING");

    for (const account of accounts) {
      const existing = await client.query("SELECT id FROM users WHERE username=$1 LIMIT 1", [account.username]);
      if (existing.rowCount) {
        await client.query(
          `UPDATE users SET role=$1,student_id=$2,active=TRUE,updated_at=CURRENT_TIMESTAMP WHERE username=$3`,
          [account.role, account.studentId, account.username],
        );
        continue;
      }

      const passwordHash = await argon2.hash(env[account.env], {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      });
      await client.query(
        `INSERT INTO users(id,username,password_hash,role,student_id,must_change_password)
         VALUES($1,$2,$3,$4,$5,TRUE)`,
        [randomUUID(), account.username, passwordHash, account.role, account.studentId],
      );
      createdAccounts += 1;
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return { students: 4, admins: 1, createdAccounts };
}
