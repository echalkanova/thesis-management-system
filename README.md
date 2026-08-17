# ThesisFlow - Система за управление на дипломни работи

## Изисквания
- Node.js 20+
- PostgreSQL 15+
- pnpm

## Стартиране

### 1. Клонирай репото
git clone https://github.com/echalkanova/thesis-management-system.git
cd thesis-management-system

### 2. Инсталирай зависимостите
pnpm install

### 3. Създай PostgreSQL база данни
createdb thesis_management
psql -U postgres -d thesis_management < database_dump.sql

### 4. Създай .env файл
cp artifacts/api-server/.env.example artifacts/api-server/.env
Попълни стойностите в .env файла:
- DATABASE_URL=postgresql://postgres:postgres@localhost:5432/thesis_management
- JWT_SECRET=thesis-secret-key-2024
- PORT=3000
- GMAIL_USER=your-email@gmail.com
- GMAIL_PASS=your-app-password
- APP_URL=http://localhost:5173

### 5. Стартирай backend-а (Терминал 1)
cd artifacts/api-server
pnpm dev

### 6. Стартирай frontend-а (Терминал 2)
cd artifacts/thesis-mgmt
pnpm dev

Отвори браузъра на http://localhost:5173

## Роли в системата
- Администратор - управлява потребителите и системата
- Студент - подава и следи дипломната си работа
- Научен ръководител - одобрява и ръководи дипломни работи
- Рецензент - пише рецензии на дипломни работи
- Ръководител-катедра - допуска студенти до защита

## Тестови акаунти
- Администратор: admin@uni.bg / admin123
- Студент: itodorov@uni.bg
- Научен ръководител: givanov@uni.bg
- Рецензент: masenova@uni.bg

## Факултети и катедри
- ФКСТ: Компютърни системи, Програмиране и компютърни технологии, Киберсигурност, Интелигентни технологии в индустрията
- ФЕТТ: Електронна техника, Микроелектроника, Силова електроника
- ФТК: Радиокомуникации и видеотехнологии, Телекомуникационни мрежи
- ФТ: Двигатели автомобилна техника и транспорт, Въздушен транспорт, Железопътна техника и технологии