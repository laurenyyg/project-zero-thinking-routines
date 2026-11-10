import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompt grounding the assistant strictly in Harvard Project Zero
const SYSTEM_INSTRUCTION = `You are an expert Harvard Project Zero (PZ) educational consultant and thinking routines advisor.
Your role is to guide teachers, learners, and inquiry-led practitioners to choose and apply the exact right thinking routine from the Harvard Project Zero toolbox.

Core PZ Frameworks:
1. Cultures of Thinking & Visible Thinking: +1 Routine, 3-2-1 Bridge, Chalk Talk, Circle of Viewpoints, Compass Points, Connect Extend Challenge, CSI (Color Symbol Image), Generate-Sort-Connect-Elaborate, Headlines, Here Now / There Then, Hotspots, I Used to Think... Now I Think..., Options Diamond, Options Explosion, Red Light Yellow Light, Reporter's Notebook, Same and Different, See Think Wonder, Stop Look Listen, Take a Stand, Take Note, The 3 Whys, The 4 Cs, The Complexity Scale, The Explanation Game, Think Pair Share, Think Puzzle Explore, Tug for Truth, Tug of War, Word-Phrase-Sentence.
2. Agency by Design & PZ Connect: Parts People Interactions, Parts Purposes Complexities, Think Feel Care, Imagine If..., Creative Hunt, What Can Be.
3. Arts as Civic Commons: See Think Make Discuss, See Think Me We, Values Identities Actions (VIA), Lenses for Dialogue.

Response Guidelines:
- Tone: Crisp, structured, encouraging, deeply knowledgeable, educational.
- Avoid robotic fluff or generic AI slop.
- Always recommend 1 primary Harvard Project Zero routine (and optionally 1 alternate).
- Clearly explain WHY this routine fits the user's specific context.
- Outline the concrete step-by-step thinking moves for the learner to follow right away.
- When the user confirms they completed it or want to log it, encourage them to log it into their practice tracker.`;

