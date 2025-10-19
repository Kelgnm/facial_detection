# Facial Detection Login Website

This project is a facial detection web application that allows users to register and log in using their camera.  
User data and facial embeddings are stored securely in a PostgreSQL database with two-factor authentication for added security.

---

## Features
- Face-based user registration and login
- Facial embeddings stored in PostgreSQL
- Two-factor authentication
- Built with Python (backend) and Next.js (frontend)

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   pip install -r requirements.txt
## Set up PostgreSQL and update your database login credentials in the python files.

2. In Python files you will find this
    ```bash
    connect = "dbname=[dbname] user=[user] password=[password] host=[localhost] port=[5432]"

## Start the frontend:
    ``` bash
    cd react_frontend
    npm install
    npm run start
