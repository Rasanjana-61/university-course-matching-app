# University Course Matching API: Postman testing guide

Inspected: **2026-10-08 (Asia/Colombo)**. **57 explicit application endpoints**, traced through all 11 mounted routers. Only this documentation and the two Postman JSON files were created.

## Base URL and configuration

Use **http://localhost:5000** as the environment variable **baseUrl**, without a trailing slash or /api. Every collection request includes its /api prefix. Backend/index.js uses process.env.PORT || 5000 and calls app.listen(PORT) without a host restriction. Backend/.env and .env.example both specify PORT=5000; the inspected shell has no PORT override. Expected run context: npm start/dev from Backend loads Backend/.env through dotenv/config. A shell PORT override takes precedence. If dotenv is explicitly pointed elsewhere, recheck PORT. .env.local is not automatically loaded by dotenv/config.

Environment files were parsed locally using dotenv, and only key presence plus nonsensitive port/mode metadata were retained. DATABASE_URL is set in Backend/.env. JWT_SECRET, ADMIN_JWT_SECRET and TEACHER_JWT_SECRET are absent from that file and the inspected shell, so their respective code fallbacks apply; their values are deliberately omitted. NODE_ENV and VERCEL are unset in the inspected shell/.env. No connection strings, email credentials, environment tokens or JWT signing values are copied into these artifacts.

## Verification boundary

**Found in source: all 57 endpoints. Successfully tested over HTTP: none.** One existing-server probe was attempted: GET http://localhost:5000/api/health returned no HTTP response (ECONNREFUSED). No success status or response body was observed. All success statuses and response structures below are handler expectations.

The agent did not start/import the backend application, run initDB, run verify-api/check-db/update-university-banners, connect directly to the DB, send registration/login/CRUD requests, send email, install packages or change backend source. npm start/dev calls initDB, which creates/alters tables, seeds records and updates university banners. Notification GET handlers call CREATE TABLE IF NOT EXISTS; even their GETs are not guaranteed read-only.

## Route inventory and authentication

index.js mounts /api/auth, /api/universities, /api/courses, /api/students, /api/match, /api/scholarships, /api/teachers, /api/admin, /api/inquiries, /api/notifications and /api/student-notifications. Each router has direct handlers; no additional nested/mounted routers or dynamic route registrations were found. GET /api/health is defined directly in index.js. CORS middleware can answer OPTIONS preflights and Express can answer HEAD using GET handlers; these are framework behavior, not additional explicitly implemented business endpoints.

Most handlers have **no authentication or role middleware**. This includes university/course/scholarship writes, student profile/account/saved-course operations, announcement writes/deletes, personal notifications, and inquiry deletion. Comments or frontend screen labels saying admin only do not enforce access. The collection uses No Auth for those requests.

Protected endpoints: GET /api/auth/me verifies the student-signature JWT and looks up decoded.id without checking a role. The two teacher read endpoints require a TEACHER_JWT_SECRET signature and role teacher. Admin dashboard/students/question writes and inquiry list/reply/status require an ADMIN_JWT_SECRET signature and role admin OR teacher. An ordinary teacher-login token uses a different signing configuration and should not be assumed to pass the admin verifier.

Teacher and admin accounts share the teachers table. Its default stored role is admin, but teacher registration omits role while signing role teacher; data.role can therefore differ from the teacher JWT role. Teacher login does not inspect the stored role. Admin login signs the stored role (falling back to admin); its verifier checks the role later. Registration for both kinds of staff is public.

Actual assessment routes are /api/admin/questions. There is no /api/assessments submission/scoring/results handler, no /api/matching router, no standalone /api/saved-courses router, and no logout/refresh-token handler. Saved courses live under /api/students/:email. SQL routes use SERIAL integer IDs and snake_case raw rows; prisma/schema.prisma defines a different UUID/camelCase model and is not used by these handlers.

## Headers and notation

**JSON** in the table means Content-Type: application/json is needed to populate req.body. Protected requests also need Authorization: Bearer <the appropriate issued token>. No other custom headers are enforced; Accept: application/json is optional. GET/DELETE and the two bodyless read-marking PUTs need no JSON body or content-type header.

All :id values are existing integer IDs, not UUIDs; the code often relies on PostgreSQL conversion and can return 500 for malformed IDs rather than 400. :email is a URL-encoded student email; matching is generally case-insensitive. Query requirements are listed separately. Decimal DB columns may be serialized as strings, unlike the explicitly parseFloat-converted authentication/dashboard fields.

Bodies in endpoint details use entirely synthetic names/emails/passwords and illustrative ID 1. Replace credentials with a dedicated test account, IDs with actual existing or newly created test IDs, and OTP 123456 with a newly issued matching unexpired code. These examples satisfy the relevant application validation and expected types; success also requires their database prerequisites. No real passwords or live tokens are included. Collection bodies use environment variables; credentials/IDs/OTP are intentionally empty in the exported environment.

## Full endpoint table

