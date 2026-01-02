# LabManager: Full-Stack Laboratory Resource Management System

## Project Overview

LabManager is a **full-stack web application** developed to **centralize and optimize** the management of laboratory assets, including materials, equipment, and maintenance workflows. This project was **architected** to replace fragmented, manual processes (e.g., spreadsheets) with a unified, data-driven platform. The core value proposition is to **mitigate operational risks** associated with expired materials and equipment downtime, thereby **enhancing compliance** and laboratory efficiency. The system **implements** a clear separation of concerns, utilizing a modern RESTful API to ensure scalability and maintainability.

## Key Features

*   **Comprehensive Asset Lifecycle Management**: **Implemented** robust CRUD operations for both consumable materials and capital equipment, tracking their entire lifecycle from acquisition to disposal.
*   **Proactive Inventory Control**: **Engineered** a system for real-time stock level monitoring, **triggering** alerts for low stock and materials nearing expiration (`validade < CURDATE()`).
*   **Structured Maintenance Workflow**: **Developed** a dedicated module to schedule, log, and track preventive and corrective maintenance, **linking** maintenance history directly to specific equipment IDs.
*   **Secure Binary Data Handling**: **Integrated** functionality to upload and retrieve critical documents (e.g., Safety Data Sheets - FISPQ), **persisting** them as BLOBs within the database for simplified data integrity and backup.
*   **Decoupled Communication Service**: **Orchestrated** an automated email service using Python's `smtplib` to dispatch material requests to suppliers, **improving** procurement cycle times.
*   **Business Intelligence Dashboard**: **Provided** a dashboard that **aggregates** key operational metrics, such as total inventory valuation and material statistics, with a CSV export feature for external analysis.

## Tech Stack

The application is built on a modern, decoupled architecture, utilizing a robust set of technologies across the entire stack.

| Category | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **React 19** (Vite) | **Chosen** for its component-based model, facilitating modular development and high reusability. Vite **optimized** the development and build process. |
| | **React Router DOM v7** | **Employed** for efficient, declarative client-side routing, **delivering** a smooth Single Page Application (SPA) experience. |
| | **Custom CSS/SCSS** | **Prioritized** custom styling over heavy frameworks to **maintain** a lightweight bundle size and **ensure** full control over the design system. |
| **Backend** | **Python 3.x** / **Flask** | **Selected** Flask for its minimal overhead, allowing for rapid development of a high-performance, resource-oriented REST API. |
| | **Flask-CORS** | **Configured** to manage cross-origin requests, **enforcing** security policies between the decoupled frontend and backend. |
| **Persistence** | **MySQL** | **Utilized** for its transactional integrity and mature relational model, which is ideal for structured inventory and maintenance data. |
| **Utilities** | **python-dotenv** | **Implemented** for secure management of environment-specific configurations (e.g., database credentials), **adhering** to the 12-Factor App principles. |

## Architecture & Design: The Layered Approach

The system **adheres** to a **Layered Architecture** pattern, ensuring a clear separation of concerns and promoting modularity, which is crucial for future feature expansion and maintenance.

1.  **Presentation Layer (React SPA)**: Focuses on the UI/UX. It **consumes** the REST API and manages the application state using React Hooks.
2.  **Business Logic Layer (Flask Endpoints)**: **Encapsulates** the core business rules, such as stock validation (`estoque_atual > estoque_minimo`) and maintenance scheduling logic. This layer **delegates** data access to the Persistence Layer.
3.  **Persistence Layer (MySQL Connector)**: **Handles** all database interactions, including connection pooling (via `db.py`) and executing parameterized SQL queries to **prevent** SQL injection vulnerabilities.

This design **facilitates** independent development and testing of each layer, **improving** the overall stability and testability of the application.

## Technical Challenges & Solutions (Crucial for Recruiters)

The development process **involved** overcoming specific technical challenges, demonstrating a practical understanding of system design and optimization.

