const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TabStopType, TabStopPosition,
} = require("docx");

// ── Color Palette ────────────────────
const COLORS = {
  primary: "1B4F72",
  secondary: "2E86C1",
  accent: "E67E22",
  success: "27AE60",
  headerBg: "1B4F72",
  headerText: "FFFFFF",
  sectionBg: "D6EAF8",
  altRowBg: "F2F3F4",
  lightBorder: "BDC3C7",
  darkBorder: "7F8C8D",
  white: "FFFFFF",
};

const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.lightBorder };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

// Page width: US Letter with 1" margins = 9360 DXA
const PAGE_WIDTH = 9360;

// ── Helper Functions ─────────────────
function createHeaderCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text, bold: true, color: COLORS.headerText, font: "Arial", size: 18 })],
    })],
  });
}

function createCell(text, width, options = {}) {
  const { bold, color, shading, alignment } = options;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: shading ? { fill: shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: alignment || AlignmentType.LEFT,
      children: [new TextRun({
        text,
        bold: bold || false,
        color: color || "2C3E50",
        font: "Arial",
        size: 18,
      })],
    })],
  });
}

function createCheckboxCell(width, options = {}) {
  return createCell("\u2610", width, { alignment: AlignmentType.CENTER, ...options });
}

function sectionHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 28, color: COLORS.primary })],
  });
}

function subHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 24, color: COLORS.secondary })],
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 20, color: "2C3E50" })],
  });
}

function createTestTable(headers, rows, columnWidths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((header, idx) => createHeaderCell(header, columnWidths[idx])),
  });

  const dataRows = rows.map((row, rowIdx) =>
    new TableRow({
      children: row.map((cell, colIdx) => {
        const isCheckbox = cell === "[]";
        const isAltRow = rowIdx % 2 === 1;
        const shading = isAltRow ? COLORS.altRowBg : undefined;

        if (isCheckbox) {
          return createCheckboxCell(columnWidths[colIdx], { shading });
        }

        const isBold = colIdx === 0 && headers.length > 3;
        return createCell(cell, columnWidths[colIdx], { shading, bold: isBold });
      }),
    })
  );

  return new Table({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    columnWidths,
    rows: [headerRow, ...dataRows],
  });
}

