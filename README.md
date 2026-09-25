# ShopNest

A full-stack e-commerce platform built with React, Redux Toolkit, Django REST Framework, and PostgreSQL/SQLite.

## Architecture

- **Frontend:** React, Vite, Redux Toolkit, React Router, Tailwind CSS
- **Backend:** Django, Django REST Framework, SimpleJWT, django-filter
- **Database:** PostgreSQL for production, SQLite for development
- **API:** REST API with Swagger/OpenAPI documentation

## Features

- User authentication
- Product catalog and categories
- Cart and wishlist
- Orders
- Reviews
- Coupons
- Payment integration
- Admin interface
- API documentation

## Local Development

### Backend

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Configuration

Create a local `.env` file from the project's example configuration. Keep secrets, payment keys, JWT secrets, and database credentials out of Git.

## Testing

```bash
cd backend
python manage.py test
```

## Project Goal

Demonstrate production-style full-stack development, REST API design, authentication, state management, database integration, and deployment readiness.