// API endpoint for interactive advisor
app.post('/api/pz-advisor', async (req: Request, res: Response) => {
  const { messages, userTaskContext } = req.body;

  if (!aiClient) {
    // Intelligent heuristic educational fallback if GEMINI_API_KEY is not configured
    const lastUserMsg = (messages && messages.length > 0 ? messages[messages.length - 1].content : '').toLowerCase();
    
    let recommendedRoutine = '3-2-1 Bridge';
    let rationale = 'To capture initial conceptions before an inquiry and trace how your thinking shifts.';
    let steps = [
      '3 Initial Thoughts or Words',
      '2 Puzzling Questions',
      '1 Metaphor or Simile',
      'After Learning: Repeat 3-2-1',
      'The Bridge: Explain the evolution in your thinking',
    ];

    if (lastUserMsg.includes('debate') || lastUserMsg.includes('truth') || lastUserMsg.includes('fake') || lastUserMsg.includes('evidence')) {
      recommendedRoutine = 'Claim, Support, Question';
      rationale = 'To ground reasoning in verifiable evidence and expose unanswered tensions.';
      steps = [
        '1. Make a clear claim or interpretation',
        '2. Identify concrete evidence or observations to support it',
        '3. Ask: What remains unexplained or vulnerable?',
      ];
    } else if (lastUserMsg.includes('decision') || lastUserMsg.includes('choice') || lastUserMsg.includes('trade-off')) {
      recommendedRoutine = 'Compass Points';
      rationale = 'To evaluate all sides of a proposition through E (Excitement), W (Worries), N (Need to know), and S (Stance).';
      steps = [
        'E = Excited: What is the upside?',
        'W = Worrisome: What are the risks or downsides?',
        'N = Need to Know: What additional data do you need?',
        'S = Stance: What is your current actionable step forward?',
      ];
    } else if (lastUserMsg.includes('system') || lastUserMsg.includes('organization') || lastUserMsg.includes('community')) {
      recommendedRoutine = 'Parts, People, Interactions';
      rationale = 'To unpack the human and structural dynamics inside a complex system.';
      steps = [
        '1. What are the parts of the system?',
        '2. Who are the people connected to the system?',
        '3. How do the people interact with each other and the parts?',
        '4. How does a change in one element ripple across the rest?',
      ];
    } else if (lastUserMsg.includes('art') || lastUserMsg.includes('image') || lastUserMsg.includes('photo') || lastUserMsg.includes('notice')) {
      recommendedRoutine = 'See, Think, Wonder';
      rationale = 'To slow down looking and separate direct observation from interpretation and curiosity.';
      steps = [
        '1. See: What do you objectively observe?',
        '2. Think: What do you think is going on?',
        '3. Wonder: What does this make you wonder?',
      ];
    }

    return res.json({
      reply: `For your context (${userTaskContext || 'your inquiry'}), I recommend the Harvard Project Zero routine: **${recommendedRoutine}**.\n\n**Why it fits:** ${rationale}\n\n**Step-by-step facilitation:**\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nOnce you try this routine, click **"Log Practice"** to save it to your dashboard!`,
      recommendedRoutineId: recommendedRoutine.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      recommendedRoutineName: recommendedRoutine,
    });
  }

  try {
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Add task context reminder if present
    if (userTaskContext) {
      formattedContents.unshift({
        role: 'user',
        parts: [{ text: `User task context: "${userTaskContext}"` }],
      });
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const replyText = response.text || 'I recommend exploring one of the Harvard Project Zero routines.';
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error invoking Gemini API:', error);

    // Provide rich educational Harvard PZ fallback so user workflow is uninterrupted during upstream spikes
    const lastUserMsg = (messages && messages.length > 0 ? messages[messages.length - 1].content : '').toLowerCase();
    
    let fallbackName = 'Compass Points';
    let fallbackPurpose = 'To examine multiple facets of a proposition, idea, or dilemma before taking a stand.';
    let fallbackSteps = [
      '1. E = Excited: What excites you about this idea or proposition? What is the upside?',
      '2. W = Worrisome: What do you find worrisome about this idea or proposition? What is the downside?',
      '3. N = Need to Know: What else do you need to know or find out about this idea?',
      '4. S = Stance or Suggestion: What is your current stance or suggestion for moving forward?',
    ];

    if (lastUserMsg.includes('text') || lastUserMsg.includes('read') || lastUserMsg.includes('book') || lastUserMsg.includes('chapter')) {
      fallbackName = 'The 4 Cs';
      fallbackPurpose = 'To structure a rich text-based discussion through Connections, Challenge, Concepts, and Changes.';
      fallbackSteps = [
        '1. Connections: What connections do you draw between the text and your life or learning?',
        '2. Challenge: What ideas or assumptions do you want to challenge?',
        '3. Concepts: What key concepts are important and worth holding on to?',
        '4. Changes: What changes in attitudes, thinking, or action are suggested?',
      ];
    } else if (lastUserMsg.includes('evidence') || lastUserMsg.includes('claim') || lastUserMsg.includes('debate') || lastUserMsg.includes('truth')) {
      fallbackName = 'Claim, Support, Question';
      fallbackPurpose = 'To ground reasoning in verifiable evidence and expose unanswered tensions.';
      fallbackSteps = [
        '1. Make a Claim: State an explanation, interpretation, or stance on the topic.',
        '2. Identify Support: Point to specific facts, data, observations, or experiences that back your claim.',
        '3. Ask a Question: What remains unexplained, uncertain, or vulnerable?',
      ];
    } else if (lastUserMsg.includes('system') || lastUserMsg.includes('complex') || lastUserMsg.includes('community')) {
      fallbackName = 'Parts, People, Interactions';
      fallbackPurpose = 'To unpack systems by identifying parts, connected people, and interaction dynamics.';
      fallbackSteps = [
        '1. What are the parts of the system?',
        '2. Who are the people connected to the system?',
        '3. How do the people in the system interact with each other and with the parts?',
        '4. How does a change in one element affect the various parts and people?',
      ];
    } else if (lastUserMsg.includes('shift') || lastUserMsg.includes('change') || lastUserMsg.includes('learn')) {
      fallbackName = '3-2-1 Bridge';
      fallbackPurpose = 'To activate prior knowledge and make visible the shift in thinking over time.';
      fallbackSteps = [
        '1. Initial 3-2-1: 3 Words, 2 Questions, 1 Metaphor before the learning experience.',
        '2. Learning Experience: Engage with the content, video, or discussion.',
        '3. New 3-2-1: Repeat 3 Words, 2 Questions, 1 Metaphor after the learning experience.',
        '4. Bridge: Explain how and why your new thinking shifted from your initial thoughts.',
      ];
    }

    return res.json({
      reply: `For your context ("${userTaskContext || 'your inquiry'}"), I recommend the Harvard Project Zero routine: **${fallbackName}**.\n\n**Purpose:** ${fallbackPurpose}\n\n**Step-by-step facilitation:**\n${fallbackSteps.join('\n')}\n\nClick **"Step-by-Step Guide"** below to walk through each step, or **"Log Practice"** to record your session.`,
      recommendedRoutineName: fallbackName,
      recommendedRoutineId: fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