| # | Method | Full localhost URL | Purpose | Auth/headers | Parameters | Example JSON body | Expected success | Runtime evidence |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `http://localhost:5000/api/health` | Check service availability | None enforced | None | None | 200 Health | Attempt failed: ECONNREFUSED |
| 2 | POST | `http://localhost:5000/api/auth/register` | Register a student | None enforced; JSON | None | studentRegister (see detail) | 201 StudentAuth | Not executed |
| 3 | POST | `http://localhost:5000/api/auth/login` | Log in a student | None enforced; JSON | None | studentLogin (see detail) | 200 StudentAuth | Not executed |
| 4 | GET | `http://localhost:5000/api/auth/me` | Read the authenticated student | student JWT | None | None | 200 StudentMe | Not executed |
| 5 | POST | `http://localhost:5000/api/auth/forgot-password` | Create and send a reset OTP | None enforced; JSON | None | forgot (see detail) | 200 Forgot | Not executed |
| 6 | POST | `http://localhost:5000/api/auth/verify-otp` | Verify a reset OTP | None enforced; JSON | None | verify (see detail) | 200 Message | Not executed |
| 7 | POST | `http://localhost:5000/api/auth/reset-password` | Reset a student password | None enforced; JSON | None | reset (see detail) | 200 Message | Not executed |
| 8 | GET | `http://localhost:5000/api/universities` | List universities | None enforced | None | None | 200 UniversityList | Not executed |
| 9 | GET | `http://localhost:5000/api/universities/:id` | Read a university with its courses | None enforced | Path id: existing integer; Postman {{universityId}} | None | 200 UniversityDetail | Not executed |
| 10 | POST | `http://localhost:5000/api/universities` | Create a university | None enforced; JSON | None | university (see detail) | 201 UniversityWrite | Not executed |
| 11 | PUT | `http://localhost:5000/api/universities/:id` | Replace a university's editable fields | None enforced; JSON | Path id: existing integer; Postman {{universityId}} | university (see detail) | 200 UniversityWrite | Not executed |
| 12 | DELETE | `http://localhost:5000/api/universities/:id` | Delete a university and its courses | None enforced | Path id: existing integer; Postman {{universityId}} | None | 200 UniversityDelete | Not executed |
| 13 | GET | `http://localhost:5000/api/courses` | List and filter courses | None enforced | Query stream (optional): Case-insensitive stream match; absent, empty, All, undefined or null strings disable filter. Example: Physical Science; Query search (optional): Substring search in course name/description/university name; empty, undefined or null strings disable filter. Example: Computing | None | 200 CourseList | Not executed |
| 14 | GET | `http://localhost:5000/api/courses/:id` | Read a course | None enforced | Path id: existing integer; Postman {{courseId}} | None | 200 CourseDetail | Not executed |
| 15 | GET | `http://localhost:5000/api/courses/:id/admission` | Read course admission requirements | None enforced | Path id: existing integer; Postman {{courseId}} | None | 200 Admission | Not executed |
| 16 | POST | `http://localhost:5000/api/courses` | Create a course | None enforced; JSON | None | course (see detail) | 201 CourseWrite | Not executed |
| 17 | PUT | `http://localhost:5000/api/courses/:id` | Replace a course's editable fields | None enforced; JSON | Path id: existing integer; Postman {{courseId}} | course (see detail) | 200 CourseWrite | Not executed |
| 18 | DELETE | `http://localhost:5000/api/courses/:id` | Delete a course | None enforced | Path id: existing integer; Postman {{courseId}} | None | 200 CourseDelete | Not executed |
| 19 | GET | `http://localhost:5000/api/students/:email` | Read a student profile by email | None enforced | Path email: URL-encoded student email; Postman {{studentEmail}} | None | 200 StudentRow | Not executed |
| 20 | PUT | `http://localhost:5000/api/students/:email` | Update basic student profile fields | None enforced; JSON | Path email: URL-encoded student email; Postman {{studentEmail}} | profileUpdate (see detail) | 200 StudentRow | Not executed |
| 21 | POST | `http://localhost:5000/api/students` | Create or upsert a student profile | None enforced; JSON | None | profile (see detail) | 200 StudentRow | Not executed |
| 22 | POST | `http://localhost:5000/api/students/:email/toggle-save` | Toggle saving a course | None enforced; JSON | Path email: URL-encoded student email; Postman {{studentEmail}} | toggle (see detail) | 200 SavedToggle | Not executed |
| 23 | GET | `http://localhost:5000/api/students/:email/saved-courses` | List a student's saved course details | None enforced | Path email: URL-encoded student email; Postman {{studentEmail}} | None | 200 CourseList | Not executed |
| 24 | DELETE | `http://localhost:5000/api/students/:email` | Delete a student account | None enforced | Path email: URL-encoded student email; Postman {{studentEmail}} | None | 200 Message | Not executed |
| 25 | POST | `http://localhost:5000/api/match` | Calculate course recommendations | None enforced; JSON | None | match (see detail) | 200 Match | Not executed |
| 26 | GET | `http://localhost:5000/api/scholarships` | List and filter scholarships | None enforced | Query search (optional): Substring search on title/provider/eligibility. Example: Merit; Query category (optional): Case-insensitive category match. Example: Merit | None | 200 ScholarshipList | Not executed |
| 27 | GET | `http://localhost:5000/api/scholarships/:id` | Read a scholarship | None enforced | Path id: existing integer; Postman {{scholarshipId}} | None | 200 ScholarshipDetail | Not executed |
| 28 | POST | `http://localhost:5000/api/scholarships` | Create a scholarship | None enforced; JSON | None | scholarship (see detail) | 201 ScholarshipWrite | Not executed |
| 29 | PUT | `http://localhost:5000/api/scholarships/:id` | Replace a scholarship's editable fields | None enforced; JSON | Path id: existing integer; Postman {{scholarshipId}} | scholarship (see detail) | 200 ScholarshipWrite | Not executed |
| 30 | DELETE | `http://localhost:5000/api/scholarships/:id` | Delete a scholarship | None enforced | Path id: existing integer; Postman {{scholarshipId}} | None | 200 ScholarshipDelete | Not executed |
| 31 | POST | `http://localhost:5000/api/teachers/register` | Register a teacher | None enforced; JSON | None | staffRegister (see detail) | 201 StaffAuth | Not executed |
| 32 | POST | `http://localhost:5000/api/teachers/login` | Log in through teacher authentication | None enforced; JSON | None | staffLogin (see detail) | 200 StaffAuth | Not executed |
| 33 | GET | `http://localhost:5000/api/teachers/dashboard` | Read the teacher dashboard | teacher JWT | None | None | 200 TeacherDashboard | Not executed |
| 34 | GET | `http://localhost:5000/api/teachers/students` | List students for the teacher dashboard | teacher JWT | Query stream (optional): Case-insensitive exact stream match. Example: Physical Science; Query district (optional): Case-insensitive exact district match. Example: Colombo; Query search (optional): Case-insensitive substring match on student full_name or email. Example: Postman | None | 200 StaffStudentList | Not executed |
| 35 | POST | `http://localhost:5000/api/admin/register` | Register an admin | None enforced; JSON | None | adminRegister (see detail) | 201 StaffAuth | Not executed |
| 36 | POST | `http://localhost:5000/api/admin/login` | Log in through admin authentication | None enforced; JSON | None | adminLogin (see detail) | 200 StaffAuth | Not executed |
| 37 | GET | `http://localhost:5000/api/admin/dashboard` | Read the admin dashboard | admin JWT | None | None | 200 AdminDashboard | Not executed |
| 38 | GET | `http://localhost:5000/api/admin/students` | List students for the admin dashboard | admin JWT | Query stream (optional): Case-insensitive exact stream match. Example: Physical Science; Query district (optional): Case-insensitive exact district match. Example: Colombo; Query search (optional): Case-insensitive substring match on student full_name or email. Example: Postman | None | 200 StaffStudentList | Not executed |
| 39 | GET | `http://localhost:5000/api/admin/questions` | List assessment questions | None enforced | None | None | 200 QuestionList | Not executed |
| 40 | POST | `http://localhost:5000/api/admin/questions` | Create an assessment question | admin JWT; JSON | None | question (see detail) | 201 QuestionWrite | Not executed |
| 41 | PUT | `http://localhost:5000/api/admin/questions/:id` | Update an assessment question | admin JWT; JSON | Path id: existing integer; Postman {{questionId}} | questionUpdate (see detail) | 200 QuestionWrite | Not executed |
| 42 | DELETE | `http://localhost:5000/api/admin/questions/:id` | Delete an assessment question | admin JWT | Path id: existing integer; Postman {{questionId}} | None | 200 Message | Not executed |
| 43 | POST | `http://localhost:5000/api/inquiries` | Submit a student inquiry | None enforced; JSON | None | inquiry (see detail) | 201 InquiryWrite | Not executed |
| 44 | GET | `http://localhost:5000/api/inquiries/my` | List inquiries for a student email | None enforced | Query email (required): Required student email. Example: {{studentEmail}} | None | 200 InquiryList | Not executed |
| 45 | GET | `http://localhost:5000/api/inquiries` | List all inquiries for an advisor | admin JWT | Query status (optional): Case-insensitive status filter. Example: Pending; Query category (optional): Case-insensitive category filter. Example: Admissions; Query search (optional): Substring search on subject/message/student name/email. Example: Postman | None | 200 InquiryList | Not executed |
| 46 | PUT | `http://localhost:5000/api/inquiries/:id/reply` | Reply and notify the student | admin JWT; JSON | Path id: existing integer; Postman {{inquiryId}} | reply (see detail) | 200 InquiryWrite | Not executed |
| 47 | PUT | `http://localhost:5000/api/inquiries/:id/status` | Change an inquiry status | admin JWT; JSON | Path id: existing integer; Postman {{inquiryId}} | inquiryStatus (see detail) | 200 InquiryWrite | Not executed |
| 48 | DELETE | `http://localhost:5000/api/inquiries/:id` | Delete an inquiry | None enforced | Path id: existing integer; Postman {{inquiryId}} | None | 200 Message | Not executed |
| 49 | GET | `http://localhost:5000/api/notifications` | List announcements | None enforced | Query stream (optional): Exact target_stream filter including global announcements; omitted or lowercase all disables filter. Example: Physical Science | None | 200 NotificationList | Not executed |
| 50 | GET | `http://localhost:5000/api/notifications/unread-count` | Count all announcements | None enforced | None | None | 200 Count | Not executed |
| 51 | POST | `http://localhost:5000/api/notifications` | Create an announcement | None enforced; JSON | None | notification (see detail) | 201 NotificationDetail | Not executed |
| 52 | PUT | `http://localhost:5000/api/notifications/:id` | Partially update an announcement | None enforced; JSON | Path id: existing integer; Postman {{notificationId}} | notification (see detail) | 200 NotificationDetail | Not executed |
| 53 | DELETE | `http://localhost:5000/api/notifications/:id` | Delete an announcement | None enforced | Path id: existing integer; Postman {{notificationId}} | None | 200 NotificationDelete | Not executed |
| 54 | GET | `http://localhost:5000/api/student-notifications` | List a student's personal inbox | None enforced | Query email (required): Required student email. Example: {{studentEmail}} | None | 200 StudentNotificationList | Not executed |
| 55 | GET | `http://localhost:5000/api/student-notifications/unread-count` | Count unread personal notifications | None enforced | Query email (optional): Email used to count is_read=false notifications; absent returns 0. Example: {{studentEmail}} | None | 200 Count | Not executed |
| 56 | PUT | `http://localhost:5000/api/student-notifications/mark-all-read` | Mark a student's inbox as read | None enforced | Query email (required): Required email whose notifications are marked read. Example: {{studentEmail}} | None | 200 Message | Not executed |
| 57 | PUT | `http://localhost:5000/api/student-notifications/:id/read` | Mark one personal notification as read | None enforced | Path id: existing integer; Postman {{studentNotificationId}} | None | 200 Success | Not executed |

## Import and use in Postman

1. In Postman, select **Import**, choose **University-Course-Matching.postman_collection.json** and **University-Course-Matching.local.postman_environment.json**, and import both.
2. Select **University Course Matching - localhost** in the environment selector. Check baseUrl=http://localhost:5000. Keep /api in request paths, not in baseUrl.
3. Set local environment values for password, teacherPassword, adminPassword and newPassword as needed. Use dedicated synthetic student/teacher/admin emails or replace the example.com addresses with test accounts. Credential/token/OTP values are exported empty and marked secret where supported. Avoid sharing populated environment exports.
4. Required email query parameters are enabled. Optional filters are included but disabled so an initial request lists all records; enable them in **Params** when testing filters. Enable email on the personal unread-count request to count that student rather than the zero-without-email branch.
5. Open **Scripts > Post-response** to see assertions and capture scripts. Successful student login/registration saves the top-level token to token and captures studentId/studentEmail. Teacher/admin flows save their top-level token to teacherToken/adminToken and capture their respective IDs/emails. Successful creates capture universityId, courseId, scholarshipId, questionId, inquiryId and notificationId; student upsert captures studentId. Capture requires the expected success status and success:true. IDs are not assumed from lists: copy a chosen test row ID manually when needed. Copy personal notification IDs from the inbox after a reply.
6. The collection includes database writes and deletes. Send requests selectively according to the testing order; the agent did not execute the collection.

## Testing order (future manual testing; not performed by the agent)

1. **Health first:** GET /api/health against an already-running local server. Expect 200 with status ok. This inspection found ECONNREFUSED; local service availability must be resolved before testing. Normal backend startup initializes/seeds the database, so use your intended test database and development setup.
2. **Register a dedicated student:** set studentEmail/password (string, >=6 characters), then POST /api/auth/register. Expect 201; 409 means that password-bearing account already exists. The script saves token and student identity. Registration writes data.
3. **Log in:** POST /api/auth/login with the same email/password. Expect 200 and a top-level token. The script updates token. Login can save a password hash when an old profile has no password.
4. **Verify the protected student endpoint:** GET /api/auth/me using {{token}}. Compare the returned id/email with login. Student tokens do not authorize teacher/admin routes.
5. **Read catalogue data:** list universities, courses, scholarships and admin/questions. Set universityId/courseId/scholarshipId/questionId from selected test rows. Test details, admission requirements, optional filters, profile lookup and saved-course lookup. Questions are public and include inactive rows.
6. **Matching and student operations:** POST /api/match is a read-only calculation. POST /api/students upserts your test profile. Test profile PUT (see its SQL caveat), then POST toggle-save with courseId and GET saved-courses. Sending toggle-save twice reverses the saved state.
7. **Teacher authentication:** register a separate teacher test account or use an existing one, then POST /api/teachers/login. Use {{teacherToken}} for teacher dashboard/students. Filters apply after fetching at most 200 students.
8. **Admin authentication:** register a separate admin test account or use an existing one; POST /api/admin/login saves adminToken. Use {{adminToken}} for admin dashboard/students and assessment-question writes. Do not assume the teacher-signature token passes these verifiers.
9. **Catalogue CRUD in your test DB:** create a synthetic university first (captures universityId), then a course referencing it (captures courseId), then scholarship/question records. Test updates/details and delete only those test records after dependent tests. University deletion cascades to courses. Public catalogue writes enforce no admin auth.
10. **Inquiry and inbox workflow:** create a test inquiry (captures inquiryId); list /inquiries/my?email=...; use adminToken to list/reply/change status. Reply attempts to create a personal notification. List /student-notifications?email=..., copy a row ID to studentNotificationId, enable email on unread-count, then test mark-one-read and mark-all-read. Inbox GETs may create tables.
11. **Announcements:** list/count, create a synthetic announcement (captures notificationId), update/delete it. Its unread-count counts all announcements. No admin auth is enforced on these handlers.
12. **Password reset last:** use a controllable test email; forgot-password issues an OTP via email or nonproduction demoOtp. Set otp to that issued code, verify-otp, then reset-password with newPassword >=6 characters. Copy newPassword into password and log in again. The sample OTP is not an issued code.
13. **Cleanup last:** delete only test inquiry/announcement/question/scholarship/course/university records you created, and the test student account last. Several delete handlers do not explicitly clean saved IDs or ancillary student data. There is no staff-account delete API.
14. **Optional failure checks:** omit required fields, use a nonexistent resource or remove/expire the bearer token. Common expected statuses are 400 validation, 401 missing/invalid token or credentials, 403 wrong role, 404 absent resource, 409 registration conflict and 500 server/database errors. Unknown paths reach the 404 handler.

