// Unwrap Gemini's response into the flat shape StudyQuest expects.
const text = $json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

let out = {};
try {
  out = JSON.parse(text);
} catch (e) {
  const m = String(text).match(/\{[\s\S]*\}/);
  if (m) {
    try { out = JSON.parse(m[0]); } catch (e2) { out = {}; }
  }
}

// Which task produced this? Read it back off the node that built the request.
let task = 'scan';
try { task = $('Build Gemini Request').first().json.task || 'scan'; } catch (e) {}

if (task === 'studyset') {
  return [{
    json: {
      title: out.title || 'Study set',
      module: out.module || '',
      summary: Array.isArray(out.summary) ? out.summary : [],
      keyTerms: Array.isArray(out.keyTerms) ? out.keyTerms : [],
      flashcards: Array.isArray(out.flashcards) ? out.flashcards : [],
      quiz: Array.isArray(out.quiz) ? out.quiz : []
    }
  }];
}

return [{
  json: {
    assignments: Array.isArray(out.assignments) ? out.assignments : [],
    grades: Array.isArray(out.grades) ? out.grades : [],
    documentType: out.documentType || 'document',
    note: out.note || ''
  }
}];
