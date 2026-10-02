# Auth Service

The auth API stores account records in the existing PostgreSQL `tododb` database. Passwords are bcrypt-hashed and successful signup/login responses contain an eight-hour JWT.

## Local setup

1. Install dependencies with `npm ci` and copy `.env.example` to `.env`.
2. Start a PostgreSQL port-forward to the Minikube database in another terminal:

   ```sh
   kubectl port-forward -n raju svc/raju-stack-postgres 15432:5432
   ```

3. In `.env`, use `POSTGRES_HOST=127.0.0.1` and `POSTGRES_PORT=15432`. Replace the JWT placeholder with the output of `openssl rand -base64 48`, and set `CORS_ORIGIN=http://localhost:3000`.

4. Start the auth API with `npm start`. In the frontend directory, run the React development server with the local auth endpoint:

   ```sh
   REACT_APP_AUTH_API_URL=http://localhost:8090/api/auth npm start
   ```

The API initializes the `auth_users` table on startup. The Minikube JWT value in the GitOps values file is for local development only; use a managed Kubernetes Secret in shared environments.