## Copy a login token manually

After a successful login, copy the **top-level token value** from response Body JSON, without quotes and without the word Bearer. On the protected request choose **Authorization → Bearer Token** and paste it into the Token field. To use variables, enter **{{token}}** for /auth/me, **{{teacherToken}}** for teacher endpoints or **{{adminToken}}** for protected admin/inquiry endpoints. Postman adds Authorization: Bearer automatically. Avoid a duplicate manually entered Authorization header. The collection already configures these settings.

The student login script follows the actual response shape; token is not inside data:

```javascript
const result = pm.response.json();
if (pm.response.code === 200 && result.success === true && typeof result.token === "string" && result.token.length > 0) {
  pm.environment.set("token", result.token);
  if (result.data && result.data.id !== undefined) pm.environment.set("studentId", String(result.data.id));
  if (result.data && result.data.email) pm.environment.set("studentEmail", result.data.email);
}
```

Issued JWTs have a 7-day expiry in source. Failed requests do not overwrite saved tokens. Obtain a fresh token when one expires.

## Important source-derived limitations

- PUT /api/students/:email uses double-quoted empty SQL identifiers in NULLIF expressions; PostgreSQL is likely to reject that SQL. 200 is its declared handler success, not a verified runtime result. Backend source was not changed.
- Raw GET/POST/PUT student-profile responses include password. Avoid exporting actual response bodies with sensitive hashes. Authentication responses select a camelCase profile without password.
- Type validation is often weak; truthy wrong-type values can produce 500. Required-field checks alone do not validate DB constraints/foreign keys.
- General error responses include error.message. This guide contains no live error strings with connection details.
- Health checks the service, not database connectivity. A successful health response does not establish that auth/catalogue routes work.
- Unknown routes return 404 {success:false,message:"Route not found: <requested URL>"}. The final error middleware declares 500 {success:false,message:"Internal server error",error:"<error message>"}; malformed JSON may consequently return 500 instead of the normal parser status.

## Endpoint details

### 1. GET /api/health

**Purpose:** Check service availability. **Source:** [Backend/index.js:33](../../index.js#L33).

**Full URL:** `http://localhost:5000/api/health`. **Postman URL:** `{{baseUrl}}/api/health`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** No request parameters or body.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **Health** (placeholders describe types, not a captured response):

```json
{
  "status": "ok",
  "service": "University Course Matching API",
  "timestamp": "ISO-8601 string"
}
```

**Failures:** 500 for database/server/type/constraint errors.

**Side effects:** No database access.

**Runtime evidence:** Attempted GET on 2026-10-08; ECONNREFUSED, no HTTP response.

### 2. POST /api/auth/register

**Purpose:** Register a student. **Source:** [Backend/routes/authRoute.js:15](../../routes/authRoute.js#L15).

**Full URL:** `http://localhost:5000/api/auth/register`. **Postman URL:** `{{baseUrl}}/api/auth/register`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** fullName must be a string with at least 2 characters after trimming; email must match /^[^\s@]+@[^\s@]+\.[^\s@]+$/ after trim/lowercase; password must be a string of at least 6 characters. Email is normalized. stream defaults to Physical Science; district Colombo; school empty; zScore 0; interests and preferredLocations empty arrays. No stream/district enum or z-score range is enforced. Use arrays of strings for the PostgreSQL text[] fields.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "fullName": "Postman Test Student",
  "email": "postman.student@example.com",
  "password": "ExampleOnly123!",
  "stream": "Physical Science",
  "district": "Colombo",
  "school": "Example College",
  "zScore": 1.8,
  "interests": [
    "Computing"
  ],
  "preferredLocations": [
    "Colombo"
  ]
}
```

**Expected success:** HTTP **201**. Structure **StudentAuth** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "token": "issued JWT string (not a sample token)",
  "data": {
    "id": "integer",
    "fullName": "string",
    "email": "string",
    "school": "string",
    "stream": "string",
    "district": "string",
    "zScore": "number",
    "interests": "string[]",
    "preferredLocations": "string[]",
    "savedCourseIds": "integer[]",
    "subjects": "JSON[]"
  }
}
```

**Failures:** 400 validation; 409 account already has a password; 500 server/database error.

**Side effects:** Writes database records.

**Notes:** If an existing profile has no password, registration updates that record. Its existing z-score/interests/preferences are retained in that branch.

**Runtime evidence:** Not executed. Found and documented from source only.

### 3. POST /api/auth/login

**Purpose:** Log in a student. **Source:** [Backend/routes/authRoute.js:157](../../routes/authRoute.js#L157).

**Full URL:** `http://localhost:5000/api/auth/login`. **Postman URL:** `{{baseUrl}}/api/auth/login`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** email must match the email regex; password must be a nonempty string. Existing student account required; comparison is against its stored password hash.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "email": "postman.student@example.com",
  "password": "ExampleOnly123!"
}
```

**Expected success:** HTTP **200**. Structure **StudentAuth** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "token": "issued JWT string (not a sample token)",
  "data": {
    "id": "integer",
    "fullName": "string",
    "email": "string",
    "school": "string",
    "stream": "string",
    "district": "string",
    "zScore": "number",
    "interests": "string[]",
    "preferredLocations": "string[]",
    "savedCourseIds": "integer[]",
    "subjects": "JSON[]"
  }
}
```

**Failures:** 400 validation; 401 invalid credentials; 500 server/database error.

**Side effects:** May WRITE: if the existing student has no password, login saves a hash of the supplied password.

**Runtime evidence:** Not executed. Found and documented from source only.

### 4. GET /api/auth/me

**Purpose:** Read the authenticated student. **Source:** [Backend/routes/authRoute.js:244](../../routes/authRoute.js#L244).

**Full URL:** `http://localhost:5000/api/auth/me`. **Postman URL:** `{{baseUrl}}/api/auth/me`.

**Required headers:** Authorization: Bearer {{token}}. **Authentication/roles:** Student JWT; no role check.

**Path/query parameters:** None.

**Validation and defaults:** A valid student JWT signed with JWT_SECRET is required. There is no role claim check; decoded.id must identify an existing student.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **StudentMe** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": {
    "id": "integer",
    "fullName": "string",
    "email": "string",
    "school": "string",
    "stream": "string",
    "district": "string",
    "zScore": "number",
    "interests": "string[]",
    "preferredLocations": "string[]",
    "savedCourseIds": "integer[]",
    "subjects": "JSON[]"
  }
}
```

**Failures:** 401 missing/invalid/expired token (also catches lookup errors); 404 no matching student.

**Side effects:** SELECT only, following the inspected handler.

**Runtime evidence:** Not executed. Found and documented from source only.

### 5. POST /api/auth/forgot-password

**Purpose:** Create and send a reset OTP. **Source:** [Backend/routes/authRoute.js:287](../../routes/authRoute.js#L287).

**Full URL:** `http://localhost:5000/api/auth/forgot-password`. **Postman URL:** `{{baseUrl}}/api/auth/forgot-password`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** Valid email regex and an existing student account required. Replaces prior reset codes with a 15-minute OTP.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "email": "postman.student@example.com"
}
```

**Expected success:** HTTP **200**. Structure **Forgot** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "demoOtp": "6-digit string; omitted in production"
}
```

**Failures:** 400 invalid email; 404 account not found; 500 reset/email/database error.

**Side effects:** Writes password_resets and sends email (or logs email using the development fallback).

**Notes:** demoOtp is present only when NODE_ENV is not production. Use a newly issued OTP, never a made-up code.

**Runtime evidence:** Not executed. Found and documented from source only.

### 6. POST /api/auth/verify-otp

**Purpose:** Verify a reset OTP. **Source:** [Backend/routes/authRoute.js:345](../../routes/authRoute.js#L345).

**Full URL:** `http://localhost:5000/api/auth/verify-otp`. **Postman URL:** `{{baseUrl}}/api/auth/verify-otp`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** email and otp must be truthy; email is lowercased/trimmed and otp is stringified/trimmed. No separate six-digit or email-format validation is enforced here. Matching unexpired database code required.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "email": "postman.student@example.com",
  "otp": "123456"
}
```

**Expected success:** HTTP **200**. Structure **Message** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string"
}
```

**Failures:** 400 missing or invalid/expired code; 500 server/database error.

**Side effects:** SELECT only; does not consume the code or issue a reset token.

**Runtime evidence:** Not executed. Found and documented from source only.

### 7. POST /api/auth/reset-password

**Purpose:** Reset a student password. **Source:** [Backend/routes/authRoute.js:391](../../routes/authRoute.js#L391).

**Full URL:** `http://localhost:5000/api/auth/reset-password`. **Postman URL:** `{{baseUrl}}/api/auth/reset-password`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** email, otp, newPassword must be truthy; newPassword must be a string of at least 6 characters. Requires a matching unexpired OTP. Verifying the OTP first is helpful but not mandatory.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "email": "postman.student@example.com",
  "otp": "123456",
  "newPassword": "NewExampleOnly123!"
}
```

**Expected success:** HTTP **200**. Structure **Message** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string"
}
```

**Failures:** 400 missing fields/short password/invalid OTP; 404 student missing; 500 server/database error.

**Side effects:** Updates the student password and deletes reset codes.

**Runtime evidence:** Not executed. Found and documented from source only.

### 8. GET /api/universities

**Purpose:** List universities. **Source:** [Backend/routes/universitiesRoute.js:7](../../routes/universitiesRoute.js#L7).

**Full URL:** `http://localhost:5000/api/universities`. **Postman URL:** `{{baseUrl}}/api/universities`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** No filters or pagination.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **UniversityList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "count": "integer",
  "data": "University[] with courses_count integer"
}
```

**Failures:** 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Notes:** Ordered by name; adds courses_count.

**Resource variable:** Copy the id of a chosen test row from data into universityId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 9. GET /api/universities/:id

**Purpose:** Read a university with its courses. **Source:** [Backend/routes/universitiesRoute.js:26](../../routes/universitiesRoute.js#L26).

**Full URL:** `http://localhost:5000/api/universities/:id`. **Postman URL:** `{{baseUrl}}/api/universities/{{universityId}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{universityId}}

