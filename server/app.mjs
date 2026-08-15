import { randomUUID } from "node:crypto";
import argon2 from "argon2";
import connectPgSimple from "connect-pg-simple";
import express from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().trim().min(2).max(50),
  password: z.string().min(1).max(256),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(8).max(128),
});

const xpSchema = z.object({
  amount: z.number().int().min(-1000).max(1000).refine((value) => value !== 0),
  reason: z.string().trim().min(2).max(200),
  week: z.number().int().min(1).max(8).optional(),
});

const rewardSchema = z.object({
  rewardId: z.enum(["ticket", "sticker", "access-key", "power-card", "drop", "badge", "crew-token", "spotlight"]),
  week: z.number().int().min(1).max(8).optional(),
});

const submissionSchema = z.object({
  type: z.string().trim().min(1).max(30),
  value: z.string().trim().min(1).max(12000),
});

function userPayload(row) {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    studentId: row.student_id || null,
    mustChangePassword: Boolean(row.must_change_password),
  };
}

function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: "authentication_required" });
  next();
}

function requireStudent(req, res, next) {
  if (!req.session?.user || req.session.user.role !== "student" || !req.session.user.studentId) {
    return res.status(403).json({ error: "student_role_required" });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "admin_role_required" });
  }
  next();
}

function publicStudentSelect() {
  return `SELECT s.id,s.name,s.nickname,s.level,s.streak,s.longest_streak,s.progress,s.week_status,s.accent,
    COALESCE(SUM(x.amount),0)::int AS total_xp
    FROM students s
    LEFT JOIN xp_transactions x ON x.student_id=s.id`;
}

async function audit(client, adminUserId, action, target, beforeSummary = null, afterSummary = null) {
  await client.query(
    `INSERT INTO audit_logs(id,admin_user_id,action,target,before_summary,after_summary)
     VALUES($1,$2,$3,$4,$5,$6)`,
    [randomUUID(), adminUserId, action, target, beforeSummary, afterSummary],
  );
}

function mutationOriginGuard(config) {
  const configuredOrigin = new URL(config.appUrl).origin;
  return (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.get("origin");
    if (!origin && !config.production) return next();
    if (origin !== configuredOrigin) return res.status(403).json({ error: "invalid_origin" });
    next();
  };
}