// ── Build Document ───────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 20 } },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: COLORS.primary },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: COLORS.secondary },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: COLORS.accent },
        paragraph: { spacing: { before: 200, after: 60 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // ════════════════════════════════════
    // COVER PAGE
    // ════════════════════════════════════
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({ spacing: { before: 3600 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "SHIPWITHAI-AUTH PLUGIN", bold: true, font: "Arial", size: 52, color: COLORS.primary })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: "Quality Assurance Testing Checklist", font: "Arial", size: 32, color: COLORS.secondary })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          border: { top: { style: BorderStyle.SINGLE, size: 3, color: COLORS.accent, space: 10 } },
          children: [new TextRun({ text: "Version 1.0.0  |  Global Market Release", font: "Arial", size: 22, color: COLORS.darkBorder })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "33 Files  |  4,443 Lines  |  5 Auth Providers", font: "Arial", size: 20, color: COLORS.darkBorder })],
        }),
        new Paragraph({ spacing: { before: 1200 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Prepared by: ShipWithAI Team", font: "Arial", size: 22, color: COLORS.primary })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Date: February 2026", font: "Arial", size: 20, color: COLORS.darkBorder })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
          children: [new TextRun({ text: "CONFIDENTIAL \u2014 Internal Testing Only", bold: true, font: "Arial", size: 18, color: COLORS.accent })],
        }),
      ],
    },

    // ════════════════════════════════════
    // MAIN CONTENT
    // ════════════════════════════════════
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.secondary, space: 4 } },
            children: [
              new TextRun({ text: "ShipWithAI-Auth Testing Checklist", font: "Arial", size: 16, color: COLORS.secondary, italics: true }),
              new TextRun({ text: "\tv1.0.0", font: "Arial", size: 16, color: COLORS.darkBorder }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.lightBorder, space: 4 } },
            children: [
              new TextRun({ text: "Page ", font: "Arial", size: 16, color: COLORS.darkBorder }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: COLORS.darkBorder }),
              new TextRun({ text: "  |  shipwithai.io", font: "Arial", size: 16, color: COLORS.darkBorder }),
            ],
          })],
        }),
      },
      children: [
        // ── TESTING OVERVIEW ──────────────
        sectionHeading("1. Testing Overview"),
        bodyText("This checklist ensures the shipwithai-auth plugin meets global market quality standards. Each tester should pick at least one auth provider and complete all sections relevant to that provider. Mark each item as Pass (\u2611), Fail (\u2612), or N/A."),

        subHeading("1.1 Tester Assignment"),
        createTestTable(
          ["Tester Name", "Provider", "Framework", "ORM", "Start Date", "Status"],
          [
            ["", "Better Auth", "Next.js App Router", "Drizzle", "", "[]"],
            ["", "Clerk", "Next.js App Router", "N/A (managed)", "", "[]"],
            ["", "Auth.js (v5)", "Next.js App Router", "Drizzle", "", "[]"],
            ["", "Firebase Auth", "Next.js App Router", "N/A (Firestore)", "", "[]"],
            ["", "Supabase Auth", "Next.js App Router", "Supabase SQL", "", "[]"],
            ["", "Better Auth", "Express/Hono", "Prisma", "", "[]"],
            ["", "Any provider", "Next.js Pages Router", "Any", "", "[]"],
          ],
          [1800, 1500, 1800, 1500, 1100, 660]
        ),

        new Paragraph({ spacing: { before: 200, after: 80 },
          children: [new TextRun({ text: "Testing Environment Requirements:", bold: true, font: "Arial", size: 20, color: COLORS.primary })],
        }),
        createTestTable(
          ["Requirement", "Minimum Version", "Verified"],
          [
            ["Node.js", "v18.17+", "[]"],
            ["npm / pnpm / yarn", "npm 9+ / pnpm 8+ / yarn 4+", "[]"],
            ["Claude Code CLI", "Latest stable", "[]"],
            ["Fresh create-next-app", "Next.js 14+ (App Router)", "[]"],
            ["PostgreSQL (for DB providers)", "v15+", "[]"],
            ["Git", "v2.30+", "[]"],
          ],
          [4000, 4000, 1360]
        ),

        // ── SECTION 2: PLUGIN INSTALLATION ──
        new Paragraph({ children: [new PageBreak()] }),
        sectionHeading("2. Plugin Installation & Structure"),
        bodyText("Verify the plugin installs correctly and Claude Code recognizes all components."),

        createTestTable(
          ["#", "Test Case", "Expected Result", "Pass"],
          [
            ["2.1", "Clone repo to .claude/plugins/shipwithai-auth/", "Folder created, all 33 files present", "[]"],
            ["2.2", "Run: find . -type f | wc -l in plugin dir", "Output: 33", "[]"],
            ["2.3", "Verify plugin.json is valid JSON", "No parse errors", "[]"],
            ["2.4", "Check plugin appears in Claude Code /plugins list", "shipwithai-auth listed with description", "[]"],
            ["2.5", "Run /shipwithai-auth:setup command", "Interactive wizard starts, asks provider question", "[]"],
            ["2.6", "Verify SKILL.md loads when Claude works on auth tasks", "Claude references the decision framework", "[]"],
            ["2.7", "Verify all 9 reference files are readable", "No encoding issues, markdown renders properly", "[]"],
            ["2.8", "Check hooks.json syntax", "Valid JSON, hook definition correct", "[]"],
            ["2.9", "Verify README.md has accurate file structure", "File tree matches actual structure", "[]"],
            ["2.10", "Test plugin in fresh Claude Code session (no cache)", "Plugin loads without errors", "[]"],
          ],
          [500, 3500, 4000, 1360]
        ),

        // ── SECTION 3: PER-PROVIDER TESTING ──
        new Paragraph({ children: [new PageBreak()] }),
        sectionHeading("3. Provider-Specific Testing"),
        bodyText("Each provider must be tested end-to-end on a fresh Next.js project. Start with: npx create-next-app@latest test-auth --typescript --tailwind --app"),

        // Better Auth
        subHeading("3.1 Better Auth"),
        createTestTable(
          ["#", "Test Case", "Expected Result", "Pass"],
          [
            ["3.1.1", "Install better-auth package", "No dependency conflicts", "[]"],
            ["3.1.2", "Copy better-auth.config.ts, fill env vars", "Server starts without errors", "[]"],
            ["3.1.3", "Run npx better-auth secret", "Secret generated in .env.local", "[]"],
            ["3.1.4", "Create API route at api/auth/[...all]/route.ts", "GET/POST handlers work", "[]"],
            ["3.1.5", "Email/password signup", "User created in DB, session cookie set", "[]"],
            ["3.1.6", "Email/password login", "Session created, redirect to dashboard", "[]"],
            ["3.1.7", "Google OAuth login", "Redirect to Google, callback works, user created", "[]"],
            ["3.1.8", "GitHub OAuth login", "Redirect to GitHub, callback works, user created", "[]"],
            ["3.1.9", "Session persistence across page reload", "User stays logged in", "[]"],
            ["3.1.10", "Sign out clears session", "Cookie cleared, redirect to login", "[]"],
            ["3.1.11", "Protected route middleware blocks unauthenticated", "Redirect to /login", "[]"],
            ["3.1.12", "Drizzle schema migration runs clean", "Tables created: users, sessions, accounts, verifications", "[]"],
            ["3.1.13", "Prisma schema migration runs clean", "Same tables as Drizzle", "[]"],
            ["3.1.14", "Password reset flow", "Email sent (or logged), token works", "[]"],
            ["3.1.15", "Cookie cache option works", "Reduced DB queries on repeated requests", "[]"],
          ],
          [600, 3500, 3900, 1360]
        ),

        // Clerk
        new Paragraph({ children: [new PageBreak()] }),
        subHeading("3.2 Clerk"),
        createTestTable(
          ["#", "Test Case", "Expected Result", "Pass"],
          [
            ["3.2.1", "Install @clerk/nextjs", "No dependency conflicts", "[]"],
            ["3.2.2", "Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY", "App starts, ClerkProvider wraps app", "[]"],
            ["3.2.3", "Pre-built <SignIn /> component renders", "Full sign-in UI with email + OAuth options", "[]"],
            ["3.2.4", "Pre-built <SignUp /> component renders", "Full sign-up UI", "[]"],
            ["3.2.5", "<UserButton /> shows avatar dropdown", "User avatar, manage account, sign out options", "[]"],
            ["3.2.6", "Email/password signup via Clerk UI", "User created in Clerk dashboard", "[]"],
            ["3.2.7", "Google OAuth via Clerk", "OAuth flow works end-to-end", "[]"],
            ["3.2.8", "clerkMiddleware protects routes", "Unauthenticated users redirected", "[]"],
            ["3.2.9", "Server-side auth() returns userId", "userId available in server components", "[]"],
            ["3.2.10", "Webhook endpoint receives user.created event", "Svix signature verified, user synced to DB", "[]"],
            ["3.2.11", "Webhook receives user.updated event", "DB record updated", "[]"],
            ["3.2.12", "Webhook receives user.deleted event", "DB record removed", "[]"],
          ],
          [600, 3500, 3900, 1360]
        ),

        // Auth.js
        subHeading("3.3 Auth.js (NextAuth v5)"),
        createTestTable(
          ["#", "Test Case", "Expected Result", "Pass"],
          [
            ["3.3.1", "Install next-auth@beta", "No dependency conflicts, v5 installed", "[]"],
            ["3.3.2", "Run npx auth secret, add to .env.local", "AUTH_SECRET generated", "[]"],
            ["3.3.3", "Create auth.ts config + API route", "Auth endpoints respond", "[]"],
            ["3.3.4", "Google OAuth login", "Redirect, callback, session created", "[]"],
            ["3.3.5", "GitHub OAuth login", "Same flow as Google", "[]"],
            ["3.3.6", "Session available in server components via auth()", "session.user.id populated", "[]"],
            ["3.3.7", "SessionProvider works in client components", "useSession() returns session", "[]"],
            ["3.3.8", "Drizzle adapter persists sessions to DB", "Sessions table populated", "[]"],
            ["3.3.9", "Prisma adapter persists sessions to DB", "Same as Drizzle", "[]"],
            ["3.3.10", "Custom signIn callback fires", "Custom logic executes", "[]"],
            ["3.3.11", "Middleware protects routes", "Unauthenticated redirected", "[]"],
            ["3.3.12", "TypeScript session extension compiles", "session.user.id has correct type", "[]"],
            ["3.3.13", "No v4 patterns in guide (old API references)", "All code uses v5 API", "[]"],
          ],
          [600, 3500, 3900, 1360]
        ),

        // Firebase
        new Paragraph({ children: [new PageBreak()] }),
        subHeading("3.4 Firebase Auth"),
        createTestTable(
          ["#", "Test Case", "Expected Result", "Pass"],
          [
            ["3.4.1", "Install firebase + firebase-admin", "No conflicts", "[]"],
            ["3.4.2", "Client SDK initializes (no duplicate app error)", "getApps() check works", "[]"],
            ["3.4.3", "Admin SDK initializes with service account", "PRIVATE_KEY newline replacement works", "[]"],
            ["3.4.4", "Email/password signup via createUserWithEmailAndPassword", "User in Firebase Console", "[]"],
            ["3.4.5", "Google OAuth with signInWithPopup", "Popup opens, returns user", "[]"],
            ["3.4.6", "Google OAuth with signInWithRedirect", "Redirect works, getRedirectResult returns user", "[]"],
            ["3.4.7", "Session cookie created via API route", "__session cookie set, httpOnly", "[]"],
            ["3.4.8", "Server component reads session cookie", "verifySessionCookie returns user claims", "[]"],
            ["3.4.9", "Token refresh works (wait 1 hour or force)", "New ID token obtained automatically", "[]"],
            ["3.4.10", "Middleware blocks without __session cookie", "Redirect to /login", "[]"],
            ["3.4.11", "Sign out clears cookie + client auth state", "Both cleared, redirect works", "[]"],
            ["3.4.12", "Cookie name is __session (Firebase Hosting)", "Not session or token", "[]"],
            ["3.4.13", "onAuthStateChanged listener works in React", "State updates on login/logout", "[]"],
          ],
          [600, 3500, 3900, 1360]
        ),

        // Supabase
        subHeading("3.5 Supabase Auth"),
        createTestTable(
          ["#", "Test Case", "Expected Result", "Pass"],
          [
            ["3.5.1", "Install @supabase/supabase-js + @supabase/ssr", "Not @supabase/auth-helpers (deprecated)", "[]"],
            ["3.5.2", "Browser client createClient works", "Supabase connection established", "[]"],
            ["3.5.3", "Server client createClient works", "Cookies read/write correctly", "[]"],
            ["3.5.4", "Email/password signup", "User in Supabase Auth dashboard", "[]"],
            ["3.5.5", "Google OAuth with redirectTo callback", "auth/callback route exchanges code", "[]"],
            ["3.5.6", "GitHub OAuth", "Same flow as Google", "[]"],
            ["3.5.7", "Middleware refreshes session on every request", "Token refreshed, cookies updated", "[]"],
            ["3.5.8", "getUser() used instead of getSession() for auth", "Server-side validates with Supabase", "[]"],
            ["3.5.9", "RLS policies: user reads own profile", "SELECT returns only own data", "[]"],
            ["3.5.10", "RLS policies: user cannot read other profiles", "Empty result or denied", "[]"],
            ["3.5.11", "Trigger: profile auto-created on signup", "profiles row created with auth.uid()", "[]"],
            ["3.5.12", "Supabase SQL migration runs without errors", "profiles table, trigger, RLS policies", "[]"],
            ["3.5.13", "Cookie chunking works for long JWTs", "No cookie overflow errors", "[]"],
          ],
          [600, 3500, 3900, 1360]
        ),

        // ── SECTION 4: UI COMPONENTS ──
        new Paragraph({ children: [new PageBreak()] }),
        sectionHeading("4. UI Component Testing"),
        bodyText("All components use shadcn/ui. Test with: npx shadcn@latest init, then add required components."),

        createTestTable(
          ["#", "Component", "Test Case", "Expected Result", "Pass"],
          [
            ["4.1", "login-page.tsx", "Renders without errors", "Form with email, password, OAuth buttons", "[]"],
            ["4.2", "login-page.tsx", "Email validation on empty submit", "Browser native validation or error message", "[]"],
            ["4.3", "login-page.tsx", "Provider swap comments are clear", "Can uncomment 1 provider, others stay commented", "[]"],
            ["4.4", "register-page.tsx", "Renders without errors", "Form with name, email, password, confirm fields", "[]"],
            ["4.5", "register-page.tsx", "Password mismatch shows error", "Client-side validation fires before submit", "[]"],
            ["4.6", "register-page.tsx", "Password min length enforced", "Error shown for < 8 characters", "[]"],
            ["4.7", "forgot-password.tsx", "Renders, submits email", "Success state shows check email message", "[]"],
            ["4.8", "forgot-password.tsx", "Try different email button resets form", "Returns to email input state", "[]"],
            ["4.9", "user-profile.tsx", "Renders with user data", "Avatar, name, email displayed", "[]"],
            ["4.10", "user-profile.tsx", "Update name works", "API called, success message shown", "[]"],
            ["4.11", "user-profile.tsx", "Sign out button works", "Redirect to /login", "[]"],
            ["4.12", "auth-provider-buttons.tsx", "Renders selected providers", "Only configured providers shown", "[]"],
            ["4.13", "auth-provider-buttons.tsx", "Loading state on click", "Spinner shown, buttons disabled", "[]"],
            ["4.14", "auth-provider-buttons.tsx", "Error callback fires on failure", "onError prop called with message", "[]"],
            ["4.15", "All components", "TypeScript compiles without errors", "No type errors in strict mode", "[]"],
            ["4.16", "All components", "Mobile responsive (< 640px)", "Forms remain usable on small screens", "[]"],
            ["4.17", "All components", "Dark mode compatible", "Colors work in both themes (if Tailwind dark)", "[]"],
          ],
          [500, 2000, 2500, 3000, 1360]
        ),

        // ── SECTION 5: MIDDLEWARE TESTING ──
        new Paragraph({ children: [new PageBreak()] }),
        sectionHeading("5. Middleware & Config Testing"),

        subHeading("5.1 Middleware Templates"),
        createTestTable(
          ["#", "File", "Test Case", "Expected Result", "Pass"],
          [
            ["5.1.1", "nextjs-middleware.ts", "Route matcher excludes static assets", "Images, CSS, JS not intercepted", "[]"],
            ["5.1.2", "nextjs-middleware.ts", "Protected route redirects to /login", "302 redirect when unauthenticated", "[]"],
            ["5.1.3", "nextjs-middleware.ts", "Auth route redirects to /dashboard when logged in", "302 redirect when authenticated", "[]"],
            ["5.1.4", "nextjs-middleware.ts", "Each provider option uncomments cleanly", "No syntax errors after uncommenting one", "[]"],
            ["5.1.5", "express-middleware.ts", "requireAuth returns 401 for no token", "JSON error response", "[]"],
            ["5.1.6", "express-middleware.ts", "requireAuth passes user to req.user", "User data available in route handler", "[]"],
            ["5.1.7", "express-middleware.ts", "requireRole blocks insufficient roles", "403 Forbidden response", "[]"],
            ["5.1.8", "hono-middleware.ts", "requireAuth returns 401 for no token", "ctx.json error response", "[]"],
            ["5.1.9", "hono-middleware.ts", "ctx.set(user) available in routes", "User data readable via ctx.get(user)", "[]"],
          ],
          [500, 2000, 2800, 2700, 1360]
        ),

        subHeading("5.2 Config Templates"),
        createTestTable(
          ["#", "File", "Test Case", "Expected Result", "Pass"],
          [
            ["5.2.1", "better-auth.config.ts", "Compiles with TS, all imports resolve", "No type errors", "[]"],
            ["5.2.2", "better-auth.config.ts", "Drizzle adapter connects to DB", "Tables accessible", "[]"],
            ["5.2.3", "clerk.config.ts", "Setup steps are accurate and up-to-date", "Matches current Clerk docs", "[]"],
            ["5.2.4", "authjs.config.ts", "Compiles, NextAuth() returns handlers", "GET/POST exports work", "[]"],
            ["5.2.5", "firebase.config.ts", "Client init with getApps() check", "No duplicate app errors", "[]"],
            ["5.2.6", "firebase.config.ts", "Admin SDK private key newline fix works", "No JSON parse errors", "[]"],
            ["5.2.7", "supabase.config.ts", "Browser + server clients both work", "Cookies handled correctly", "[]"],
            ["5.2.8", "supabase.config.ts", "OAuth callback route exchanges code", "Session created after redirect", "[]"],
            ["5.2.9", "env.example", "All required vars listed per provider", "No missing vars discovered during testing", "[]"],
          ],
          [500, 2200, 2600, 2700, 1360]
        ),

        // ── SECTION 6: SCHEMA TESTING ──
        new Paragraph({ children: [new PageBreak()] }),
        sectionHeading("6. Database Schema Testing"),

        createTestTable(
          ["#", "File", "Test Case", "Expected Result", "Pass"],
          [
            ["6.1", "drizzle-auth-schema.ts", "npx drizzle-kit push creates all tables", "users, sessions, accounts, verifications tables", "[]"],
            ["6.2", "drizzle-auth-schema.ts", "Foreign key cascade on user delete", "Sessions + accounts deleted when user removed", "[]"],
            ["6.3", "drizzle-auth-schema.ts", "Unique constraint on email", "Duplicate email insert fails", "[]"],
            ["6.4", "drizzle-auth-schema.ts", "Type exports work", "User, NewUser, Session, Account types usable", "[]"],
            ["6.5", "prisma-auth-schema.prisma", "npx prisma db push creates all tables", "Same tables as Drizzle", "[]"],
            ["6.6", "prisma-auth-schema.prisma", "Column mappings correct (snake_case)", "DB columns are snake_case, Prisma fields camelCase", "[]"],
            ["6.7", "prisma-auth-schema.prisma", "Cascade delete works", "Same as Drizzle", "[]"],
            ["6.8", "supabase-migration.sql", "SQL runs in Supabase SQL Editor", "No errors, all objects created", "[]"],
            ["6.9", "supabase-migration.sql", "Trigger creates profile on signup", "Profile row with name + avatar from metadata", "[]"],
            ["6.10", "supabase-migration.sql", "RLS blocks cross-user reads", "User A cannot see User B profile", "[]"],
            ["6.11", "supabase-migration.sql", "updated_at trigger fires on UPDATE", "Timestamp auto-updates", "[]"],
          ],
          [500, 2400, 2600, 2500, 1360]
        ),

        // ── SECTION 7: SCRIPT TESTING ──
        sectionHeading("7. Script Testing"),

        createTestTable(
          ["#", "Script", "Test Case", "Expected Result", "Pass"],
          [
            ["7.1", "auth-init.ts", "Runs with --provider=better-auth flag", "Installs better-auth, creates .env.local", "[]"],
            ["7.2", "auth-init.ts", "Runs with --provider=clerk flag", "Installs @clerk/nextjs", "[]"],
            ["7.3", "auth-init.ts", "Runs with --provider=supabase flag", "Installs @supabase/supabase-js + @supabase/ssr", "[]"],
            ["7.4", "auth-init.ts", "--oauth=google,github,apple adds all env vars", "All 3 OAuth sections in .env.local", "[]"],
            ["7.5", "auth-init.ts", "--orm=drizzle adds drizzle deps", "drizzle-orm + drizzle-kit installed", "[]"],
            ["7.6", "auth-init.ts", "--orm=prisma adds prisma deps", "@prisma/client + prisma installed", "[]"],
            ["7.7", "auth-init.ts", "Appends to existing .env.local (not overwrites)", "Previous env vars preserved", "[]"],
            ["7.8", "auth-init.ts", "Scaffolds src/lib/ and src/app/api/ directories", "Directories created", "[]"],
            ["7.9", "verify-auth-setup.ts", "Detects provider from package.json", "Correct provider identified", "[]"],
            ["7.10", "verify-auth-setup.ts", "Reports missing env vars", "Specific var names listed", "[]"],
            ["7.11", "verify-auth-setup.ts", "Reports missing files", "File paths listed", "[]"],
            ["7.12", "verify-auth-setup.ts", "Checks .gitignore for .env", "Warning if missing", "[]"],
            ["7.13", "verify-auth-setup.ts", "Detects hardcoded secrets in source", "Fail if pattern matches found", "[]"],
            ["7.14", "verify-auth-setup.ts", "Exit code 1 on errors, 0 on pass", "CI/CD compatible", "[]"],
          ],
          [500, 1800, 3000, 2700, 1360]
        ),

        // ── SECTION 8: SETUP COMMAND ──
        new Paragraph({ children: [new PageBreak()] }),
        sectionHeading("8. Interactive Setup Command"),

        createTestTable(
          ["#", "Test Case", "Expected Result", "Pass"],
          [
            ["8.1", "/shipwithai-auth:setup triggers the wizard", "Provider selection question appears", "[]"],
            ["8.2", "Supported providers listed as options", "Better Auth, Firebase Auth (Clerk, Auth.js, Supabase marked coming soon)", "[]"],
            ["8.3", "OAuth provider selection (multi-select)", "Can pick Google + GitHub + Apple combo", "[]"],
            ["8.4", "ORM selection shows correct options", "Drizzle, Prisma, None", "[]"],
            ["8.5", "Selecting Better Auth installs correct packages", "better-auth installed via npm", "[]"],
            ["8.6", "Config file created for selected provider", "Correct config template copied/adapted", "[]"],
            ["8.7", "Env vars set for selected provider", ".env.local created with correct vars", "[]"],
            ["8.8", "Schema file generated for selected ORM", "Correct schema template used", "[]"],
            ["8.9", "API route created", "Correct route handler for provider", "[]"],
            ["8.10", "Middleware installed", "middleware.ts created with correct provider", "[]"],
            ["8.11", "UI components copied if requested", "login-page.tsx etc. in correct directory", "[]"],
            ["8.12", "Summary checklist shown at end", "All completed steps listed", "[]"],
            ["8.13", "Verification runs after setup", "verify-auth-setup.ts reports pass/fail", "[]"],
          ],
          [500, 3500, 4000, 1360]
        ),

        // ── SECTION 9: DOCUMENTATION QUALITY ──
        sectionHeading("9. Documentation & Content Quality"),
        bodyText("Critical for global market. Content must be accurate, clear, and free of errors. Every code snippet must work."),

        createTestTable(
          ["#", "Test Case", "Expected Result", "Pass"],
          [
            ["9.1", "All markdown files render correctly in GitHub", "No broken formatting, tables render", "[]"],
            ["9.2", "Code snippets have correct syntax highlighting", "Language tags present (```typescript)", "[]"],
            ["9.3", "No broken links in references", "All file references point to existing files", "[]"],
            ["9.4", "No typos or grammatical errors", "Professional English throughout", "[]"],
            ["9.5", "Package names match current npm registry", "All packages installable as written", "[]"],
            ["9.6", "API patterns match latest docs for each provider", "No deprecated methods referenced", "[]"],
            ["9.7", "Better Auth guide matches v1.x API (latest)", "No pre-1.0 patterns", "[]"],
            ["9.8", "Auth.js guide uses v5 API only (no v4 patterns)", "No NextAuthOptions, no [...nextauth]", "[]"],
            ["9.9", "Supabase guide uses @supabase/ssr (not auth-helpers)", "No deprecated package references", "[]"],
            ["9.10", "Firebase guide works with modular SDK v9+", "No compat imports (firebase/compat/*)", "[]"],
            ["9.11", "09-common-pitfalls.md: all 27 pitfalls reproducible", "Each bug and fix is accurate", "[]"],
            ["9.12", "01-choosing-provider.md: cost table accurate", "Prices match provider websites", "[]"],
            ["9.13", "07-oauth-social-login.md: redirect URIs correct", "Better Auth + Firebase callback URLs accurate", "[]"],
            ["9.14", "README.md: Quick start instructions work", "User can follow top-to-bottom", "[]"],
          ],
          [500, 4000, 3500, 1360]
        ),

        // ── SECTION 10: SECURITY ──
        new Paragraph({ children: [new PageBreak()] }),
        sectionHeading("10. Security Review"),

        createTestTable(
          ["#", "Test Case", "Expected Result", "Pass"],
          [
            ["10.1", "No hardcoded secrets in any file", "All secrets via process.env", "[]"],
            ["10.2", "env.example has placeholder values only", "No real keys, tokens, or URLs", "[]"],
            ["10.3", ".gitignore includes .env* pattern", "Secrets never committed", "[]"],
            ["10.4", "Session cookies are httpOnly", "Cannot be read by client JS", "[]"],
            ["10.5", "Session cookies have secure flag in production", "HTTPS only in prod", "[]"],
            ["10.6", "SameSite=Lax on session cookies", "CSRF protection enabled", "[]"],
            ["10.7", "Password hashing used (not plaintext)", "bcrypt or scrypt in DB", "[]"],
            ["10.8", "OAuth state parameter validated", "CSRF protection on OAuth flow", "[]"],
            ["10.9", "Webhook signatures verified (Clerk: svix)", "Tampered webhooks rejected", "[]"],
            ["10.10", "Admin/service role keys never exposed to client", "Only in server-side code", "[]"],
            ["10.11", "Rate limiting mentioned in guide", "At minimum documented, ideally configured", "[]"],
            ["10.12", "SQL injection prevention in Supabase migration", "Parameterized queries, no string concat", "[]"],
          ],
          [600, 3500, 3900, 1360]
        ),

        // ── SECTION 11: CROSS-PLATFORM ──
        sectionHeading("11. Cross-Platform & Edge Cases"),

        createTestTable(
          ["#", "Test Case", "Expected Result", "Pass"],
          [
            ["11.1", "Plugin works on macOS", "Full flow functional", "[]"],
            ["11.2", "Plugin works on Linux (Ubuntu/Debian)", "Full flow functional", "[]"],
            ["11.3", "Plugin works on Windows (WSL2)", "Full flow functional", "[]"],
            ["11.4", "Works with npm", "Install + scripts run", "[]"],
            ["11.5", "Works with pnpm", "Install + scripts run", "[]"],
            ["11.6", "Works with yarn (v4)", "Install + scripts run", "[]"],
            ["11.7", "Fresh project (zero config) to working auth", "Under 10 minutes with guide", "[]"],
            ["11.8", "Existing project with other deps", "No dependency conflicts", "[]"],
            ["11.9", "Multiple OAuth providers on same app", "Google + GitHub simultaneously", "[]"],
            ["11.10", "Account linking: same email, different OAuth", "Accounts linked (not duplicate users)", "[]"],
            ["11.11", "Session expired: graceful redirect", "No crash, clean redirect to login", "[]"],
            ["11.12", "Network offline during OAuth callback", "Error handled, user notified", "[]"],
          ],
          [600, 3500, 3900, 1360]
        ),

        // ── SECTION 12: SIGN-OFF ──
        new Paragraph({ children: [new PageBreak()] }),
        sectionHeading("12. Final Sign-Off"),
        bodyText("All sections must pass before marketplace release. Any FAIL item requires a fix + re-test."),

        createTestTable(
          ["Section", "Total Tests", "Pass", "Fail", "N/A", "Sign-Off"],
          [
            ["2. Plugin Installation", "10", "", "", "", "[]"],
            ["3.1 Better Auth", "15", "", "", "", "[]"],
            ["3.2 Clerk", "12", "", "", "", "[]"],
            ["3.3 Auth.js", "13", "", "", "", "[]"],
            ["3.4 Firebase Auth", "13", "", "", "", "[]"],
            ["3.5 Supabase Auth", "13", "", "", "", "[]"],
            ["4. UI Components", "17", "", "", "", "[]"],
            ["5. Middleware & Config", "18", "", "", "", "[]"],
            ["6. Database Schemas", "11", "", "", "", "[]"],
            ["7. Scripts", "14", "", "", "", "[]"],
            ["8. Setup Command", "13", "", "", "", "[]"],
            ["9. Documentation", "14", "", "", "", "[]"],
            ["10. Security", "12", "", "", "", "[]"],
            ["11. Cross-Platform", "12", "", "", "", "[]"],
            ["TOTAL", "187", "", "", "", ""],
          ],
          [2000, 1300, 1200, 1200, 1200, 2460]
        ),

        new Paragraph({ spacing: { before: 400 } }),
        bodyText("Release Approval:"),
        new Paragraph({ spacing: { before: 200, after: 100 },
          children: [
            new TextRun({ text: "Lead Reviewer: ___________________________    Date: _______________", font: "Arial", size: 20, color: "2C3E50" }),
          ],
        }),
        new Paragraph({ spacing: { after: 100 },
          children: [
            new TextRun({ text: "QA Lead: ________________________________    Date: _______________", font: "Arial", size: 20, color: "2C3E50" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Product Owner: ___________________________    Date: _______________", font: "Arial", size: 20, color: "2C3E50" }),
          ],
        }),

        new Paragraph({ spacing: { before: 600 },
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.accent, space: 10 } },
          children: [new TextRun({ text: "187 test cases across 12 sections \u2014 Global market quality standard", font: "Arial", size: 18, color: COLORS.darkBorder, italics: true })],
        }),
      ],
    },
  ],
});

// ── Export ─────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  const outputPath = "/sessions/eloquent-modest-hamilton/mnt/claude-kit-zip/ethan/shipwithai-auth-testing-checklist.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created: ${outputPath}`);
  console.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
