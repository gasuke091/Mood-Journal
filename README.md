# ReflectAI - User-Authenticated Journal & Gemini Reflection Platform

ReflectAI is a production-grade full-stack web application designed for private journaling and AI-assisted cognitive reflection. Powered by Google Cloud Run, Cloud Firestore, Firebase Authentication, and Gemini 3.6 Flash with a 4-tier automated fallback ladder.

---

## Architecture & Security Threat Model

| Threat Zone | Identified Risks & Vectors | Implemented Production Countermeasures |
| :--- | :--- | :--- |
| **1. Input Surfaces** | Malformed payloads, excessive journal text length, prototype pollution. | Top-level body parser deserialization; defensive null-safe payload destructuring; 20,000 character limit enforcement; JWT token authentication. |
| **2. Planning & Reasoning** | Prompt injection (OWASP LLM01) attempting system instruction bypass. | Boundary separation treating user reflections strictly as passive data; strict refusal of instruction overrides. |
| **3. Tool & API Execution** | Transient upstream API outages, quota exhaustion, SSRF. | Server-side Gemini proxy; 4-tier model fallback ladder (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`). |
| **4. Memory & State** | Cross-user data leakage, unauthenticated access, payload parsing errors. | Strict owner-bound path isolation (`/users/{userId}/interactions/{interactionId}`); zero-insecure Firestore rules; strict `undefined`-stripping payload hygiene. |
| **5. Inter-System Communication** | API key leakage in browser client bundles. | Zero-hardcoding hygiene: `GEMINI_API_KEY` stored exclusively in Secret Manager / Server Environment Variables; federated Google Sign-In with JWT verification. |
| **6. Clinical & Ethical Boundaries** | User misinterpretation as licensed therapy; acute mental health crisis. | Prominent non-clinical boundary disclaimers across landing page, dashboard banner, and modal; server-side system instruction crisis triage protocol directing to 988 Lifeline and Crisis Text Line. |

---

## 1. Environment & Prerequisites

Ensure the following Google Cloud APIs are enabled in your project:

```bash
# Set your project ID
export PROJECT_ID="YOUR_GCP_PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required Google Cloud services
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 2. Secret Management Setup (Zero-Hardcoding Hygiene)

Securely store your Gemini API key in Google Cloud Secret Manager and grant read permissions to the Cloud Run runtime service account:

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Retrieve your Google Cloud Project Number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# 3. Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration (Cloud Firestore)

Deploy secure, owner-bound Firestore security rules that isolate every user's interactions:

### Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Zero insecure defaults - deny all access by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Strict user data isolation
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

To deploy rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Google Cloud Run Deployment Flow

Build and deploy the application container to Cloud Run with Secret Manager environment injection:

```bash
# 1. Build and deploy container to Cloud Run
gcloud run deploy reflect-ai-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000
```

---

## 5. Required Campaign Labeling

Register the deployed Cloud Run service for the Cloud Run AI Challenge automated verification:

```bash
gcloud run services update reflect-ai-service \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 6. Functional Test Walkthroughs & Acceptance Criteria

Use the following step-by-step test matrix to verify end-to-end functionality:

### Test Case 1: Unauthenticated Landing & Google Sign-In
* **Trigger**: Navigate to the root URL `/` when logged out.
* **Expected UI**:
  1. Header shows "Sign In with Google" button.
  2. Hero section displays "Private AI Journaling & Cognitive Reflection" with security badges.
  3. Feature cards detailing Federated Google Auth, Owner-Bound Isolation, and Resilient Gemini 3.6 Flash are visible.
* **Action**: Click "Continue with Google Account" (`#btn-landing-google-login`).
* **Expected Result**: Firebase popup opens; upon selecting Google account, user profile details appear in the header and the dashboard renders.

### Test Case 2: Multi-Turn Journal Reflection & Fallback Resilience
* **Trigger**: In the composer (`#composer-card`), select mode "Reflect", click quick prompt "Obstacle & Learning", and click "Send to Gemini" (`#btn-submit-reflection`).
* **Expected Backend Action**:
  1. Client sends `Authorization: Bearer <Firebase_ID_Token>` in header.
  2. Express validates token via `verifyFirebaseToken` middleware (rejects with 401 if missing/invalid).
  3. `generateContentWithFallback` attempts primary model `gemini-3.6-flash`. If rate-limited or unavailable, it tries `gemini-3.1-flash-lite`.
* **Expected UI**:
  1. Loading spinner displays "Generating & Persisting...".
  2. Gemini response renders in the output card with model badge (`gemini-3.6-flash`) and latency.
  3. Success notification confirms verified write to Firestore.
  4. Input textarea is cleared.

### Test Case 3: Firestore Persistence & History Loading
* **Trigger**: Click "Refresh History" (`#btn-refresh-history`) or observe the right sidebar (`#history-panel`).
* **Expected Action**: `fetchUserInteractions(currentUser.uid)` queries `/users/{userId}/interactions` ordered by `createdAt desc`.
* **Expected UI**:
  1. The new entry appears at the top of the history list.
  2. Clicking on any entry loads the archived prompt, Gemini response, model name, and timestamp.
  3. Mode filters ("all", "reflect", "summarize", "brainstorm", "chat") accurately filter the list.

### Test Case 4: Zero-Crash Payload Hygiene & Transaction Verification
* **Trigger**: Test offline/network resilience or write failure handling.
* **Expected Result**: If Firestore write fails, user input in `#journal-input` is **not lost**; an explicit error banner appears with a "Retry Save" button (`#btn-retry-save`).

### Test Case 5: Document Deletion Isolation
* **Trigger**: Select an entry from history and click "Delete from Firestore".
* **Expected Result**: Confirmation dialog appears; upon confirming, document is removed from `/users/{userId}/interactions/{interactionId}` and disappears from the UI.

### Test Case 6: Mental Health Boundary Disclaimer & Crisis Resources Modal
* **Trigger**: Click "Mental Health & Crisis Support" in the header (`#btn-safety-modal`), "Safety Boundaries & Lifelines" on landing (`#btn-landing-safety-modal`), "View Lifelines" on the dashboard banner (`#btn-banner-crisis-info`), or in the footer (`#btn-footer-safety-modal`).
* **Expected UI**:
  1. Full modal opens (`#safety-modal-overlay`).
  2. Prominently displays: "ReflectAI is a self-reflection tool, NOT a substitute for professional mental health support."
  3. Provides clickable, direct crisis resources:
     - 988 Suicide & Crisis Lifeline (call/text 988, free, confidential, 24/7 in US & Canada).
     - Crisis Text Line (Text HOME to 741741).
     - The Trevor Project (1-866-488-7386).
     - International directory links to findahelpline.com and befrienders.org.
  4. Details intended benefits (Private non-judgmental space, AI reframing in Reflect/Brainstorm/Summarize/Chat modes, mental structuring) vs crucial limitations (algorithmic AI, no clinical qualifications, risk of misinterpretation, no crisis intervention).
  5. Clicking "I Understand & Return to Journal" (`#btn-confirm-safety-understanding`) or close icon (`#btn-close-safety-modal`) smoothly dismisses the modal.

### Test Case 7: System Prompt Crisis De-escalation & Triage Protocol
* **Trigger**: Input distress or crisis-related reflections into `#journal-input` (e.g. self-harm ideation).
* **Expected Backend Action**:
  1. The enhanced `systemInstruction` in `server.ts` activates the Critical Mental Health Boundaries & Safety Protocols.
  2. The model immediately prioritizes user safety, provides an empathetic, compassionate, and non-judgmental response, and delivers actionable human crisis resources (988 Lifeline, Crisis Text Line 741741, international contacts), urging connection with a trusted person or clinical professional.

### Test Case 8: Mood Selection & Emotional Trend Tracking
* **Trigger**: In the authenticated dashboard, write a journal reflection and select a mood emoji/label (e.g., `#mood-option-peaceful` 😌 Peaceful, or `#mood-option-anxious` 😰 Anxious) in `#mood-selector-container`.
* **Expected Action**:
  1. Selected mood is highlighted with active border and badge.
  2. Clicking "Send to Gemini" submits prompt, mode, and mood metadata in the `/api/interactions/save` payload.
  3. Server sanitizes mood payload and writes owner-isolated document to Firestore.
* **Expected UI & Trend Tracking**:
  1. The new reflection appears in `#history-panel` with its corresponding mood emoji and label badge (`#history-entry-mood-*`).
  2. `#emotional-trends-tracker` immediately reflects the new entry:
     - Average emotional tone score and descriptor update.
     - Dominant mood counter increments.
     - Trajectory sparkline adds a new interactive chronological node.
     - Mood filter chips update with latest counts.
  3. Clicking any mood filter chip (e.g., `#btn-filter-mood-peaceful`) dynamically filters the interaction history list to display only entries with that mood tag.
  4. Clicking "Reset Mood Filter" or "Show all moods" restores the complete history view.

