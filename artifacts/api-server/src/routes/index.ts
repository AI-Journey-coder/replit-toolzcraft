import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import toolsRouter from "./tools";
import adminRouter from "./admin";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(toolsRouter);
router.use(adminRouter);
router.use(aiRouter);

export default router;
