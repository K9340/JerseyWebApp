# FuturaSport Jersey Customizer Suite

This repository contains the migrated full-stack implementation of the FuturaSport Jersey Customizer and Production Grading Suite. The architecture has been redesigned into a Node.js + Express backend and a React Native (Expo) frontend that supports Web, Android, and iOS devices.

---

## 📂 Project Structure

```
jersey-customizer-app/
├── backend/                  # Node.js + Express API Server (PostgreSQL database)
│   ├── config/               # Database tables bootstrap config
│   ├── routes/               # REST controllers (designs.js, orders.js, admin.js)
│   ├── uploads/              # Local file uploads for logos, fonts, templates
│   ├── server.js             # Main server logic entry point
│   ├── render.yaml           # Deployment blueprint for Render web + Postgres hosting
│   └── package.json
│
├── frontend/                 # React Native + Expo App (supporting Web, iOS, Android)
│   ├── assets/               # Dynamic splash, icon, and fonts folders
│   ├── components/           # JerseyCanvas and canvasEngine drawing modules
│   ├── screens/              # Viewports: Home, Customizer, Roster, Track, Admin
│   ├── services/             # Axios API client linked to backend
│   ├── App.js                # Core state routing navigator
│   ├── app.json              # Expo bundle configurations
│   └── package.json
│
├── vercel.json               # Frontend routing configuration for Vercel Web hosting
└── README.md                 # Deployment & running guides (this file)
```

---

## ⚙️ Environment Configuration

The application reads database links and Google Client IDs from environment variables. Set them up before running local servers:

1. **Backend Setup:**
   * Navigate to `backend/`, copy the template, and configure your keys (e.g. custom database path, JWT secrets):
     ```bash
     cp .env.example .env
     ```

2. **Frontend Setup:**
   * Navigate to `frontend/`, copy the template, and insert your Google Client IDs:
     ```bash
     cp .env.example .env
     ```

---

## 💻 Local Quickstart

### Prerequisites
*   Node.js (v18+) and npm installed.

### 1. Launch Backend API
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server (runs on `http://localhost:5000`):
    ```bash
    npm run dev
    ```

### 2. Launch Frontend (Expo)
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start Expo (press `w` to open in browser, `a` for Android simulator, or `i` for iOS simulator):
    ```bash
    npm run start
    ```

---

## 🗄️ Database Administration Dashboard

The backend mounts a visual control panel to handle backups and restorations:
*   **Access Path:** `http://localhost:5000/admin/db` (or `/admin/db` in production)
*   **Backup:** Clicking **Download Backup File** downloads a structured `.json` data dump containing designs, orders, and rosters records.
*   **Recovery:** Select a valid `.json` backup file and click **Restore Database** to wipe active tables and repopulate them inside SQL transaction blocks. The system supports legacy SQLite CamelCase properties and native PostgreSQL lowercase keys automatically.

---

## 🌐 Backend Hosting: Render Setup (Node.js)

To deploy the Express server on [Render](https://render.com/):

1.  **Create a Render account** and link your Git repository (GitHub/GitLab).
2.  In the Render Dashboard, click **New +** ➔ **Blueprint**.
3.  Point it to your linked repository. Render will automatically read the root-level [render.yaml](file:///h:/JERSEY%20PRO/TSHIRTPRO/jersey-customizer-app/render.yaml) file, create the backend web service, run `npm install`, and boot the app on `port 5000`.
4.  Once deployed, copy your backend URL (e.g. `https://jersey-customizer-backend.onrender.com`).

---

## 🎨 Frontend Hosting: Vercel Setup (Expo Web)

To deploy the web frontend on [Vercel](https://vercel.com/):

1.  Export your Expo project into a static web bundle from the `frontend/` directory:
    ```bash
    cd frontend
    npm run build:web
    ```
    This generates a optimized static site inside `frontend/dist/`.
2.  **Log in to Vercel** and select **Add New** ➔ **Project**.
3.  Import your Git repository.
4.  In the project build configuration settings:
    *   **Framework Preset:** Other / None (Static Site).
    *   **Root Directory:** `frontend`
    *   **Build Command:** `npm run build:web`
    *   **Output Directory:** `dist`
    *   **Environment Variables:** Create a key `NODE_ENV` with value `production`. Vercel will automatically route endpoints to the Render production URL as configured in [api.js](file:///h:/JERSEY%20PRO/TSHIRTPRO/jersey-customizer-app/frontend/services/api.js).
5.  Click **Deploy**.

---

## 📱 Mobile App Compilation (Android APK / iOS IPA)

This project is built using Expo, enabling cloud-based compilation for Android and iOS using **EAS (Expo Application Services)** without needing a local Mac or Android Studio.

### Prerequisites
1.  Create a free account on [Expo](https://expo.dev/).
2.  Install the EAS CLI globally:
    ```bash
    npm install -g eas-cli
    ```
3.  Log in to your Expo account via terminal:
    ```bash
    eas login
    ```

### 1. Build Android App (APK for testing)
1.  Initialize the EAS project configuration inside `frontend/`:
    ```bash
    cd frontend
    eas build:configure
    ```
2.  Add a preview profile to `eas.json` for outputting an installable `.apk` file instead of an `.aab` play store bundle:
    ```json
    "preview": {
      "developmentClient": false,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
    ```
3.  Run the build command:
    ```bash
    eas build --platform android --profile preview
    ```
4.  Once the cloud build finishes, scan the terminal QR code with your Android phone to download and install the app!

### 2. Build iOS App
1.  Run the iOS compilation command:
    ```bash
    eas build --platform ios
    ```
2.  EAS will guide you to connect your Apple Developer credentials to generate provisioning profiles and compile the installable file.