export function createApp({ pool, config, staticDirectory = null }) {
  const app = express();
  if (config.trustProxy) app.set("trust proxy", 1);

  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(express.json({ limit: "900kb" }));
  app.use(mutationOriginGuard(config));

  const PgSession = connectPgSimple(session);
  app.use(session({
    store: new PgSession({ pool, tableName: "user_sessions", createTableIfMissing: false }),
    name: "elu.sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: config.secureCookies,
      sameSite: "lax",
      maxAge: config.sessionHours * 60 * 60 * 1000,
    },
  }));

  const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "too_many_attempts" },
  });

  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  app.get("/api/auth/session", (req, res) => {
    if (!req.session?.user) return res.json({ authenticated: false });
    res.json({ authenticated: true, user: req.session.user });
  });

  app.post("/api/auth/login", loginLimiter, async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "invalid_request" });
      const { username, password } = parsed.data;
      const result = await pool.query(
        `SELECT id,username,password_hash,role,student_id,active,must_change_password
         FROM users WHERE LOWER(username)=LOWER($1) LIMIT 1`,
        [username],
      );
      const row = result.rows[0];
      const valid = Boolean(row?.active) && await argon2.verify(row.password_hash, password).catch(() => false);
      if (!valid) return res.status(401).json({ error: "invalid_credentials" });
      req.session.user = userPayload(row);
      await new Promise((resolve, reject) => req.session.save((error) => error ? reject(error) : resolve()));
      res.json({ user: req.session.user });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/logout", (req, res, next) => {
    if (!req.session) return res.status(204).end();
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie("elu.sid");
      res.status(204).end();
    });
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res, next) => {
    try {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "invalid_password" });
      const current = await pool.query("SELECT password_hash FROM users WHERE id=$1 AND active=TRUE", [req.session.user.id]);
      if (!current.rowCount || !await argon2.verify(current.rows[0].password_hash, parsed.data.currentPassword).catch(() => false)) {
        return res.status(400).json({ error: "current_password_invalid" });
      }
      const passwordHash = await argon2.hash(parsed.data.newPassword, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      });
      await pool.query(
        "UPDATE users SET password_hash=$1,must_change_password=FALSE,updated_at=CURRENT_TIMESTAMP WHERE id=$2",
        [passwordHash, req.session.user.id],
      );
      req.session.user.mustChangePassword = false;
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/me", requireAuth, async (req, res, next) => {
    try {
      if (req.session.user.role === "admin") return res.json({ user: req.session.user });
      const studentId = req.session.user.studentId;
      const result = await pool.query(
        `${publicStudentSelect()}, s.feedback
         WHERE s.id=$1 GROUP BY s.id`,
        [studentId],
      );
      if (!result.rowCount) return res.status(404).json({ error: "student_not_found" });
      const rewards = await pool.query(
        "SELECT reward_id,week,created_at FROM reward_grants WHERE student_id=$1 ORDER BY created_at DESC",
        [studentId],
      );
      const weeks = await pool.query(
        "SELECT week,status,progress,reward_id,completed_at FROM week_progress WHERE student_id=$1 ORDER BY week",
        [studentId],
      );
      res.json({ user: req.session.user, student: result.rows[0], rewards: rewards.rows, weeks: weeks.rows });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/crew", requireAuth, async (_req, res, next) => {
    try {
      const result = await pool.query(`${publicStudentSelect()} GROUP BY s.id ORDER BY s.name COLLATE \"C\"`);
      res.json({ students: result.rows });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/leaderboard", requireAuth, async (_req, res, next) => {
    try {
      const result = await pool.query(`${publicStudentSelect()} GROUP BY s.id ORDER BY total_xp DESC,s.name ASC`);
      res.json({ students: result.rows });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/missions", requireAuth, async (_req, res, next) => {
    try {
      const result = await pool.query(
        "SELECT id,week,title,description,instructions,base_xp,bonus_xp,submission_type,active,archived FROM missions WHERE archived=FALSE ORDER BY week",
      );
      res.json({ missions: result.rows });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/missions/:week/start", requireStudent, async (req, res, next) => {
    try {
      const week = Number(req.params.week);
      if (!Number.isInteger(week) || week < 1 || week > 8) return res.status(400).json({ error: "invalid_week" });
      const studentId = req.session.user.studentId;
      const result = await pool.query(
        `UPDATE week_progress SET status='In Progress',updated_at=CURRENT_TIMESTAMP
         WHERE student_id=$1 AND week=$2 AND status='Not Started'
         RETURNING week,status,progress`,
        [studentId, week],
      );
      if (!result.rowCount) return res.status(409).json({ error: "mission_not_startable" });
      await pool.query(
        "UPDATE students SET week_status='In Progress',progress=0,updated_at=CURRENT_TIMESTAMP WHERE id=$1",
        [studentId],
      );
      res.json({ progress: result.rows[0] });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/missions/:week/submit", requireStudent, async (req, res, next) => {
    try {
      const week = Number(req.params.week);
      if (!Number.isInteger(week) || week < 1 || week > 8) return res.status(400).json({ error: "invalid_week" });
      const parsed = submissionSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "invalid_submission" });
      const studentId = req.session.user.studentId;
      const allowed = await pool.query(
        "SELECT status FROM week_progress WHERE student_id=$1 AND week=$2",
        [studentId, week],
      );
      if (!allowed.rowCount || !["In Progress", "Needs Revision"].includes(allowed.rows[0].status)) {
        return res.status(409).json({ error: "mission_not_submittable" });
      }
      await pool.query(
        `INSERT INTO submissions(id,student_id,week,type,value,status)
         VALUES($1,$2,$3,$4,$5,'Submitted')
         ON CONFLICT(student_id,week) DO UPDATE SET type=EXCLUDED.type,value=EXCLUDED.value,status='Submitted',submitted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP`,
        [randomUUID(), studentId, week, parsed.data.type, parsed.data.value],
      );
      await pool.query(
        "UPDATE week_progress SET status='Submitted',updated_at=CURRENT_TIMESTAMP WHERE student_id=$1 AND week=$2",
        [studentId, week],
      );
      await pool.query(
        "UPDATE students SET week_status='Submitted',updated_at=CURRENT_TIMESTAMP WHERE id=$1",
        [studentId],
      );
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/students", requireAdmin, async (_req, res, next) => {
    try {
      const students = await pool.query(
        `${publicStudentSelect()}, s.private_note,s.feedback
         GROUP BY s.id ORDER BY s.name ASC`,
      );
      res.json({ students: students.rows });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/students/:id/xp", requireAdmin, async (req, res, next) => {
    const parsed = xpSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_xp" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const target = await client.query("SELECT id,name FROM students WHERE id=$1", [req.params.id]);
      if (!target.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "student_not_found" });
      }
      await client.query(
        `INSERT INTO xp_transactions(id,student_id,amount,reason,week,admin_user_id)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [randomUUID(), req.params.id, parsed.data.amount, parsed.data.reason, parsed.data.week || null, req.session.user.id],
      );
      await audit(client, req.session.user.id, "XP transaction", req.params.id, null, `${parsed.data.amount} XP · ${parsed.data.reason}`);
      await client.query("COMMIT");
      const total = await pool.query("SELECT COALESCE(SUM(amount),0)::int AS total_xp FROM xp_transactions WHERE student_id=$1", [req.params.id]);
      res.json({ ok: true, totalXp: total.rows[0].total_xp });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      next(error);
    } finally {
      client.release();
    }
  });

  app.post("/api/admin/students/:id/rewards", requireAdmin, async (req, res, next) => {
    const parsed = rewardSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_reward" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const target = await client.query("SELECT id FROM students WHERE id=$1", [req.params.id]);
      if (!target.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "student_not_found" });
      }
      const granted = await client.query(
        `INSERT INTO reward_grants(id,student_id,reward_id,week,admin_user_id)
         VALUES($1,$2,$3,$4,$5)
         ON CONFLICT(student_id,reward_id,week) DO NOTHING RETURNING id`,
        [randomUUID(), req.params.id, parsed.data.rewardId, parsed.data.week || null, req.session.user.id],
      );
      if (!granted.rowCount) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "reward_already_granted" });
      }
      await audit(client, req.session.user.id, "Reward granted", req.params.id, null, parsed.data.rewardId);
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      next(error);
    } finally {
      client.release();
    }
  });

  app.post("/api/admin/students/:id/complete", requireAdmin, async (req, res, next) => {
    const week = Number(req.body?.week);
    if (!Number.isInteger(week) || week < 1 || week > 8) return res.status(400).json({ error: "invalid_week" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const updated = await client.query(
        `UPDATE week_progress SET status='Completed',progress=100,completed_at=COALESCE(completed_at,CURRENT_TIMESTAMP),updated_at=CURRENT_TIMESTAMP
         WHERE student_id=$1 AND week=$2 RETURNING student_id`,
        [req.params.id, week],
      );
      if (!updated.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "student_not_found" });
      }
      await client.query(
        "UPDATE students SET week_status='Completed',progress=100,updated_at=CURRENT_TIMESTAMP WHERE id=$1",
        [req.params.id],
      );
      await audit(client, req.session.user.id, "Mission completed", `${req.params.id}:week-${week}`, null, "Completed");
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      next(error);
    } finally {
      client.release();
    }
  });

  app.use("/api", (_req, res) => res.status(404).json({ error: "not_found" }));

  if (staticDirectory) {
    app.use(express.static(staticDirectory, { index: "index.html", maxAge: config.production ? "1h" : 0 }));
    app.get("*", (_req, res) => res.sendFile("index.html", { root: staticDirectory }));
  }

  app.use((error, _req, res, _next) => {
    console.error("ELU server error", error?.message || error);
    res.status(500).json({ error: "server_error" });
  });

  return app;
}
