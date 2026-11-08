import type {
  Book,
  BookCreate,
  BookListItem,
  GoogleBookSuggestion,
  NoteSection,
  Profile,
  ReadingActivity,
  ReadingDay,
} from './types'

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { detail: text }
    }
  }

  if (!response.ok) {
    const detail =
      typeof data === 'object' && data && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : response.statusText
    throw new ApiError(response.status, detail)
  }

  return data as T
}

export const api = {
  me: () => request<{ authenticated: boolean }>('/api/auth/me'),
  login: (password: string) =>
    request<{ authenticated: boolean }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  logout: () =>
    request<{ authenticated: boolean }>('/api/auth/logout', { method: 'POST' }),

  getProfile: () => request<Profile>('/api/profile'),
  updateProfile: (body: Partial<Profile>) =>
    request<Profile>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  listBooks: () => request<BookListItem[]>('/api/books'),
  getBook: (id: string) => request<Book>(`/api/books/${id}`),
  createBook: (body: BookCreate) =>
    request<Book>('/api/books', { method: 'POST', body: JSON.stringify(body) }),
  updateBook: (id: string, body: Partial<BookCreate>) =>
    request<Book>(`/api/books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteBook: (id: string) =>
    request<void>(`/api/books/${id}`, { method: 'DELETE' }),

  saveNotes: (id: string, sections: Omit<NoteSection, 'id'>[] | NoteSection[]) =>
    request<NoteSection[]>(`/api/books/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ sections }),
    }),

  markToday: (bookId: string) =>
    request<ReadingDay>(`/api/books/${bookId}/reading-days/today`, {
      method: 'POST',
    }),
  addReadingDay: (bookId: string, day?: string) =>
    request<ReadingDay>(`/api/books/${bookId}/reading-days`, {
      method: 'POST',
      body: JSON.stringify({ day: day ?? null }),
    }),
  readingActivity: (year?: number) =>
    request<ReadingActivity>(
      `/api/reading-activity${year ? `?year=${year}` : ''}`,
    ),

  googleBooks: (q: string) =>
    request<GoogleBookSuggestion[]>(
      `/api/google-books?q=${encodeURIComponent(q)}`,
    ),
}

export { ApiError }
