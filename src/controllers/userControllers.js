import User from "../models/user.js";
import WebsiteProject from "../models/WebsiteProjects.js";
import Conversation from "../models/conversation.js";
import { generateAIResponse } from "../Services/geminiapi.js";

export const syncUser = async (req, res) => {
  try {
    const userId = req.auth()?.userId || req.body.userId;
    const { name, email } = req.body;

    if (!userId || !name || !email) {
      return res.status(400).json({
        message: "userId, name and email are required"
      });
    }

    let user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      user = await User.create({
        clerkUserId: userId,
        name,
        email,
        credits: 100
      });
    }

    res.status(200).json({
      message: "User synced successfully",
      user
    });

  } catch (error) {
    console.error("Sync User Error:", error);
    res.status(500).json({ error: error.message });
  }
};



export const getCredits = async (req, res) => {
  try {
    const userId = req.auth()?.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ credits: user.credits });

  } catch (error) {
    console.error("Get Credits Error:", error);
    res.status(500).json({ error: error.message });
  }
};




export const addCredits = async (req, res) => {
  try {
    const userId = req.auth()?.userId || req.body.userId;
    const { amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        message: "userId and amount are required"
      });
    }

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.credits += Number(amount);
    await user.save();

    res.status(200).json({
      message: "Credits added",
      credits: user.credits
    });

  } catch (error) {
    console.error("Add Credits Error:", error);
    res.status(500).json({ error: error.message });
  }
};



export const getUserProjects = async (req, res) => {
  try {
    const userId = req.auth()?.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const projects = await WebsiteProject.find({
      clerkUserId: userId
    }).sort({ createdAt: -1 });

    res.status(200).json(projects);

  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ error: error.message });
  }
};




export const createProject = async (req, res) => {
  try {
    const userId = req.auth()?.userId || req.body.userId;
    const { initial_prompt } = req.body;
    console.log(`[Backend] createProject called. userId: ${userId}, prompt: ${initial_prompt?.substring(0, 30)}...`);


    if (!userId || !initial_prompt) {
      console.warn(`[Backend] Missing userId (${userId}) or prompt (${initial_prompt})`);
      return res.status(400).json({
        message: "userId and initial_prompt are required"
      });
    }


    let user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      console.log("User not found during project creation, creating user...");
      
      user = await User.create({
        clerkUserId: userId,
        email: req.body.email || `user_${userId}@clerk.com`,
        name: req.body.name || "AI Builder User",
        credits: 100
      });
    }


    if (user.credits < 1) {
      return res.status(400).json({
        message: "Not enough credits"
      });
    }

    const newProject = await WebsiteProject.create({
      name: initial_prompt.substring(0, 30),
      initial_prompt,
      current_code: "",
      clerkUserId: userId
    });


    await Conversation.create({
      role: "user",
      content: initial_prompt,
      projectId: newProject._id
    });


    await Conversation.create({
      role: "assistant",
      content: "Generating your website...",
      projectId: newProject._id
    });

    user.credits -= 1;
    await user.save();

    res.status(201).json({
      success: true,
      projectId: newProject._id,
      remainingCredits: user.credits
    });

    
    generateWebsite(newProject._id, initial_prompt).catch(console.error);


  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ error: error.message });
  }
};




const generateWebsite = async (projectId, prompt) => {
  try {
    console.log(`[AI] Starting generation for project ${projectId}...`);
    const enhanceMessages = [
      {
        role: "system",
        content: "You are a prompt enhancement specialist. Expand the user's website idea into a detailed prompt. Return ONLY the enhanced prompt."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    console.log("[AI] Enhancing prompt...");
    const enhancedPrompt = await generateAIResponse(enhanceMessages);
    console.log("[AI] Enhanced Prompt received.");

    const generateMessages = [
      {
        role: "system",
        content: `
        You are a senior frontend developer generating files for a backend API system.

The generated website will be programmatically saved into separate files by my Node.js backend.

You MUST strictly follow this file-based structure.

========================
OUTPUT STRUCTURE RULES
========================

1. Generate three separate files:
   - index.html
   - styles.css
   - script.js

2. HTML must:
   - NOT contain <style> tags
   - NOT contain inline CSS
   - NOT contain JavaScript code inside <script> tags
   - ONLY link external files like this:

     <link rel="stylesheet" href="styles.css">
     <script src="script.js"></script>

3. CSS must contain ALL styling.
4. JavaScript must contain ALL interactivity logic.

5. Do NOT merge everything into one file.
6. Do NOT return markdown.
7. Do NOT wrap output inside blocks.
8. Do NOT add explanations or text outside JSON.
9. Return ONLY valid JSON.

========================
REQUIRED JSON FORMAT
========================

{
  "files": {
    "index.html": "full html code here",
    "styles.css": "full css code here",
    "script.js": "full javascript code here"
  }
}

========================
DESIGN REQUIREMENTS
========================

- Modern professional UI
- Responsive (mobile-first)
- Clean typography
- Smooth hover effects
- Proper spacing
- Semantic HTML5
- Accessible structure

Website description:
${prompt}
        
        
        
        
        
        
        `

      },
      {
        role: "user",
        content: enhancedPrompt
      }
    ];

    console.log("[AI] Generating website code...");
    const generatedCode = await generateAIResponse(generateMessages);
    console.log("[AI] Website code generated. Length:", generatedCode?.length);

    if (!generatedCode) {
      throw new Error("AI returned empty code.");
    }


    const cleanCode = generatedCode.replace(/```[a-z]*\n?|```/gi, "").trim();

    await WebsiteProject.findByIdAndUpdate(projectId, {
      current_code: cleanCode
    });

    await Conversation.create({
      role: "assistant",
      content: `Enhanced Prompt:\n\n${enhancedPrompt}`,
      projectId
    });

    await Conversation.create({
      role: "assistant",
      content: cleanCode,
      projectId
    });

    console.log(`[AI] Project ${projectId} updated with generated code.`);

  } catch (error) {
    console.error("[AI] Generation failed:", error);

    await WebsiteProject.findByIdAndUpdate(projectId, {
      current_code: "ERROR: Failed to generate code."
    });

    await Conversation.create({
      role: "assistant",
      content: `Website generation failed: ${error.message}. Please try again.`,
      projectId
    });
  }
};




export const getConversation = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        message: "ProjectId is required"
      });
    }

    const messages = await Conversation.find({
      projectId
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });

  } catch (error) {
    console.error("Get Conversation Error:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};