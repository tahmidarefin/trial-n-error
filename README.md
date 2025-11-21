# TrialNError - An Online Examination Management System
TrialNError is a smart online examination management system, focuses on creating and managing various online tests for educators and recruiters. It is also built with modern technologies, with API & UI efficiency to make user interaction comfortable and intuitive.

## Tech Stack
The project is built with following technologies:
- **Frontend**: React.js, Vite
- **Backend**: FastAPI, Python
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Package Manager**: uv, npm

## Prerequisites
Make sure, you have installed the following:
- uv [install](https://docs.astral.sh/uv/getting-started/installation/)
- npm [install](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- PostgreSQL [install](https://www.postgresql.org/download/)

## Getting Started
1. **Clone the repository**
```
git clone git@github.com:tahmidarefin/trial-n-error.git
cd trial-n-error
```
2. **Install dependcies**

Frontend:
```
cd frontend
npm install
```
Backend:
```
cd backend
uv sync
```
3. **Setup environment variables**

Navgiate to `trial-n-error/backend` and copy `.env.example` file to a new file name `.env`
```
cp apps/api/.env.example apps/api/.env
```
Update the `.env` file with your PostgreSQL database credentials and JWT Authentication SECRET KEY

4. **Start backend server**

The application can be served using follow commands
```
# Serve the backend API from ./backend directory
uv run main.py

# Serve the frontend from ./fontend directory
npm run build && npm run preview
```

5. **Access the application**

The frontend will be available at `http://localhost:5173` and the backend will be available at `http://localhost:8000`.

## Running tests

## Deployment
