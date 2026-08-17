# ThesisFlow - Система за управление на дипломни работи

## Изисквания
- Node.js 20+
- PostgreSQL 15+
- pnpm

## Стартиране

### 1. Инсталирай зависимостите
pnpm install

### 2. Създай PostgreSQL база данни
createdb thesis_management
psql -U postgres -d thesis_management < database_dump.sql

### 3. Създай .env файл
cp artifacts/api-server/.env.example artifacts/api-server/.env
Попълни стойностите в .env файла.

### 4. Стартирай backend-а
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/thesis_management
export JWT_SECRET=thesis-secret-key-2024
export PORT=3000
pnpm --filter api-server dev

### 5. Стартирай frontend-а
pnpm --filter thesis-mgmt dev

Отвори браузъра на http://localhost:5173

## Тестови акаунти
- Администратор: admin@uni.bg
- Студент: itodorov@uni.bg