**Validation and defaults:** Existing integer university id required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **UniversityDetail** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "University with courses: Course[]"
}
```

**Failures:** 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Runtime evidence:** Not executed. Found and documented from source only.

### 10. POST /api/universities

**Purpose:** Create a university. **Source:** [Backend/routes/universitiesRoute.js:49](../../routes/universitiesRoute.js#L49).

**Full URL:** `http://localhost:5000/api/universities`. **Postman URL:** `{{baseUrl}}/api/universities`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** name, shortName (or short_name), location, district must be nonempty strings after trim. Optional description/website are trimmed. logoUrl/logo_url and backgroundImageUrl/background_image_url aliases are accepted. short_name is UNIQUE in PostgreSQL; repeat creation can produce a 500. No URL-format validation is enforced.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "name": "Postman Test University",
  "shortName": "PMTEST",
  "location": "Colombo",
  "district": "Colombo",
  "description": "Synthetic Postman test university.",
  "website": "https://example.com",
  "logoUrl": "https://example.com/logo.png",
  "backgroundImageUrl": "https://example.com/banner.png"
}
```

**Expected success:** HTTP **201**. Structure **UniversityWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "University"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Automatic ID capture:** Successful response data.id → universityId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 11. PUT /api/universities/:id

**Purpose:** Replace a university's editable fields. **Source:** [Backend/routes/universitiesRoute.js:81](../../routes/universitiesRoute.js#L81).

**Full URL:** `http://localhost:5000/api/universities/:id`. **Postman URL:** `{{baseUrl}}/api/universities/{{universityId}}`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{universityId}}

**Validation and defaults:** name, shortName (or short_name), location, district must be nonempty strings after trim. Optional description/website are trimmed. logoUrl/logo_url and backgroundImageUrl/background_image_url aliases are accepted. short_name is UNIQUE in PostgreSQL; repeat creation can produce a 500. No URL-format validation is enforced.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "name": "Postman Test University",
  "shortName": "PMTEST",
  "location": "Colombo",
  "district": "Colombo",
  "description": "Synthetic Postman test university.",
  "website": "https://example.com",
  "logoUrl": "https://example.com/logo.png",
  "backgroundImageUrl": "https://example.com/banner.png"
}
```

**Expected success:** HTTP **200**. Structure **UniversityWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "University"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** Required fields must be resent. Omitted optional description/website/images become null.

**Runtime evidence:** Not executed. Found and documented from source only.

### 12. DELETE /api/universities/:id

**Purpose:** Delete a university and its courses. **Source:** [Backend/routes/universitiesRoute.js:127](../../routes/universitiesRoute.js#L127).

**Full URL:** `http://localhost:5000/api/universities/:id`. **Postman URL:** `{{baseUrl}}/api/universities/{{universityId}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{universityId}}

**Validation and defaults:** Existing integer university id required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **UniversityDelete** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": "integer",
    "name": "string"
  }
}
```

**Failures:** 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Database ON DELETE CASCADE removes its courses.

**Runtime evidence:** Not executed. Found and documented from source only.

### 13. GET /api/courses

**Purpose:** List and filter courses. **Source:** [Backend/routes/coursesRoute.js:7](../../routes/coursesRoute.js#L7).

**Full URL:** `http://localhost:5000/api/courses`. **Postman URL:** `{{baseUrl}}/api/courses`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Query stream (optional): Case-insensitive stream match; absent, empty, All, undefined or null strings disable filter. Example: Physical Science
- Query search (optional): Substring search in course name/description/university name; empty, undefined or null strings disable filter. Example: Computing

**Validation and defaults:** Optional stream and search strings; no pagination.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **CourseList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "count": "integer",
  "data": "Course[] with university_name, university_short_name, university_location"
}
```

**Failures:** 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Resource variable:** Copy the id of a chosen test row from data into courseId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 14. GET /api/courses/:id

**Purpose:** Read a course. **Source:** [Backend/routes/coursesRoute.js:87](../../routes/coursesRoute.js#L87).

**Full URL:** `http://localhost:5000/api/courses/:id`. **Postman URL:** `{{baseUrl}}/api/courses/{{courseId}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{courseId}}

**Validation and defaults:** Existing integer course id required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **CourseDetail** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "Course with university_name, university_short_name, university_location, university_website"
}
```

**Failures:** 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Runtime evidence:** Not executed. Found and documented from source only.

### 15. GET /api/courses/:id/admission

**Purpose:** Read course admission requirements. **Source:** [Backend/routes/coursesRoute.js:114](../../routes/coursesRoute.js#L114).

**Full URL:** `http://localhost:5000/api/courses/:id/admission`. **Postman URL:** `{{baseUrl}}/api/courses/{{courseId}}/admission`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{courseId}}

**Validation and defaults:** Existing integer course id required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **Admission** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": {
    "courseName": "string",
    "universityName": "string",
    "stream": "string",
    "eligiblePill": "string",
    "streamNote": "string",
    "requiredSubjects": [
      {
        "type": "string",
        "name": "string"
      }
    ],
    "subjectsNote": "string",
    "grades": {
      "min": "string",
      "recommended": "string",
      "note": "string"
    },
    "selection": {
      "ranking": "string",
      "cutOff": "string",
      "note": "string"
    },
    "documents": {
      "required": "string",
      "optional": "string",
      "note": "string"
    },
    "deadlines": {
      "results": "string",
      "applications": "string",
      "note": "string"
    }
  }
}
```

**Failures:** 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Notes:** Builds default stream-specific criteria and overlays stored admission_requirements; returned keys can be overridden by the stored object.

**Runtime evidence:** Not executed. Found and documented from source only.

### 16. POST /api/courses

**Purpose:** Create a course. **Source:** [Backend/routes/coursesRoute.js:207](../../routes/coursesRoute.js#L207).

**Full URL:** `http://localhost:5000/api/courses`. **Postman URL:** `{{baseUrl}}/api/courses`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** universityId/university_id, name, code, stream, degreeType/degree_type are required and truthy; the string fields are trimmed. universityId must identify an existing university (foreign key). durationYears/duration_years is parseInt(value) || 4; minZScore/min_z_score is parseFloat(value), default 0; districtCutoffs/district_cutoffs defaults {}; careerPaths/career_paths defaults [] and also accepts a comma-separated string. description defaults empty. No stream enum, positive duration, score range, or numeric validation is enforced. Use a finite decimal fitting DECIMAL(5,4), integer duration, object cutoffs and string[] career paths. admission_requirements is NOT writable by these handlers.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "universityId": "1",
  "name": "Postman Test Computing",
  "code": "PMCS01",
  "stream": "Physical Science",
  "degreeType": "BSc (Hons)",
  "durationYears": 4,
  "minZScore": 1.5,
  "districtCutoffs": {
    "Colombo": 1.6,
    "Kandy": 1.5
  },
  "description": "Synthetic computing course.",
  "careerPaths": [
    "Software Engineer",
    "Data Analyst"
  ]
}
```

**Expected success:** HTTP **201**. Structure **CourseWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "Course"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Automatic ID capture:** Successful response data.id → courseId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 17. PUT /api/courses/:id

**Purpose:** Replace a course's editable fields. **Source:** [Backend/routes/coursesRoute.js:252](../../routes/coursesRoute.js#L252).

**Full URL:** `http://localhost:5000/api/courses/:id`. **Postman URL:** `{{baseUrl}}/api/courses/{{courseId}}`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{courseId}}

**Validation and defaults:** universityId/university_id, name, code, stream, degreeType/degree_type are required and truthy; the string fields are trimmed. universityId must identify an existing university (foreign key). durationYears/duration_years is parseInt(value) || 4; minZScore/min_z_score is parseFloat(value), default 0; districtCutoffs/district_cutoffs defaults {}; careerPaths/career_paths defaults [] and also accepts a comma-separated string. description defaults empty. No stream enum, positive duration, score range, or numeric validation is enforced. Use a finite decimal fitting DECIMAL(5,4), integer duration, object cutoffs and string[] career paths. admission_requirements is NOT writable by these handlers.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "universityId": "1",
  "name": "Postman Test Computing",
  "code": "PMCS01",
  "stream": "Physical Science",
  "degreeType": "BSc (Hons)",
  "durationYears": 4,
  "minZScore": 1.5,
  "districtCutoffs": {
    "Colombo": 1.6,
    "Kandy": 1.5
  },
  "description": "Synthetic computing course.",
  "careerPaths": [
    "Software Engineer",
    "Data Analyst"
  ]
}
```

**Expected success:** HTTP **200**. Structure **CourseWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "Course"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** Required fields must be resent. Omitted optional fields revert to handler defaults.

**Runtime evidence:** Not executed. Found and documented from source only.

### 18. DELETE /api/courses/:id

**Purpose:** Delete a course. **Source:** [Backend/routes/coursesRoute.js:307](../../routes/coursesRoute.js#L307).

**Full URL:** `http://localhost:5000/api/courses/:id`. **Postman URL:** `{{baseUrl}}/api/courses/{{courseId}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{courseId}}

**Validation and defaults:** Existing integer course id required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **CourseDelete** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": "integer",
    "name": "string"
  }
}
```

**Failures:** 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** Does not clean student_profiles.saved_course_ids.

**Runtime evidence:** Not executed. Found and documented from source only.

### 19. GET /api/students/:email

**Purpose:** Read a student profile by email. **Source:** [Backend/routes/studentsRoute.js:7](../../routes/studentsRoute.js#L7).

**Full URL:** `http://localhost:5000/api/students/:email`. **Postman URL:** `{{baseUrl}}/api/students/{{studentEmail}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path email: URL-encoded student email; Postman {{studentEmail}}

**Validation and defaults:** Existing student email, matched case-insensitively; use a URL-encoded email path.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **StudentRow** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "StudentProfile (raw DB row, snake_case, includes password column)"
}
```

**Failures:** 404 if the student is absent; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Notes:** SELECT * includes the password column. Treat any real response as sensitive; no sample password hash is exported.

**Runtime evidence:** Not executed. Found and documented from source only.

### 20. PUT /api/students/:email

**Purpose:** Update basic student profile fields. **Source:** [Backend/routes/studentsRoute.js:26](../../routes/studentsRoute.js#L26).

**Full URL:** `http://localhost:5000/api/students/:email`. **Postman URL:** `{{baseUrl}}/api/students/{{studentEmail}}`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path email: URL-encoded student email; Postman {{studentEmail}}

**Validation and defaults:** Existing email required. No required body fields. fullName, school, district use truthy values; interests changes only when an array. location and skills are destructured but ignored.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "fullName": "Postman Test Student Updated",
  "school": "Example College",
  "district": "Colombo",
  "interests": [
    "Computing",
    "Technology"
  ]
}
```

**Expected success:** HTTP **200**. Structure **StudentRow** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "StudentProfile (raw DB row, snake_case, includes password column)"
}
```

**Failures:** 404 student missing; 500 SQL/database/server error.

**Side effects:** Writes database records.

**Notes:** Source caveat: NULLIF uses "" in SQL, which PostgreSQL treats as a zero-length quoted identifier rather than an empty string literal. The handler declares 200 but is likely to return 500 as written; not runtime verified. RETURNING * also includes password.

