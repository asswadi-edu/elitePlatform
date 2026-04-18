---
description: Fix IP connection issues after a network change
---

If the application is unable to fetch data after switching to a new network, follow these steps to update the local IP address across the configuration files.

1. **Find current IP address**
// turbo
   Run `ipconfig` in the terminal and find the `IPv4 Address` for the active network adapter (usually WiFi).

2. **Update Laravel Configuration**
   Open the root `.env` file and update:
   - `APP_URL=http://<NEW_IP>:8000`
   - `SANCTUM_STATEFUL_DOMAINS=<NEW_IP>:3000,<NEW_IP>:8000,localhost:3000,127.0.0.1:8000`

3. **Update Frontend Configuration**
   Open `frontend/.env` and update:
   - `REACT_APP_API_URL=http://<NEW_IP>:8000`

4. **Clear Laravel Cache**
// turbo
   Run `php artisan config:clear` in the root directory.

5. **Restart React Server**
   Stop the React development server (Ctrl+C) and run `npm start` again in the `frontend` directory.
