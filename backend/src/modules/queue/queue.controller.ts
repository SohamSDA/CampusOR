import { Request, Response } from "express";
import { Queue, Token, TokenStatus } from "./queue.model.js";
import { TokenService } from "./services/token.service.js";
import { AuthRequest } from "../../middlewares/auth.js"; 

// 1: Create a new queue
export async function createQueue(req: AuthRequest, res: Response) {
  try {
    const { name, location, operator } = req.body;
    
    // Use the explicit operator from body, or default to the creating user
    // (This allows admins to assign operators, or operators to assign themselves)
    const operatorId = operator || req.user?.sub;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        error: "Queue name and location are required",
      });
    }

    // Check for duplicate queue (same name + location)
    const existingQueue = await Queue.findOne({ name, location });
    if (existingQueue) {
      return res.status(409).json({
        success: false,
        error: "A queue with this name and location already exists",
      });
    }

    const queue = await Queue.create({
      name,
      location,
      operator: operatorId || null,
      isActive: true,
      nextSequence: 1,
    });

    return res.status(201).json({
      success: true,
      queue: {
        id: queue._id,
        name: queue.name,
        location: queue.location,
        isActive: queue.isActive,
        operator: queue.operator,
        createdAt: queue.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Queue Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create queue",
    });
  }
}

// 2: Generate token for a user in a queue
export async function generateToken(req: Request, res: Response) {
  const { queueId } = req.params;

  // We rely on the service to handle the logic, but we could add 
  // checks here if the queue is active before calling service
  const result = await TokenService.generateToken(queueId);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
}

// 3: Update token status
export async function updateTokenStatus(req: Request, res: Response) {
  const { tokenId } = req.params;
  const { status } = req.body;

  if (!Object.values(TokenStatus).includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Invalid token status",
    });
  }

  const result = await TokenService.updateStatus(tokenId, status);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
}

// 4: Get Queue State for Operator Dashboard
export async function getQueueOperatorView(req: Request, res: Response) {
  try {
    const { queueId } = req.params;

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ success: false, error: "Queue not found" });
    }

    // Fetch waiting tokens sorted by sequence
    const waitingTokens = await Token.find({
      queue: queueId,
      status: TokenStatus.WAITING,
    })
      .sort({ seq: 1 })
      .select("id seq status");

    // Fetch the token currently being served (most recently updated to SERVED)
    const nowServingToken = await Token.findOne({
      queue: queueId,
      status: TokenStatus.SERVED,
    })
      .sort({ updatedAt: -1 })
      .select("id seq status");

    return res.status(200).json({
      queue: {
        id: queue._id,
        name: queue.name,
        location: queue.location,
        status: queue.isActive ? "ACTIVE" : "PAUSED",
      },
      tokens: waitingTokens.map((t) => ({
        id: t._id,
        number: t.seq,
        status: t.status,
      })),
      nowServing: nowServingToken
        ? { id: nowServingToken._id, number: nowServingToken.seq }
        : null,
    });
  } catch (error) {
    console.error("Get Operator View Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch queue state",
    });
  }
}