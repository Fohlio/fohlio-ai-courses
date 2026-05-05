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
        title: "Scaffold and run the starter project",
        description:
          "Install the Nest CLI, create a new project `nest new airport-api`, add the `GET /hello/:name` endpoint from Part 5, and submit a screenshot showing it working.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-1-2",
        title: "Push your starter to a GitHub repo",
        description:
          "Create a public repo `nestjs-course-yourname` and push your scaffolded `airport-api` project. Submit the repo URL — we'll keep using it for every lesson going forward.",
        category: "required",
        submissionType: "pr_link",
        order: 2,
      },
      {
        id: "nestjs-task-1-3",
        title: "Controller vs Service — in your own words",
        description:
          "In 1–2 sentences: what is the difference between a Controller and a Service in NestJS? Use the airport analogy.",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-1-4",
        title: "Add a second controller",
        description:
          "Create a `FlightController` with `GET /flights` that returns a hardcoded array of 3 flight objects. Register it in AppModule. Hint: `nest generate controller flight`.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-1-5",
        title: "Swap to Fastify",
        description:
          "Follow the NestJS Fastify docs and switch your app to use the FastifyAdapter. Verify it still responds correctly. What do you notice?",
        category: "advanced",
        submissionType: "text",
        order: 2,
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
        title: "Generate a UsersModule with CRUD",
        description:
          "Run `nest g module/controller/service users`. Build endpoints GET /users, POST /users, GET /users/:id, DELETE /users/:id with an in-memory array (shape: { id, name, email }). Submit a screenshot showing POST creating a user and GET returning the array including the new one.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-2-2",
        title: "Push to your repo",
        description:
          "Commit and push the UsersModule changes to your nestjs-course-yourname repo from Lesson 1. Submit the link to the commit or PR.",
        category: "required",
        submissionType: "pr_link",
        order: 2,
      },
      {
        id: "nestjs-task-2-3",
        title: "Why not new UsersService()?",
        description:
          "In 2–3 sentences: why doesn't the controller create its service with `new UsersService()` directly? Use the airport analogy.",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-2-4",
        title: "Read about provider scopes",
        description:
          "Read the NestJS docs on Injection Scopes. Then answer in a few sentences: when would you reach for Scope.REQUEST? Give one realistic backend scenario where DEFAULT (singleton) genuinely doesn't work.",
        category: "advanced",
        submissionType: "text",
        order: 1,
      },
      {
        id: "nestjs-task-2-5",
        title: "Build a SharedModule",
        description:
          "Create a SharedModule with a small UtilsService (e.g. generateId() or formatTimestamp(date)). Import it into both UsersModule and FlightsModule and call UtilsService from both their services. Screenshot showing both endpoints returning data that uses the shared utility.",
        category: "advanced",
        submissionType: "screenshot",
        order: 2,
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
        title: "Add a global LoggingMiddleware",
        description:
          "Create a class-form LoggerMiddleware with @Injectable that logs every request as `${method} ${url} - ${responseTime}ms`. Wire it via configure() in AppModule with .forRoutes('*'). Screenshot of your terminal showing 3+ requests logged with timing.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-3-2",
        title: "Push the pipeline additions",
        description:
          "Push to your nestjs-course-yourname repo: at minimum LoggerMiddleware + an ApiKeyGuard applied to one route + a TimingInterceptor. Submit the link to the commit/PR.",
        category: "required",
        submissionType: "pr_link",
        order: 2,
      },
      {
        id: "nestjs-task-3-3",
        title: "Guard vs Pipe",
        description:
          "In your own words, 2–4 sentences: what's the difference between a Guard and a Pipe? When would you use each?",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-3-4",
        title: "Add a RolesGuard",
        description:
          "Add a RolesGuard that reads X-User-Role from a header. Apply it to one admin-only route (e.g. DELETE /flights/:id) so it returns 403 unless the role is admin. Screenshot showing two requests: one with X-User-Role: admin succeeding, one with X-User-Role: user getting 403.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-3-5",
        title: "UpperCaseInterceptor",
        description:
          "Build a custom UpperCaseInterceptor that walks the response and uppercases every string value. Apply it to one endpoint with @UseInterceptors(). Screenshot showing the same endpoint with and without the interceptor (before/after).",
        category: "advanced",
        submissionType: "screenshot",
        order: 2,
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
        title: "Set up Postgres + first Prisma migration",
        description:
          "Run Postgres locally, `npx prisma init`, define a Flight model in schema.prisma, run `prisma migrate dev --name init`, screenshot the generated migration.sql.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-4-2",
        title: "Replace in-memory FlightsService with Prisma",
        description:
          "Generate PrismaModule + PrismaService, rewrite FlightsService CRUD using Prisma. Verify data survives restart. Push to nestjs-course-yourname and submit commit/PR link.",
        category: "required",
        submissionType: "pr_link",
        order: 2,
      },
      {
        id: "nestjs-task-4-3",
        title: "Why extend PrismaClient?",
        description:
          "In 2–3 sentences using the airport analogy: why does PrismaService extend PrismaClient instead of every service doing `new PrismaClient()`?",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-4-4",
        title: "Add a relational Airline model",
        description:
          "Add Airline model to schema, migrate, add findAllByAirline(airlineId) using Prisma where + include. Screenshot the JSON response with nested airline data.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-4-5",
        title: "Prisma vs TypeORM — when TypeORM wins",
        description:
          "Read NestJS TypeORM and Prisma docs. List 3 concrete scenarios where you'd actively prefer TypeORM over Prisma.",
        category: "advanced",
        submissionType: "text",
        order: 2,
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
        title: "Build /auth/register and /auth/login",
        description:
          "Add User model + migrate. Implement register (bcrypt hash) and login (compare + sign JWT). Screenshot the login response with the JWT.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-5-2",
        title: "Protect FlightsController with AuthGuard('jwt')",
        description:
          "Apply @UseGuards(AuthGuard('jwt')) to FlightsController. Verify 401 without token, 200 with token. Push to repo and submit commit/PR link.",
        category: "required",
        submissionType: "pr_link",
        order: 2,
      },
      {
        id: "nestjs-task-5-3",
        title: "Hashing vs encryption",
        description:
          "In 2–3 sentences: why hash passwords instead of encrypt them? What's the practical difference between a hash and an encryption?",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-5-4",
        title: "Role-based access on DELETE /flights/:id",
        description:
          "Implement RolesGuard + @Roles() decorator. Apply @Roles('admin') to DELETE. Verify regular user gets 403 and admin gets 204. Submit two screenshots.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-5-5",
        title: "Helmet, CORS, and rate limiting",
        description:
          "Add helmet(), enableCors({ origin: 'http://localhost:3000' }), ThrottlerModule (10 req/min). Submit two screenshots: security response headers and a 429 after exceeding the rate.",
        category: "advanced",
        submissionType: "screenshot",
        order: 2,
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
        title: "Wire ValidationPipe + CreateFlightDto",
        description:
          "Add CreateFlightDto with @IsString on code, @IsInt @Min(0) on capacity, plus one more field. Wire global ValidationPipe (whitelist/forbidNonWhitelisted/transform). POST a body missing a field; screenshot the 400 response with field-by-field errors.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-6-2",
        title: "UpdateFlightDto via PartialType",
        description:
          "Create UpdateFlightDto extends PartialType(CreateFlightDto). Wire it into PATCH /flights/:id. Push to nestjs-course-yourname; submit the commit URL.",
        category: "required",
        submissionType: "pr_link",
        order: 2,
      },
      {
        id: "nestjs-task-6-3",
        title: "Why whitelist matters",
        description:
          "2–3 sentences: why are whitelist:true and forbidNonWhitelisted:true critical for production? Name the attack class (mass assignment).",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-6-4",
        title: "ClassSerializerInterceptor + @Exclude",
        description:
          "Add @Exclude on a sensitive field (e.g. passwordHash). Wire ClassSerializerInterceptor globally. Screenshot GET /users/:id response showing the field is gone.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-6-5",
        title: "URI versioning v1 vs v2",
        description:
          "Enable URI versioning. Build /v1/flights and /v2/flights where v2 returns a richer shape (e.g. adds formattedDate). Screenshot both responses.",
        category: "advanced",
        submissionType: "screenshot",
        order: 2,
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
        title: "Document FlightsController with Swagger",
        description:
          "Install @nestjs/swagger, wire SwaggerModule.setup('api', ...) in main.ts. Decorate FlightsController with @ApiTags + @ApiOperation + @ApiResponse on every endpoint. Decorate CreateFlightDto with @ApiProperty. Screenshot /api UI showing all endpoints.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-7-2",
        title: "Push the documented controller",
        description:
          "Push the documented FlightsController + DTO + main.ts changes to nestjs-course-yourname. Submit the commit URL.",
        category: "required",
        submissionType: "pr_link",
        order: 2,
      },
      {
        id: "nestjs-task-7-3",
        title: "REST vs GraphQL — one sentence each",
        description:
          "One sentence: when would you reach for Swagger-documented REST? One sentence: when GraphQL?",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-7-4",
        title: "Add a GraphQL FlightResolver",
        description:
          "Install @nestjs/graphql @nestjs/apollo @apollo/server graphql. Build a FlightResolver alongside the REST controller. Open /graphql playground; run a query that fetches only code and capacity. Screenshot the playground.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-7-5",
        title: "Enable Swagger CLI plugin",
        description:
          "Add @nestjs/swagger plugin to nest-cli.json (classValidatorShim, introspectComments). Remove explicit @ApiProperty from one DTO. Confirm Swagger UI still shows all fields. Screenshot before/after.",
        category: "advanced",
        submissionType: "screenshot",
        order: 2,
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
        title: "Cache GET /flights",
        description:
          "Add @nestjs/cache-manager. Cache GET /flights with TTL 60s using CacheInterceptor + @CacheTTL. Take a screenshot showing two consecutive responses with timestamps — second one visibly faster.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-8-2",
        title: "Add a BullMQ notifications queue",
        description:
          "Install @nestjs/bullmq. Run Redis locally. Register a 'notifications' queue. On flight creation, enqueue a 'flight-created' job whose processor console.logs the flight ID. Push to nestjs-course-yourname and submit the commit link.",
        category: "required",
        submissionType: "pr_link",
        order: 2,
      },
      {
        id: "nestjs-task-8-3",
        title: "EventEmitter2 vs BullMQ",
        description:
          "In one short paragraph (3–5 sentences), contrast when to reach for EventEmitter2 vs BullMQ. Use a concrete Fohlio-style example for each.",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-8-4",
        title: "Add a 5-minute @Cron job",
        description:
          "Add @nestjs/schedule. Create a CleanupService with @Cron('*/5 * * * *') that logs '[CRON] Cleanup pass at <ISO timestamp>'. Run the app for ≥10 minutes and screenshot 2–3 cron firings.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-8-5",
        title: "Swap cache to Redis",
        description:
          "Replace the in-memory cache store with @keyv/redis. Hit GET /flights once, restart the Node process, hit it again — the cache should still serve the cached value. Screenshot the timestamps and the cache surviving the restart.",
        category: "advanced",
        submissionType: "screenshot",
        order: 2,
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
        title: "Extract notifications microservice (TCP)",
        description:
          "In nestjs-course-yourname, scaffold a sibling NestJS app (notifications-service or apps/notifications). Make it a TCP microservice on port 4000 with @EventPattern('flight.created'). Wire airport-api with ClientsModule + emit on flight create. Screenshot both processes running and the microservice log line.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-9-2",
        title: "WebSocket gateway broadcasting flight updates",
        description:
          "Add a Socket.IO FlightsGateway in airport-api. On PATCH /flights/:id, broadcast 'flight_updated' with the flight. Test with a tiny HTML page or Postman WS client. Push to nestjs-course-yourname and submit the commit link.",
        category: "required",
        submissionType: "pr_link",
        order: 2,
      },
      {
        id: "nestjs-task-9-3",
        title: "WebSocket vs SSE",
        description:
          "In 2–3 sentences, when would you reach for WebSockets and when for SSE? Use a concrete example for each.",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-9-4",
        title: "Switch microservice to Redis transport",
        description:
          "Change Transport.TCP to Transport.REDIS in both createMicroservice and ClientsModule.register. Verify emit('flight.created') still works end-to-end. Screenshot both processes after the switch with the microservice receiving an event over Redis.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-9-5",
        title: "gRPC reading exercise",
        description:
          "Read NestJS gRPC docs. In 3 bullets: (a) what gRPC gives you over REST, (b) the cost, (c) when to specifically reach for it over TCP/Redis/NATS.",
        category: "advanced",
        submissionType: "text",
        order: 2,
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
        title: "Capstone repo — production-ready NestJS service",
        description:
          "Submit your nestjs-course-yourname repo URL. Must include: ≥5 unit tests passing, ≥2 e2e tests passing, /health endpoint returning 200, Sentry initialized in main.ts (free DSN or dummy DSN OK), and either a Dockerfile or vercel.json + api/index.ts.",
        category: "required",
        submissionType: "pr_link",
        order: 1,
      },
      {
        id: "nestjs-task-10-2",
        title: "Deploy live + screenshot /health = 200",
        description:
          "Deploy your app to Vercel (recommended), Railway, Fly.io, or your own server. Submit a screenshot of GET /health returning 200 from the live URL.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
      },
      {
        id: "nestjs-task-10-3",
        title: "Course retrospective (4–6 sentences)",
        description:
          "What surprised you most across the 10 lessons? What would you do differently if you started a new NestJS service tomorrow?",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-10-4",
        title: "GitHub Actions CI workflow + green check",
        description:
          "Add .github/workflows/ci.yml that runs npm ci, lint, build, test, test:e2e on push/PR. Trigger it with a small commit. Submit a screenshot of the green check on GitHub Actions.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-10-5",
        title: "Sentry end-to-end with real DSN",
        description:
          "Sign up for a free Sentry account, set a real DSN in your env, add a /debug endpoint that throws Error('test capture'), trigger it, and screenshot the captured event in your Sentry dashboard with the stack trace visible.",
        category: "advanced",
        submissionType: "screenshot",
        order: 2,
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
        title: "Map a real Fohlio module to the Module Convention",
        description:
          "Open the asuncion repo, pick the `users` module, screenshot its folder structure, and identify which files map to which slot in the Module Convention from architecture.md.",
        category: "required",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-11-2",
        title: "Refactor FlightsService through a FlightsRepository",
        description:
          "In your nestjs-course-yourname repo: create a FlightsRepository class and move all DB access out of FlightsService into named repository methods. The service must NOT import the ORM directly. Push and submit the commit URL.",
        category: "required",
        submissionType: "pr_link",
        order: 2,
      },
      {
        id: "nestjs-task-11-3",
        title: "Explain the Repository Pattern in airport language",
        description:
          "In 3-4 sentences using the airport analogy (waiter / records librarian / archive), explain the Repository Pattern to a teammate used to 'just calling the ORM in the service.' What problem does it solve?",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-11-4",
        title: "Refactor a util into an injected service",
        description:
          "In your nestjs-course-yourname repo, find or create a service that calls a `*.util.ts` function which touches a repository, the clock, or any mockable side-effect. Promote that util to an @Injectable() class, inject it through the constructor, update the module's providers. Push and submit the commit/PR URL.",
        category: "required",
        submissionType: "pr_link",
        order: 4,
      },
      {
        id: "nestjs-task-11-5",
        title: "Read architecture.md and surface the rules",
        description:
          "Read asuncion/architecture.md in full. List 3 MUST rules and 3 NEVER rules with line numbers. Bonus paragraph: pick the rule you find most surprising and explain why.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-11-6",
        title: "Edge cases of the soft-delete lifecycle",
        description:
          "Read the soft-delete sections in architecture.md and trace workspace.entity.ts. Write 4-6 sentences on edge cases a naive `where: { deletedAt: null }` filter wouldn't handle (partial unique indexes, raw-SQL leak risk, restore-over-recreate, cascading deletes).",
        category: "advanced",
        submissionType: "text",
        order: 2,
      },
      {
        id: "nestjs-task-11-7",
        title: "Write a Suites/Automock unit test",
        description:
          "Install @suites/unit and @suites/doubles in your nestjs-course-yourname repo. Pick a service with 2+ injected deps (ideally the one you refactored in task #4). Write a unit test using TestBed.solitary(YourService).compile(). Override one mock with mockResolvedValue, assert the behavior. Screenshot the green test run. Bonus: compare line count vs Test.createTestingModule + manual mocks.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
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
        title: "Multi-tenancy on the Flight entity",
        description:
          "Add `workspaceId: string` to the Flight entity. Update FlightsRepository so every query filters by workspaceId. Add an @CurrentUser()-style decorator that reads X-Workspace-Id from request headers and returns { workspaceId }. Push to nestjs-course-yourname and submit the commit URL.",
        category: "required",
        submissionType: "pr_link",
        order: 1,
      },
      {
        id: "nestjs-task-12-2",
        title: "The /me endpoint with @CurrentUser",
        description:
          "Add GET /me that uses your @CurrentUser() decorator from task 1. Make a request with the X-Workspace-Id header. Screenshot the typed user object in the response.",
        category: "required",
        submissionType: "screenshot",
        order: 2,
      },
      {
        id: "nestjs-task-12-3",
        title: "Why pure JWT isn't enough",
        description:
          "Read asuncion/src/modules/auth/auth-state.service.ts. In 4-6 sentences, explain why pure JWT is insufficient for Fohlio's use case and what tradeoff Redis adds. Cover the firing scenario, brute-force lockout, and per-request cost.",
        category: "required",
        submissionType: "text",
        order: 3,
      },
      {
        id: "nestjs-task-12-4",
        title: "RedisIoAdapter cross-instance broadcast",
        description:
          "Wire RedisIoAdapter into a small WebSocket gateway. Spin up TWO instances on different ports, both connected to the same Redis. Connect a client to instance A, emit from instance B, confirm A's client receives it. Screenshot both terminals showing the cross-instance broadcast.",
        category: "advanced",
        submissionType: "screenshot",
        order: 1,
      },
      {
        id: "nestjs-task-12-5",
        title: "Split into two Node entrypoints",
        description:
          "Restructure into apps/api/main.ts and apps/worker/main.ts. The worker boots its own NestApplication from WorkerModule with only BullMQ consumers, no HTTP. Add a `start:worker` script in package.json. Push to nestjs-course-yourname and submit commit URL.",
        category: "advanced",
        submissionType: "pr_link",
        order: 2,
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

      for (const task of lesson.homework) {
        await tx.homeworkTask.upsert({
          where: {
            lessonId_category_order: {
              lessonId: upsertedLesson.id,
              category: task.category,
              order: task.order,
            },
          },
          update: {
            title: task.title,
            description: task.description,
            submissionType: task.submissionType,
          },
          create: {
            id: task.id,
            lessonId: upsertedLesson.id,
            title: task.title,
            description: task.description,
            category: task.category,
            submissionType: task.submissionType,
            order: task.order,
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
