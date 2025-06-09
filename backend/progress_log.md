# Campus Connect Backend - Progress Log (Windows Version)

**Date : 08-06-2025**

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

**Date : 10-06-2025**

## Folder Architecture Documentation

### Folder Descriptions for Campus Connect Backend

#### 1. models/
> Defines the database structure using SQLAlchemy ORM.
- Contains Python classes that represent database tables (e.g., User, Student, Professor).
- These models inherit from Base and map to tables using declarative syntax.
- Used by repositories and Alembic for database operations and migrations.

#### 2. schemas/
> Houses Pydantic models that define request and response shapes.
- These are used for data validation and serialization.
- Examples: UserCreate, UserLogin, UserResponse, Token.
- Ensures that incoming request bodies are validated and outgoing responses are well-structured.

#### 3. repositories/
> Responsible for raw database operations and queries.
- Each repository class contains logic to interact with models using SQLAlchemy.
- Promotes separation of concerns by isolating direct DB operations from business logic.
- Example methods: get_by_email(), create(), exists_by_email().

#### 4. services/
> Contains business logic and application-specific processing.
- Acts as an intermediary between routers and repositories.
- Handles tasks like user registration, password hashing, token generation, etc.
- Encourages reuse and clean layering of logic (e.g., AuthService, DocumentProcessingService).

#### 5. utils/
> Utility functions and helpers used across the application.
- Includes functions for authentication (create_access_token, verify_password, etc.).
- May also include date converters, file processors, or other reusable logic.
- Keeps your services and routes clean by offloading generic operations.

#### 6. routers/
> Contains route definitions and API endpoint handlers.
- Splits the API into modular route groups (e.g., /auth, /user).
- Uses FastAPI's APIRouter to keep routes organized.
- Responsible only for request handling and delegating work to services.

#### 7. main.py
> The entry point of the FastAPI application.
- Initializes the FastAPI app with title, description, and version.
- Registers routes using app.include_router().
- Handles startup/shutdown events if needed.

---