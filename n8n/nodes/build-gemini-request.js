// Build the Gemini request from what StudyQuest posted.
// Two tasks share this webhook:
//   scan     (default) -> { imageBase64, mimeType, today, knownModules }
//   studyset            -> { task:'studyset', text | imageBase64, mimeType }
// Plus { ping: true } from Settings -> Test connection.

const b = $json.body ?? $json;

// Answer the ping without spending quota.
if (b.ping) {
  return [{ json: { skip: true } }];
}

// â”€â”€ Task: generate a study set (notes + terms + cards + quiz) â”€â”€
if (b.task === 'studyset') {
  const studyPrompt = [
    "You are StudyQuest's study-material generator, used by Singapore polytechnic students revising for exams.",
    '',
    'From the material provided, produce a study set:',
    '',
    '- "summary": 6-12 bullets covering what a student actually needs to remember. Most important first. Each bullet one sentence, plain language, no filler.',
    '- "keyTerms": every technical term the material defines, with a one-sentence definition IN YOUR OWN WORDS. 4-15 of them.',
    '- "flashcards": 10-20 cards. "front" is a term or short question; "back" is the answer in one or two sentences. Test understanding, not trivia.',
    '- "quiz": 5-10 multiple-choice questions. Exactly 4 options each. "answerIndex" is the 0-based index of the correct one. Wrong options must be plausible. "explanation" says in one sentence why the right answer is right.',
    '',
    'Rules:',
    '- Use ONLY what is in the material. Do not add outside facts.',
    '- If the material is too thin, return empty arrays and put the reason in "title".',
    '- Write for someone revising the night before, not for a textbook.'
  ].join('\n');

  const studySchema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      module: { type: 'STRING' },
      summary: { type: 'ARRAY', items: { type: 'STRING' } },
      keyTerms: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: { term: { type: 'STRING' }, definition: { type: 'STRING' } },
          required: ['term', 'definition']
        }
      },
      flashcards: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: { front: { type: 'STRING' }, back: { type: 'STRING' } },
          required: ['front', 'back']
        }
      },
      quiz: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING' },
            options: { type: 'ARRAY', items: { type: 'STRING' } },
            answerIndex: { type: 'NUMBER' },
            explanation: { type: 'STRING' }
          },
          required: ['question', 'options', 'answerIndex', 'explanation']
        }
      }
    },
    required: ['title', 'module', 'summary', 'keyTerms', 'flashcards', 'quiz']
  };

  const studyParts = [{ text: studyPrompt }];
  if (b.imageBase64) {
    studyParts.push({ inlineData: { mimeType: b.mimeType || 'image/jpeg', data: b.imageBase64 } });
  } else if (b.text) {
    studyParts.push({ text: '\n\nMATERIAL:\n' + b.text });
  } else {
    throw new Error('studyset task needs either text or imageBase64.');
  }

  return [{
    json: {
      skip: false,
      task: 'studyset',
      geminiBody: {
        contents: [{ parts: studyParts }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: studySchema
        }
      }
    }
  }];
}

// â”€â”€ Task: scan a document for deadlines (default) â”€â”€
if (!b.imageBase64) {
  throw new Error('No imageBase64 in the request body.');
}

const today = b.today || new Date().toISOString().slice(0, 10);
const known = Array.isArray(b.knownModules) ? b.knownModules.filter(Boolean) : [];
const TYPES = ['CA', 'Group Project', 'Reflection', 'Exam', 'Quiz'];

const prompt = [
  'You are the document scanner for StudyQuest, a study planner used by Singapore polytechnic students.',
  '',
  'Read the attached document image and extract every piece of assessed work you can find: continuous assessments, quizzes, exams, group projects, reflections, presentations, submissions.',
  '',
  `Today's date is ${today}. Use it to resolve any date that omits a year - always pick the NEXT occurrence, never a date in the past. Return every date as YYYY-MM-DD.`,
  '',
  'Rules:',
  '- "weight" is the percentage of the module grade (1-100). If the document does not state one, estimate from the assessment type.',
  '- "estHours" is the total effort in hours (1-40).',
  `- "type" must be exactly one of: ${TYPES.join(', ')}.`,
  known.length
    ? `- "module" is the module code. Modules already in this account: ${known.join(', ')} - reuse these codes when the document refers to them.`
    : '- "module" is the module code such as C240. Leave it empty if the document does not show one.',
  '- "confidence" is 0-1: how sure you are this is a real assessment with the right date.',
  '- Do NOT invent assignments. If there is no assessed work, return an empty list and say what the document was in "note".',
  '- If the document shows achieved marks (results slip, graded rubric, transcript), fill "grades" with module code and score out of 100. Letter grades: A=85, B+=78, B=72, C+=65, C=58, D+=52, D=45, F=30. Otherwise leave "grades" empty.',
  '- Ignore anything that is not assessed work: lecture topics, readings, timetable slots without a submission, admin notices.'
].join('\n');

const responseSchema = {
  type: 'OBJECT',
  properties: {
    documentType: { type: 'STRING' },
    note: { type: 'STRING' },
    assignments: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          module: { type: 'STRING' },
          type: { type: 'STRING', enum: TYPES },
          dueDate: { type: 'STRING' },
          weight: { type: 'NUMBER' },
          estHours: { type: 'NUMBER' },
          confidence: { type: 'NUMBER' }
        },
        required: ['title', 'type', 'dueDate', 'weight', 'estHours', 'confidence']
      }
    },
    grades: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          module: { type: 'STRING' },
          score: { type: 'NUMBER' },
          label: { type: 'STRING' }
        },
        required: ['module', 'score', 'label']
      }
    }
  },
  required: ['documentType', 'note', 'assignments', 'grades']
};

return [{
  json: {
    skip: false,
    task: 'scan',
    geminiBody: {
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: b.mimeType || 'image/jpeg', data: b.imageBase64 } }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema
      }
    }
  }
}];
