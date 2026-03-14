const API_BASE_URL = (process.env as any).NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = {
  uploadDocument: async (file: File, employerId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employer_id', employerId);
    const response = await fetch(`${API_BASE_URL}/upload-document`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  generateTraining: async (documentId: string, role: string) => {
    const response = await fetch(`${API_BASE_URL}/generate-training`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, role }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  getTraining: async (trainingModuleId: string) => {
    const response = await fetch(`${API_BASE_URL}/training/${trainingModuleId}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  /** Returns { quiz_id, questions } — questions have no correct_index/explanation */
  getQuiz: async (trainingModuleId: string) => {
    const response = await fetch(`${API_BASE_URL}/quiz/${trainingModuleId}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  /** Employer-only: returns full questions including correct answers */
  getQuizWithAnswers: async (trainingModuleId: string) => {
    const response = await fetch(`${API_BASE_URL}/quiz/${trainingModuleId}/full`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  submitQuiz: async (volunteerId: string, quizId: string, answers: { question_id: number; selected_option: number }[]) => {
    const response = await fetch(`${API_BASE_URL}/submit-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volunteer_id: volunteerId, quiz_id: quizId, answers }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  /** Get passport by volunteer ID (most recent) */
  getPassport: async (volunteerId: string) => {
    const response = await fetch(`${API_BASE_URL}/passport/${volunteerId}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  /** Get passport by passport ID — used for shareable links and result page */
  getPassportById: async (passportId: string) => {
    const response = await fetch(`${API_BASE_URL}/result/${passportId}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  getEmployerVolunteers: async (employerId: string) => {
    const response = await fetch(`${API_BASE_URL}/employer/volunteers/${employerId}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
};
