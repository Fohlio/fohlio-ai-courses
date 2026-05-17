import "dotenv/config";
import { readFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ADMIN_GITHUB_NICKNAME } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const COURSE_ID = "course-nestjs";
const COURSE_SLUG = "nestjs";

type HomeworkTaskSeed = {
  id: string;
  title: string;
  description: string;
  category: "required" | "advanced";
  submissionType: "pr_link" | "screenshot" | "text" | "quiz" | "checklist";
  order: number;
  modelAnswer?: string;
  estimatedMinutes?: number;
};

type LessonSeed = {
  id: string;
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  learningGoals: string[];
  contentFile: string;
  isPublished: boolean;
  homework: HomeworkTaskSeed[];
};

const LESSONS: LessonSeed[] = [
  {
    id: "nestjs-lesson-1",
    slug: "intro",
    order: 1,
    title: "Why NestJS? From Spaghetti to Structure",
    subtitle: "The airport analogy, CLI setup, first endpoint",
    description:
      "Understand what problem NestJS solves, install the CLI, scaffold your first project, and learn the core mental model: Modules, Controllers, Services.",
    learningGoals: [
      "Understand why NestJS exists and what problem it solves",
      "Know the core philosophy: modules, dependency injection, decorators",
      "Scaffold, run, and navigate a new NestJS project",
      "Understand what happens when Nest starts up",
      "Have a mental model (the airport) for every lesson ahead",
    ],
    contentFile: "nestjs-1-intro.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-1-1",
        title: "Scaffold and run airport-api",
        description:
          "Install the Nest CLI (npm i -g @nestjs/cli), create the project (nest new airport-api), add the GET /hello/:name endpoint from Part 5, and start the server (npm run start:dev). Submit a screenshot showing the endpoint responding in your browser or Postman — the URL and the response body must both be visible.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 20,
        modelAnswer:
          "Your screenshot should show: the browser or Postman URL bar containing /hello/<some-name>, and the response body returning a string that includes the name. The terminal should show no compile errors. If you see 'Cannot GET /hello/name', the route decorator or parameter decorator is missing — check @Get('hello/:name') and @Param('name').",
      },
      {
        id: "nestjs-task-1-2",
        title: "Controller vs Service — in your own words",
        description:
          "In 1–2 sentences, explain the difference between a Controller and a Service in NestJS. Use the airport analogy from the lesson. Do not copy the lesson text — rephrase it in your own words so you can recall it without looking.",
        category: "required",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 10,
        modelAnswer:
          "Strong answer captures two things: (1) the Controller is the entry point — it decides which handler runs based on the HTTP method and route, like the check-in desk directing passengers. (2) The Service holds the business logic — it does the actual work, like the back-office staff processing the booking. The key distinction: Controllers know about HTTP; Services know nothing about HTTP. If your answer says 'Controller handles requests and Service handles business logic' that is correct, but bonus points for noting that Services are reusable across multiple Controllers.",
      },
      {
        id: "nestjs-task-1-3",
        title: "Add a FlightController with GET /flights",
        description:
          "Generate a FlightController (nest generate controller flight) and add a GET /flights endpoint that returns a hardcoded array of 3 flight objects: [{ id: 1, destination: 'NYC', gate: 'A12' }, ...]. Register it in AppModule. Submit a screenshot showing the /flights response in Postman or the browser with all 3 objects visible.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 20,
      },
      {
        id: "nestjs-task-1-4",
        title: "Why does DI exist — the elaborative question",
        description:
          "Why does NestJS use a dependency injection container instead of letting each class call 'new SomeDependency()' directly? What specific problems does 'new' cause in a large codebase — think testing, lifecycle management, and sharing state. Write 3–5 sentences. Do not just describe what DI does — explain why the alternative fails.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 15,
      },
    ],
  },
  {
    id: "nestjs-lesson-2",
    slug: "building-blocks",
    order: 2,
    title: "Controllers, Providers & Modules — The Holy Trinity",
    subtitle: "Routing, dependency injection, feature modules",
    description:
      "Go deep on the three core building blocks of every NestJS app: build a real feature module with multiple endpoints, proper DI, @Body, @Query, and @Headers.",
    learningGoals: [
      "Build a feature module end-to-end with the CLI generators",
      "Understand how DI resolves dependencies at startup",
      "Use @Body, @Query, @Param, and @Headers decorators",
      "Know module encapsulation: providers, exports, imports",
      "Recognize common pitfalls: forgotten providers, circular deps",
    ],
    contentFile: "nestjs-2-building-blocks.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-2-1",
        title: "Generate a UsersModule with in-memory CRUD",
        description:
          "Run nest g module users, nest g controller users, nest g service users. Build these endpoints: GET /users (return all), POST /users (add one, body: { name, email }), GET /users/:id, DELETE /users/:id. Use an in-memory array. Submit a screenshot showing POST creating a user and GET /users returning the array with the new entry — both requests visible, ideally side by side in Postman/Insomnia.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 30,
        modelAnswer:
          "Your screenshot must show: (1) a POST /users response with the created user object including an id, (2) a GET /users response that includes that same user in the array. Common mistakes: forgetting to register UsersService in UsersModule providers, or not returning the created object from the POST handler. If you get 'Cannot POST /users', the controller is not registered in the module — check that UsersModule is imported in AppModule.",
      },
      {
        id: "nestjs-task-2-2",
        title: "Build and wire a SharedModule",
        description:
          "Create a SharedModule that exposes a UtilsService with one method — generateId() that returns a UUID or timestamp-based string. Import SharedModule into both FlightsModule and UsersModule. Call UtilsService.generateId() when creating a new user or flight to assign IDs. Submit a screenshot showing POST /users and POST /flights both returning objects with IDs generated by the shared utility.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
        estimatedMinutes: 25,
        modelAnswer:
          "Key checkpoints: (1) SharedModule has 'exports: [UtilsService]' — without this, other modules cannot inject it. (2) FlightsModule and UsersModule both have 'imports: [SharedModule]'. (3) Both service constructors receive UtilsService via DI, not a direct import of the class. If you see 'Nest can't resolve dependencies of UsersService', UtilsService is not exported from SharedModule or SharedModule is not imported into UsersModule.",
      },
      {
        id: "nestjs-task-2-3",
        title: "Injection Scopes — when singleton breaks",
        description:
          "Read the NestJS docs on Injection Scopes (docs.nestjs.com/fundamentals/injection-scopes). Then: describe one realistic production scenario where the default singleton scope genuinely causes a bug — not just 'performance' but a concrete correctness issue. Explain which scope fixes it and why. Write 3–5 sentences. Use the airport analogy if it helps.",
        category: "advanced",
        submissionType: "text",
        order: 1,
        estimatedMinutes: 20,
      },
      {
        id: "nestjs-task-2-4",
        title: "Why does DI beat 'new' in a module system — the elaborative question",
        description:
          "You now have UsersModule, FlightsModule, and SharedModule. Imagine UtilsService was NOT injectable — instead every service did 'const utils = new UtilsService()'. List 3 concrete problems this creates in the airport-api codebase specifically, not in theory. What breaks first in testing? What breaks when UtilsService gains a constructor argument? What breaks if you need to swap the implementation?",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 20,
      },
    ],
  },
  {
    id: "nestjs-lesson-3",
    slug: "request-pipeline",
    order: 3,
    title: "The Request Pipeline",
    subtitle: "Middleware, Guards, Interceptors, Pipes, Exception Filters",
    description:
      "Trace every stop a request makes on its way to your handler and back. Build each layer type. Know when to use which.",
    learningGoals: [
      "Explain the order: Middleware → Guard → Interceptor → Pipe → Handler → Interceptor → Filter",
      "Build a custom logging Middleware",
      "Build a custom Guard for header-based access control",
      "Build a Pipe and an Interceptor",
      "Catch errors with a custom Exception Filter",
    ],
    contentFile: "nestjs-3-request-pipeline.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-3-1",
        title: "LoggingMiddleware + timing in the terminal",
        description:
          "Create a class-based LoggerMiddleware with @Injectable() that logs every request as 'METHOD /url - Xms' (measure elapsed time with Date.now()). Wire it in AppModule.configure() with .forRoutes('*'). Hit at least 3 different endpoints. Submit a screenshot of your terminal showing 3+ logged lines with timing, and the server running without errors.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 25,
        modelAnswer:
          "Your terminal should show lines like 'GET /flights - 12ms', 'POST /users - 5ms', etc. Three things to verify: (1) you implemented NestMiddleware interface with use(req, res, next), (2) you called next() — without it, requests hang, (3) you measured time by storing Date.now() before calling next() and computing the delta in a response finish listener (or simply after next() if the middleware is synchronous). If timing always shows 0ms, you are measuring before the handler runs — move the end timestamp to the response 'finish' event.",
      },
      {
        id: "nestjs-task-3-2",
        title: "ApiKeyGuard + TimingInterceptor — pipeline chain",
        description:
          "Build an ApiKeyGuard that reads an X-Api-Key header and returns 403 if the key is not the expected value. Build a TimingInterceptor that logs 'Handler took Xms' after the handler completes. Apply both to GET /flights — the guard via @UseGuards(), the interceptor via @UseInterceptors(). Submit a screenshot showing: (1) a request without the key getting 403, (2) a request with the correct key getting 200, and (3) the terminal showing the interceptor timing log for the successful request.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
        estimatedMinutes: 30,
        modelAnswer:
          "Checklist: Guard must return false (or throw ForbiddenException) — returning false gives a 403 automatically. Interceptor uses tap() from RxJS to measure time after the observable completes. Both the 403 and the 200 must be visible in the screenshot. The timing log should only appear for the successful request (the guard short-circuits before the interceptor's 'after handler' code on a 403). If you see 'Guard is not defined', check it is in the providers array of the relevant module.",
      },
      {
        id: "nestjs-task-3-3",
        title: "RolesGuard with header-based role check — critique and extend",
        description:
          "Build a RolesGuard that reads X-User-Role from headers and blocks DELETE /flights/:id unless the role is 'admin'. Submit two screenshots: one showing DELETE with X-User-Role: user getting 403, one with X-User-Role: admin getting 204. Then write 2–3 sentences: what is the security flaw in trusting an arbitrary request header for roles, and what would the real fix be in a production system (you will implement it in Lesson 5)? Include this reflection in your text submission alongside the screenshots.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 30,
      },
      {
        id: "nestjs-task-3-4",
        title: "Why a Guard and not Middleware for authentication — the elaborative question",
        description:
          "In the pipeline, both Middleware and Guards run before the handler. So why does NestJS even have Guards — why not just put authentication logic in a Middleware? What specifically can a Guard do that Middleware cannot? Think about: access to ExecutionContext, decorators, the can-activate contract, and testability. Write 4–5 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 20,
      },
    ],
  },
  {
    id: "nestjs-lesson-4",
    slug: "data-layer",
    order: 4,
    title: "The Data Layer — Prisma & PostgreSQL",
    subtitle: "Databases, the repository pattern, migrations, seeding",
    description:
      "Connect NestJS to PostgreSQL using Prisma. Replace the in-memory store from Lesson 2 with a real, persisted, type-safe data layer.",
    learningGoals: [
      "Set up Prisma inside a NestJS app",
      "Build a PrismaService and inject it app-wide",
      "Run migrations and seed data",
      "Replace in-memory CRUD with type-safe Prisma queries",
      "Know the tradeoffs: Prisma vs TypeORM vs MikroORM",
    ],
    contentFile: "nestjs-4-data-layer.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-4-1",
        title: "Prisma migration + persistent FlightsService",
        description:
          "Run Postgres locally (Docker or native). Run npx prisma init, define a Flight model in schema.prisma (fields: id, code, destination, capacity, createdAt). Run prisma migrate dev --name init. Generate PrismaModule + PrismaService, inject PrismaService into FlightsService, and rewrite all CRUD methods to use Prisma. Verify data survives server restart by: (1) POSTing a flight, (2) stopping the server, (3) restarting, (4) GETting /flights and confirming the flight is still there. Submit a screenshot of the generated migration.sql file AND the GET /flights response after restart.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 40,
        modelAnswer:
          "Two things must be visible: (1) the migration.sql file open in the terminal or editor showing a CREATE TABLE statement with your flight fields, (2) GET /flights returning the flight you created before the restart. Common failure: DATABASE_URL not set in .env — Prisma will error with 'Environment variable not found'. Another common mistake: forgetting onModuleInit() { await this.$connect() } in PrismaService — without it, the first request may race against the connection.",
      },
      {
        id: "nestjs-task-4-2",
        title: "Airline relation + guard-and-pipeline interplay",
        description:
          "This task combines Lesson 4 (Prisma relations) with Lesson 3 (Guards) and Lesson 2 (modules). Add an Airline model to schema.prisma (fields: id, name, iataCode). Each Flight belongs to one Airline (add airlineId foreign key to Flight). Migrate. Add findAllByAirline(airlineId: number) to FlightsService using Prisma where + include. Expose it as GET /flights?airlineId=X. The endpoint must be protected by the ApiKeyGuard from Lesson 3 — pass the key as X-Api-Key header. Submit a screenshot of the JSON response showing nested airline data inside a flight object, with the X-Api-Key header visible in the request.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
        estimatedMinutes: 35,
        modelAnswer:
          "Your response should look like: { id: 1, code: 'AA100', airlineId: 1, airline: { id: 1, name: 'American', iataCode: 'AA' } }. If 'airline' is undefined, you forgot 'include: { airline: true }' in the Prisma query. If you get 403, the X-Api-Key header is missing or wrong. If you get a migration error about foreign keys, make sure you created the Airline table first (or reference it in the same migration) and that Prisma's referential integrity mode matches your Postgres setup.",
      },
      {
        id: "nestjs-task-4-3",
        title: "Debug a broken PrismaService — process-visible task",
        description:
          "Here is a deliberately broken PrismaService. Read it, identify every bug, and explain why each bug matters in a running NestJS app:\n\n@Injectable()\nexport class PrismaService {\n  private client = new PrismaClient();\n  async findAllFlights() {\n    return this.client.flight.findMany();\n  }\n}\n\nThe bugs to find: (1) it creates a new PrismaClient instance every time the class is instantiated — what happens when 50 requests come in? (2) it never calls $connect() — what is the first-request failure mode? (3) it does not implement OnModuleDestroy to call $disconnect() — what leaks? Write your answer as a numbered list, one bug per item, with the consequence described. Then write the correct version of PrismaService as a code snippet in your text submission.",
        category: "advanced",
        submissionType: "text",
        order: 1,
        estimatedMinutes: 25,
      },
      {
        id: "nestjs-task-4-4",
        title: "Why Prisma uses a code-generation model — the elaborative question",
        description:
          "Prisma generates a typed client from your schema. TypeORM uses decorators on classes. MikroORM does both. Why does the code-generation approach (Prisma's model) give stronger type safety than the decorator approach, and what does it trade away? Think about: what happens to types after a migration in each approach, what the developer must manually maintain, and where type errors surface (compile time vs runtime). Write 4–6 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 20,
      },
    ],
  },
  {
    id: "nestjs-lesson-5",
    slug: "auth-security",
    order: 5,
    title: "Auth & Security — Passport, JWT, Guards, Helmet, CORS",
    subtitle: "Login flows, JWT, role-based access, production hardening",
    description:
      "Implement full JWT authentication with Passport, role-based Guards, and production security hardening: Helmet, CORS, rate limiting.",
    learningGoals: [
      "Hash passwords with bcrypt and understand why",
      "Build local + JWT Passport strategies",
      "Protect routes with AuthGuard('jwt') and a custom RolesGuard",
      "Configure Helmet, CORS, and rate limiting",
      "Understand cookies vs JWT-in-headers tradeoffs",
    ],
    contentFile: "nestjs-5-auth-security.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-5-1",
        title: "Full auth flow: register → login → protected endpoint",
        description:
          "Add a User model to schema.prisma (fields: id, email, passwordHash, role). Migrate. Build AuthModule with: POST /auth/register (hash password with bcrypt, store user), POST /auth/login (verify password, sign JWT). Then protect FlightsController with @UseGuards(AuthGuard('jwt')). Submit a screenshot showing three consecutive requests in Postman/Insomnia: (1) POST /auth/register with 201, (2) POST /auth/login with the JWT in the response body, (3) GET /flights with the Authorization: Bearer <token> header returning 200. All three must be in the screenshot.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 45,
        modelAnswer:
          "All three responses must be visible. Common failures: (1) 401 on GET /flights even with a valid token — check that JwtStrategy is in AuthModule providers and JwtModule.register() has the correct secret that matches the signing secret. (2) 400 on register — check that body parsing is enabled (it is by default in Nest, but if you switched to Fastify you need fastify/multipart). (3) bcrypt compare returns false — make sure you are comparing req.body.password against the stored hash, not against a re-hashed value.",
      },
      {
        id: "nestjs-task-5-2",
        title: "RolesGuard + Helmet + rate limiting — cumulative hardening",
        description:
          "This task combines Lesson 5 (auth) with Lesson 3 (Guards) and Lesson 4 (Prisma user roles). Implement RolesGuard + @Roles() decorator. Apply @Roles('admin') to DELETE /flights/:id. Set one user's role to 'admin' in the DB directly (prisma studio or a seed script). Then in main.ts: add app.use(helmet()), app.enableCors({ origin: 'http://localhost:3000' }), and ThrottlerModule globally with limit 5 requests per 30 seconds. Submit two screenshots: (1) DELETE /flights/:id with a regular user's JWT getting 403, with an admin JWT getting 204. (2) Response headers from any endpoint showing helmet's Content-Security-Policy and X-Frame-Options headers.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
        estimatedMinutes: 40,
        modelAnswer:
          "Screenshot 1: two DELETE requests — the 403 response body should say 'Forbidden' and the 204 should be empty. The JWT payloads should differ by role. Screenshot 2: response headers must include Content-Security-Policy (from Helmet) and X-Frame-Options: SAMEORIGIN. If headers are missing, helmet() was called after the route setup — it must be before app.listen(). If RolesGuard always returns 403, check that the JWT strategy puts role into req.user and the guard reads it from context.switchToHttp().getRequest().user.",
      },
      {
        id: "nestjs-task-5-3",
        title: "Audit an auth implementation — critique and improve",
        description:
          "Below is a simplified auth implementation. Read it carefully, then: (1) list every security flaw you can find, (2) for each flaw explain the attack scenario, (3) write the corrected version of the problematic line(s) in your text submission.\n\n@Post('login')\nasync login(@Body() body: any) {\n  const user = await this.db.user.findFirst({ where: { email: body.email } });\n  if (user.password === body.password) {\n    return { token: jwt.sign({ userId: user.id }, 'secret', { expiresIn: '100y' }) };\n  }\n  throw new UnauthorizedException();\n}\n\nFlaws to find: plaintext password comparison, hardcoded JWT secret, 100-year expiry, findFirst without null check, body typed as 'any' bypassing validation. Write your metacognitive memo at the end: what did this exercise reveal that a ChatGPT summary of the lesson would not?",
        category: "advanced",
        submissionType: "text",
        order: 1,
        estimatedMinutes: 30,
      },
      {
        id: "nestjs-task-5-4",
        title: "Why hash and not encrypt — the elaborative question",
        description:
          "A hash is one-way; encryption is two-way. So why does a data breach still expose users even when passwords are hashed — and what does bcrypt's cost factor actually protect against that SHA-256 does not? Walk through the attack: attacker has the hash table, no secret key. What can they do with SHA-256 hashes vs bcrypt hashes, and why does the difference matter in practice? Write 4–6 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 20,
      },
    ],
  },
  {
    id: "nestjs-lesson-6",
    slug: "validation-dtos",
    order: 6,
    title: "Validation, Serialization & DTOs Done Right",
    subtitle: "class-validator, class-transformer, mapped types, versioning",
    description:
      "Build bulletproof DTOs with class-validator, control what leaves your API with class-transformer, and master PartialType/PickType for DRY type definitions.",
    learningGoals: [
      "Write validation DTOs with class-validator decorators",
      "Configure global ValidationPipe with the right options",
      "Use class-transformer to exclude/expose fields",
      "Use PartialType, PickType, OmitType to avoid duplication",
      "Implement URI versioning",
    ],
    contentFile: "nestjs-6-validation-dtos.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-6-1",
        title: "CreateFlightDto + ValidationPipe errors in the response",
        description:
          "Create src/flights/dto/create-flight.dto.ts with at minimum: @IsString() on code, @IsInt() @Min(0) on capacity, and one additional validated field of your choice (@IsDateString() on departureDate works well). Wire the global ValidationPipe in main.ts with whitelist: true, forbidNonWhitelisted: true, transform: true. Submit a screenshot of a POST /flights request that is missing one required field — the 400 response body must show the field-level error messages array (not just '400 Bad Request').",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 30,
        modelAnswer:
          "Your 400 response body should look like: { statusCode: 400, message: ['code must be a string', ...], error: 'Bad Request' }. If you see a generic 400 without the message array, the ValidationPipe is not wired globally — check that new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }) is passed to app.useGlobalPipes() in main.ts. If every request returns 400 even with valid data, check that transform: true is set and that you have @IsInt() not @IsNumber() where an integer is expected.",
      },
      {
        id: "nestjs-task-6-2",
        title: "UpdateFlightDto + @Exclude on sensitive fields — cumulative",
        description:
          "This task combines Lesson 6 (DTOs) with Lesson 5 (auth user model) and Lesson 4 (Prisma). Create UpdateFlightDto extends PartialType(CreateFlightDto) and wire it into PATCH /flights/:id. Then add @Exclude() to the passwordHash field on a User response class (create a UserResponseDto or a plain User class with class-transformer). Wire ClassSerializerInterceptor globally. Submit a screenshot showing: (1) a PATCH /flights/1 request with a partial body returning the updated flight, (2) GET /users/:id (or GET /me from Lesson 5's JWT) returning a user object with passwordHash absent from the response.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
        estimatedMinutes: 35,
        modelAnswer:
          "Two things must be visible: (1) PATCH with e.g. { capacity: 200 } returning the full updated flight including unchanged fields — this confirms PartialType works and the handler calls prisma.flight.update() correctly. (2) The user response lacking 'passwordHash' key. If 'passwordHash' still appears, ClassSerializerInterceptor is not global — check app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))). Also ensure the returned object is an instance of the class with @Exclude() — returning a plain object from Prisma won't trigger class-transformer; you must use 'plainToInstance(UserDto, user)'.",
      },
      {
        id: "nestjs-task-6-3",
        title: "Design better DTOs — critique and rebuild",
        description:
          "You are reviewing a teammate's PR. Their DTO for a new BookingModule looks like this:\n\nexport class CreateBookingDto {\n  @IsString() flightId: string;\n  @IsString() passengerId: string;\n  @IsString() seatClass: string;\n  @IsBoolean() isPaid: boolean;\n  @IsString() internalNotes: string;\n  @IsString() createdBy: string;\n  @IsString() updatedBy: string;\n}\n\nIdentify at least 3 problems with this DTO from a production standpoint (think: fields that should never come from the client, missing constraints, missing optionality). Then write the corrected DTO. Include your metacognitive memo: what did you catch that a linter alone would not flag, and what would happen in production if this DTO shipped unchanged?",
        category: "advanced",
        submissionType: "text",
        order: 1,
        estimatedMinutes: 25,
      },
      {
        id: "nestjs-task-6-4",
        title: "Why whitelist beats manual field stripping — the elaborative question",
        description:
          "A developer argues: 'I don't need whitelist: true — I just destructure the fields I need in the handler: const { name, email } = body'. Why is this reasoning wrong in a codebase with 30+ endpoints maintained by a team of 8? Think about: what happens when a new field is added to the DTO but not destructured, what happens when a junior dev calls Object.assign(existingRecord, body), and what 'mass assignment' concretely means in the context of a Prisma update call. Write 4–6 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 20,
      },
    ],
  },
  {
    id: "nestjs-lesson-7",
    slug: "apis-at-scale",
    order: 7,
    title: "APIs at Scale — REST, Swagger & GraphQL",
    subtitle: "OpenAPI auto-docs, versioning, GraphQL resolvers",
    description:
      "Auto-generate Swagger docs, version your API, and build a GraphQL layer with resolvers, mutations, and subscriptions.",
    learningGoals: [
      "Set up Swagger with @nestjs/swagger and decorate your DTOs",
      "Use the Swagger CLI plugin for automatic @ApiProperty inference",
      "Build a GraphQL resolver with queries and mutations",
      "Understand when to add GraphQL vs stick with REST",
      "Get a feel for GraphQL subscriptions",
    ],
    contentFile: "nestjs-7-apis-at-scale.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-7-1",
        title: "Swagger UI with every FlightsController endpoint documented",
        description:
          "Install @nestjs/swagger and wire SwaggerModule.setup('api', app, document) in main.ts. Decorate FlightsController with @ApiTags('flights'). Add @ApiOperation and @ApiResponse(s) to every endpoint (GET list, GET one, POST, PATCH, DELETE). Decorate every field in CreateFlightDto with @ApiProperty (including description and example). Submit a screenshot of the /api Swagger UI showing all FlightsController endpoints expanded with their request/response schemas visible.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 35,
        modelAnswer:
          "The Swagger UI should show a 'flights' tag group with all 5 (or however many you have) endpoints listed. Each endpoint when expanded should show: the operation description, expected request body schema with field descriptions, and at least one documented response code. If the UI is blank or shows no schemas, SwaggerModule.createDocument() is misconfigured — verify that app is the NestApplication instance and the DocumentBuilder.build() result is passed as the third argument. If @ApiProperty fields are missing, check that you are decorating the CreateFlightDto class fields directly, not an interface.",
      },
      {
        id: "nestjs-task-7-2",
        title: "GraphQL query with field selection + Swagger CLI plugin — cumulative",
        description:
          "This task combines Lesson 7 (GraphQL + Swagger) with Lesson 6 (DTOs) and Lesson 4 (Prisma data). Install @nestjs/graphql @nestjs/apollo @apollo/server graphql. Build a FlightResolver with a flights() query that calls FlightsService.findAll(). Open /graphql playground, run a query that selects ONLY code and capacity — not id, not destination. Screenshot the playground showing the query and the response containing only those two fields. Then add the @nestjs/swagger CLI plugin to nest-cli.json (classValidatorShim: true, introspectComments: true), remove @ApiProperty from one DTO field, rebuild, and screenshot the Swagger UI still showing that field.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
        estimatedMinutes: 45,
        modelAnswer:
          "Two screenshots required: (1) GraphQL playground showing a query like '{ flights { code capacity } }' and a response with only code and capacity fields. If you see 'Cannot query field', the Flight type is missing the @Field() decorator on that property. (2) Swagger UI showing the removed-@ApiProperty field still appearing — confirming the CLI plugin inferred it. If the field disappears, the plugin is not active — check that nest-cli.json has the plugins array in compilerOptions, not at the top level.",
      },
      {
        id: "nestjs-task-7-3",
        title: "Design the public API surface for a new Bookings feature — AI-resilient",
        description:
          "The airport-api needs a /bookings resource. Before writing any code, design the API surface: list the endpoints (method + path + brief description), identify which ones need JWT auth, which need role protection, and write the Swagger @ApiOperation description for each. Then: (1) decide whether bookings should be REST-only or also exposed via GraphQL, and defend your choice in 2–3 sentences. (2) Write 2 sentences you would add to the Swagger doc to warn a frontend developer about rate limits on the booking creation endpoint. Submit your design as structured text. This task requires judgment about your specific airport-api — an AI cannot answer it for you without knowing your current schema and auth setup.",
        category: "advanced",
        submissionType: "text",
        order: 1,
        estimatedMinutes: 30,
      },
      {
        id: "nestjs-task-7-4",
        title: "Why does GraphQL not replace REST for all APIs — the elaborative question",
        description:
          "GraphQL lets clients fetch exactly the fields they need, eliminating over-fetching. This sounds strictly better than REST. So why do large production systems (GitHub, Shopify, Stripe) keep their REST APIs alongside GraphQL, and why does NestJS make it equally easy to build both? Identify at least 3 concrete scenarios where REST is the better choice, and explain the technical reason — not 'REST is simpler' but what specific property of the use case makes REST win. Write 5–7 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 20,
      },
    ],
  },
  {
    id: "nestjs-lesson-8",
    slug: "async-power",
    order: 8,
    title: "Async Power — Queues, Events, Caching, Cron",
    subtitle: "BullMQ, EventEmitter, cache-manager, scheduled tasks",
    description:
      "Move slow work out of the request cycle with BullMQ queues, decouple modules with EventEmitter2, speed up reads with caching, and automate tasks with cron jobs.",
    learningGoals: [
      "Cache GET endpoints with cache-manager (in-memory + Redis)",
      "Set up BullMQ and add background jobs",
      "Use EventEmitter2 for domain events",
      "Schedule recurring jobs with @nestjs/schedule",
      "Pick the right logger for production: built-in, Pino, or Winston",
    ],
    contentFile: "nestjs-8-async-power.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-8-1",
        title: "Cache GET /flights with visible timing proof",
        description:
          "Add @nestjs/cache-manager. Apply CacheInterceptor + @CacheTTL(60) to GET /flights. Hit the endpoint twice in a row and capture both response times. Submit a screenshot showing both responses — the second response time must be noticeably lower than the first, or include the terminal showing the Prisma query log only firing on the first request. Tip: add PRISMA_QUERY_LOG=true to .env to see whether Prisma actually queries the DB on the second call.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 25,
        modelAnswer:
          "The screenshot should show either: (a) two Postman/Insomnia requests where response time drops from e.g. 45ms to <5ms, or (b) terminal output showing a Prisma SELECT query on the first request and no SELECT on the second. If timing does not change, CacheInterceptor is not applied — check it is registered in the controller's @UseInterceptors() or wired globally. If every request re-queries the DB, verify CacheModule.register({ ttl: 60 }) is in the imports of the module that owns FlightsController.",
      },
      {
        id: "nestjs-task-8-2",
        title: "BullMQ notification queue + cron cleanup — cumulative async",
        description:
          "This task combines Lesson 8 (queues + cron) with Lesson 4 (Prisma) and Lesson 5 (auth). Install @nestjs/bullmq and run Redis (docker run -p 6379:6379 redis). Register a 'notifications' queue. When a new flight is created via POST /flights (which already requires JWT from Lesson 5), enqueue a 'flight-created' job with the flight id. Build a processor that logs 'Notification sent for flight <id>'. Then add @nestjs/schedule and create a CleanupService with @Cron('*/2 * * * *') (every 2 minutes) that logs '[CRON] Checking for stale jobs at <ISO timestamp>'. Run the app for at least 6 minutes. Submit a screenshot showing: (1) the POST /flights terminal output with the job enqueue log, (2) at least 3 cron firing log lines.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
        estimatedMinutes: 45,
        modelAnswer:
          "Screenshot must show both: the BullMQ processor log line ('Notification sent for flight X') triggered by a POST /flights, and the cron log lines at 2-minute intervals. Common failures: (1) Redis not running — BullMQ will throw 'connect ECONNREFUSED 127.0.0.1:6379'. (2) The processor is not decorated with @Processor('notifications') — the queue name must match exactly. (3) ScheduleModule.forRoot() not imported — @Cron jobs fire silently if the module is missing. If cron fires but the timestamp format is wrong, use new Date().toISOString().",
      },
      {
        id: "nestjs-task-8-3",
        title: "Choose the right async tool for 5 scenarios — AI-resilient judgment",
        description:
          "For each of the 5 airport-api scenarios below, state which tool you would use (EventEmitter2, BullMQ, @Cron, or cache-manager) and write one sentence explaining why. Then write a 3-sentence metacognitive memo: what distinction between the tools was hardest to make, and what would you now look for in a code review to catch an EventEmitter2-where-BullMQ-was-needed mistake?\n\nScenarios:\n1. Send a passenger a welcome email after registration — email sending takes ~800ms.\n2. Invalidate the GET /flights cache when a flight is updated.\n3. Emit an in-process domain event so FlightsModule can notify GateModule without a direct import.\n4. Archive all completed flights older than 30 days every night at 02:00.\n5. Re-try a failed payment up to 3 times with exponential backoff.",
        category: "advanced",
        submissionType: "text",
        order: 1,
        estimatedMinutes: 25,
      },
      {
        id: "nestjs-task-8-4",
        title: "Why does a background queue not solve every latency problem — the elaborative question",
        description:
          "BullMQ moves work out of the request cycle. So why can't you use it to speed up every slow endpoint — for example, why can't you enqueue the database query itself and return the result asynchronously? Walk through what the client would receive, how the response model would have to change, and what additional infrastructure that requires. Then name one class of problem where a queue genuinely does not help latency at all. Write 4–6 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 20,
      },
    ],
  },
  {
    id: "nestjs-lesson-9",
    slug: "microservices",
    order: 9,
    title: "Microservices & Real-time",
    subtitle: "Transport layers, WebSocket gateways, SSE, hybrid apps",
    description:
      "Break a monolith into microservices using NestJS transports, add real-time features with WebSocket gateways, and stream data with Server-Sent Events.",
    learningGoals: [
      "Understand NestJS microservice transports: TCP, Redis, RabbitMQ, Kafka, gRPC",
      "Build a TCP microservice and connect it to the main app via ClientProxy",
      "Create a WebSocket gateway for real-time updates",
      "Decide between WebSockets and SSE",
      "Run HTTP + microservice in one hybrid process",
    ],
    contentFile: "nestjs-9-microservices.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-9-1",
        title: "TCP notifications microservice receiving flight.created events",
        description:
          "Scaffold a sibling NestJS app (notifications-service/ or apps/notifications/) in your project. Make it a TCP microservice on port 4000 with a @EventPattern('flight.created') handler that logs the incoming flight id. In airport-api, wire ClientsModule.register() with Transport.TCP pointing to port 4000. After a successful POST /flights (which requires JWT from Lesson 5), call client.emit('flight.created', { id: flight.id }). Run both processes. Submit a screenshot showing both terminal windows: the airport-api terminal accepting the POST /flights request, and the notifications-service terminal logging the received flight.created event.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 40,
        modelAnswer:
          "Both terminals must be visible in the screenshot. The notifications-service terminal should show a log line like 'Received flight.created: { id: 1 }'. Common failures: (1) ECONNREFUSED — the notifications-service is not running, or its TCP port does not match ClientsModule. (2) The event is never emitted — check that client.emit() is called after the Prisma create, not before. (3) @EventPattern('flight.created') name must exactly match the string passed to client.emit() — case-sensitive.",
      },
      {
        id: "nestjs-task-9-2",
        title: "WebSocket gateway + Redis transport switch — cumulative real-time",
        description:
          "This task combines Lesson 9 (WebSockets + transport) with Lesson 8 (BullMQ events) and Lesson 5 (JWT). Add a FlightsGateway using @WebSocketGateway() and Socket.IO. When PATCH /flights/:id succeeds (protected by AuthGuard from Lesson 5), broadcast a 'flight_updated' event with the updated flight via the gateway. Test it with a simple HTML file or Postman's WebSocket client — connect, then PATCH a flight, confirm the browser/client receives the event. Then switch the notifications-service transport from Transport.TCP to Transport.REDIS (same Redis you use for BullMQ from Lesson 8). Verify emit('flight.created') still works. Submit a screenshot showing the WebSocket client receiving a flight_updated event AND both terminals running with Redis transport.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
        estimatedMinutes: 45,
        modelAnswer:
          "Your screenshot needs two things: (1) the WebSocket client (browser console, Postman WS, or a simple HTML page) showing it received 'flight_updated' with the updated flight data, (2) both terminals running with the Redis transport active. If the WebSocket event is never received, check that server.emit() is called on the gateway's @WebSocketServer() server instance. If the Redis transport fails to connect, verify the Redis host/port in Transport.REDIS options matches your running Redis container.",
      },
      {
        id: "nestjs-task-9-3",
        title: "Architect the multi-service airport for a new Baggage feature — AI-resilient",
        description:
          "The airport-api is growing. A new BaggageService must track bags tied to flights. Design how it communicates with the existing services. Answer these questions in structured text: (1) Should BaggageService be a new NestJS microservice or a module inside airport-api — give your reasoning, not just a choice. (2) If a bag is lost, which transport would you use to notify the passenger in real time (WebSocket, SSE, TCP microservice event, or BullMQ job), and why? (3) What happens to in-flight BullMQ jobs if the BaggageService process crashes — how would you protect against job loss? Your answer must reference the specific architecture of your airport-api as it exists after Lessons 1–9.",
        category: "advanced",
        submissionType: "text",
        order: 1,
        estimatedMinutes: 25,
      },
      {
        id: "nestjs-task-9-4",
        title: "Why does a microservice boundary cost more than a function call — the elaborative question",
        description:
          "Calling a method on a NestJS service is a synchronous in-process function call. Calling a TCP microservice goes over the network. This is obvious. But the real costs of a microservice boundary go beyond network latency — what are 3 additional failure modes or operational costs that appear the moment you extract a module into its own process? Think about: partial failures, distributed transactions, observability, and deployment. For each, explain what you would concretely do to mitigate it. Write 6–8 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 25,
      },
    ],
  },
  {
    id: "nestjs-lesson-10",
    slug: "production-ready",
    order: 10,
    title: "Production Ready — The Capstone",
    subtitle: "Testing, health, observability, deployment, CI/CD — and shipping your airport",
    description:
      "Ship a NestJS service to production: write unit + e2e tests, add health checks, integrate Sentry, deploy your app, and set up CI/CD. The capstone of the course.",
    learningGoals: [
      "Write unit tests with Jest and e2e tests with Supertest",
      "Add Terminus health checks for liveness and readiness",
      "Integrate Sentry for error tracking",
      "Deploy NestJS to Vercel, Railway, Fly.io, or Docker",
      "Configure GitHub Actions CI on every push",
    ],
    contentFile: "nestjs-10-production-ready.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-10-1",
        title: "Tests passing + /health live — the capstone screenshot",
        description:
          "Write at least 5 unit tests (Jest) for FlightsService — mock PrismaService with jest.fn(). Write at least 2 e2e tests (Supertest) for FlightsController — one for the happy path, one for the 401 unauthenticated case. Add @nestjs/terminus with a /health endpoint that checks DB connectivity. Deploy to Vercel, Railway, Fly.io, or any accessible host. Submit a screenshot showing: (1) npm run test output with 5+ passing unit tests, (2) npm run test:e2e output with 2+ passing e2e tests, (3) GET <your-live-url>/health returning 200 with status: 'ok' in the browser or Postman.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 60,
        modelAnswer:
          "Three sections must be visible: (1) Jest unit test output showing test names and 'Tests: X passed'. Common failure: PrismaService mock not set up — use jest.mock('../prisma/prisma.service') or pass a mock object via Test.createTestingModule providers. (2) e2e test output — if you get 'Cannot find module supertest', run npm i -D supertest @types/supertest. (3) Live /health returning { status: 'ok', info: { database: { status: 'up' } } }. If the DB check fails on the live deployment, the DATABASE_URL env var is not set in the hosting provider's environment variables.",
      },
      {
        id: "nestjs-task-10-2",
        title: "Course retrospective — what the airport taught you",
        description:
          "Write a retrospective of 4–6 sentences. Answer both questions: (1) What concept surprised you most — not which was hardest, but which one changed how you think about backend architecture? (2) If you were starting a new NestJS service tomorrow for a real Fohlio feature, what is the first architectural decision you would make differently compared to how you started Lesson 1? Be specific — not 'I would structure it better' but name the structure, the module, the pattern.",
        category: "required",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 20,
        modelAnswer:
          "There is no single correct answer — this is a reflection task. A strong answer will: (1) name a specific concept (DI container, the request pipeline order, BullMQ vs EventEmitter2, JWT statelessness) and explain what mental model it replaced, (2) name a specific architectural decision (setting up a PrismaModule from day one, using the repository pattern immediately, enabling global ValidationPipe before writing the first DTO) with a reason grounded in the course experience. Answers that say 'I would write more tests' without naming what to test first are too generic.",
      },
      {
        id: "nestjs-task-10-3",
        title: "Write a test that ChatGPT cannot write for you — AI-resilient",
        description:
          "Write a unit test for a behavior specific to your airport-api that requires knowing your actual service logic, not a generic NestJS pattern. The test should exercise a conditional path — for example: if a flight has 0 capacity, the booking service throws a ConflictException; if a flight is already departed, the update guard returns 403. Write the test using Jest and the TestBed pattern from the lesson. Submit your test code as a code block in the text field, plus a screenshot of it passing. Then write your metacognitive memo (3 sentences): what made this test hard to specify without actually knowing your codebase, and what would a generic AI-generated test for 'FlightsService' miss?",
        category: "advanced",
        submissionType: "text",
        order: 1,
        estimatedMinutes: 35,
      },
      {
        id: "nestjs-task-10-4",
        title: "Why do unit tests and e2e tests catch different bugs — the elaborative question",
        description:
          "You have 5 unit tests and 2 e2e tests for airport-api. A bug slips through both and reaches production. What class of bug is it? Describe the specific gap between unit tests (mocked dependencies, isolated logic) and e2e tests (real HTTP, real DB) that neither covers — and what third type of test (integration test, contract test, or load test) would catch it. Give a concrete example using the FlightsController + FlightsService + Prisma stack from your airport-api. Write 4–6 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 20,
      },
    ],
  },
  {
    id: "nestjs-lesson-11",
    slug: "fohlio-architecture",
    order: 11,
    title: "Fohlio in the Wild — Part 1: Architecture, Data, Conventions",
    subtitle: "How we actually do it: architecture.md as law, MikroORM, repositories, soft-delete, cursor pagination",
    description:
      "Bonus lesson translating the textbook NestJS from lessons 1-10 into Fohlio's production codebase patterns: the architecture.md as enforced law, MikroORM (instead of Prisma), the repository pattern, universal soft-delete, cursor-based pagination, and Kysely as the escape hatch.",
    learningGoals: [
      "Understand why Fohlio enforces architecture.md as law, not suggestion",
      "Map the textbook Prisma you learned to MikroORM in production",
      "Apply the Repository Pattern: services orchestrate, repositories own DB access",
      "Implement universal soft-delete with lifecycle hooks",
      "Use cursor-based pagination for unbounded collections",
      "Know when to reach for Kysely alongside MikroORM",
      "Apply the 'no util files' rule: every dependency through the constructor",
      "Write Suites (Automock) unit tests in seconds, not minutes",
    ],
    contentFile: "nestjs-11-fohlio-architecture.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-11-1",
        title: "Refactor FlightsService through a FlightsRepository",
        description:
          "In your airport-api: create a FlightsRepository class. Move every Prisma call out of FlightsService into named repository methods (findById, findAll, save, remove). FlightsService must NOT import PrismaService or any ORM directly — only FlightsRepository. Register FlightsRepository in FlightsModule providers and inject it into FlightsService via the constructor. Submit a screenshot of the FlightsService file open in your editor — the file must show no Prisma import and the FlightsRepository constructor injection must be visible.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 35,
        modelAnswer:
          "Your FlightsService should look like: constructor(private readonly repo: FlightsRepository) {}. The file should have no 'import { PrismaService }' or 'import { PrismaClient }' statement. If FlightsRepository is not in FlightsModule providers, NestJS will throw 'Nest can't resolve dependencies of FlightsService'. The repository methods should have meaningful names that express intent (findById, not prisma.flight.findUnique) — the service calls repo.findById(id), not prisma.flight.findUnique({ where: { id } }).",
      },
      {
        id: "nestjs-task-11-2",
        title: "Suites unit test + util-to-service refactor — cumulative",
        description:
          "This task combines Lesson 11 (Suites, no-util rule) with Lesson 10 (testing) and Lesson 8 (BullMQ). First: find a utility function in your codebase that touches a repository, the clock (Date.now()), or the BullMQ queue — or create a small one (e.g. a formatFlightCode() function used in FlightsService). Promote it to an @Injectable() class (e.g. FlightCodeFormatter), inject it through FlightsService constructor, update providers in FlightsModule. Then install @suites/unit and @suites/doubles and write a unit test for FlightsService using TestBed.solitary(FlightsService).compile(). Override one mock (e.g. FlightsRepository.findAll) with mockResolvedValue. Assert the service behavior. Submit a screenshot of the green test run showing the test name and pass status.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
        estimatedMinutes: 45,
        modelAnswer:
          "The test runner output must show at least one test passing with a descriptive name (e.g. 'FlightsService > findAll > returns flights from repository'). If TestBed.solitary() throws 'Cannot find module @suites/unit', run npm i -D @suites/unit @suites/doubles. The Suites test should be noticeably shorter than an equivalent Test.createTestingModule() version — if your Suites test has manual mock setup for every dependency, you are not using Suites correctly; solitary() auto-mocks all dependencies. The refactored service must have the injected class in its constructor, not imported and called as a static function.",
      },
      {
        id: "nestjs-task-11-3",
        title: "Map a Fohlio module to the Module Convention — critique what you find",
        description:
          "Open the asuncion repo. Pick any module other than users (try bookings, workspaces, or invitations). Take a screenshot of its folder structure. Then write a short analysis: (1) Which files map to which Module Convention slot (entities/, dto/, repositories/, service.ts, controller.ts, module.ts)? (2) Is there anything in the module that violates the 'no util files' rule from architecture.md — a *.util.ts, a *.helper.ts, or a plain function doing side-effectful work? (3) If you found a violation, describe what it should be refactored into. Submit the screenshot and the analysis as text below it.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 30,
      },
      {
        id: "nestjs-task-11-4",
        title: "Why does the repository pattern make tests faster — the elaborative question",
        description:
          "You refactored FlightsService to go through FlightsRepository. Now your Suites unit test mocks FlightsRepository instead of PrismaService. What concrete difference does this make in the test — specifically, what would you have to set up in the mock if you were mocking PrismaService directly, and why is that harder? Then explain: why does the repository boundary make it easier to swap the ORM in the future — what specifically would change if you moved from Prisma to MikroORM with the repository pattern in place vs without it? Write 5–7 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 20,
      },
    ],
  },
  {
    id: "nestjs-lesson-12",
    slug: "fohlio-multitenant",
    order: 12,
    title: "Fohlio in the Wild — Part 2: Multi-tenancy, Auth, Real-time, Workers",
    subtitle: "Workspace isolation, stateful JWT, Socket.IO at scale, and the worker process",
    description:
      "Final bonus lesson covering Fohlio's runtime patterns: multi-tenant workspace isolation, the @CurrentUser decorator, stateful JWT + Redis (AuthStateService), Socket.IO scaled with RedisIoAdapter, the separate worker Node process, and Sentry-before-bootstrap production hardening.",
    learningGoals: [
      "Implement multi-tenancy with workspaceId filtering everywhere",
      "Build and use a @CurrentUser() decorator that types the JWT payload",
      "Understand why pure JWT is insufficient and how Redis-backed AuthState fixes it",
      "Scale Socket.IO across multiple Node instances with RedisIoAdapter",
      "Run the worker as a separate Node process with its own entrypoint",
      "Apply production hardening: Sentry before bootstrap, Helmet, Swagger CSP trick",
    ],
    contentFile: "nestjs-12-fohlio-multitenant.html",
    isPublished: true,
    homework: [
      {
        id: "nestjs-task-12-1",
        title: "workspaceId tenant isolation on flights + /me endpoint",
        description:
          "Add workspaceId: string to the Flight entity in schema.prisma and migrate. Update FlightsRepository so every query (findAll, findById, update, remove) filters by workspaceId — no query should return data from a different workspace. Build a @CurrentUser() param decorator that reads X-Workspace-Id from request headers and returns { workspaceId }. Add GET /me that returns the value from @CurrentUser(). Submit a screenshot showing: (1) GET /me with X-Workspace-Id: ws-001 header returning { workspaceId: 'ws-001' }, (2) GET /flights with X-Workspace-Id: ws-001 returning only flights for that workspace (create two flights under different workspaceIds first to prove isolation).",
        category: "required",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 40,
        modelAnswer:
          "Two things must be visible: (1) GET /me returning { workspaceId: 'ws-001' } — if it returns undefined, the decorator is not reading from req.headers['x-workspace-id'] correctly (header names are lowercase in Node.js). (2) GET /flights with ws-001 returning only ws-001 flights, not all flights in the table. If all flights are returned regardless of workspaceId, the repository findAll() is not filtering — add a 'where: { workspaceId }' clause to every Prisma query. The workspaceId must come from the request context, not a hardcoded value.",
      },
      {
        id: "nestjs-task-12-2",
        title: "Why pure JWT is insufficient + Redis authState tradeoff — cumulative analysis",
        description:
          "This task combines Lesson 12 (stateful JWT) with Lesson 5 (JWT basics) and Lesson 8 (Redis). First, recall the JWT you built in Lesson 5. Answer these questions in 5–7 sentences: (1) A fired employee's JWT is valid for 24 hours and you cannot invalidate it — what exactly happens if they use it during those 24 hours? Name the specific resource they can access given your airport-api's current auth setup. (2) Fohlio adds a Redis AuthState check on every request. What is the cost of this on a 1000-req/s airport-api — be specific about where the latency comes from. (3) What happens to every active user's session if Redis goes down — and how would you mitigate that risk without removing the authstate check?",
        category: "required",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 30,
        modelAnswer:
          "Strong answers will cover: (1) The fired employee can access any JWT-protected endpoint — in airport-api that means GET/POST/PATCH/DELETE /flights, GET /users, etc., for the remaining token lifetime. (2) Each request adds one Redis GET call — roughly 0.3–1ms on a local Redis, up to 5–10ms on a remote one. At 1000 req/s that is 1000 Redis ops/s, well within Redis capacity but adding to tail latency. (3) If Redis is down and the guard requires a successful authState lookup, every request will fail with 500 or 401. Mitigations: circuit breaker pattern, a fallback mode that trusts the JWT if Redis is unreachable (with a risk window), or Redis Sentinel/Cluster for HA.",
      },
      {
        id: "nestjs-task-12-3",
        title: "RedisIoAdapter cross-instance broadcast — scaled real-time",
        description:
          "Wire RedisIoAdapter from @socket.io/redis-adapter into your FlightsGateway (you built the gateway in Lesson 9). Spin up TWO instances of airport-api on different ports (PORT=3000 and PORT=3001) — both connected to the same Redis. Open two browser tabs or two Postman WebSocket connections: one to ws://localhost:3000, one to ws://localhost:3001. PATCH a flight via the instance on port 3000. Confirm the client connected to port 3001 also receives the flight_updated event. Submit a screenshot showing both browser/Postman WS clients — both must show the received event, and the terminal of the instance that did NOT handle the PATCH must show the broadcast was forwarded via Redis.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
        estimatedMinutes: 40,
      },
      {
        id: "nestjs-task-12-4",
        title: "Why does Socket.IO need Redis for horizontal scaling — the elaborative question",
        description:
          "A single Socket.IO server handles WebSocket connections in memory. When you add a second server instance, connections are split between them. Explain concretely what goes wrong when instance A tries to broadcast to a client connected to instance B — trace the code path. Then explain what the Redis adapter does to fix it, specifically what data Redis holds and how the two adapter instances coordinate. Finally: why does this problem not exist for REST endpoints, and what does that tell you about the architectural cost of stateful connections? Write 5–7 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 2,
        estimatedMinutes: 25,
      },
    ],
  },
];

