// services/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  auth: {
    login: async (nis: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis, password })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Login gagal');
      }
      return res.json();
    }
  },
  sessions: {
    getStatus: async (token: string) => {
      const res = await fetch(`${API_BASE}/sessions/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  },
  questions: {
    getNext: async (sessionId: number, representation: string, token: string) => {
      const res = await fetch(`${API_BASE}/questions/next`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ session_id: sessionId, current_representation: representation })
      });
      return res.json();
    },
    submit: async (data: {
      user_id: number,
      question_id: number,
      arm_id: number,
      session_id: number,
      answer: string
      current_representation: string
    }, token: string) => {
      const res = await fetch(`${API_BASE}/questions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },
  progress: {
    get: async (userId: number, token: string) => {
      const res = await fetch(`${API_BASE}/progress/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  },
  // 🔥 TAMBAHKAN INI:
  profile: {
    get: async (userId: number, token: string) => {
      const res = await fetch(`${API_BASE}/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Gagal mengambil profil');
      }
      return res.json();
    },
    update: async (userId: number, data: { name: string; school: string }, token: string) => {
      const res = await fetch(`${API_BASE}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Gagal memperbarui profil');
      }
      return res.json();
    }
  }
};