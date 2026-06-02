# AidDesk — Система управления заявками технической поддержки

AidDesk — веб-приложение класса **Help Desk** для приёма, обработки и отслеживания обращений пользователей в службу технической поддержки. Реализовано в виде full-stack приложения с разграничением прав доступа по ролям.

---

## Технологии

### Frontend
| Технология | Версия |
|---|---|
| React | 19 |
| TypeScript | 6.0 |
| Vite | 8.0 |
| React Router DOM | 7 |
| Axios | 1.16 |
| CSS Modules | — |
| React Hot Toast | 2.6 |

### Backend
| Технология | Версия |
|---|---|
| ASP.NET Core Web API | 9.0 |
| Entity Framework Core | — |
| PostgreSQL | — |
| JWT Bearer Auth | — |
| BCrypt.Net | — |
| Swagger / OpenAPI | — |

---

## Возможности

### Роли пользователей

| Роль | Возможности |
|---|---|
| **Client** | Создание заявок, просмотр своих обращений, публичные комментарии |
| **Support** | Обработка назначенных заявок, смена статуса, публичные и внутренние комментарии |
| **Manager** | Полное управление заявками, назначение исполнителей, приоритеты, управление пользователями |
| **Admin** | Все права менеджера + журнал аудита, полное управление ролями |

### Заявки (Tickets)
- Создание клиентом (заголовок + описание) или менеджером (с приоритетом, статусом, исполнителем)
- Статусы: `Waiting` → `In Progress` → `Done`
- Приоритеты: `Low`, `Medium`, `High`
- Назначение на сотрудника поддержки
- История изменений статуса
- Фильтрация и сортировка

### Комментарии
- **Публичные** — видны всем участникам заявки
- **Внутренние** — только для сотрудников (Support, Manager, Admin)

### Управление пользователями
- Просмотр, изменение роли и удаление (Manager / Admin)
- Защита от изменения собственной роли и превышения уровня прав

### Журнал аудита
- Полная история операций в системе (только Admin)
- Фиксация автора изменений, описания действия и связанной заявки

### Аутентификация
- Регистрация и вход по email и паролю
- JWT-токены с автоматическим редиректом при истечении сессии
- Защищённые маршруты с проверкой роли

---

## Структура проекта

```
.
├── aiddesk-frontend/            # React SPA
│   └── src/
│       ├── api/                 # Сервисы для работы с API
│       ├── components/ui/       # Переиспользуемые UI-компоненты
│       ├── context/             # AuthContext (глобальное состояние сессии)
│       ├── hooks/               # Кастомные хуки
│       ├── layouts/             # MainLayout, Header, Sidebar
│       ├── pages/               # Страницы приложения
│       ├── routes/              # ProtectedRoute
│       └── types/               # TypeScript-типы и DTO
│
└── AidDeskAPI/                  # ASP.NET Core Web API
    ├── AidDeskAPI/
    │   ├── API/                 # Фича-модули (Controllers + Services + DTO)
    │   │   ├── Auth/
    │   │   ├── Tickets/
    │   │   ├── Users/
    │   │   ├── Comments/
    │   │   ├── AuditLog/
    │   │   └── TicketHistory/
    │   └── Program.cs
    └── AidDeskDatabase_DataAccess_EF/
        ├── Entities/            # EF Core-сущности
        └── AidDeskDbContext.cs
```

---

## Запуск проекта

### Backend

1. Задайте переменные окружения:

```env
ConnectionStrings__DefaultConnection=Host=localhost;Database=aiddesk;Username=postgres;Password=your_password
Jwt__Key=your_secret_key_min_32_chars
Jwt__Issuer=AidDeskAPI
Jwt__Audience=AidDeskClient
```

2. Примените миграции и запустите:

```bash
cd AidDeskAPI/AidDeskAPI
dotnet ef database update
dotnet run
```

API будет доступен на `http://localhost:5122`.  
Swagger UI — `http://localhost:5122/swagger`.

---

### Frontend

1. Установите зависимости:

```bash
cd aiddesk-frontend
npm install
```

2. При необходимости создайте `.env` файл и переопределите адрес API:

```env
VITE_API_URL=http://localhost:5122
```

3. Запустите dev-сервер:

```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`.

---

## API — основные эндпоинты

### Auth
| Метод | Путь | Доступ |
|---|---|---|
| POST | `/api/auth/register` | Публичный |
| POST | `/api/auth/login` | Публичный |

### Tickets
| Метод | Путь | Доступ |
|---|---|---|
| GET | `/api/tickets` | Manager, Admin |
| GET | `/api/tickets/assigned` | Support |
| GET | `/api/tickets/my` | Любой авторизованный |
| GET | `/api/tickets/{id}` | Любой авторизованный |
| POST | `/api/tickets` | Client |
| POST | `/api/tickets/manager` | Manager, Admin |
| PATCH | `/api/tickets/{id}/status` | Support |
| PATCH | `/api/tickets/{id}/assign` | Manager, Admin |
| PUT | `/api/tickets` | Manager, Admin |
| DELETE | `/api/tickets` | Manager, Admin |

### Users
| Метод | Путь | Доступ |
|---|---|---|
| GET | `/api/users` | Support, Manager, Admin |
| GET | `/api/users/me` | Любой авторизованный |
| PUT | `/api/users/me` | Любой авторизованный |
| PUT | `/api/users/me/password` | Любой авторизованный |
| PUT | `/api/users/{id}/role` | Manager, Admin |
| DELETE | `/api/users/{id}` | Manager, Admin |

### Comments
| Метод | Путь | Доступ |
|---|---|---|
| GET | `/api/comments/{ticketId}` | Любой авторизованный |
| POST | `/api/comments/client` | Client |
| POST | `/api/comments/support` | Support, Manager, Admin |

### Audit Logs & History
| Метод | Путь | Доступ |
|---|---|---|
| GET | `/api/auditlogs` | Admin |
| GET | `/api/tickethistory/{ticketId}` | Любой авторизованный |

---

## База данных

PostgreSQL. Схема включает пять таблиц:

- **User** — пользователи системы
- **Ticket** — заявки
- **Comment** — комментарии к заявкам
- **TicketHistory** — история изменений статусов
- **AuditLog** — журнал аудита

---

## Автор

**Зайцев В.Д.**, группа 241-333  
Курсовой проект, 4 семестр
