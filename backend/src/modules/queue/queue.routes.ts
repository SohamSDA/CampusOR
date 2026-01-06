import { Router } from "express";
import {
  createQueue,
  generateToken,
  updateTokenStatus,
  getQueueOperatorView,
} from "./queue.controller.js";
import { verifyJWT, authorize } from "../../middlewares/auth.js";

const router = Router();

// queues
// Only operators and admins can create queues
router.post("/", verifyJWT, authorize("operator", "admin"), createQueue);

// Get the unified view for the operator dashboard
router.get(
  "/:queueId/operator-view",
  verifyJWT,
  authorize("operator", "admin"),
  getQueueOperatorView
);

// tokens
// Public endpoint for users/kiosks to get a token
router.post("/:queueId/tokens", generateToken);

// Only operators/admins can update status (serve/skip)
router.patch(
  "/tokens/:tokenId/status",
  verifyJWT,
  authorize("operator", "admin"),
  updateTokenStatus
);

export default router;