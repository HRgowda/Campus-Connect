# Campus Connect Backend - Progress Log (Windows Version) 

** Date : 08-06-2025

## Project Initialization

1. **Installed Poetry:**
   ```powershell
   (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
   ```

2. **Verified Poetry installation:**
   ```bash
   poetry --version
   ```

3. **Created a new backend project folder:**
   ```bash
   mkdir backend
   cd backend
   ```

4. **Initialized a new Poetry project:**
   ```bash
   poetry init
   ```
   *(Follow prompts to set project config)*

5. **Installed required dependencies:**
   ```bash
   poetry add fastapi uvicorn sqlalchemy alembic python-dotenv
   ```

6. **Created and activated virtual environment:**
   ```bash
   a. poetry env activate

   b. C:\Users\Hemanth\AppData\Local\pypoetry\Cache\virtualenvs\backend-env-5iVuOTuH-py3.12\Scripts\activate.bat
   ```

7. **(Optional) Set Python version explicitly if needed:**
   ```bash
   poetry env use python
   ```

## Folder Structure Created

```
backend\
├── app\
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   └── models\
│       ├── __init__.py
│       └── user.py
├── alembic\
│   ├── versions\
│   └── env.py (modified)
├── alembic.ini (updated with DB URL)
├── .env
└── campus_connect.db (SQLite DB)
```

## Environment Configuration

- **Created `.env` file with:**
  ```
  DATABASE_URL=sqlite:///./campus_connect.db
  ```

- **Setup `app\database.py`:**
  - Created SQLAlchemy engine using `DATABASE_URL`
  - Configured session with `SessionLocal`
  - Defined Base class using `DeclarativeBase`
  - Created `get_db()` dependency for FastAPI

## Models

- **Created `app\models\user.py`:**
  - Defined two models: `Student` and `Professor`
  - Both models inherit from `Base`

## Alembic Setup

1. **Initialized Alembic:**
   ```bash
   alembic init alembic
   ```

2. **Updated `alembic.ini`:**
   - Changed DB URL section to use:
     ```
     sqlalchemy.url = sqlite:///./campus_connect.db
     ```

3. **Modified `alembic\env.py`:**
   - Used `load_dotenv()` to load `.env`
   - Appended root path with:
     ```python
     sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
     ```
   - Imported Base and models:
     ```python
     from app.database import Base
     from app.models import user
     ```

4. **Created first migration:**
   ```bash
   alembic revision --autogenerate -m "Initial migration student and professor model"
   ```

5. **Applied migration to create tables:**
   ```bash
   alembic upgrade head
   ```

## Running the Server

- **In `app\main.py`:**
  - Created FastAPI app with title, description, version
  - Added root endpoint `/`
  - Included:
    ```python
    models.Base.metadata.create_all(bind=engine)
    ```

- **To start server:**
  ```bash
  poetry run uvicorn app.main:app --reload
  ```

## Verifying Database

- Used SQLite extension in VSCode to open: `campus_connect.db`
- Confirmed `students` and `professors` tables were created

---