**Runtime evidence:** Not executed. Found and documented from source only.

### 21. POST /api/students

**Purpose:** Create or upsert a student profile. **Source:** [Backend/routes/studentsRoute.js:60](../../routes/studentsRoute.js#L60).

**Full URL:** `http://localhost:5000/api/students`. **Postman URL:** `{{baseUrl}}/api/students`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** Only truthy fullName and email are explicitly required; no email regex/password validation. Defaults: stream Physical Science, zScore 0, district Colombo, school empty, interests/preferredLocations/subjects []. Email is LOWERed but not trimmed. zScore is parseFloat(value) || 0. Non-array subjects becomes []. Subject item shape is not validated; string[] interests/preferences suit the DB.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "fullName": "Postman Test Student",
  "email": "postman.student@example.com",
  "stream": "Physical Science",
  "zScore": 1.8,
  "district": "Colombo",
  "school": "Example College",
  "interests": [
    "Computing"
  ],
  "preferredLocations": [
    "Colombo"
  ],
  "subjects": [
    {
      "name": "Combined Mathematics",
      "grade": "A"
    },
    {
      "name": "Physics",
      "grade": "B"
    },
    {
      "name": "Chemistry",
      "grade": "B"
    }
  ]
}
```

**Expected success:** HTTP **200**. Structure **StudentRow** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "StudentProfile (raw DB row, snake_case, includes password column)"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** Actual route is POST only, despite a comment saying POST / PUT. Updates stream, z-score, district, interests, preferences and subjects on email conflict; preserves an existing password. RETURNING * includes password.

**Automatic ID capture:** Successful response data.id → studentId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 22. POST /api/students/:email/toggle-save

**Purpose:** Toggle saving a course. **Source:** [Backend/routes/studentsRoute.js:115](../../routes/studentsRoute.js#L115).

**Full URL:** `http://localhost:5000/api/students/:email/toggle-save`. **Postman URL:** `{{baseUrl}}/api/students/{{studentEmail}}/toggle-save`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path email: URL-encoded student email; Postman {{studentEmail}}

**Validation and defaults:** Existing student email and truthy courseId required; courseId is parseInt(...,10). Use an existing integer course ID. Course existence is not checked and there is no FK on the saved ID array.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "courseId": "1"
}
```

**Expected success:** HTTP **200**. Structure **SavedToggle** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "isSaved": "boolean",
  "savedCourseIds": "integer[]"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 404 if the student is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** Sending the same request twice undoes the save. Response has isSaved and savedCourseIds at the top level.

**Runtime evidence:** Not executed. Found and documented from source only.

### 23. GET /api/students/:email/saved-courses

**Purpose:** List a student's saved course details. **Source:** [Backend/routes/studentsRoute.js:161](../../routes/studentsRoute.js#L161).

**Full URL:** `http://localhost:5000/api/students/:email/saved-courses`. **Postman URL:** `{{baseUrl}}/api/students/{{studentEmail}}/saved-courses`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path email: URL-encoded student email; Postman {{studentEmail}}

**Validation and defaults:** Student email path required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **CourseList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "count": "integer",
  "data": "Course[] with university_name, university_short_name, university_location"
}
```

**Failures:** 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Notes:** Missing student or empty saved IDs returns 200 with count 0 and data [], rather than 404.

**Runtime evidence:** Not executed. Found and documented from source only.

### 24. DELETE /api/students/:email

**Purpose:** Delete a student account. **Source:** [Backend/routes/studentsRoute.js:192](../../routes/studentsRoute.js#L192).

**Full URL:** `http://localhost:5000/api/students/:email`. **Postman URL:** `{{baseUrl}}/api/students/{{studentEmail}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path email: URL-encoded student email; Postman {{studentEmail}}

**Validation and defaults:** Existing student email required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **Message** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string"
}
```

**Failures:** 404 if the student is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** Deletes only student_profiles; does not explicitly delete inquiries, personal notifications or reset codes.

**Runtime evidence:** Not executed. Found and documented from source only.

### 25. POST /api/match

**Purpose:** Calculate course recommendations. **Source:** [Backend/routes/matchingRoute.js:8](../../routes/matchingRoute.js#L8).

**Full URL:** `http://localhost:5000/api/match`. **Postman URL:** `{{baseUrl}}/api/match`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** Truthy stream and zScore !== undefined required. zScore is parseFloat, with no finite/range check. district defaults Colombo; interests and preferredLocations default []. Use a valid stream string, finite score, and string arrays.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "stream": "Physical Science",
  "zScore": 1.8,
  "district": "Colombo",
  "interests": [
    "Computing"
  ],
  "preferredLocations": [
    "Colombo"
  ]
}
```

**Expected success:** HTTP **200**. Structure **Match** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "meta": {
    "stream": "string",
    "zScore": "number",
    "district": "string",
    "totalEvaluated": "integer",
    "eligibleCount": "integer",
    "reachCount": "integer"
  },
  "data": {
    "topRecommendations": "MatchedCourse[] (up to 5)",
    "eligible": "MatchedCourse[]",
    "reach": "MatchedCourse[]",
    "others": "MatchedCourse[]",
    "all": "MatchedCourse[]"
  }
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 500 for database/server/type/constraint errors.

**Side effects:** Read-only calculation using SELECT; no database writes.

**Notes:** safe if score-minus-cutoff >= 0.15; target >= 0; reach >= -0.10; otherwise unlikely. Sorted by matchScore; topRecommendations contains up to 5.

**Runtime evidence:** Not executed. Found and documented from source only.

### 26. GET /api/scholarships

**Purpose:** List and filter scholarships. **Source:** [Backend/routes/scholarshipsRoute.js:7](../../routes/scholarshipsRoute.js#L7).

**Full URL:** `http://localhost:5000/api/scholarships`. **Postman URL:** `{{baseUrl}}/api/scholarships`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Query search (optional): Substring search on title/provider/eligibility. Example: Merit
- Query category (optional): Case-insensitive category match. Example: Merit

**Validation and defaults:** Optional search/category strings; no pagination.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **ScholarshipList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "count": "integer",
  "data": "Scholarship[]"
}
```

**Failures:** 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Resource variable:** Copy the id of a chosen test row from data into scholarshipId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 27. GET /api/scholarships/:id

**Purpose:** Read a scholarship. **Source:** [Backend/routes/scholarshipsRoute.js:50](../../routes/scholarshipsRoute.js#L50).

**Full URL:** `http://localhost:5000/api/scholarships/:id`. **Postman URL:** `{{baseUrl}}/api/scholarships/{{scholarshipId}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{scholarshipId}}

**Validation and defaults:** Existing integer scholarship id required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **ScholarshipDetail** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "Scholarship"
}
```

**Failures:** 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Runtime evidence:** Not executed. Found and documented from source only.

### 28. POST /api/scholarships

**Purpose:** Create a scholarship. **Source:** [Backend/routes/scholarshipsRoute.js:69](../../routes/scholarshipsRoute.js#L69).

**Full URL:** `http://localhost:5000/api/scholarships`. **Postman URL:** `{{baseUrl}}/api/scholarships`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** title, category, provider, eligibility, value, deadline must be nonempty strings after trim. status defaults Open; description/benefits/requirements/applicationInstructions/officialSourceUrl default empty strings. application_instructions and official_source_url aliases accepted. Category/status are not enum-validated; deadline is an arbitrary string, not parsed as a date.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "title": "Postman Test Scholarship",
  "category": "Merit",
  "provider": "Example Education Fund",
  "eligibility": "A/L passes",
  "value": "LKR 10000",
  "deadline": "31 Dec 2026",
  "status": "Open",
  "description": "Synthetic scholarship.",
  "benefits": "Tuition support",
  "requirements": "A/L result sheet",
  "applicationInstructions": "Submit the test application form.",
  "officialSourceUrl": "https://example.com/scholarships"
}
```

**Expected success:** HTTP **201**. Structure **ScholarshipWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "Scholarship"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Automatic ID capture:** Successful response data.id → scholarshipId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 29. PUT /api/scholarships/:id

**Purpose:** Replace a scholarship's editable fields. **Source:** [Backend/routes/scholarshipsRoute.js:111](../../routes/scholarshipsRoute.js#L111).

**Full URL:** `http://localhost:5000/api/scholarships/:id`. **Postman URL:** `{{baseUrl}}/api/scholarships/{{scholarshipId}}`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{scholarshipId}}

**Validation and defaults:** title, category, provider, eligibility, value, deadline must be nonempty strings after trim. status defaults Open; description/benefits/requirements/applicationInstructions/officialSourceUrl default empty strings. application_instructions and official_source_url aliases accepted. Category/status are not enum-validated; deadline is an arbitrary string, not parsed as a date.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "title": "Postman Test Scholarship",
  "category": "Merit",
  "provider": "Example Education Fund",
  "eligibility": "A/L passes",
  "value": "LKR 10000",
  "deadline": "31 Dec 2026",
  "status": "Open",
  "description": "Synthetic scholarship.",
  "benefits": "Tuition support",
  "requirements": "A/L result sheet",
  "applicationInstructions": "Submit the test application form.",
  "officialSourceUrl": "https://example.com/scholarships"
}
```

**Expected success:** HTTP **200**. Structure **ScholarshipWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "Scholarship"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** Required fields must be resent. Omitted optional fields revert to handler defaults.

**Runtime evidence:** Not executed. Found and documented from source only.

### 30. DELETE /api/scholarships/:id

**Purpose:** Delete a scholarship. **Source:** [Backend/routes/scholarshipsRoute.js:165](../../routes/scholarshipsRoute.js#L165).

**Full URL:** `http://localhost:5000/api/scholarships/:id`. **Postman URL:** `{{baseUrl}}/api/scholarships/{{scholarshipId}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{scholarshipId}}

**Validation and defaults:** Existing integer scholarship id required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **ScholarshipDelete** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": "integer",
    "title": "string"
  }
}
```

**Failures:** 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Runtime evidence:** Not executed. Found and documented from source only.

### 31. POST /api/teachers/register

**Purpose:** Register a teacher. **Source:** [Backend/routes/teachersRoute.js:32](../../routes/teachersRoute.js#L32).

**Full URL:** `http://localhost:5000/api/teachers/register`. **Postman URL:** `{{baseUrl}}/api/teachers/register`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** fullName.trim() must have at least 2 characters; valid email regex; password.length at least 6. Use strings, since wrong types can cause a 500. Optional school and subject default to empty strings. A unique email in the shared teachers table is required.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "fullName": "Postman Test Teacher",
  "email": "postman.teacher@example.com",
  "password": "ExampleOnly123!",
  "school": "Example College",
  "subject": "Physics"
}
```

**Expected success:** HTTP **201**. Structure **StaffAuth** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "token": "issued JWT string (not a sample token)",
  "data": {
    "id": "integer",
    "fullName": "string",
    "email": "string",
    "school": "string",
    "subject": "string",
    "role": "stored string"
  }
}
```

