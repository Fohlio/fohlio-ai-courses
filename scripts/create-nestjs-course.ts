import "dotenv/config";
import { readFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ADMIN_GITHUB_NICKNAME } from "../src/lib/constants";
import { seedCourseSkills, seedBadges } from "../src/lib/skillSeeder";
import {
  NESTJS_SKILLS,
  NESTJS_LESSON_SKILLS,
  BADGES,
} from "./gamification-seeds";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const COURSE_ID = "course-nestjs";
const COURSE_SLUG = "nestjs";

type HomeworkTaskSeed = {
  id: string;
  title: string;
  description: string;
  category: "required" | "advanced";
  submissionType: "pr_link" | "screenshot" | "text" | "quiz" | "checklist" | "widget";
  order: number;
  widgetId?: string;
  widgetConfig?: Record<string, unknown>;
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
        title: "Place the airport crew in the right NestJS slot",
        description:
          "Drag each airport role onto the NestJS building block it represents. This is the core mental model you will lean on for the next 11 lessons — get it right now and the rest of the course is downhill.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "arch-diagram",
        widgetConfig: {
          prompt:
            "Match the airport analogy from Part 3 of the lesson to the NestJS building block.",
          slots: [
            { id: "slot-terminal", label: "Terminal (groups gates + crew + shared services)", correctNodeId: "node-module" },
            { id: "slot-gate", label: "Gate Agent (talks to passengers, routes them)", correctNodeId: "node-controller" },
            { id: "slot-crew", label: "Ground Crew (does the actual work — refuel, load bags)", correctNodeId: "node-service" },
            { id: "slot-dispatch", label: "Ops Dispatch (decides which crew shows up where)", correctNodeId: "node-di" },
          ],
          nodes: [
            { id: "node-module", label: "@Module", hint: "Groups controllers + providers" },
            { id: "node-controller", label: "@Controller", hint: "Maps HTTP routes to handlers" },
            { id: "node-service", label: "@Injectable() service", hint: "Holds business logic" },
            { id: "node-di", label: "DI container", hint: "Resolves dependencies at startup" },
          ],
        },
        modelAnswer:
          "Terminal = @Module, Gate Agent = @Controller, Ground Crew = @Injectable() service, Ops Dispatch = DI container. The Controller knows about HTTP; the Service knows nothing about HTTP. The Module groups them and declares what is shared. The DI container is the reason you never call 'new SomeService()' yourself — it hands the right instance to every constructor that asks for one.",
        estimatedMinutes: 10,
      },
      {
        id: "nestjs-task-1-2",
        title: "Match the four core NestJS concepts to their definitions",
        description:
          "Pair each NestJS term from Lesson 1 with the one-line definition that captures what it actually does. No analogy this time — the real engineering meaning.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            {
              id: "p-module",
              term: "@Module",
              definition:
                "A class decorated to group related controllers and providers and declare which are exposed to other modules.",
            },
            {
              id: "p-controller",
              term: "@Controller",
              definition:
                "A class whose methods are bound to HTTP routes by decorators like @Get and @Post.",
            },
            {
              id: "p-injectable",
              term: "@Injectable()",
              definition:
                "Marks a class as a provider that the DI container can construct and hand to other classes.",
            },
            {
              id: "p-nestfactory",
              term: "NestFactory.create(AppModule)",
              definition:
                "Builds the entire dependency graph from the root module and returns a running application.",
            },
          ],
        },
        modelAnswer:
          "These four terms are the spine of every NestJS app. If you can map them to definitions cold, you can read any NestJS file and find the entry point. NestFactory.create() is where the airport gets booted up — it walks the module graph, instantiates each @Injectable(), and wires constructors via DI before listening on a port.",
        estimatedMinutes: 8,
      },
      {
        id: "nestjs-task-1-3",
        title: "Scaffold airport-api and add GET /hello/:name",
        description:
          "Install the Nest CLI (npm i -g @nestjs/cli), create the project (nest new airport-api), add the GET /hello/:name endpoint from Part 5, and start the server (npm run start:dev). Submit a screenshot showing the endpoint responding in your browser or Postman — the URL and the response body must both be visible. This is the one task you have to actually run code for — the airport doesn't exist until you scaffold it.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 20,
        modelAnswer:
          "Your screenshot should show: the URL bar containing /hello/<some-name>, and the response body returning a string that includes the name. The terminal should show no compile errors. If you see 'Cannot GET /hello/name', the route decorator or parameter decorator is missing — check @Get('hello/:name') and @Param('name'). This scaffolded airport-api is the project you will extend for the next 11 lessons.",
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
        title: "Fill in the SharedModule that exports UtilsService",
        description:
          "Complete the SharedModule decorator metadata so UtilsService can be injected into both UsersService and FlightsService. Miss one keyword and Nest will throw 'can't resolve dependencies' at startup. Get every blank right — the keywords are case-sensitive.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "code-fill",
        widgetConfig: {
          language: "ts",
          code: [
            "import { Module } from '@nestjs/common';",
            "import { UtilsService } from './utils.service';",
            "",
            "@{{1}}({",
            "  providers: [{{2}}],",
            "  {{3}}: [UtilsService],",
            "})",
            "export class SharedModule {}",
            "",
            "// In users.module.ts:",
            "@Module({",
            "  imports: [{{4}}],",
            "  providers: [UsersService],",
            "  controllers: [UsersController],",
            "})",
            "export class UsersModule {}",
          ].join("\n"),
          blanks: [
            { id: "1", placeholder: "decorator", answer: "Module" },
            { id: "2", placeholder: "the provider class", answer: "UtilsService" },
            { id: "3", placeholder: "expose to other modules", answer: "exports" },
            { id: "4", placeholder: "module being consumed", answer: "SharedModule" },
          ],
        },
        modelAnswer:
          "Three things must line up: (1) UtilsService is in providers — it lives in this Terminal. (2) UtilsService is in exports — other Terminals can see it. (3) UsersModule imports SharedModule — without this line, UsersService gets 'Nest can't resolve dependencies'. The exports field is the one rookies forget — providers alone keeps the service private to SharedModule.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-2-2",
        title: "Order how Nest resolves a constructor at startup",
        description:
          "When Nest boots, it walks the dependency graph in a very specific order. Arrange these six steps so they reflect what actually happens when AppModule → UsersModule → UsersController → UsersService → UtilsService is instantiated. Get the order wrong and you cannot explain why a missing 'exports' fails at startup rather than at request time.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "flow-order",
        widgetConfig: {
          prompt:
            "Order the six steps Nest performs when bootstrapping the airport-api app.",
          steps: [
            { id: "s1", label: "NestFactory.create(AppModule) is called", detail: "Entry point in main.ts" },
            { id: "s2", label: "Module graph is walked", detail: "AppModule → imports → SharedModule, UsersModule, ..." },
            { id: "s3", label: "Each module's providers are registered in the DI container", detail: "Including which providers are exported" },
            { id: "s4", label: "Provider instances are constructed in dependency order", detail: "UtilsService before UsersService" },
            { id: "s5", label: "Controllers are instantiated with their dependencies injected", detail: "UsersController gets UsersService via constructor" },
            { id: "s6", label: "app.listen(3000) starts the HTTP server", detail: "Airport opens to passengers" },
          ],
          lockFirst: false,
          lockLast: false,
        },
        modelAnswer:
          "The order is: create → walk modules → register providers → construct providers → construct controllers → listen. Critical insight: providers are constructed before controllers, and a controller's constructor cannot complete until every dependency it asks for has been resolved. That is why a missing 'exports' or a circular dep blows up at startup, not on the first request — Nest refuses to listen if the graph cannot be built.",
        estimatedMinutes: 10,
      },
      {
        id: "nestjs-task-2-3",
        title: "Generate UsersModule + SharedModule with working CRUD",
        description:
          "Run nest g module users, nest g controller users, nest g service users. Build GET /users, POST /users, GET /users/:id, DELETE /users/:id using an in-memory array. Then create a SharedModule that exports a UtilsService.generateId(), import it into both UsersModule and FlightsModule, and have both POST handlers call generateId() for ids. Submit a screenshot showing POST /users and POST /flights both returning objects whose ids came from the shared utility — proof that DI is actually wiring across modules.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 35,
        modelAnswer:
          "Two things must be visible: (1) created user/flight objects with id values that look generated (UUID or timestamp string). (2) Both POST responses must include those ids. If you see 'Nest can't resolve dependencies of UsersService', UtilsService is not exported from SharedModule or SharedModule is not imported into UsersModule. The whole point of this task: prove that the airport's shared Ops crew (UtilsService) can be deployed at multiple Terminals (modules) without duplicating code.",
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
        title: "Order the request pipeline — every stop from passenger to gate",
        description:
          "Arrange the stages of a request through the NestJS airport, from the moment the passenger walks in to the moment the response comes back. The order is real and load-bearing — guards run before pipes for a reason, and exception filters wrap the whole thing for a reason.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "flow-order",
        widgetConfig: {
          prompt:
            "Arrange every stop a request makes from passenger arrival to response sent. (Use Part 7's diagram as a check — but try without looking first.)",
          steps: [
            { id: "s-req", label: "Request arrives (Express/Fastify adapter)", detail: "Passenger enters the airport" },
            { id: "s-mw", label: "Middleware runs", detail: "Logging, request id, etc." },
            { id: "s-guard", label: "Guards run (canActivate)", detail: "Boarding pass check — return false = 403" },
            { id: "s-int-before", label: "Interceptors — 'before' phase", detail: "Start timing, attach observables" },
            { id: "s-pipe", label: "Pipes run (validate + transform args)", detail: "ValidationPipe runs here" },
            { id: "s-handler", label: "Controller handler executes", detail: "The gate agent does its job" },
            { id: "s-int-after", label: "Interceptors — 'after' phase", detail: "Wrap response, log timing" },
            { id: "s-filter", label: "Exception filter (only if something threw)", detail: "Catches HttpException and friends" },
          ],
          lockFirst: true,
          lockLast: false,
        },
        modelAnswer:
          "The order is fixed: Middleware → Guard → Interceptor (pre) → Pipe → Handler → Interceptor (post) → Filter (on error). Two non-obvious points: Guards run before Pipes, so authorization happens before validation — you reject unauthorized requests cheaply. Interceptors wrap the handler symmetrically (before/after) using RxJS observables, which is why tap() runs after the handler completes. Exception filters sit outside the whole chain and catch anything that throws.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-3-2",
        title: "Decide: Middleware, Guard, Interceptor, Pipe, or Filter?",
        description:
          "Walk a series of real airport-api scenarios and pick which pipeline layer should handle each one. There is one best answer per branch — the wrong layer either runs at the wrong time or cannot access the data it needs.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "decision-tree",
        widgetConfig: {
          rootId: "n1",
          nodes: {
            n1: {
              id: "n1",
              question:
                "You need to reject every request that lacks a valid X-Api-Key header before the handler runs. Which layer?",
              options: [
                {
                  label: "Middleware — it runs first, so block there",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "Middleware can do it, but you lose access to ExecutionContext, decorators like @Public(), and route metadata. Guards are the right shape for 'should this run?'.",
                  },
                },
                { label: "Guard — return false in canActivate", nextNodeId: "n2" },
                {
                  label: "Pipe — throw if header is missing",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Pipes transform/validate handler arguments. They are too late and too narrow — they run after the guard and only see method parameters, not request headers cleanly.",
                  },
                },
              ],
            },
            n2: {
              id: "n2",
              question:
                "Same request now needs to be measured — how long did the handler take? Which layer logs 'Handler took Xms' AFTER the handler returns?",
              options: [
                {
                  label: "Middleware — start time before next(), end after",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "Works, but you have to hook the response 'finish' event manually. Interceptors give you the symmetric before/after via RxJS tap() for free.",
                  },
                },
                { label: "Interceptor — tap() after the handler observable completes", nextNodeId: "n3" },
                {
                  label: "Exception Filter — record time when the response leaves",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Filters only fire on errors. A successful request never enters the filter — you would record zero timings on the happy path.",
                  },
                },
              ],
            },
            n3: {
              id: "n3",
              question:
                "The handler throws a custom FlightNotFoundException. You want the response body to be a consistent { error, code, requestId } shape. Where does that transform live?",
              options: [
                {
                  label: "Interceptor — wrap the response",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "Interceptors handle successful responses well; thrown exceptions skip the post-interceptor and go straight to the filter chain.",
                  },
                },
                {
                  label: "Exception Filter — catch and reshape",
                  outcome: {
                    kind: "correct",
                    explanation:
                      "Exactly. Filters catch thrown exceptions and own the final error response shape. Guard → Interceptor pre → Pipe → Handler (throws) → Filter (catches and formats).",
                  },
                },
                {
                  label: "Pipe — reject with a formatted error",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Pipes run before the handler. A FlightNotFoundException thrown inside the handler never reaches a pipe.",
                  },
                },
              ],
            },
          },
        },
        modelAnswer:
          "Correct path: Guard → Interceptor → Exception Filter. The principle: layers are not interchangeable — each owns a specific concern (Guard = should this run, Interceptor = wrap the call, Pipe = transform args, Filter = catch errors). Picking the wrong layer either silently fails or works but couples you to the wrong API surface.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-3-3",
        title: "Build LoggerMiddleware + ApiKeyGuard + TimingInterceptor for real",
        description:
          "Wire all three layers into airport-api. LoggerMiddleware logs 'METHOD /url - Xms' for every request. ApiKeyGuard reads X-Api-Key and returns 403 if wrong. TimingInterceptor logs 'Handler took Xms' after the handler. Apply guard and interceptor to GET /flights. Submit a screenshot showing: (1) terminal logs from middleware on 3+ endpoints, (2) a 403 from the guard with no key, (3) the interceptor's timing log for a successful authenticated request.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 35,
        modelAnswer:
          "Three things must be visible: middleware lines like 'GET /flights - 12ms', a 403 response body for the keyless request, and an interceptor timing line for the authenticated one. The interceptor line should only appear for the 200 — the guard short-circuits before the interceptor's after-phase on a 403. If timing always shows 0ms, you measured before next() instead of in the response finish event.",
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
        title: "Design the Flight entity for Prisma",
        description:
          "Pick the right name, type, and flag for each Flight field. The schema is the contract between airport-api and Postgres — get a type wrong and either the migration fails or you store data you cannot query.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "model-builder",
        widgetConfig: {
          prompt:
            "Build the Flight entity for schema.prisma. Each row is one field. Pick the canonical name, the Prisma scalar type, and whether the field is the primary key.",
          entityName: "Flight",
          expectedFields: [
            {
              id: "f-id",
              nameOptions: ["id", "Id", "flightId", "uuid"],
              correctName: "id",
              typeOptions: [
                { value: "Int", label: "Int" },
                { value: "String", label: "String" },
                { value: "DateTime", label: "DateTime" },
              ],
              correctType: "Int",
              flagLabel: "Primary key (@id @default(autoincrement()))",
              correctFlag: true,
            },
            {
              id: "f-code",
              nameOptions: ["code", "iata", "flightCode", "name"],
              correctName: "code",
              typeOptions: [
                { value: "String", label: "String" },
                { value: "Int", label: "Int" },
                { value: "Boolean", label: "Boolean" },
              ],
              correctType: "String",
              flagLabel: "Unique (@unique)",
              correctFlag: true,
            },
            {
              id: "f-destination",
              nameOptions: ["destination", "dest", "to", "city"],
              correctName: "destination",
              typeOptions: [
                { value: "String", label: "String" },
                { value: "Int", label: "Int" },
                { value: "Json", label: "Json" },
              ],
              correctType: "String",
              flagLabel: "Optional (?)",
              correctFlag: false,
            },
            {
              id: "f-capacity",
              nameOptions: ["capacity", "seats", "maxPassengers", "size"],
              correctName: "capacity",
              typeOptions: [
                { value: "Int", label: "Int" },
                { value: "Float", label: "Float" },
                { value: "String", label: "String" },
              ],
              correctType: "Int",
              flagLabel: "Optional (?)",
              correctFlag: false,
            },
            {
              id: "f-createdAt",
              nameOptions: ["createdAt", "created_at", "timestamp", "when"],
              correctName: "createdAt",
              typeOptions: [
                { value: "DateTime", label: "DateTime" },
                { value: "String", label: "String" },
                { value: "Int", label: "Int" },
              ],
              correctType: "DateTime",
              flagLabel: "Has default (@default(now()))",
              correctFlag: true,
            },
          ],
        },
        modelAnswer:
          "id: Int @id @default(autoincrement()), code: String @unique, destination: String, capacity: Int, createdAt: DateTime @default(now()). Two judgement calls worth flagging: (1) code is unique because two flights cannot share the same IATA-style identifier. (2) capacity is Int, not Float — half-seats are not a real thing. The createdAt default lets Prisma stamp the row at insert time without your service code reaching for new Date().",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-4-2",
        title: "Build the Prisma query for flights with their airline",
        description:
          "Assemble a Prisma query that lists flights filtered by airlineId, including the related airline record, ordered by createdAt desc, with a take of 50. Each dropdown is one decision — pick the slot that goes where the placeholder is.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "query-builder",
        widgetConfig: {
          dialect: "prisma",
          prompt:
            "Build the Prisma call for GET /flights?airlineId=X. It must return the flights for that airline, with the airline object nested in each, newest first, capped at 50.",
          template:
            "this.prisma.flight.{{op}}({\n  where: { {{filter}} },\n  {{include}},\n  orderBy: { createdAt: {{order}} },\n  take: {{take}},\n});",
          slots: [
            {
              id: "op",
              label: "Operation",
              correct: "findMany",
              options: [
                { value: "findMany" },
                { value: "findUnique" },
                { value: "findFirst" },
                { value: "create" },
              ],
            },
            {
              id: "filter",
              label: "Where clause",
              correct: "airlineId",
              options: [
                { value: "airlineId", label: "airlineId" },
                { value: "id", label: "id" },
                { value: "code", label: "code" },
                { value: "name", label: "name" },
              ],
            },
            {
              id: "include",
              label: "Include relation",
              correct: "include: { airline: true }",
              options: [
                { value: "include: { airline: true }" },
                { value: "select: { airline: true }" },
                { value: "with: { airline: true }" },
                { value: "join: { airline: true }" },
              ],
            },
            {
              id: "order",
              label: "Sort direction",
              correct: "'desc'",
              options: [
                { value: "'desc'", label: "'desc' (newest first)" },
                { value: "'asc'", label: "'asc' (oldest first)" },
                { value: "1", label: "1" },
                { value: "-1", label: "-1" },
              ],
            },
            {
              id: "take",
              label: "Limit",
              correct: "50",
              options: [
                { value: "50" },
                { value: "100" },
                { value: "limit(50)" },
                { value: "first: 50" },
              ],
            },
          ],
        },
        modelAnswer:
          "findMany + where { airlineId } + include { airline: true } + orderBy createdAt desc + take 50. Two gotchas: include vs select are not the same — select replaces the default set of scalar fields, include adds the relation while keeping all scalars. And take is the Prisma name for limit; SQL's LIMIT 50 is take: 50 here.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-4-3",
        title: "Wire PrismaService and persist flights across restart",
        description:
          "Run npx prisma init, define the Flight model you designed above, run prisma migrate dev --name init. Generate PrismaModule + PrismaService (with onModuleInit calling $connect()). Inject PrismaService into FlightsService and rewrite CRUD to use Prisma. Prove persistence: POST a flight, stop the server, restart, GET /flights — the flight is still there. Submit screenshots of the migration.sql AND the GET /flights response after restart.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 40,
        modelAnswer:
          "Two things must be visible: migration.sql with a CREATE TABLE statement, and GET /flights returning the persisted flight after a restart. Common failure: DATABASE_URL not set in .env — Prisma will error 'Environment variable not found'. Another classic: forgetting onModuleInit() { await this.$connect() } — the first request races the connection.",
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
        title: "Find the worst security flaw in this login handler",
        description:
          "Click the single line that does the most damage. Then write one sentence naming what kind of attack it enables. Multiple lines are bad — only one of them is the worst — pick the one that hands the attacker the most leverage if the DB ever leaks.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "error-trace",
        widgetConfig: {
          code: [
            "@Post('login')",
            "async login(@Body() body: any) {",
            "  const user = await this.db.user.findFirst({ where: { email: body.email } });",
            "  if (user.password === body.password) {",
            "    return { token: jwt.sign({ userId: user.id }, 'secret', { expiresIn: '100y' }) };",
            "  }",
            "  throw new UnauthorizedException();",
            "}",
          ],
          errorMessage:
            "Security review: this handler is unsafe to ship. Click the single line that is the worst offender — the one that turns a database leak into an immediate full-user compromise.",
          rootCauseLine: 4,
          acceptKeywords: ["plaintext", "plain text", "bcrypt", "hash", "compare", "leak"],
        },
        modelAnswer:
          "Line 4 is the worst: it compares passwords in plaintext. That means user.password is a plaintext column in the DB — if the DB is ever leaked, every account is instantly compromised. The other lines are also bad (hardcoded JWT secret, 100-year expiry, body: any, missing null check on user) — but they are recoverable. A plaintext password column is not, because the users have already typed those passwords into other sites too. The fix: store passwordHash = await bcrypt.hash(password, 12) at register; check with await bcrypt.compare(body.password, user.passwordHash) at login.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-5-2",
        title: "Pick the right guard for each protected airport endpoint",
        description:
          "For each branch in the decision tree, choose which guard (or combination) protects the route. The wrong choice either over-blocks legitimate users or under-protects sensitive data.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "decision-tree",
        widgetConfig: {
          rootId: "n1",
          nodes: {
            n1: {
              id: "n1",
              question:
                "GET /flights must be readable only by authenticated users — any role. What guards it?",
              options: [
                { label: "@UseGuards(AuthGuard('jwt'))", nextNodeId: "n2" },
                {
                  label: "@UseGuards(RolesGuard) with @Roles('user', 'admin')",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "Works, but the RolesGuard usually depends on the JWT already being parsed — you still need AuthGuard('jwt') in front. And listing every role defeats the point of 'any authenticated user'.",
                  },
                },
                {
                  label: "ApiKeyGuard from Lesson 3 (X-Api-Key header)",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "API keys identify a service, not a user. You cannot distinguish two users with the same key, and you cannot revoke one user's access without rotating the key for everyone.",
                  },
                },
              ],
            },
            n2: {
              id: "n2",
              question:
                "DELETE /flights/:id must be admin-only. What chain protects it?",
              options: [
                {
                  label: "@UseGuards(AuthGuard('jwt')) — JWT contains the role, that's enough",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "The JWT carries the role, but the guard does not check it. Without a RolesGuard you would let any logged-in user delete flights.",
                  },
                },
                {
                  label: "@UseGuards(AuthGuard('jwt'), RolesGuard) + @Roles('admin')",
                  nextNodeId: "n3",
                },
                {
                  label: "Just RolesGuard — it can read the JWT itself",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "RolesGuard typically reads req.user, which is populated by AuthGuard('jwt'). Skip the JWT guard and req.user is undefined.",
                  },
                },
              ],
            },
            n3: {
              id: "n3",
              question:
                "POST /auth/login itself — does it need a guard?",
              options: [
                {
                  label: "@UseGuards(AuthGuard('local')) — Passport local strategy",
                  outcome: {
                    kind: "correct",
                    explanation:
                      "Right. The local strategy reads email + password from the body, runs bcrypt.compare, attaches the user to req — and the handler can sign the JWT for the verified user.",
                  },
                },
                {
                  label: "@UseGuards(AuthGuard('jwt'))",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Chicken and egg — the user does not yet have a JWT, that is what they are trying to obtain.",
                  },
                },
                {
                  label: "No guard — the handler validates the password itself",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "It works, but you duplicate logic that Passport's local strategy already encapsulates and you make testing harder.",
                  },
                },
              ],
            },
          },
        },
        modelAnswer:
          "Correct path: AuthGuard('jwt') → AuthGuard('jwt') + RolesGuard with @Roles('admin') → AuthGuard('local') on login. The pattern: every protected route stacks guards in a specific order. JWT guards parse the token and populate req.user; RolesGuard reads role from that req.user. Skip the first and the second has nothing to read. Login is the exception — local strategy bootstraps the session by verifying credentials.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-5-3",
        title: "Wire register → login → protected GET /flights end-to-end",
        description:
          "Add a User model (id, email, passwordHash, role) and migrate. Build AuthModule with POST /auth/register (bcrypt-hash the password, store), POST /auth/login (verify + sign JWT). Protect FlightsController with AuthGuard('jwt'). Submit a screenshot showing all three requests in sequence: register 201, login returning the JWT, GET /flights with Authorization: Bearer <token> returning 200.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 45,
        modelAnswer:
          "All three responses must be visible. If GET /flights returns 401 even with a valid token, JwtStrategy is not in AuthModule providers or JwtModule.register() has a different secret than the one used to sign. If bcrypt.compare returns false, you are comparing against a re-hashed value, not the stored hash.",
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
        title: "Fill in CreateFlightDto and the global ValidationPipe",
        description:
          "Wire class-validator decorators on a DTO and the global ValidationPipe options that make the airport reject malformed boarding passes. Three options on the pipe matter; missing any one means malicious or sloppy clients sneak fields past you.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "code-fill",
        widgetConfig: {
          language: "ts",
          code: [
            "// create-flight.dto.ts",
            "import { IsString, IsInt, Min, IsDateString } from 'class-validator';",
            "",
            "export class CreateFlightDto {",
            "  @{{1}}()",
            "  code!: string;",
            "",
            "  @IsInt()",
            "  @{{2}}(0)",
            "  capacity!: number;",
            "",
            "  @{{3}}()",
            "  departureDate!: string;",
            "}",
            "",
            "// main.ts",
            "app.useGlobalPipes(new ValidationPipe({",
            "  {{4}}: true,",
            "  forbidNonWhitelisted: true,",
            "  {{5}}: true,",
            "}));",
          ].join("\n"),
          blanks: [
            { id: "1", placeholder: "string validator", answer: "IsString" },
            { id: "2", placeholder: "no negative seats", answer: "Min" },
            { id: "3", placeholder: "ISO date string", answer: "IsDateString" },
            { id: "4", placeholder: "strip unknown fields", answer: "whitelist" },
            { id: "5", placeholder: "string '5' → number 5", answer: "transform" },
          ],
        },
        modelAnswer:
          "@IsString() on code, @Min(0) on capacity, @IsDateString() on departureDate. The pipe options: whitelist (drop any field not in the DTO), forbidNonWhitelisted (return 400 if extra fields are present), transform (turn the request body into an instance of the DTO class — required for @Type and for class-transformer's @Expose/@Exclude to fire later). Skip whitelist and a junior dev's prisma.flight.create({ data: body }) becomes a mass-assignment vulnerability.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-6-2",
        title: "Find the bug in this 'create booking' DTO",
        description:
          "A teammate's PR ships the DTO below. Click the single field that is most dangerous — the one that lets a client write something they should never get to write. Then explain what attack you would run against it.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "error-trace",
        widgetConfig: {
          code: [
            "export class CreateBookingDto {",
            "  @IsString() flightId: string;",
            "  @IsString() passengerId: string;",
            "  @IsString() seatClass: string;",
            "  @IsBoolean() isPaid: boolean;",
            "  @IsString() internalNotes: string;",
            "  @IsString() createdBy: string;",
            "  @IsString() updatedBy: string;",
            "}",
          ],
          errorMessage:
            "Code review: one of these fields should never come from the client. Click the worst offender — the one whose presence in the DTO is a security flaw, not just a tidiness issue.",
          rootCauseLine: 5,
          acceptKeywords: ["isPaid", "paid", "trust", "client", "payment", "bypass"],
        },
        modelAnswer:
          "Line 5 (isPaid) is the worst. A client can POST { ..., isPaid: true } and book a flight without paying — the field exists on the DTO, validates as a boolean, and gets passed straight to prisma.create. createdBy/updatedBy are also bad (clients can spoof identity) but isPaid is a direct revenue leak. The fix: drop isPaid from the DTO entirely and set it server-side after a successful payment webhook. The pattern: DTO fields are a privilege list, not a convenience list.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-6-3",
        title: "Build UpdateFlightDto + @Exclude on User passwordHash",
        description:
          "Create UpdateFlightDto extends PartialType(CreateFlightDto) and wire it into PATCH /flights/:id. Add @Exclude() to the passwordHash field on a User response class. Wire ClassSerializerInterceptor globally. Submit a screenshot showing: (1) PATCH /flights/1 with a partial body returning the updated flight (proving PartialType works), (2) GET /me returning a user object with NO passwordHash key.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 35,
        modelAnswer:
          "If passwordHash still appears, ClassSerializerInterceptor is not global, or the response is a plain object — class-transformer only fires when the returned value is an instance of the class with @Exclude(). Use plainToInstance(UserDto, user) before returning.",
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
        title: "Match REST and GraphQL concepts to their meaning",
        description:
          "Pair each term from the lesson with the definition that captures what it actually does. Mixing these up is how you end up with a 'REST endpoint' that is secretly a query resolver — or worse, a Swagger doc that lies.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            {
              id: "p-apitags",
              term: "@ApiTags('flights')",
              definition:
                "Swagger decorator that groups all endpoints of a controller under one section in the generated docs.",
            },
            {
              id: "p-apiproperty",
              term: "@ApiProperty({ example, description })",
              definition:
                "Marks a DTO field so it appears in the Swagger schema with a description and example value.",
            },
            {
              id: "p-resolver",
              term: "@Resolver(() => Flight)",
              definition:
                "GraphQL class decorator that binds query/mutation methods to a specific object type.",
            },
            {
              id: "p-query",
              term: "@Query(() => [Flight])",
              definition:
                "Marks a resolver method as a GraphQL read operation that returns the given object type.",
            },
            {
              id: "p-field",
              term: "@Field()",
              definition:
                "Exposes a property of an entity class to the GraphQL schema — without it, the field is invisible to GraphQL.",
            },
            {
              id: "p-versioning",
              term: "URI versioning",
              definition:
                "Strategy that puts the API version in the path (e.g. /v2/flights) so old and new clients can coexist.",
            },
          ],
        },
        modelAnswer:
          "Six terms, six definitions. The trick is that @ApiProperty and @Field look superficially similar but live in different worlds: @ApiProperty is for Swagger/OpenAPI, @Field is for GraphQL. You need both on the same property if you want it exposed in both. Versioning is orthogonal to either — and URI versioning is the Nest default because it works for both REST and GraphQL clients.",
        estimatedMinutes: 10,
      },
      {
        id: "nestjs-task-7-2",
        title: "Order the steps to add Swagger to airport-api",
        description:
          "Arrange the steps to set up Swagger so /api shows every FlightsController endpoint with proper schemas. Some steps depend on others — get the order wrong and the UI is blank or missing schemas.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "code-order",
        widgetConfig: {
          language: "ts",
          prompt:
            "Reorder these lines so they form the correct Swagger bootstrap inside main.ts — and the correct decoration on the controller. Top = runs first.",
          lines: [
            "const config = new DocumentBuilder().setTitle('airport-api').setVersion('1.0').build();",
            "const document = SwaggerModule.createDocument(app, config);",
            "SwaggerModule.setup('api', app, document);",
            "@ApiTags('flights')",
            "@Controller('flights')",
            "export class FlightsController {}",
          ],
        },
        modelAnswer:
          "DocumentBuilder → createDocument(app, config) → setup('api', app, document), then @ApiTags + @Controller + class. createDocument needs both the running app and the built config — it walks every controller decorated with @ApiTags / @ApiOperation and reflects the DTO classes into JSON Schema. setup mounts it at /api. Reverse any of the first three and you get either a TypeError or an empty UI.",
        estimatedMinutes: 10,
      },
      {
        id: "nestjs-task-7-3",
        title: "Design the API surface for a new Bookings feature",
        description:
          "The airport-api needs a /bookings resource. Before writing any code, design the API surface: list the endpoints (method + path + brief description), identify which ones need JWT auth, which need role protection, and write the Swagger @ApiOperation description for each. Then: (1) decide whether bookings should be REST-only or also exposed via GraphQL, and defend your choice in 2–3 sentences. (2) Write 2 sentences you would add to the Swagger doc to warn a frontend developer about rate limits on the booking creation endpoint. Submit your design as structured text.",
        category: "advanced",
        submissionType: "text",
        order: 3,
        estimatedMinutes: 30,
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
        title: "Pick the right async tool for each airport scenario",
        description:
          "Walk five real airport-api scenarios. For each, choose between EventEmitter2, BullMQ, @Cron, or cache-manager. The four tools sound similar but their failure modes are very different — picking the wrong one either silently drops work or rebuilds Redis from scratch.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "decision-tree",
        widgetConfig: {
          rootId: "n1",
          nodes: {
            n1: {
              id: "n1",
              question:
                "Send a passenger a welcome email after registration. Email sending takes ~800ms via SendGrid. Which tool?",
              options: [
                {
                  label: "EventEmitter2 — emit('user.registered'), email module subscribes",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "Decouples modules, but EventEmitter2 is in-process and synchronous within the event loop. If SendGrid is slow or the server crashes mid-handler, the email is lost — no retry, no persistence.",
                  },
                },
                { label: "BullMQ — enqueue a 'send-welcome-email' job", nextNodeId: "n2" },
                {
                  label: "@Cron — run every minute, send to anyone registered in the last minute",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Up to 60 seconds of latency, plus you have to scan the user table for 'who needs an email'. That is BullMQ's job.",
                  },
                },
                {
                  label: "cache-manager — cache the welcome email",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Caching does not deliver emails. cache-manager is read-side acceleration, not work execution.",
                  },
                },
              ],
            },
            n2: {
              id: "n2",
              question:
                "Archive completed flights older than 30 days every night at 02:00. Which tool?",
              options: [
                {
                  label: "BullMQ — schedule a recurring job at midnight",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "Works (BullMQ supports cron-like patterns), but @nestjs/schedule is purpose-built for time-driven tasks and does not need Redis at all.",
                  },
                },
                { label: "@Cron('0 2 * * *') in a service", nextNodeId: "n3" },
                {
                  label: "EventEmitter2 — emit 'archive.daily' from somewhere",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Who emits it? You'd need a separate scheduler to emit on time — at which point you might as well use @Cron directly.",
                  },
                },
              ],
            },
            n3: {
              id: "n3",
              question:
                "FlightsModule needs to notify GateModule whenever a flight is created — without FlightsModule importing GateModule. Which tool?",
              options: [
                {
                  label: "EventEmitter2 — emit('flight.created'), GateModule listens",
                  outcome: {
                    kind: "correct",
                    explanation:
                      "Exactly. EventEmitter2's whole purpose is in-process decoupling. Both modules live in the same process; the event is fast, free, and module-graph-free. Persistence and retries are not needed.",
                  },
                },
                {
                  label: "BullMQ — enqueue 'flight.created', GateModule has a processor",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "Works, but adds Redis as a dependency for what is fundamentally an in-process pub/sub. Save BullMQ for work that must survive a crash or run out-of-process.",
                  },
                },
                {
                  label: "cache-manager — set a key 'last-flight-created'",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Cache is not a pub/sub. GateModule has no way to know when the key changed.",
                  },
                },
              ],
            },
          },
        },
        modelAnswer:
          "Correct path: BullMQ (email needs retry + persistence) → @Cron (time-driven recurring task) → EventEmitter2 (in-process decoupling). The rule of thumb: BullMQ when work must survive a crash or run on a separate worker process; @Cron when work is time-driven; EventEmitter2 when modules need to talk without importing each other; cache-manager only for read-side acceleration.",
        estimatedMinutes: 15,
      },
      {
        id: "nestjs-task-8-2",
        title: "Predict the cron and cache log output",
        description:
          "You added a @Cron('*/2 * * * *') job that logs '[CRON] tick' and a CacheInterceptor with @CacheTTL(60) on GET /flights. Predict what the terminal shows after this sequence of commands, then reveal and self-assess. The point: form a model before running the code.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "terminal-trace",
        widgetConfig: {
          prompt:
            "After running the server for ~4 minutes and making 3 back-to-back GET /flights requests in the first 5 seconds, what should the Prisma + cron logs look like? Predict the order of log lines.",
          command:
            "# t=00:00 server starts; t=00:01 GET; t=00:02 GET; t=00:03 GET; ... t=02:00 cron; t=04:00 cron",
          expectedOutput: [
            "[Prisma] SELECT * FROM Flight   # first GET — cache miss",
            "[HTTP]   GET /flights 200 42ms",
            "[HTTP]   GET /flights 200 3ms   # second GET — cache hit",
            "[HTTP]   GET /flights 200 2ms   # third GET — cache hit",
            "[CRON]   tick at 02:00",
            "[CRON]   tick at 04:00",
          ],
          fuzzy: true,
        },
        modelAnswer:
          "Only the first GET should hit Prisma — the cache TTL is 60s, so all three GETs in the first 5 seconds share one DB query. Cron fires every 2 minutes regardless of HTTP traffic. If you see [Prisma] SELECT three times in a row, CacheInterceptor is not applied or CacheModule is missing from imports. If [CRON] never fires, ScheduleModule.forRoot() was not added to AppModule.",
        estimatedMinutes: 10,
      },
      {
        id: "nestjs-task-8-3",
        title: "Wire BullMQ notifications + a CleanupService cron job",
        description:
          "Install @nestjs/bullmq and run Redis. Register a 'notifications' queue. When POST /flights succeeds (JWT-protected from Lesson 5), enqueue a 'flight-created' job; build a processor that logs 'Notification sent for flight <id>'. Add @nestjs/schedule and a CleanupService with @Cron('*/2 * * * *') logging '[CRON] Checking at <ISO timestamp>'. Run for 6+ minutes. Screenshot must show the BullMQ processor log triggered by POST /flights AND at least 3 cron lines at 2-minute intervals.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 45,
        modelAnswer:
          "Common failures: Redis not running (ECONNREFUSED 127.0.0.1:6379); @Processor('notifications') name does not match the queue name; ScheduleModule.forRoot() not imported (cron fires silently). The screenshot proves the airport's back-of-house work loop is running.",
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
        title: "Place each transport on the multi-service airport diagram",
        description:
          "The airport is splitting into multiple services. Drag each communication need onto the transport (in NestJS terms) best suited for it. The wrong pick either adds infra you don't need or fails the moment you scale past one instance.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "arch-diagram",
        widgetConfig: {
          prompt:
            "Match each communication need between airport-api, notifications-service, and the passenger's browser to the right NestJS transport.",
          slots: [
            {
              id: "slot-internal-event",
              label:
                "airport-api → notifications-service: 'flight.created' event, fire-and-forget, low latency, same datacenter",
              correctNodeId: "node-tcp",
            },
            {
              id: "slot-multi-subscriber",
              label:
                "airport-api emits 'flight.delayed' → many services subscribe (notifications, audit, analytics) → must scale to dozens of subscribers",
              correctNodeId: "node-redis",
            },
            {
              id: "slot-browser-push",
              label:
                "Passenger's browser must receive a 'gate-changed' push within 100ms while sitting on a webpage — bidirectional",
              correctNodeId: "node-ws",
            },
            {
              id: "slot-browser-stream",
              label:
                "Passenger's browser wants a one-way stream of boarding updates over plain HTTP — no need to send back",
              correctNodeId: "node-sse",
            },
          ],
          nodes: [
            { id: "node-tcp", label: "Transport.TCP microservice", hint: "Point-to-point, low overhead" },
            { id: "node-redis", label: "Transport.REDIS microservice (pub/sub)", hint: "Fan-out to many subscribers" },
            { id: "node-ws", label: "@WebSocketGateway (Socket.IO)", hint: "Bidirectional persistent connection" },
            { id: "node-sse", label: "@Sse endpoint (Server-Sent Events)", hint: "One-way HTTP stream" },
          ],
        },
        modelAnswer:
          "TCP for point-to-point internal events (cheap, fast, no broker needed). Redis pub/sub when multiple services must receive the same event (TCP would force fan-out from the producer). WebSocket for bidirectional browser push (chat, presence, live editing). SSE for one-way browser streams (notifications, progress bars) — much simpler than WebSocket and reuses regular HTTP.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-9-2",
        title: "Pick WebSocket vs SSE — and justify",
        description:
          "You are about to add real-time boarding updates to airport-api's passenger app. Pick the transport, then write at least 20 words explaining why this scenario favors one over the other. The justification is graded — the AI cannot tell whether you understood the tradeoff without you saying it out loud.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "Passengers open the boarding page in a browser. The server pushes 'gate-changed' and 'boarding-now' updates. The client only consumes; it never sends data back over the same channel. Hundreds of thousands of passengers may be connected simultaneously. Which transport do you choose?",
          options: [
            {
              id: "opt-ws",
              label:
                "WebSocket gateway (Socket.IO) — the full bidirectional channel even though we only push one way",
            },
            {
              id: "opt-sse",
              label:
                "Server-Sent Events (@Sse endpoint) — one-way HTTP stream, no upgrade handshake",
            },
            {
              id: "opt-poll",
              label:
                "Long polling — clients hit GET /boarding/status every 5s and the server hangs the response",
            },
            {
              id: "opt-tcp",
              label:
                "Transport.TCP microservice — passengers connect directly to the service",
            },
          ],
          correctOptionId: "opt-sse",
          minJustificationWords: 20,
          rubric:
            "A strong answer says: SSE is one-way, runs over plain HTTP/2 (so it's friendly to proxies, load balancers, and firewalls), needs no upgrade handshake, and uses less memory per connection than Socket.IO at the same scale. WebSocket is overkill when you never need the client to send messages back over the same channel.",
        },
        modelAnswer:
          "SSE wins here. It's one-way (server → client) over plain HTTP — no upgrade handshake, friendlier to corporate proxies and CDNs, and lighter per-connection than Socket.IO. WebSocket would work but pays the cost of bidirectional state for a one-way use case. Long polling is a pre-2010 workaround. TCP microservice transport is for service-to-service, not browser-to-service.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-9-3",
        title: "Build the TCP notifications microservice + WebSocket gateway",
        description:
          "Scaffold a sibling notifications-service as a TCP microservice on port 4000 with @EventPattern('flight.created') logging the flight id. From airport-api, emit 'flight.created' after a successful POST /flights. Add a FlightsGateway with @WebSocketGateway() that broadcasts 'flight_updated' on every PATCH. Submit a screenshot of both terminals AND a WebSocket client (browser console or Postman WS) receiving the event after a PATCH.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 50,
        modelAnswer:
          "Three things must be visible: both terminals running, the notifications-service logging the TCP event, and the WebSocket client receiving 'flight_updated'. If you get ECONNREFUSED, the notifications-service is not running or the port mismatch with ClientsModule.register(). @EventPattern is case-sensitive.",
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
        title: "Quiz: testing, health checks, deployment — explain your answer",
        description:
          "Three multiple-choice questions about the capstone topics. Pick the answer AND write at least 8 words explaining the why. Picking the right answer with the wrong reason still counts as wrong — that is the whole point.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 8,
          questions: [
            {
              id: "q-unit-mock",
              prompt:
                "You are unit-testing FlightsService.findAll(). FlightsService depends on PrismaService. What do you do with PrismaService in the test?",
              options: [
                { id: "a", label: "Use the real PrismaService and a real Postgres test database" },
                { id: "b", label: "Mock PrismaService — replace it with an object whose .flight.findMany() is jest.fn()" },
                { id: "c", label: "Skip the test — services that talk to Prisma can only be e2e tested" },
                { id: "d", label: "Use SQLite in-memory as a Prisma substitute" },
              ],
              correctOptionId: "b",
              rubric:
                "Unit tests isolate the unit. Hitting a real DB makes it an integration test, slower and more flaky.",
            },
            {
              id: "q-health",
              prompt:
                "What is the practical difference between Kubernetes liveness and readiness probes — and which one fits /health/db?",
              options: [
                { id: "a", label: "They are the same; just pick one" },
                { id: "b", label: "Liveness restarts the pod if it fails; readiness removes the pod from the load balancer if it fails. /health/db is a readiness check" },
                { id: "c", label: "Liveness is for HTTP, readiness is for WebSockets" },
                { id: "d", label: "Readiness restarts the pod; liveness only logs" },
              ],
              correctOptionId: "b",
              rubric:
                "DB connectivity should temporarily remove a pod from rotation (readiness) — restarting on every DB blip (liveness) cascades failures.",
            },
            {
              id: "q-deploy",
              prompt:
                "Your Vercel deploy of airport-api works locally but returns 500 in production. Where is the most likely cause?",
              options: [
                { id: "a", label: "TypeScript compilation differences between Node 18 and Node 20" },
                { id: "b", label: "DATABASE_URL is not set in Vercel project env vars, or points to a DB Vercel cannot reach" },
                { id: "c", label: "@nestjs/cli is a devDependency and Vercel pruned it" },
                { id: "d", label: "Jest tests are running on every request" },
              ],
              correctOptionId: "b",
              rubric:
                "Env config drift between local .env and production is the #1 deploy-day bug. Always check the host's env panel first.",
            },
          ],
        },
        modelAnswer:
          "(1) Mock PrismaService — the unit under test is the service's logic, not Prisma. (2) Readiness probes are the right shape for DB health — they pull the pod out of rotation instead of restarting it. (3) Env-var drift between local and production is the most common deploy-day bug. The course-long pattern: prefer the cheapest, fastest, most-isolated test that proves the specific behavior.",
        estimatedMinutes: 15,
      },
      {
        id: "nestjs-task-10-2",
        title: "Order the CI/CD pipeline from push to production",
        description:
          "Arrange the steps a typical GitHub Actions + Vercel pipeline takes from 'developer pushes a commit' to 'production serves the new code'. Skip a step and either the deploy fails or a broken commit ships.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "flow-order",
        widgetConfig: {
          prompt:
            "Order the steps of the production CI/CD pipeline for airport-api from git push to live traffic.",
          steps: [
            { id: "s-push", label: "Developer pushes commit / opens PR", detail: "Triggers the GitHub Actions workflow" },
            { id: "s-install", label: "CI: npm ci — install pinned dependencies", detail: "Clean install for reproducibility" },
            { id: "s-lint", label: "CI: lint + typecheck", detail: "ESLint + tsc --noEmit" },
            { id: "s-unit", label: "CI: run unit tests (Jest)", detail: "Fast, mocked, isolated" },
            { id: "s-e2e", label: "CI: run e2e tests (Supertest against test DB)", detail: "Slower, real HTTP" },
            { id: "s-build", label: "CI: build the Nest app (nest build)", detail: "TypeScript → dist/" },
            { id: "s-deploy", label: "Deploy to the host (Vercel / Railway / Fly.io)", detail: "Host runs migrations + starts the new process" },
            { id: "s-health", label: "Health check probes /health before sending traffic", detail: "Readiness gate" },
            { id: "s-traffic", label: "Load balancer flips traffic to the new instance", detail: "Old instance drains" },
          ],
          lockFirst: true,
          lockLast: true,
        },
        modelAnswer:
          "push → install → lint+typecheck → unit → e2e → build → deploy → health probe → traffic flip. The two non-obvious orderings: tests run before build (no point building broken code) but the build step is still necessary because deploys ship compiled JS, not source TS. And the health probe sits between deploy and traffic — without it, your load balancer sends real users to a process that hasn't connected to its DB yet.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-10-3",
        title: "Ship airport-api: 5 unit + 2 e2e tests, /health endpoint, live deploy",
        description:
          "Write at least 5 unit tests (Jest, mocked PrismaService) for FlightsService. Write 2 e2e tests (Supertest) for FlightsController — happy path and 401. Add @nestjs/terminus with /health checking DB connectivity. Deploy to Vercel/Railway/Fly.io/Docker. Submit a screenshot showing: (1) Jest output with 5+ passing tests, (2) e2e output with 2+ passing, (3) GET <live-url>/health returning 200 with status: 'ok'.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 60,
        modelAnswer:
          "If /health fails on the deployed instance, DATABASE_URL is not set in the host's env panel. If unit tests hang, you forgot to provide a mock for PrismaService in Test.createTestingModule. The capstone proof: the airport is open for business at a public URL.",
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
        title: "Refactor FlightsService through a repository — fill in the blanks",
        description:
          "Rewrite FlightsService so that every database call goes through FlightsRepository, not Prisma directly. This is the boundary Fohlio enforces. Get the imports, constructor, and method delegations right.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "code-fill",
        widgetConfig: {
          language: "ts",
          code: [
            "// flights.repository.ts",
            "import { Injectable } from '@nestjs/common';",
            "import { PrismaService } from '../prisma/prisma.service';",
            "",
            "@{{1}}()",
            "export class FlightsRepository {",
            "  constructor(private readonly prisma: PrismaService) {}",
            "",
            "  findAll() {",
            "    return this.prisma.flight.findMany();",
            "  }",
            "",
            "  findById(id: number) {",
            "    return this.prisma.flight.{{2}}({ where: { id } });",
            "  }",
            "}",
            "",
            "// flights.service.ts — note: NO Prisma import here",
            "import { Injectable } from '@nestjs/common';",
            "import { FlightsRepository } from './flights.repository';",
            "",
            "@Injectable()",
            "export class FlightsService {",
            "  constructor(private readonly {{3}}: FlightsRepository) {}",
            "",
            "  findAll() {",
            "    return this.{{3}}.findAll();",
            "  }",
            "}",
            "",
            "// flights.module.ts",
            "@Module({",
            "  controllers: [FlightsController],",
            "  providers: [FlightsService, {{4}}],",
            "})",
            "export class FlightsModule {}",
          ].join("\n"),
          blanks: [
            { id: "1", placeholder: "decorator", answer: "Injectable" },
            { id: "2", placeholder: "find one by primary key", answer: "findUnique" },
            { id: "3", placeholder: "constructor field name", answer: "repo", accept: ["repository", "flightsRepository"] },
            { id: "4", placeholder: "register the repository", answer: "FlightsRepository" },
          ],
        },
        modelAnswer:
          "The repository owns the ORM. The service depends on the repository, not on Prisma. Module providers must include both — without FlightsRepository in providers, Nest throws 'can't resolve dependencies of FlightsService'. The 'no Prisma import in the service' rule is what makes swapping Prisma for MikroORM trivial later — you change one file (the repository), not every service.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-11-2",
        title: "Suites: pick solitary() vs sociable() — and justify",
        description:
          "Pick the Suites test mode that matches the testing intent in the scenario below, then explain in at least 15 words why. The two modes look almost identical at a glance — the difference is what gets auto-mocked.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "You want to unit-test FlightsService.findAllForAirline(airlineId) in isolation. It depends on FlightsRepository, a Logger, and a Clock service. You want EVERY dependency auto-mocked so you can override just the FlightsRepository.findAll() call and assert the service behavior. Which Suites mode?",
          options: [
            {
              id: "opt-solitary",
              label:
                "TestBed.solitary(FlightsService).compile() — auto-mocks every dependency",
            },
            {
              id: "opt-sociable",
              label:
                "TestBed.sociable(FlightsService).expose(FlightsRepository).compile() — keeps the repo real, mocks the rest",
            },
            {
              id: "opt-create",
              label:
                "Test.createTestingModule({ providers: [FlightsService, FlightsRepository, ...] }) — the classic NestJS path",
            },
            {
              id: "opt-no-test",
              label:
                "Don't unit test it — only e2e test the controller above it",
            },
          ],
          correctOptionId: "opt-solitary",
          minJustificationWords: 15,
          rubric:
            "Strong answer: solitary() auto-mocks ALL dependencies. That is the whole point of the unit test — exercise only FlightsService logic. sociable() is for cross-class behavior tests where you want a real collaborator. The classic createTestingModule path works but requires manually declaring every mock, which is exactly the boilerplate Suites removes.",
        },
        modelAnswer:
          "solitary() is the right call. It auto-mocks every dependency of FlightsService and lets you reach in with TestBed.solitary(...).mock(FlightsRepository).using({ findAll: () => [...] }). sociable() is for integration-style tests where you want a real collaborator (e.g. the actual Logger). The Test.createTestingModule path works but requires manually declaring a mock for every dependency — exactly the boilerplate Suites was built to remove.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-11-3",
        title: "Audit a Fohlio module against the Module Convention",
        description:
          "Open the asuncion repo. Pick any module other than users (try bookings, workspaces, or invitations). Take a screenshot of its folder structure. Then write a short analysis: (1) Which files map to which Module Convention slot (entities/, dto/, repositories/, service.ts, controller.ts, module.ts)? (2) Is there anything that violates the 'no util files' rule — a *.util.ts, a *.helper.ts, or a plain function doing side-effectful work? (3) If you found a violation, describe what it should be refactored into.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 30,
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
        title: "Add the tenant column to the Flight entity",
        description:
          "Multi-tenancy at Fohlio means every row carries the workspaceId. Pick the right fields to add to the Flight model so the repository can filter every query by workspace. Get the type and indexing right — a missing index here costs you query speed in production.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "model-builder",
        widgetConfig: {
          prompt:
            "Define the new fields that make Flight a tenant-scoped entity. The id field already exists — only declare the multi-tenancy additions and the soft-delete column from the lesson.",
          entityName: "Flight",
          expectedFields: [
            {
              id: "f-workspaceId",
              nameOptions: ["workspaceId", "tenant_id", "orgId", "wsId"],
              correctName: "workspaceId",
              typeOptions: [
                { value: "String", label: "String" },
                { value: "Int", label: "Int" },
                { value: "Json", label: "Json" },
              ],
              correctType: "String",
              flagLabel: "Indexed (@@index([workspaceId]))",
              correctFlag: true,
            },
            {
              id: "f-deletedAt",
              nameOptions: ["deletedAt", "deleted_at", "isDeleted", "removedAt"],
              correctName: "deletedAt",
              typeOptions: [
                { value: "DateTime", label: "DateTime?" },
                { value: "Boolean", label: "Boolean" },
                { value: "Int", label: "Int" },
              ],
              correctType: "DateTime",
              flagLabel: "Nullable (soft-delete marker)",
              correctFlag: true,
            },
            {
              id: "f-createdBy",
              nameOptions: ["createdBy", "owner", "userId", "creator"],
              correctName: "createdBy",
              typeOptions: [
                { value: "String", label: "String" },
                { value: "Int", label: "Int" },
                { value: "DateTime", label: "DateTime" },
              ],
              correctType: "String",
              flagLabel: "Required",
              correctFlag: false,
            },
          ],
        },
        modelAnswer:
          "workspaceId: String, indexed (every tenant query filters on it — without an index, multi-tenancy turns into a full-table-scan tax). deletedAt: DateTime? — nullable so the absence of a value means 'live'. createdBy: String — required, tracks which user in that workspace owned the row. The combination workspaceId + deletedAt + createdBy is what Fohlio's repository hooks key on.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-12-2",
        title: "Build the tenant-scoped query that returns only this workspace's flights",
        description:
          "Assemble the Prisma findMany that the FlightsRepository runs. It must filter by the current workspaceId, skip soft-deleted rows, and order by createdAt desc. One wrong slot and you leak another tenant's data — this is the #1 bug class in multi-tenant systems.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "query-builder",
        widgetConfig: {
          dialect: "prisma",
          prompt:
            "Build the tenant-scoped findMany for FlightsRepository.findAllForWorkspace(workspaceId).",
          template:
            "this.prisma.flight.findMany({\n  where: {\n    {{tenant}}: workspaceId,\n    {{soft}}: null,\n  },\n  orderBy: { {{sortField}}: {{sortDir}} },\n  take: {{limit}},\n});",
          slots: [
            {
              id: "tenant",
              label: "Tenant filter field",
              correct: "workspaceId",
              options: [
                { value: "workspaceId" },
                { value: "id" },
                { value: "createdBy" },
                { value: "tenantId" },
              ],
            },
            {
              id: "soft",
              label: "Soft-delete filter field",
              correct: "deletedAt",
              options: [
                { value: "deletedAt" },
                { value: "isDeleted" },
                { value: "removed" },
                { value: "status" },
              ],
            },
            {
              id: "sortField",
              label: "Order-by field",
              correct: "createdAt",
              options: [
                { value: "createdAt" },
                { value: "id" },
                { value: "code" },
                { value: "destination" },
              ],
            },
            {
              id: "sortDir",
              label: "Order direction",
              correct: "'desc'",
              options: [
                { value: "'desc'", label: "'desc' (newest first)" },
                { value: "'asc'", label: "'asc'" },
                { value: "1" },
                { value: "-1" },
              ],
            },
            {
              id: "limit",
              label: "Page size",
              correct: "50",
              options: [
                { value: "50" },
                { value: "1000" },
                { value: "Infinity" },
                { value: "undefined", label: "no limit" },
              ],
            },
          ],
        },
        modelAnswer:
          "where { workspaceId, deletedAt: null }, orderBy createdAt desc, take 50. Both clauses in the where matter: the workspaceId is the tenant boundary; the deletedAt: null is the soft-delete filter. Forget either and you either leak rows across tenants or expose deleted records. The take is the pagination ceiling — production should always cap unbounded list endpoints.",
        estimatedMinutes: 12,
      },
      {
        id: "nestjs-task-12-3",
        title: "Wire @CurrentUser() decorator + workspaceId isolation on /flights",
        description:
          "Add workspaceId: string to Flight, migrate. Update FlightsRepository so every query (findAll, findById, update, remove) filters by workspaceId. Build a @CurrentUser() param decorator that reads X-Workspace-Id from request headers. Add GET /me returning the decoded value. Submit a screenshot showing: (1) GET /me with X-Workspace-Id: ws-001 returning { workspaceId: 'ws-001' }, (2) GET /flights with two workspaceIds in the DB returning only the ws-001 ones.",
        category: "advanced",
        submissionType: "screenshot",
        order: 3,
        estimatedMinutes: 45,
        modelAnswer:
          "If GET /me returns undefined, the decorator is reading the header with the wrong case — Node.js lowercases all header names, so use req.headers['x-workspace-id']. If GET /flights leaks rows from other workspaces, the repository findAll() is not filtering — add 'where: { workspaceId }' to every query. The proof of correct isolation: two flights in the DB under different workspaceIds, but GET /flights with X-Workspace-Id: ws-001 returns only one.",
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
            widgetId: task.widgetId ?? null,
            widgetConfig: task.widgetConfig
              ? (JSON.parse(JSON.stringify(task.widgetConfig)) as object)
              : undefined,
            modelAnswer: task.modelAnswer ?? null,
            estimatedMinutes: task.estimatedMinutes ?? null,
          },
        });
      }
    }
  }, { timeout: 60_000, maxWait: 10_000 });

  await seedCourseSkills(prisma, {
    courseId: COURSE_ID,
    skills: NESTJS_SKILLS,
    lessonSkills: NESTJS_LESSON_SKILLS,
  });
  await seedBadges(prisma, BADGES);

  console.log("NestJS course seeded successfully.");
  console.log(`Course slug: ${COURSE_SLUG}`);
  console.log(`Lessons published: ${LESSONS.filter((l) => l.isPublished).length}/${LESSONS.length}`);
  const totalTasks = LESSONS.reduce((acc, l) => acc + l.homework.length, 0);
  console.log(`Homework tasks seeded: ${totalTasks}`);
  console.log(`Skills: ${NESTJS_SKILLS.length}, lesson links: ${NESTJS_LESSON_SKILLS.length}, badges: ${BADGES.length} (global catalog)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
