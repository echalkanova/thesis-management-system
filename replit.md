# Система за управление на дипломни работи (TMS)

Уеб базирана система за управление на дипломни работи за университет — следи дипломни работи, защити, рецензии и оценки с ролево базиран достъп.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — стартиране на API сървъра (порт 5000)
- `pnpm --filter @workspace/thesis-mgmt run dev` — стартиране на frontend (порт от env)
- `pnpm run typecheck` — пълна проверка на типовете
- `pnpm run build` — typecheck + build на всички пакети
- `pnpm --filter @workspace/api-spec run codegen` — регенериране на API hooks и Zod схеми от OpenAPI спецификацията
- `pnpm --filter @workspace/db run push` — прилагане на DB схема (само за разработка)
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite, TailwindCSS, shadcn/ui, Recharts, wouter, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (от OpenAPI спецификация)
- Auth: custom HMAC-SHA256 JWT (Bearer token в localStorage)
- Build: esbuild (CJS bundle за API)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI спецификация (source of truth за API контракта)
- `lib/db/src/schema.ts` — Drizzle ORM схема (source of truth за DB)
- `lib/api-client-react/src/generated/` — генерирани hooks и Zod схеми (не редактирай ръчно)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/thesis-mgmt/src/pages/` — React pages/screens
- `artifacts/thesis-mgmt/src/components/` — UI компоненти (shadcn/ui базирани)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks + Zod schemas
- JWT Bearer token in localStorage (не session cookies) за да работи правилно с Vite proxy
- Role-based access control на ниво route (frontend) и middleware (backend)
- Drizzle ORM без миграции в dev — `db push` директно актуализира схемата
- Recharts за charts в Reports страницата — вече е в dependencies

## Product

Системата поддържа 5 роли: **студент**, **научен ръководител**, **рецензент**, **член на комисия**, **администратор**.

Ключови функции:
- Автентикация и регистрация с ролево базиран достъп
- CRUD за дипломни работи с подача, статус tracking и файлови прикачки
- Назначаване на научни ръководители и рецензенти
- График за защити с управление на комисии
- Рецензии с препоръка (одобрявам / не одобрявам / корекции)
- Оценяване от членове на комисия
- Известия (notifications)
- Табло с обобщена статистика
- Справки и отчети с графики (само за admin/supervisor)

## Seed данни (dev)

- `admin@uni.bg` / `admin123` → Администратор
- `supervisor@uni.bg` / `supervisor123` → Научен ръководител
- `reviewer@uni.bg` / `reviewer123` → Рецензент
- `student1@uni.bg` / `student123` → Студент
- `student2@uni.bg` / `student123` → Студент

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `pnpm run typecheck:libs` трябва да се пусне след промяна на lib пакет
- Не редактирай файлове в `lib/api-client-react/src/generated/` — те са автогенерирани
- `setAuthTokenGetter` трябва да се вика при mount на AuthProvider
- `RegisterInputRole` type се импортва от `@workspace/api-client-react`, не от пътя до generated файла
- `useMarkAllNotificationsRead` мутацията приема `undefined` (не `{}`) като аргумент

## Pointers

- Виж `pnpm-workspace` skill за workspace структура, TypeScript setup, и детайли за пакети