**Failures:** 400 validation; 409 shared-table email conflict; 500 server/database error.

**Side effects:** Writes database records.

**Notes:** Signs a JWT with role teacher. INSERT omits role, but initDB defines teachers.role default admin, so data.role can be admin even though the token role is teacher.

**Runtime evidence:** Not executed. Found and documented from source only.

### 32. POST /api/teachers/login

**Purpose:** Log in through teacher authentication. **Source:** [Backend/routes/teachersRoute.js:76](../../routes/teachersRoute.js#L76).

**Full URL:** `http://localhost:5000/api/teachers/login`. **Postman URL:** `{{baseUrl}}/api/teachers/login`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** Valid email regex and truthy password required; use a nonempty string password. Existing teachers table account and matching bcrypt password required.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "email": "postman.teacher@example.com",
  "password": "ExampleOnly123!"
}
```

**Expected success:** HTTP **200**. Structure **StaffAuth** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "token": "issued JWT string (not a sample token)",
  "data": {
    "id": "integer",
    "fullName": "string",
    "email": "string",
    "school": "string",
    "subject": "string",
    "role": "stored string"
  }
}
```

**Failures:** 400 validation; 401 invalid credentials; 500 server/database error.

**Side effects:** Writes database records.

**Notes:** Does not check the stored role; issues role teacher in the JWT for any matching teachers table account.

**Runtime evidence:** Not executed. Found and documented from source only.

### 33. GET /api/teachers/dashboard

**Purpose:** Read the teacher dashboard. **Source:** [Backend/routes/teachersRoute.js:114](../../routes/teachersRoute.js#L114).

**Full URL:** `http://localhost:5000/api/teachers/dashboard`. **Postman URL:** `{{baseUrl}}/api/teachers/dashboard`.

**Required headers:** Authorization: Bearer {{teacherToken}}. **Authentication/roles:** Teacher JWT; role teacher.

**Path/query parameters:** None.

**Validation and defaults:** Teacher JWT required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **TeacherDashboard** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalStudents": "integer",
      "studentsWithZScore": "integer",
      "averageZScore": "number",
      "totalCourses": "integer",
      "totalUniversities": "integer"
    },
    "streamDistribution": [
      {
        "stream": "string",
        "count": "integer"
      }
    ],
    "districtDistribution": [
      {
        "district": "string",
        "count": "integer"
      }
    ],
    "zScoreRanges": [
      {
        "range": "string",
        "count": "integer"
      }
    ],
    "recentStudents": "StaffStudent[]",
    "topStudents": "StaffStudent[] without joinedAt"
  }
}
```

**Failures:** 401 missing/invalid/expired token; 403 wrong role; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Runtime evidence:** Not executed. Found and documented from source only.

### 34. GET /api/teachers/students

**Purpose:** List students for the teacher dashboard. **Source:** [Backend/routes/teachersRoute.js:184](../../routes/teachersRoute.js#L184).

**Full URL:** `http://localhost:5000/api/teachers/students`. **Postman URL:** `{{baseUrl}}/api/teachers/students`.

**Required headers:** Authorization: Bearer {{teacherToken}}. **Authentication/roles:** Teacher JWT; role teacher.

**Path/query parameters:** 

- Query stream (optional): Case-insensitive exact stream match. Example: Physical Science
- Query district (optional): Case-insensitive exact district match. Example: Colombo
- Query search (optional): Case-insensitive substring match on student full_name or email. Example: Postman

**Validation and defaults:** Teacher JWT required; optional filters.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **StaffStudentList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "StaffStudent[]"
}
```

**Failures:** 401 missing/invalid/expired token; 403 wrong role; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Notes:** Filters in memory after fetching the newest 200 students; no pagination and no total count.

**Runtime evidence:** Not executed. Found and documented from source only.

### 35. POST /api/admin/register

**Purpose:** Register an admin. **Source:** [Backend/routes/adminRoute.js:32](../../routes/adminRoute.js#L32).

**Full URL:** `http://localhost:5000/api/admin/register`. **Postman URL:** `{{baseUrl}}/api/admin/register`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** fullName.trim() must have at least 2 characters; valid email regex; password.length at least 6. Use strings, since wrong types can cause a 500. Optional school and subject default to empty strings. A unique email in the shared teachers table is required.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "fullName": "Postman Test Admin",
  "email": "postman.admin@example.com",
  "password": "ExampleOnly123!",
  "school": "Example College",
  "subject": "Physics"
}
```

**Expected success:** HTTP **201**. Structure **StaffAuth** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "token": "issued JWT string (not a sample token)",
  "data": {
    "id": "integer",
    "fullName": "string",
    "email": "string",
    "school": "string",
    "subject": "string",
    "role": "stored string"
  }
}
```

**Failures:** 400 validation; 409 shared-table email conflict; 500 server/database error.

**Side effects:** Writes database records.

**Notes:** Public registration inserts role admin; no administrator token is required.

**Runtime evidence:** Not executed. Found and documented from source only.

### 36. POST /api/admin/login

**Purpose:** Log in through admin authentication. **Source:** [Backend/routes/adminRoute.js:75](../../routes/adminRoute.js#L75).

**Full URL:** `http://localhost:5000/api/admin/login`. **Postman URL:** `{{baseUrl}}/api/admin/login`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** Valid email regex and truthy password required; use a nonempty string password. Existing teachers table account and matching bcrypt password required.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "email": "postman.admin@example.com",
  "password": "ExampleOnly123!"
}
```

**Expected success:** HTTP **200**. Structure **StaffAuth** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "token": "issued JWT string (not a sample token)",
  "data": {
    "id": "integer",
    "fullName": "string",
    "email": "string",
    "school": "string",
    "subject": "string",
    "role": "stored string"
  }
}
```

**Failures:** 400 validation; 401 invalid credentials; 500 server/database error.

**Side effects:** Writes database records.

**Notes:** Does not reject other stored roles at login; signs the stored role (or admin fallback). Protected routes subsequently require admin or teacher.

**Runtime evidence:** Not executed. Found and documented from source only.

### 37. GET /api/admin/dashboard

**Purpose:** Read the admin dashboard. **Source:** [Backend/routes/adminRoute.js:112](../../routes/adminRoute.js#L112).

**Full URL:** `http://localhost:5000/api/admin/dashboard`. **Postman URL:** `{{baseUrl}}/api/admin/dashboard`.

**Required headers:** Authorization: Bearer {{adminToken}}. **Authentication/roles:** Admin-signature JWT; role admin or teacher.

**Path/query parameters:** None.

**Validation and defaults:** JWT verified with ADMIN_JWT_SECRET and role admin or teacher.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **AdminDashboard** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalStudents": "integer",
      "studentsWithZScore": "integer",
      "averageZScore": "number",
      "totalCourses": "integer",
      "totalUniversities": "integer",
      "totalQuestions": "integer"
    },
    "streamDistribution": [
      {
        "stream": "string",
        "count": "integer"
      }
    ],
    "districtDistribution": [
      {
        "district": "string",
        "count": "integer"
      }
    ],
    "zScoreRanges": [
      {
        "range": "string",
        "count": "integer"
      }
    ],
    "recentStudents": "StaffStudent[]",
    "topStudents": "StaffStudent[] without joinedAt"
  }
}
```

**Failures:** 401 missing/invalid/expired token; 403 wrong role; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Runtime evidence:** Not executed. Found and documented from source only.

### 38. GET /api/admin/students

**Purpose:** List students for the admin dashboard. **Source:** [Backend/routes/adminRoute.js:184](../../routes/adminRoute.js#L184).

**Full URL:** `http://localhost:5000/api/admin/students`. **Postman URL:** `{{baseUrl}}/api/admin/students`.

**Required headers:** Authorization: Bearer {{adminToken}}. **Authentication/roles:** Admin-signature JWT; role admin or teacher.

**Path/query parameters:** 

- Query stream (optional): Case-insensitive exact stream match. Example: Physical Science
- Query district (optional): Case-insensitive exact district match. Example: Colombo
- Query search (optional): Case-insensitive substring match on student full_name or email. Example: Postman

**Validation and defaults:** Admin-signature JWT with role admin or teacher; optional filters.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **StaffStudentList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "StaffStudent[]"
}
```

**Failures:** 401 missing/invalid/expired token; 403 wrong role; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Notes:** Filters after fetching the newest 200 students; no pagination and no total count.

**Runtime evidence:** Not executed. Found and documented from source only.

### 39. GET /api/admin/questions

**Purpose:** List assessment questions. **Source:** [Backend/routes/adminRoute.js:212](../../routes/adminRoute.js#L212).

**Full URL:** `http://localhost:5000/api/admin/questions`. **Postman URL:** `{{baseUrl}}/api/admin/questions`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** No auth required; no query filters.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **QuestionList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "AssessmentQuestion[]"
}
```

**Failures:** 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Notes:** Returns ALL questions including inactive ones, ordered by sort_order then id. There is no assessment submit/result endpoint.

**Resource variable:** Copy the id of a chosen test row from data into questionId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 40. POST /api/admin/questions

**Purpose:** Create an assessment question. **Source:** [Backend/routes/adminRoute.js:222](../../routes/adminRoute.js#L222).

**Full URL:** `http://localhost:5000/api/admin/questions`. **Postman URL:** `{{baseUrl}}/api/admin/questions`.

**Required headers:** Content-Type: application/json; Authorization: Bearer {{adminToken}}. **Authentication/roles:** Admin-signature JWT; role admin or teacher.

**Path/query parameters:** None.

**Validation and defaults:** text must be a nonempty string after trim; category must be exactly Technology, Business, Creative or Social. sortOrder should be an integer for the DB; no application integer validation. sortOrder defaults to 99 when falsy (including 0); isActive is not read on create, so DB default true applies.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "text": "I enjoy solving problems using technology.",
  "category": "Technology",
  "sortOrder": 11
}
```

**Expected success:** HTTP **201**. Structure **QuestionWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "AssessmentQuestion"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 401 missing/invalid/expired token; 403 wrong role; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Automatic ID capture:** Successful response data.id → questionId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 41. PUT /api/admin/questions/:id

**Purpose:** Update an assessment question. **Source:** [Backend/routes/adminRoute.js:241](../../routes/adminRoute.js#L241).

**Full URL:** `http://localhost:5000/api/admin/questions/:id`. **Postman URL:** `{{baseUrl}}/api/admin/questions/{{questionId}}`.

