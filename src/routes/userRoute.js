import express from "express";
import { requireAuth } from "@clerk/express";

import { 
  createProject, 
  getUserProjects, 
  syncUser
} from "../controllers/userControllers.js";

const router = express.Router();

router.post("/create-project", requireAuth(), createProject);
router.post("/sync-user", syncUser);
router.get("/projects", requireAuth(), getUserProjects);

export default router;
