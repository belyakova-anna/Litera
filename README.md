# Litera

Личный читательский дневник: профиль, трекер частоты чтения, заметки к книгам.

## Стек

- **frontend** — React, TypeScript, Tailwind CSS, pnpm, Vite
- **backend** — FastAPI, SQLAlchemy, SQLite, uv

## Запуск

### Backend

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

Пароль по умолчанию: `litera` (см. `backend/.env` или `backend/.env.example`).

Для стабильного автокомплита Google Books можно задать `GOOGLE_BOOKS_API_KEY` в `backend/.env` (без ключа API иногда отвечает 429).

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Откройте http://localhost:5173 — запросы `/api` проксируются на backend.

## Возможности

- Профиль: любимый жанр, книга, персонаж
- Тепловая карта чтения (как вклад на GitHub) — дни отмечаются вручную кнопкой «Читаю сегодня»
- Список книг с автокомплитом Google Books
- Markdown-заметки с необязательными подсказками секций

## На будущее

Зарезервированы контракты и endpoints (пока 501):

- `GET /api/search` — поиск по заметкам
- `GET /api/recommend` — рекомендации книг
- `POST /api/rag/ask` — RAG по дневнику

См. `backend/app/services/{search,recommend,rag}.py`.