**Required headers:** Content-Type: application/json; Authorization: Bearer {{adminToken}}. **Authentication/roles:** Admin-signature JWT; role admin or teacher.

**Path/query parameters:** 

- Path id: existing integer; Postman {{questionId}}

**Validation and defaults:** text must be a nonempty string after trim; category must be exactly Technology, Business, Creative or Social. sortOrder should be an integer for the DB; no application integer validation. Required text/category must be resent. sortOrder defaults to 99 only when null/undefined; isActive defaults true only when null/undefined. Use a boolean isActive.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "text": "I enjoy solving technical problems.",
  "category": "Technology",
  "sortOrder": 11,
  "isActive": true
}
```

**Expected success:** HTTP **200**. Structure **QuestionWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "AssessmentQuestion"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 401 missing/invalid/expired token; 403 wrong role; 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Runtime evidence:** Not executed. Found and documented from source only.

### 42. DELETE /api/admin/questions/:id

**Purpose:** Delete an assessment question. **Source:** [Backend/routes/adminRoute.js:267](../../routes/adminRoute.js#L267).

**Full URL:** `http://localhost:5000/api/admin/questions/:id`. **Postman URL:** `{{baseUrl}}/api/admin/questions/{{questionId}}`.

**Required headers:** Authorization: Bearer {{adminToken}}. **Authentication/roles:** Admin-signature JWT; role admin or teacher.

**Path/query parameters:** 

- Path id: existing integer; Postman {{questionId}}

**Validation and defaults:** Existing integer question id, parsed with parseInt.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **Message** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string"
}
```

**Failures:** 401 missing/invalid/expired token; 403 wrong role; 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Runtime evidence:** Not executed. Found and documented from source only.

### 43. POST /api/inquiries

**Purpose:** Submit a student inquiry. **Source:** [Backend/routes/inquiriesRoute.js:29](../../routes/inquiriesRoute.js#L29).

**Full URL:** `http://localhost:5000/api/inquiries`. **Postman URL:** `{{baseUrl}}/api/inquiries`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** studentEmail, subject, message must be truthy strings. subject/message are trimmed after this check, so whitespace-only strings pass the truthiness check. No email regex/category enum. studentName defaults Student; category defaults Admissions; status always Pending.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "studentEmail": "postman.student@example.com",
  "studentName": "Postman Test Student",
  "category": "Admissions",
  "subject": "Postman test admissions question",
  "message": "What documents are required for a computing application?"
}
```

**Expected success:** HTTP **201**. Structure **InquiryWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "Inquiry"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Automatic ID capture:** Successful response data.id → inquiryId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 44. GET /api/inquiries/my

**Purpose:** List inquiries for a student email. **Source:** [Backend/routes/inquiriesRoute.js:65](../../routes/inquiriesRoute.js#L65).

**Full URL:** `http://localhost:5000/api/inquiries/my`. **Postman URL:** `{{baseUrl}}/api/inquiries/my?email={{studentEmail}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Query email (required): Required student email. Example: {{studentEmail}}

**Validation and defaults:** Required nonempty email query; case-insensitive trimmed matching, no email regex.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **InquiryList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "Inquiry[]"
}
```

**Failures:** 400 if the required email query is absent; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Runtime evidence:** Not executed. Found and documented from source only.

### 45. GET /api/inquiries

**Purpose:** List all inquiries for an advisor. **Source:** [Backend/routes/inquiriesRoute.js:86](../../routes/inquiriesRoute.js#L86).

**Full URL:** `http://localhost:5000/api/inquiries`. **Postman URL:** `{{baseUrl}}/api/inquiries`.

**Required headers:** Authorization: Bearer {{adminToken}}. **Authentication/roles:** Admin-signature JWT; role admin or teacher.

**Path/query parameters:** 

- Query status (optional): Case-insensitive status filter. Example: Pending
- Query category (optional): Case-insensitive category filter. Example: Admissions
- Query search (optional): Substring search on subject/message/student name/email. Example: Postman

**Validation and defaults:** Admin-signature JWT with role admin or teacher; optional filters.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **InquiryList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "Inquiry[]"
}
```

**Failures:** 401 missing/invalid/expired token; 403 wrong role; 500 for database/server/type/constraint errors.

**Side effects:** SELECT only, following the inspected handler.

**Notes:** Orders pending inquiries first, then replied, then others; newest first within these groups.

**Runtime evidence:** Not executed. Found and documented from source only.

### 46. PUT /api/inquiries/:id/reply

**Purpose:** Reply and notify the student. **Source:** [Backend/routes/inquiriesRoute.js:122](../../routes/inquiriesRoute.js#L122).

**Full URL:** `http://localhost:5000/api/inquiries/:id/reply`. **Postman URL:** `{{baseUrl}}/api/inquiries/{{inquiryId}}/reply`.

**Required headers:** Content-Type: application/json; Authorization: Bearer {{adminToken}}. **Authentication/roles:** Admin-signature JWT; role admin or teacher.

**Path/query parameters:** 

- Path id: existing integer; Postman {{inquiryId}}

**Validation and defaults:** reply must be a nonempty string after trim. status defaults Replied; unlike the status route, reply does NOT enforce a status enum.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "reply": "Please prepare your A/L results and identification.",
  "status": "Replied"
}
```

**Expected success:** HTTP **200**. Structure **InquiryWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "Inquiry"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 401 missing/invalid/expired token; 403 wrong role; 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Updates the inquiry and attempts to create a personal student notification. The notification helper catches its own errors, so reply can return 200 even if notification insertion fails.

**Runtime evidence:** Not executed. Found and documented from source only.

### 47. PUT /api/inquiries/:id/status

**Purpose:** Change an inquiry status. **Source:** [Backend/routes/inquiriesRoute.js:168](../../routes/inquiriesRoute.js#L168).

**Full URL:** `http://localhost:5000/api/inquiries/:id/status`. **Postman URL:** `{{baseUrl}}/api/inquiries/{{inquiryId}}/status`.

**Required headers:** Content-Type: application/json; Authorization: Bearer {{adminToken}}. **Authentication/roles:** Admin-signature JWT; role admin or teacher.

**Path/query parameters:** 

- Path id: existing integer; Postman {{inquiryId}}

**Validation and defaults:** status must be exactly Pending, Replied or Closed.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "status": "Closed"
}
```

**Expected success:** HTTP **200**. Structure **InquiryWrite** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "data": "Inquiry"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 401 missing/invalid/expired token; 403 wrong role; 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Runtime evidence:** Not executed. Found and documented from source only.

### 48. DELETE /api/inquiries/:id

**Purpose:** Delete an inquiry. **Source:** [Backend/routes/inquiriesRoute.js:195](../../routes/inquiriesRoute.js#L195).

**Full URL:** `http://localhost:5000/api/inquiries/:id`. **Postman URL:** `{{baseUrl}}/api/inquiries/{{inquiryId}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{inquiryId}}

**Validation and defaults:** Existing integer inquiry id, parsed with parseInt.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **Message** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string"
}
```

**Failures:** 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** No auth middleware is attached. Does not explicitly remove its personal notification.

**Runtime evidence:** Not executed. Found and documented from source only.

### 49. GET /api/notifications

**Purpose:** List announcements. **Source:** [Backend/routes/notificationsRoute.js:23](../../routes/notificationsRoute.js#L23).

**Full URL:** `http://localhost:5000/api/notifications`. **Postman URL:** `{{baseUrl}}/api/notifications`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Query stream (optional): Exact target_stream filter including global announcements; omitted or lowercase all disables filter. Example: Physical Science

**Validation and defaults:** Optional stream filter.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **NotificationList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "count": "integer",
  "data": "Notification[]"
}
```

**Failures:** 500 for database/server/type/constraint errors.

**Side effects:** Calls CREATE TABLE IF NOT EXISTS before reading; therefore not guaranteed to be database read-only.

**Notes:** Ordered by is_pinned descending then created_at descending.

**Resource variable:** Copy the id of a chosen test row from data into notificationId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 50. GET /api/notifications/unread-count

**Purpose:** Count all announcements. **Source:** [Backend/routes/notificationsRoute.js:48](../../routes/notificationsRoute.js#L48).

**Full URL:** `http://localhost:5000/api/notifications/unread-count`. **Postman URL:** `{{baseUrl}}/api/notifications/unread-count`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** No parameters; stream is not read.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **Count** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "count": "integer"
}
```

**Failures:** 500 for database/server/type/constraint errors.

**Side effects:** Calls CREATE TABLE IF NOT EXISTS.

**Notes:** Despite the name, counts ALL announcements; no per-user read tracking.

**Runtime evidence:** Not executed. Found and documented from source only.

### 51. POST /api/notifications

**Purpose:** Create an announcement. **Source:** [Backend/routes/notificationsRoute.js:61](../../routes/notificationsRoute.js#L61).

**Full URL:** `http://localhost:5000/api/notifications`. **Postman URL:** `{{baseUrl}}/api/notifications`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** None.

**Validation and defaults:** Truthy title and message required; no trim/length validation. type defaults info; accepted types info, warning, success, deadline, scholarship; other values silently become info. targetStream defaults null; isPinned defaults false; use a boolean.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "title": "Postman test announcement",
  "message": "This is a synthetic announcement.",
  "type": "info",
  "targetStream": "Physical Science",
  "isPinned": false
}
```

**Expected success:** HTTP **201**. Structure **NotificationDetail** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "Notification"
}
```

**Failures:** 400 for explicit required-field/enum validation, where implemented; 500 for database/server/type/constraint errors.

**Side effects:** Creates table if absent, then inserts announcement.

**Notes:** Comments say admin only, but no authentication middleware is attached.

**Automatic ID capture:** Successful response data.id → notificationId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 52. PUT /api/notifications/:id

**Purpose:** Partially update an announcement. **Source:** [Backend/routes/notificationsRoute.js:93](../../routes/notificationsRoute.js#L93).

**Full URL:** `http://localhost:5000/api/notifications/:id`. **Postman URL:** `{{baseUrl}}/api/notifications/{{notificationId}}`.

**Required headers:** Content-Type: application/json. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{notificationId}}

**Validation and defaults:** No required body fields. Omitted/falsy title/message/type preserve existing values; type is NOT enum-validated on update. Omitted targetStream preserves value; null/empty clears it. Omitted/null isPinned preserves it; false updates it.

**Example JSON body:** (synthetic; replace prerequisite credentials/IDs/OTP)

```json
{
  "title": "Postman test announcement",
  "message": "This is a synthetic announcement.",
  "type": "info",
  "targetStream": "Physical Science",
  "isPinned": false
}
```

