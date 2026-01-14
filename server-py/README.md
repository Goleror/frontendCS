# NewArch Python Backend

Современный Python бэкэнд на FastAPI с поддержкой PostgreSQL.

## Требования

- Python 3.10+
- PostgreSQL 12+

## Установка

1. **Установите зависимости**
```bash
pip install -r requirements.txt
```

2. **Создайте файл `.env`**
```bash
cp .env.example .env
```

3. **Отредактируйте `.env` с вашими данными**
```
DATABASE_URL=postgresql://username:password@localhost:5432/newarch
```

4. **Создайте базу данных PostgreSQL**
```sql
CREATE DATABASE newarch;
```

## Запуск

```bash
python main.py
```

Сервер будет доступен по адресу `http://localhost:8000`

### API Документация
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Структура проекта

```
server-py/
├── app/
│   ├── models/          # SQLAlchemy модели
│   ├── routes/          # API маршруты
│   ├── schemas/         # Pydantic схемы
│   ├── config.py        # Конфигурация
│   ├── database.py      # Настройка БД
│   └── __init__.py
├── main.py              # Точка входа приложения
├── requirements.txt     # Зависимости
├── .env.example         # Пример переменных окружения
└── README.md
```

## API Endpoints

### Users
- `GET /api/users` - Получить всех пользователей
- `GET /api/users/{user_id}` - Получить пользователя по ID
- `POST /api/users` - Создать нового пользователя
- `PUT /api/users/{user_id}` - Обновить пользователя
- `DELETE /api/users/{user_id}` - Удалить пользователя

## TODO

- [ ] Реализовать хеширование пароля (bcrypt)
- [ ] Добавить аутентификацию (JWT)
- [ ] Добавить валидацию данных
- [ ] Написать тесты
- [ ] Добавить миграции Alembic

## Разработка

### Активировать виртуальное окружение

```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### Запустить с автоперезагрузкой

```bash
python main.py
```