| Technical Challenge | Solution Implemented | Mid-Level Rationale & Impact |
| :--- | :--- | :--- |
| **Managing Binary Data within a Relational Model** | **Engineered** the backend to handle `multipart/form-data` for file uploads and **persisted** the raw PDF bytes as a BLOB in the MySQL database. Downloads are **orchestrated** by streaming the data via `io.BytesIO` and Flask's `send_file`. | **Rationale**: While cloud storage (S3) is the long-term goal, this approach was **chosen** to **enforce** transactional consistency—ensuring the document is created/deleted atomically with the material record—and **simplify** the initial deployment and backup strategy. |
| **Optimizing Data Retrieval for Dashboard KPIs** | **Implemented** strategic database indexing on frequently queried columns (`status`, `validade`, `categoria`) and **refactored** complex queries (e.g., total inventory value calculation) to be executed directly on the database server. | **Rationale**: This decision **minimized** data transfer overhead and **offloaded** computational complexity from the application server to the database engine, **significantly reducing** latency for key dashboard metrics and **improving** the user experience. |
| **Decoupling Email Functionality** | **Separated** the email logic into a dedicated `enviar_email` function in `Backend.py` and **utilized** the `email_config.py` module for configuration. | **Rationale**: This **adheres** to the **Single Responsibility Principle (SRP)**, making the email service easily replaceable (e.g., migrating from `smtplib` to a dedicated service like SendGrid or Mailgun) without affecting the core business logic of the application. |

## Installation & Usage

To set up and run the LabManager system locally, follow these steps.

### Prerequisites

*   Python 3.x
*   Node.js & npm (or yarn/pnpm)
*   MySQL Server

### Backend Setup (Python/Flask)

1.  **Navigate** to the backend directory:
    ```bash
    cd Projeto/backend
    ```
2.  **Install** Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: A `requirements.txt` file is assumed; if not present, install `Flask`, `flask-cors`, `mysql-connector-python`, `python-dotenv`, `smtplib`, `Pillow`.)*
3.  **Configure** Database:
    *   Create a MySQL database named `inventario`.
    *   **Execute** the schema file to create tables:
        ```bash
        mysql -u [user] -p inventario < ../Database/equipamentos_schema.sql
        ```
    *   **Create** a `.env` file in the `backend` directory with your database credentials:
        ```
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_password
        DB_NAME=inventario
        ```
4.  **Run** the Flask server:
    ```bash
    python Backend.py
    ```

### Frontend Setup (React/Vite)

1.  **Navigate** to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  **Install** Node.js dependencies:
    ```bash
    npm install
    ```
3.  **Run** the development server:
    ```bash
    npm run dev
    ```
The application will be accessible at `http://localhost:5173` (or similar port).

## Future Improvements

The following roadmap outlines features for **scaling** and **hardening** the application:

*   **Security Hardening**: **Implement** JWT (JSON Web Tokens) for stateless authentication and **migrate** password storage to a secure hashing algorithm (e.g., bcrypt) to **adhere** to modern security standards.
*   **Cloud Migration for Assets**: **Refactor** the document storage module to **integrate** with AWS S3 or a similar object storage service, **decoupling** binary data from the relational database for improved performance and scalability.
*   **Containerization & CI/CD**: **Develop** Docker and Docker Compose configurations to **standardize** the deployment environment. **Establish** a basic CI/CD pipeline to **automate** testing and deployment processes.
*   **Comprehensive Testing**: **Develop** a full suite of unit and integration tests using Pytest for the Flask API and Vitest/React Testing Library for the frontend to **enforce** code quality and prevent regressions.

## Contact

| Platform | Placeholder |
| :--- | :--- |
| **LinkedIn** | [Your LinkedIn Profile URL] |
| **Email** | [Your Professional Email Address] |
| **Portfolio** | [Your Personal Portfolio/Website URL] |