**Expected success:** HTTP **200**. Structure **NotificationDetail** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "data": "Notification"
}
```

**Failures:** 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** No authentication middleware. Does not call ensureTable; table must already exist.

**Runtime evidence:** Not executed. Found and documented from source only.

### 53. DELETE /api/notifications/:id

**Purpose:** Delete an announcement. **Source:** [Backend/routes/notificationsRoute.js:120](../../routes/notificationsRoute.js#L120).

**Full URL:** `http://localhost:5000/api/notifications/:id`. **Postman URL:** `{{baseUrl}}/api/notifications/{{notificationId}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{notificationId}}

**Validation and defaults:** Existing integer announcement id required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **NotificationDelete** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string",
  "id": "integer"
}
```

**Failures:** 404 if the resource is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** No authentication middleware. Does not call ensureTable; table must already exist.

**Runtime evidence:** Not executed. Found and documented from source only.

### 54. GET /api/student-notifications

**Purpose:** List a student's personal inbox. **Source:** [Backend/routes/studentNotificationsRoute.js:23](../../routes/studentNotificationsRoute.js#L23).

**Full URL:** `http://localhost:5000/api/student-notifications`. **Postman URL:** `{{baseUrl}}/api/student-notifications?email={{studentEmail}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Query email (required): Required student email. Example: {{studentEmail}}

**Validation and defaults:** Required nonempty email query, compared case-insensitively after trim.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **StudentNotificationList** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "count": "integer",
  "data": "StudentNotification[]"
}
```

**Failures:** 400 if the required email query is absent; 500 for database/server/type/constraint errors.

**Side effects:** Calls CREATE TABLE IF NOT EXISTS before validating the email.

**Notes:** Returns newest 50 notifications; no ownership check or token requirement.

**Resource variable:** Copy the id of a chosen test row from data into studentNotificationId.

**Runtime evidence:** Not executed. Found and documented from source only.

### 55. GET /api/student-notifications/unread-count

**Purpose:** Count unread personal notifications. **Source:** [Backend/routes/studentNotificationsRoute.js:44](../../routes/studentNotificationsRoute.js#L44).

**Full URL:** `http://localhost:5000/api/student-notifications/unread-count`. **Postman URL:** `{{baseUrl}}/api/student-notifications/unread-count`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Query email (optional): Email used to count is_read=false notifications; absent returns 0. Example: {{studentEmail}}

**Validation and defaults:** Optional email query; without it returns count 0.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **Count** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "count": "integer"
}
```

**Failures:** 500 for database/server/type/constraint errors.

**Side effects:** Calls CREATE TABLE IF NOT EXISTS even when no email is supplied.

**Runtime evidence:** Not executed. Found and documented from source only.

### 56. PUT /api/student-notifications/mark-all-read

**Purpose:** Mark a student's inbox as read. **Source:** [Backend/routes/studentNotificationsRoute.js:61](../../routes/studentNotificationsRoute.js#L61).

**Full URL:** `http://localhost:5000/api/student-notifications/mark-all-read`. **Postman URL:** `{{baseUrl}}/api/student-notifications/mark-all-read?email={{studentEmail}}`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Query email (required): Required email whose notifications are marked read. Example: {{studentEmail}}

**Validation and defaults:** Required nonempty email query.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **Message** (placeholders describe types, not a captured response):

```json
{
  "success": true,
  "message": "string"
}
```

**Failures:** 400 if the required email query is absent; 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** No JSON body, auth or ownership check. Does not ensure table exists.

**Runtime evidence:** Not executed. Found and documented from source only.

### 57. PUT /api/student-notifications/:id/read

**Purpose:** Mark one personal notification as read. **Source:** [Backend/routes/studentNotificationsRoute.js:77](../../routes/studentNotificationsRoute.js#L77).

**Full URL:** `http://localhost:5000/api/student-notifications/:id/read`. **Postman URL:** `{{baseUrl}}/api/student-notifications/{{studentNotificationId}}/read`.

**Required headers:** None. **Authentication/roles:** None enforced.

**Path/query parameters:** 

- Path id: existing integer; Postman {{studentNotificationId}}

**Validation and defaults:** Integer personal-notification id required.

**Example JSON body:** None; leave Body empty.

**Expected success:** HTTP **200**. Structure **Success** (placeholders describe types, not a captured response):

```json
{
  "success": true
}
```

**Failures:** 500 for database/server/type/constraint errors.

**Side effects:** Writes database records.

**Notes:** No JSON body, auth or ownership check; returns 200 even when no row matches. Does not ensure table exists.

**Runtime evidence:** Not executed. Found and documented from source only.

## Response model fields

The names below expand model references in endpoint response structures. Raw rows can contain extra columns added outside this source; no live database inspection was performed.

### University

```json
{
  "id": "integer",
  "name": "string",
  "short_name": "string",
  "location": "string",
  "district": "string",
  "description": "string|null",
  "website": "string|null",
  "logo_url": "string|null",
  "background_image_url": "string|null",
  "created_at": "timestamp"
}
```

### Course

```json
{
  "id": "integer",
  "university_id": "integer|null",
  "name": "string",
  "code": "string",
  "stream": "string",
  "degree_type": "string",
  "duration_years": "integer",
  "min_z_score": "decimal number or string",
  "district_cutoffs": "object",
  "description": "string|null",
  "career_paths": "string[]",
  "admission_requirements": "object",
  "created_at": "timestamp"
}
```

### StudentProfile

```json
{
  "id": "integer",
  "full_name": "string",
  "email": "string",
  "password": "sensitive password hash string|null (returned by raw profile handlers)",
  "school": "string",
  "stream": "string|null",
  "al_year": "string",
  "subjects": "JSON[]",
  "z_score": "decimal number/string|null",
  "district": "string|null",
  "interests": "string[]",
  "preferred_locations": "string[]",
  "saved_course_ids": "integer[]",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Scholarship

```json
{
  "id": "integer",
  "title": "string",
  "category": "string",
  "provider": "string",
  "eligibility": "string",
  "value": "string",
  "deadline": "string",
  "status": "string",
  "description": "string|null",
  "benefits": "string|null",
  "requirements": "string|null",
  "application_instructions": "string|null",
  "official_source_url": "string|null",
  "created_at": "timestamp"
}
```

### AssessmentQuestion

```json
{
  "id": "integer",
  "text": "string",
  "category": "Technology|Business|Creative|Social",
  "sort_order": "integer",
  "is_active": "boolean",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Inquiry

```json
{
  "id": "integer",
  "student_email": "string",
  "student_name": "string",
  "category": "string",
  "subject": "string",
  "message": "string",
  "status": "string",
  "admin_reply": "string",
  "replied_at": "timestamp|null",
  "replied_by": "string|null",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Notification

```json
{
  "id": "integer",
  "title": "string",
  "message": "string",
  "type": "string",
  "target_stream": "string|null",
  "is_pinned": "boolean",
  "created_at": "timestamp"
}
```

### StudentNotification

```json
{
  "id": "integer",
  "student_email": "string",
  "title": "string",
  "message": "string",
  "type": "string",
  "inquiry_id": "integer|null",
  "is_read": "boolean",
  "created_at": "timestamp"
}
```

### StaffStudent

```json
{
  "id": "integer",
  "fullName": "string",
  "email": "string",
  "school": "string",
  "stream": "string",
  "district": "string",
  "zScore": "number",
  "joinedAt": "timestamp (recent/list only)"
}
```

### MatchedCourse

```json
{
  "base": "Course with university_name, university_short_name, university_location, university_district",
  "requiredCutoff": "number",
  "studentZScore": "number",
  "zDiff": "number",
  "matchStatus": "safe|target|reach|unlikely",
  "matchStatusLabel": "string",
  "matchScore": "integer (max 100)",
  "interestMatchCount": "integer"
}
```

## Environment variables

| Variable | Initial export value / purpose |
|---|---|
| baseUrl | http://localhost:5000 |
| token | Empty; set locally or captured after successful requests (secret) |
| teacherToken | Empty; set locally or captured after successful requests (secret) |
| adminToken | Empty; set locally or captured after successful requests (secret) |
| studentEmail | postman.student@example.com |
| password | Empty; set locally or captured after successful requests (secret) |
| teacherEmail | postman.teacher@example.com |
| teacherPassword | Empty; set locally or captured after successful requests (secret) |
| adminEmail | postman.admin@example.com |
| adminPassword | Empty; set locally or captured after successful requests (secret) |
| newPassword | Empty; set locally or captured after successful requests (secret) |
| otp | Empty; set locally or captured after successful requests (secret) |
| studentId | Empty; set locally or captured after successful requests |
| teacherId | Empty; set locally or captured after successful requests |
| adminId | Empty; set locally or captured after successful requests |
| universityId | Empty; set locally or captured after successful requests |
| courseId | Empty; set locally or captured after successful requests |
| scholarshipId | Empty; set locally or captured after successful requests |
| questionId | Empty; set locally or captured after successful requests |
| inquiryId | Empty; set locally or captured after successful requests |
| notificationId | Empty; set locally or captured after successful requests |
| studentNotificationId | Empty; set locally or captured after successful requests |

baseUrl is the server origin. token is the student JWT; teacherToken/adminToken cover the different signing/role requirements. ID variables start empty until copied from a selected test row or captured from a successful create. studentNotificationId is copied from a personal inbox row. All credential/OTP/token values are empty in the generated environment.

## Audit coverage

Inspected Backend/index.js, every Backend/routes/*.js file, Backend/config/db.js, Backend/config/emailService.js, the university banner config/update script, scripts/verify-api.js, check-db.js, package.json, prisma/schema.prisma, backend/project README files, and redacted metadata from backend environment files. Dependency code was not treated as application endpoint source. Frontend files do not register backend routes.

The collection contains exactly one request per explicit method/path (57), including all nested path segments and mount prefixes. No fabricated endpoints, successful tests, observed database rows, credentials or issued tokens were added.

## Artifact validation (offline; not backend endpoint tests)

- Both exported JSON files parse. The collection passes the official [Postman Collection v2.1 JSON schema](https://schema.postman.com/json/collection/v2.1.0/collection.json).
- All 57 collection method/path pairs match the explicit route registrations, with no duplicates or extra requests. Authentication assignments match handler middleware. Every referenced environment variable exists.
- All 57 post-response scripts compile. Six authentication scripts were exercised with synthetic success/failure responses (12 cases): top-level token capture works on success and saves nothing on failure. These are script checks, not real logins.
- Every JSON example block in this guide and every raw request body parses.
- Artifact scans found no values from sensitive environment keys, no JWT fallback signing values, no database connection URI and no JWT-shaped issued token. Secret environment variables export empty.
- Tracked backend source has no diff; only Backend/docs/postman files were added. No database mutation request was sent.

