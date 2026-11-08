import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { api } from './api/client'
import { Layout } from './components/Layout'
import { BookDetailPage } from './pages/BookDetailPage'
import { BookNewPage } from './pages/BookNewPage'
import { BooksPage } from './pages/BooksPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  const [auth, setAuth] = useState<boolean | null>(null)

  useEffect(() => {
    api
      .me()
      .then((r) => setAuth(r.authenticated))
      .catch(() => setAuth(false))
  }, [])

  if (auth === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-hand text-3xl text-navy">✦ Litera открывается…</p>
      </div>
    )
  }

  if (!auth) {
    return <LoginPage onSuccess={() => setAuth(true)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={() => setAuth(false)} />}>
          <Route index element={<ProfilePage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="books/new" element={<BookNewPage />} />
          <Route path="books/:id" element={<BookDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
