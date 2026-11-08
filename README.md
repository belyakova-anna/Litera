# Litera

Личный читательский дневник: профиль, трекер частоты чтения, заметки к книгам.

## Стек

- **frontend** — React, TypeScript, Tailwind CSS, pnpm, Vite, nginx
- **backend** — FastAPI, SQLAlchemy, SQLite, uv

## Запуск в Docker

```bash
cp .env.example .env   # при желании поменяйте пароль и SESSION_SECRET
docker compose up --build
```

Откройте http://localhost:8080 — пароль по умолчанию: `litera`.

Данные SQLite хранятся в volume `litera-data`. Порт меняется через `LITERA_PORT` в `.env`.

Остановка:

```bash
docker compose down
```

## Локальная разработка (без Docker)

### Backend

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Откройте http://localhost:5173 — `/api` проксируется на backend.

Для стабильного автокомплита Google Books задайте `GOOGLE_BOOKS_API_KEY` в `backend/.env` или корневом `.env` (Docker).

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
