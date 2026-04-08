# Hibavonal backend

## To start the server

> Prerequisite: python3 installed

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app app run
```

## Database

The application uses **SQLite** by default via **SQLAlchemy** (Flask-SQLAlchemy). The database file is stored at `instance/hibavonal.db`.

To use a different database, set the `DATABASE_URL` environment variable before starting the server:

```bash
export DATABASE_URL="postgresql://user:password@localhost/hibavonal"
```

### Database structure

#### Enums

| Enum              | Values                                                  |
| ----------------- | ------------------------------------------------------- |
| `UserRole`        | `student`, `admin`, `maintainer`, `maintenance_manager` |
| `TicketStatus`    | `in_progress`, `done`                                   |
| `ToolOrderStatus` | `ordered`, `ready`                                      |

#### Tables

**room**

| Column    | Type        | Constraints |
| --------- | ----------- | ----------- |
| `room_id` | Integer     | PRIMARY KEY |
| `name`    | String(255) | NOT NULL    |
| `notes`   | String(255) | nullable    |

**user**

| Column          | Type           | Constraints                    |
| --------------- | -------------- | ------------------------------ |
| `user_id`       | Integer        | PRIMARY KEY                    |
| `room_id`       | Integer        | FK -> `room.room_id`, nullable |
| `username`      | String(255)    | UNIQUE, NOT NULL               |
| `email`         | String(255)    | UNIQUE, NOT NULL               |
| `password_hash` | String(255)    | NOT NULL                       |
| `role`          | Enum(UserRole) | NOT NULL                       |

**ticket_type**

| Column           | Type        | Constraints |
| ---------------- | ----------- | ----------- |
| `ticket_type_id` | Integer     | PRIMARY KEY |
| `name`           | String(255) | NOT NULL    |
| `details`        | String(255) | nullable    |

**tool**

| Column    | Type        | Constraints |
| --------- | ----------- | ----------- |
| `tool_id` | Integer     | PRIMARY KEY |
| `name`    | String(255) | NOT NULL    |

**ticket_type_tool** (junction table)

| Column           | Type    | Constraints                                      |
| ---------------- | ------- | ------------------------------------------------ |
| `ticket_type_id` | Integer | FK -> `ticket_type.ticket_type_id`, COMPOSITE PK |
| `tool_id`        | Integer | FK -> `tool.tool_id`, COMPOSITE PK               |

**tool_order**

| Column          | Type                  | Constraints                    |
| --------------- | --------------------- | ------------------------------ |
| `tool_order_id` | Integer               | PRIMARY KEY                    |
| `tool_id`       | Integer               | FK -> `tool.tool_id`, NOT NULL |
| `name`          | String(255)           | NOT NULL                       |
| `details`       | String(255)           | nullable                       |
| `status`        | Enum(ToolOrderStatus) | NOT NULL                       |

**ticket**

| Column           | Type               | Constraints                                  |
| ---------------- | ------------------ | -------------------------------------------- |
| `ticket_id`      | Integer            | PRIMARY KEY                                  |
| `room_id`        | Integer            | FK -> `room.room_id`, NOT NULL               |
| `student_id`     | Integer            | FK -> `user.user_id`, NOT NULL               |
| `maintainer_id`  | Integer            | FK -> `user.user_id`, NOT NULL               |
| `ticket_type_id` | Integer            | FK -> `ticket_type.ticket_type_id`, NOT NULL |
| `details`        | String(255)        | NOT NULL                                     |
| `status`         | Enum(TicketStatus) | NOT NULL                                     |
| `priority`       | Integer            | NOT NULL, CHECK (0-5)                        |

**student_feedback**

| Column                | Type        | Constraints                                |
| --------------------- | ----------- | ------------------------------------------ |
| `student_feedback_id` | Integer     | PRIMARY KEY                                |
| `ticket_id`           | Integer     | FK -> `ticket.ticket_id`, UNIQUE, NOT NULL |
| `details`             | String(255) | NOT NULL                                   |

#### Relationships

```
room 1──* user
room 1──* ticket
user 1──* ticket (as student)
user 1──* ticket (as maintainer)
ticket_type 1──* ticket
ticket_type *──* tool (via ticket_type_tool)
tool 1──* tool_order
ticket 1──1 student_feedback
```

## Database migrations

Migrations are managed by **Alembic** via **Flask-Migrate**.

### Common commands

```bash
# Initialize migrations (already done)
flask db init

# Generate a new migration after model changes
flask db migrate -m "description of changes"

# Apply pending migrations
flask db upgrade

# Roll back the last migration
flask db downgrade
```

### Migration history

| Revision       | Description                           |
| -------------- | ------------------------------------- |
| `bff3546daeb7` | Initialize migration setup (empty)    |
| `bb344d3633ce` | Create database schema (all 8 tables) |

Migration files are stored in `migrations/versions/`.
