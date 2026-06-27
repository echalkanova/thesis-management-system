import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import thesesRouter from "./theses";
import { thesisFilesRouter, filesRouter } from "./files";
import { thesisReviewsRouter, reviewsRouter } from "./reviews";
import { thesisGradesRouter, gradesRouter } from "./grades";
import defensesRouter from "./defenses";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import auditLogRouter from "./auditLog";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/theses", thesesRouter);
router.use("/theses/:id/files", thesisFilesRouter);
router.use("/files", filesRouter);
router.use("/theses/:id/reviews", thesisReviewsRouter);
router.use("/reviews", reviewsRouter);
router.use("/theses/:id/grades", thesisGradesRouter);
router.use("/grades", gradesRouter);
router.use("/defenses", defensesRouter);
router.use("/notifications", notificationsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/reports", dashboardRouter);
router.use("/audit-log", auditLogRouter);

export default router;