async function main() {
  const admin = await prisma.user.findUnique({
    where: { githubNickname: ADMIN_GITHUB_NICKNAME },
    select: { id: true },
  });

  if (!admin) {
    console.error(`Admin user "${ADMIN_GITHUB_NICKNAME}" not found. Run create-admin.ts first.`);
    process.exit(1);
  }

  await prisma.$transaction(async (tx) => {

    await tx.course.upsert({
      where: { id: COURSE_ID },
      update: {
        slug: COURSE_SLUG,
        title: "NestJS Backend Course",
        subtitle: "From spaghetti to production-grade APIs",
        description:
          "A 10-lesson practical course on building scalable Node.js backends with NestJS, TypeScript, Prisma, and PostgreSQL. The airport analogy stays with you the whole way.",
        status: "published",
        ownerId: admin.id,
      },
      create: {
        id: COURSE_ID,
        slug: COURSE_SLUG,
        title: "NestJS Backend Course",
        subtitle: "From spaghetti to production-grade APIs",
        description:
          "A 10-lesson practical course on building scalable Node.js backends with NestJS, TypeScript, Prisma, and PostgreSQL. The airport analogy stays with you the whole way.",
        status: "published",
        ownerId: admin.id,
      },
    });

    for (const lesson of LESSONS) {
      const contentHtml = await readFile(
        join(process.cwd(), "public", "lessons", lesson.contentFile),
        "utf-8",
      );

      const upsertedLesson = await tx.lesson.upsert({
        where: { courseId_slug: { courseId: COURSE_ID, slug: lesson.slug } },
        update: {
          order: lesson.order,
          title: lesson.title,
          subtitle: lesson.subtitle,
          description: lesson.description,
          learningGoals: lesson.learningGoals,
          contentType: "html",
          contentHtml,
          isPublished: lesson.isPublished,
        },
        create: {
          id: lesson.id,
          courseId: COURSE_ID,
          slug: lesson.slug,
          order: lesson.order,
          title: lesson.title,
          subtitle: lesson.subtitle,
          description: lesson.description,
          learningGoals: lesson.learningGoals,
          contentType: "html",
          contentHtml,
          isPublished: lesson.isPublished,
        },
      });

      await tx.homeworkTask.deleteMany({
        where: { lessonId: upsertedLesson.id },
      });
      for (const task of lesson.homework) {
        await tx.homeworkTask.create({
          data: {
            id: task.id,
            lessonId: upsertedLesson.id,
            title: task.title,
            description: task.description,
            category: task.category,
            submissionType: task.submissionType,
            order: task.order,
            modelAnswer: task.modelAnswer ?? null,
            estimatedMinutes: task.estimatedMinutes ?? null,
          },
        });
      }
    }
  }, { timeout: 60_000, maxWait: 10_000 });

  console.log("NestJS course seeded successfully.");
  console.log(`Course slug: ${COURSE_SLUG}`);
  console.log(`Lessons published: ${LESSONS.filter((l) => l.isPublished).length}/${LESSONS.length}`);
  const totalTasks = LESSONS.reduce((acc, l) => acc + l.homework.length, 0);
  console.log(`Homework tasks seeded: ${totalTasks}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
