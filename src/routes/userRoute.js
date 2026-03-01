import express from "express";
import { requireAuth } from "@clerk/express";

import { 
  createProject, 
  getUserProjects, 
  syncUser,
  refineProject,
  getConversation
} from "../controllers/userControllers.js";

const router = express.Router();

router.post("/create-project", requireAuth(), createProject);
router.post("/refine-project", requireAuth(), refineProject);
router.post("/sync-user", syncUser);
router.get("/projects", requireAuth(), getUserProjects);
router.get("/conversation/:projectId", requireAuth(), getConversation);

export default router;
