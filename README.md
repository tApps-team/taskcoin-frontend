# TaskCoin — Frontend (React + Vite)

Один React-проект с двумя разделами:
- **`/app/*`** — кабинет пользователя (тёмная тема в стиле AdCoin, mobile-first)
- **`/admin/*`** — CRM администратора (отдельный layout, доступ только `super_admin`)

## Стек
- React 18/19 + Vite + TypeScript (strict)
- React Router, **Redux Toolkit + RTK Query** (все запросы к API)
- **shadcn/ui** (Radix UI + TailwindCSS) — библиотека компонентов, иконки **lucide-react**
- TipTap (rich-text задания), react-i18next (RU, i18n-ready)
- Архитектура — **Feature-Sliced Design (FSD)**

## Архитектура (Feature-Sliced Design)
Код разбит на слои `src/{app,pages,widgets,features,entities,shared}`; импорт
разрешён только «вниз» (app → pages → widgets → features → entities → shared),
у каждого слайса есть публичный API (`index.ts`). Все импорты — по алиасу `@/…`.

```
app/        providers (store, i18n, router), App.tsx, styles/index.css
pages/      login, tasks, task-details, active, history, withdraw, profile,
            admin-{login,dashboard,users,tasks,task-details,submissions,withdrawals,settings}
widgets/    app-layout, admin-layout
features/   auth (guards), task-work, review-submission, manage-tasks,
            manage-users, create-withdrawal
entities/   session, user, task, submission, withdrawal, category, app-settings
            (каждая — model + api через baseApi.injectEndpoints + ui)
shared/     ui (shadcn-кит), api (baseApi + reauth + DTO-типы), lib, i18n
```
RTK Query собран из одного `shared/api/baseApi` — эндпоинты «инжектятся» в каждой
entity (`injectEndpoints`). Сессия (`entities/session`) хранит slice и селекторы;
`baseApi` при 401 обновляет токен и, если не вышло, шлёт `session/loggedOut`.

### UI-тема — «liquid glass» (тёмное стекло)
Дизайн в стиле frosted-glass: полупрозрачные размытые поверхности (`.glass` /
`.glass-soft`), фиолетово-неоновый `--primary`, бирюзовый акцент `--accent`,
амбиентные градиентные свечения на фоне. Всё задано CSS-переменными shadcn в
`src/app/styles/index.css` + брендовые токены `brand.violet` / `brand.teal` в
`tailwind.config.js`. shadcn-компоненты (в `src/shared/ui`) застеклованы: Card,
Dialog, Select, Input, Table, Tabs, Button (градиент + свечение).
Совет по перфомансу: тяжёлый `backdrop-blur` — только на крупных поверхностях;
списки используют более лёгкое `.glass-soft`.
Добавить новый shadcn-компонент: `npx shadcn@latest add <name>` (пишет в `src/shared/ui`).

## Быстрый старт

Нужен запущенный backend (см. `../backend/README.md`) на `http://localhost:8000`.

```bash
cd frontend
npm install
cp .env.example .env     # можно оставить пустым — используется прокси
npm run dev              # http://localhost:5173
```

Vite проксирует `/api` и `/uploads` на backend (`:8000`), поэтому CORS в разработке
не мешает и картинки/скриншоты доступны по относительным путям.

Сборка продакшена: `npm run build` (прогоняет `tsc` в strict-режиме).

## Вход
- **Пользователь (dev):** на `/login` выберите тестового пользователя
  (`user1@taskcoin.local` и т.д.) — вход без Google.
- **Google (позже):** кнопка на `/login` — заглушка. Когда включите Google
  (см. ниже), она заменяется на реальную GIS-кнопку, вызывающую `POST /api/auth/google`.
- **Админ:** `/admin/login` — `admin@taskcoin.local` / `admin12345`.

## Страницы
Кабинет: список заданий (фильтр/сортировка/поиск), детали задания (взять в работу,
таймер обратного отсчёта, загрузка до 5 скриншотов, отправка), активные задания
(поллинг 30с), история, вывод средств, профиль.

CRM: дашборд, пользователи (CRUD, блокировка, корректировка баланса), задания
(CRUD с редактором TipTap, смена статуса), детали задания с вкладкой «Отклики»
(лайтбокс скриншотов, approve/reject), очередь проверки, заявки на вывод, настройки.

## Переменные окружения (`.env`)
- `VITE_API_URL` — база API. Пусто = использовать dev-прокси (`/api`).
  Для обхода прокси укажите `http://localhost:8000/api`.
- `VITE_GOOGLE_CLIENT_ID` — client id для будущего Google-входа.
- `VITE_DEV_FAKE_AUTH` — показывать dev-селектор входа.

## Включение Google-входа позже (шаги Google Cloud Console)
1. https://console.cloud.google.com → APIs & Services → Credentials.
2. Create Credentials → **OAuth client ID** → Application type: **Web application**.
3. **Authorized JavaScript origins:** `http://localhost:5173`.
   **Authorized redirect URIs:** `http://localhost:5173`.
4. Скопируйте Client ID в `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`) и в
   `backend/.env` (`GOOGLE_CLIENT_ID`).
5. На фронте подключите Google Identity Services (GIS) кнопку, получите `id_token`
   и отправьте в `POST /api/auth/google`. Backend уже готов его проверять.

## Архитектура API-слоя
`src/api/api.ts` — единый RTK Query slice со всеми эндпоинтами и тегами
инвалидации. `baseQueryWithReauth` автоматически обновляет access-токен по
refresh при 401. Токены — в `localStorage` (проект локальный, упрощение допустимо).
