FBStocks

FBStocks is a stock management tool that allows users to manage their favorite stocks and visualize price movements through an intuitive heatmap. The project is developed using Node.js and MariaDB, with plans for future expansion to include Android applications.

Features

Google Login: Authenticate users via Google OAuth 2.0.

Favorite Stock Management: Add, delete, and list favorite stocks (Japanese stocks with 4-digit tickers).

Heatmap Visualization: Display stock price movements on a heatmap.

Sample Heatmap: Provide sample data for non-logged-in users.

RESTful API: JSON-based data input/output.

Prerequisites

Server Environment

OS: Rocky Linux 9.3

Web Server: Apache (ProxyPass and ProxyPassReverse for API proxying)

Database: MariaDB 10.5.22

Node.js: v16 or higher

Docker (optional): For containerized deployment

Dependencies

Google OAuth credentials (Client ID and Secret)

HTTPS enabled with Let’s Encrypt

Project Setup

Clone the Repository

git clone https://github.com/your-repo/fbstocks.git
cd fbstocks/backend

Install Dependencies

npm install

Configure Environment Variables

Create a .env file in the backend/ directory with the following content:

DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=fbstocks
DATABASE_HOST=localhost
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

Database Setup

Schema Initialization

Run the following command to create the database schema:

mysql -uroot -p fbstocks < db/schema.sql

Seed Master Data

Run the following command to populate the favorite_samples table with sample data:

mysql -uroot -p fbstocks < db/seeds.sql

Start the Server

node server.js

Docker Deployment (Optional)

To deploy using Docker, use the docker-compose.yml file provided:

docker-compose up -d

API Endpoints

Authentication

GET /api/auth/google: Start Google login authentication.

Favorite Management

POST /api/favorites/add: Add a favorite stock.

POST /api/favorites/remove: Remove a favorite stock.

GET /api/favorites/list: Retrieve the list of favorite stocks.

Heatmap

GET /api/heatmap/data: Get heatmap data for the logged-in user.

GET /api/heatmap/sample: Get sample heatmap data.

Utility

GET /api/hello: Health check endpoint.

Directory Structure

fbstocks/
├── backend/             # Node.js backend code
├── db/                 # Database-related files
│   ├── schema.sql   # Schema definition
│   └── seeds.sql    # Seed data
├── public/             # Frontend static files
├── .env.example        # Example environment file
├── README.md          # Project documentation

Future Enhancements

Implement an Android application for mobile users.

Add features for detailed stock analysis.

Improve database performance with scaling and optimization.

Implement API versioning for seamless updates.

License

MIT License

Feel free to modify and expand this README as the project evolves.
