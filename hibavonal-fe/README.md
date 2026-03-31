# HibaVonal frontend

## To start the dev server:

> Prerequisite: node lts is installed

> npm install  
> npm run dev

# Hibavonal Backend API

Flask alapú hibajegy-kezelő végpont implementációja.

## Funkcionalitás
- **Végpont:** `POST /tickets/create`
- **Auth:** RBAC (Role-Based Access Control) – Engedélyezett: `student`, `admin`.
- **Validálás:** Kötelező JSON mezők: `title`, `description`.
- **Státuszkódok:** 201 (Created), 400 (Bad Request), 403 (Forbidden), 500 (Internal Server Error).

## Telepítés, Futtatás & Tesztelés
```bash
pip install -r requirements.txt
python app.py
http://localhost:5000/apidocs/
