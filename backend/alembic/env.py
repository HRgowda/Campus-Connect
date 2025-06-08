import os
import sys
from logging.config import fileConfig

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool
from alembic import context

# Load environment variables from .env
load_dotenv()

# Add your app directory to sys.path (adjust if needed)
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

# Import your Base with models imported inside
from app.database import Base

# Alembic Config object, gives access to .ini file settings
config = context.config

# Set the database URL from environment or default
database_url = os.getenv("DATABASE_URL", "sqlite:///./campus_connect.db")
config.set_main_option("sqlalchemy.url", database_url)

# Setup logging config from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata for 'autogenerate'
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (no DB connection needed)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (with DB connection)."""
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = database_url

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
