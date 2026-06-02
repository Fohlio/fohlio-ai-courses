// AUTO-GENERATED CONTENT NOTE:
// SHARED_LESSON_CSS holds the byte-exact raw CSS that was previously duplicated
// inside the per-lesson <style> blocks of each seeded course family. The strip
// phase removes those <style> blocks from public/lessons/*.html; this file becomes
// the single source of truth, injected at render time via prepareLessonHtml.
//
// "skill-course"  -> shared by nestjs (12 lessons) and mikroorm (10 lessons)
// "fohlio-domain" -> shared by fohlio-domain (14 lessons)
//
// DO NOT hand-edit the CSS strings: they must stay byte-identical to the source
// HTML so rendering is unchanged after the strip phase.

export const SHARED_LESSON_CSS: Record<string, string> = {
  "skill-course": `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
            --blue: #3451B2;
            --blue-light: #E8EDFF;
            --blue-mid: #C5D0F6;
            --green: #1A8F5C;
            --green-light: #E6F9F0;
            --orange: #E8790C;
            --orange-light: #FFF3E5;
            --red: #DC2626;
            --red-light: #FEE2E2;
            --purple: #7C3AED;
            --purple-light: #EDE9FE;
            --gray-50: #F9FAFB;
            --gray-100: #F3F4F6;
            --gray-200: #E5E7EB;
            --gray-300: #D1D5DB;
            --gray-500: #6B7280;
            --gray-700: #374151;
            --gray-900: #111827;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: var(--gray-900);
            line-height: 1.7;
            background: #fff;
            font-size: 16px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 32px;
        }

        /* Header */
        .header {
            text-align: center;
            padding: 80px 0 60px;
        }
        .header h1 {
            font-size: 42px;
            font-weight: 800;
            color: var(--blue);
            letter-spacing: -1px;
        }
        .header .subtitle {
            font-size: 20px;
            color: var(--gray-500);
            margin-top: 8px;
            font-weight: 400;
        }
        .header .lesson-badge {
            display: inline-block;
            background: var(--blue-light);
            color: var(--blue);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        /* Goals box */
        .goals-box {
            background: var(--blue-light);
            border-left: 4px solid var(--blue);
            border-radius: 0 12px 12px 0;
            padding: 28px 32px;
            margin: 40px 0;
        }
        .goals-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: var(--blue);
            margin-bottom: 16px;
        }
        .goals-box ul { list-style: none; }
        .goals-box li {
            padding: 6px 0;
            padding-left: 24px;
            position: relative;
            color: var(--gray-700);
        }
        .goals-box li::before {
            content: "\\2022";
            color: var(--blue);
            font-weight: bold;
            position: absolute;
            left: 8px;
        }

        /* Section headers */
        .part-header {
            font-size: 28px;
            font-weight: 700;
            color: var(--blue);
            margin-top: 64px;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--blue-light);
        }

        h3 {
            font-size: 20px;
            font-weight: 600;
            color: var(--gray-900);
            margin-top: 36px;
            margin-bottom: 12px;
        }

        h4 {
            font-size: 17px;
            font-weight: 600;
            color: var(--gray-700);
            margin-top: 28px;
            margin-bottom: 8px;
        }

        p {
            margin-bottom: 16px;
            color: var(--gray-700);
        }

        /* Code blocks */
        code {
            font-family: 'JetBrains Mono', monospace;
            background: var(--gray-100);
            padding: 2px 7px;
            border-radius: 4px;
            font-size: 14px;
            color: var(--gray-900);
        }

        pre {
            background: var(--gray-900);
            color: #E5E7EB;
            padding: 20px 24px;
            border-radius: 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            line-height: 1.6;
            overflow-x: auto;
            margin: 16px 0;
        }
        pre code {
            background: none;
            padding: 0;
            color: inherit;
            font-size: inherit;
        }
        .comment { color: #6B7280; }
        .keyword { color: #C084FC; }
        .string { color: #86EFAC; }
        .function { color: #93C5FD; }
        .decorator { color: #F9A8D4; }
        .type { color: #FCD34D; }

        /* Info boxes */
        .info-box {
            border-radius: 12px;
            padding: 20px 24px;
            margin: 20px 0;
        }
        .info-box p { margin-bottom: 0; }
        .info-box.blue { background: var(--blue-light); border-left: 4px solid var(--blue); }
        .info-box.green { background: var(--green-light); border-left: 4px solid var(--green); }
        .info-box.orange { background: var(--orange-light); border-left: 4px solid var(--orange); }
        .info-box.purple { background: var(--purple-light); border-left: 4px solid var(--purple); }
        .info-box.red { background: var(--red-light); border-left: 4px solid var(--red); }

        /* Joke box */
        .joke-box {
            background: var(--gray-50);
            border: 1px dashed var(--gray-300);
            border-radius: 12px;
            padding: 20px 24px;
            margin: 24px 0;
            font-size: 14px;
            color: var(--gray-700);
            line-height: 1.8;
        }
        .joke-box .joke-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }

        /* Story box */
        .story-box {
            background: var(--purple-light);
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
            border-left: 4px solid var(--purple);
        }
        .story-box p { color: var(--gray-700); }
        .story-box .tech-note {
            font-style: normal;
            font-size: 13px;
            color: var(--gray-500);
            background: white;
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 12px;
            border: 1px solid var(--gray-200);
        }
        .story-box .tech-note code {
            font-size: 12px;
        }

        /* Concept cards */
        .concept-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
        }
        .concept-card {
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        .concept-card .card-icon {
            font-size: 36px;
            margin-bottom: 8px;
        }
        .concept-card .card-title {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            font-size: 15px;
            margin-bottom: 4px;
        }
        .concept-card .card-subtitle {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 6px;
        }
        .concept-card .card-desc {
            font-size: 12px;
            color: var(--gray-500);
            text-align: left;
        }

        /* Comparison table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }
        th {
            background: var(--blue);
            color: white;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 10px 16px;
            border-bottom: 1px solid var(--gray-200);
            color: var(--gray-700);
        }
        tr:nth-child(even) { background: var(--gray-50); }

        /* Diagram */
        .diagram {
            margin: 24px 0;
        }
        .diagram svg {
            width: 100%;
            height: auto;
        }
        .diagram-caption {
            text-align: center;
            font-size: 13px;
            color: var(--gray-500);
            margin-top: 8px;
        }

        /* Step cards */
        .step-card {
            background: white;
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 20px 24px;
            margin: 12px 0;
        }
        .step-card .step-number {
            display: inline-block;
            background: var(--blue);
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            text-align: center;
            line-height: 28px;
            font-size: 14px;
            font-weight: 600;
            margin-right: 12px;
        }
        .step-card .step-title {
            font-weight: 600;
            font-size: 15px;
            display: inline;
        }
        .step-card .step-desc {
            margin-top: 8px;
            font-size: 14px;
            color: var(--gray-500);
        }

        /* Layer visualization */
        .layer-stack {
            margin: 24px 0;
        }
        .layer-item {
            display: flex;
            align-items: center;
            padding: 14px 20px;
            border-radius: 10px;
            margin: 6px 0;
            transition: transform 0.2s;
        }
        .layer-item:hover {
            transform: translateX(4px);
        }
        .layer-item .layer-icon {
            font-size: 24px;
            margin-right: 16px;
            width: 36px;
            text-align: center;
        }
        .layer-item .layer-name {
            font-weight: 600;
            font-size: 15px;
            min-width: 160px;
        }
        .layer-item .layer-desc {
            font-size: 13px;
            color: var(--gray-500);
            margin-left: auto;
        }

        /* Homework section */
        .homework {
            background: var(--blue-light);
            border: 2px solid var(--blue-mid);
            border-radius: 16px;
            padding: 36px;
            margin: 48px 0;
        }
        .homework h2 {
            color: var(--blue);
            font-size: 24px;
            margin-bottom: 20px;
        }

        /* Recall box */
        .recall-box {
            background: #FFFBEB;
            border: 2px solid #FCD34D;
            border-radius: 12px;
            padding: 20px 24px;
            margin: 28px 0;
        }
        .recall-box .recall-title {
            font-weight: 700;
            font-size: 15px;
            color: #D97706;
            margin-bottom: 10px;
        }
        .recall-box .recall-question {
            font-size: 15px;
            color: var(--gray-700);
            margin-bottom: 12px;
            line-height: 1.7;
        }
        .recall-box .recall-hint {
            font-size: 13px;
            color: var(--gray-500);
            font-style: italic;
        }

        /* File tree */
        .file-tree {
            background: var(--gray-900);
            color: #E5E7EB;
            padding: 20px 24px;
            border-radius: 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            line-height: 2;
            margin: 16px 0;
            white-space: pre;
            overflow-x: auto;
        }
        .file-tree .dir { color: #93C5FD; }
        .file-tree .file { color: #E5E7EB; }
        .file-tree .comment { color: #6B7280; }
        .file-tree .highlight { color: #86EFAC; }

        /* Responsive */
        @media (max-width: 600px) {
            .concept-grid { grid-template-columns: 1fr; }
        }
    `,
  "fohlio-domain": `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
            --blue: #3451B2;
            --blue-light: #E8EDFF;
            --blue-mid: #C5D0F6;
            --green: #1A8F5C;
            --green-light: #E6F9F0;
            --orange: #E8790C;
            --orange-light: #FFF3E5;
            --red: #DC2626;
            --red-light: #FEE2E2;
            --purple: #7C3AED;
            --purple-light: #EDE9FE;
            --gray-50: #F9FAFB;
            --gray-100: #F3F4F6;
            --gray-200: #E5E7EB;
            --gray-300: #D1D5DB;
            --gray-500: #6B7280;
            --gray-700: #374151;
            --gray-900: #111827;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: var(--gray-900);
            line-height: 1.7;
            background: #fff;
            font-size: 16px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 32px;
        }

        /* Header */
        .header {
            text-align: center;
            padding: 80px 0 60px;
        }
        .header h1 {
            font-size: 42px;
            font-weight: 800;
            color: var(--blue);
            letter-spacing: -1px;
        }
        .header .subtitle {
            font-size: 20px;
            color: var(--gray-500);
            margin-top: 8px;
            font-weight: 400;
        }
        .header .lesson-badge {
            display: inline-block;
            background: var(--blue-light);
            color: var(--blue);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        /* Goals box */
        .goals-box {
            background: var(--blue-light);
            border-left: 4px solid var(--blue);
            border-radius: 0 12px 12px 0;
            padding: 28px 32px;
            margin: 40px 0;
        }
        .goals-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: var(--blue);
            margin-bottom: 16px;
        }
        .goals-box ul { list-style: none; }
        .goals-box li {
            padding: 6px 0;
            padding-left: 24px;
            position: relative;
            color: var(--gray-700);
        }
        .goals-box li::before {
            content: "\\2022";
            color: var(--blue);
            font-weight: bold;
            position: absolute;
            left: 8px;
        }

        /* Section headers */
        .part-header {
            font-size: 28px;
            font-weight: 700;
            color: var(--blue);
            margin-top: 64px;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--blue-light);
        }

        h3 {
            font-size: 20px;
            font-weight: 600;
            color: var(--gray-900);
            margin-top: 36px;
            margin-bottom: 12px;
        }

        h4 {
            font-size: 17px;
            font-weight: 600;
            color: var(--gray-700);
            margin-top: 28px;
            margin-bottom: 8px;
        }

        p {
            margin-bottom: 16px;
            color: var(--gray-700);
        }

        /* Code blocks */
        code {
            font-family: 'JetBrains Mono', monospace;
            background: var(--gray-100);
            padding: 2px 7px;
            border-radius: 4px;
            font-size: 14px;
            color: var(--gray-900);
        }

        pre {
            background: var(--gray-900);
            color: #E5E7EB;
            padding: 20px 24px;
            border-radius: 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            line-height: 1.6;
            overflow-x: auto;
            margin: 16px 0;
        }
        pre code {
            background: none;
            padding: 0;
            color: inherit;
            font-size: inherit;
        }
        .comment { color: #6B7280; }
        .keyword { color: #C084FC; }
        .string { color: #86EFAC; }
        .function { color: #93C5FD; }
        .decorator { color: #F9A8D4; }
        .type { color: #FCD34D; }

        /* Info boxes */
        .info-box {
            border-radius: 12px;
            padding: 20px 24px;
            margin: 20px 0;
        }
        .info-box p { margin-bottom: 0; }
        .info-box.blue { background: var(--blue-light); border-left: 4px solid var(--blue); }
        .info-box.green { background: var(--green-light); border-left: 4px solid var(--green); }
        .info-box.orange { background: var(--orange-light); border-left: 4px solid var(--orange); }
        .info-box.purple { background: var(--purple-light); border-left: 4px solid var(--purple); }
        .info-box.red { background: var(--red-light); border-left: 4px solid var(--red); }

        /* Joke box */
        .joke-box {
            background: var(--gray-50);
            border: 1px dashed var(--gray-300);
            border-radius: 12px;
            padding: 20px 24px;
            margin: 24px 0;
            font-size: 14px;
            color: var(--gray-700);
            line-height: 1.8;
        }
        .joke-box .joke-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }

        /* Story box */
        .story-box {
            background: var(--purple-light);
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
            border-left: 4px solid var(--purple);
        }
        .story-box p { color: var(--gray-700); }
        .story-box .tech-note {
            font-style: normal;
            font-size: 13px;
            color: var(--gray-500);
            background: white;
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 12px;
            border: 1px solid var(--gray-200);
        }
        .story-box .tech-note code {
            font-size: 12px;
        }

        /* Concept cards */
        .concept-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
        }
        .concept-card {
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        .concept-card .card-icon {
            font-size: 36px;
            margin-bottom: 8px;
        }
        .concept-card .card-title {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            font-size: 15px;
            margin-bottom: 4px;
        }
        .concept-card .card-subtitle {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 6px;
        }
        .concept-card .card-desc {
            font-size: 12px;
            color: var(--gray-500);
            text-align: left;
        }

        /* Comparison table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }
        th {
            background: var(--blue);
            color: white;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 10px 16px;
            border-bottom: 1px solid var(--gray-200);
            color: var(--gray-700);
            vertical-align: top;
        }
        tr:nth-child(even) { background: var(--gray-50); }

        /* Diagram */
        .diagram {
            margin: 24px 0;
        }
        .diagram svg {
            width: 100%;
            height: auto;
        }
        .diagram-caption {
            text-align: center;
            font-size: 13px;
            color: var(--gray-500);
            margin-top: 8px;
        }

        /* AI illustrations (only used when config.images = true) */
        .lesson-hero {
            margin: 0 0 32px;
        }
        .lesson-hero img {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 14px;
        }
        .lesson-figure {
            margin: 24px auto;
            max-width: 760px;
        }
        .lesson-figure img {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 12px;
        }
        .lesson-figure figcaption {
            text-align: center;
            font-size: 13px;
            color: var(--gray-500);
            margin-top: 8px;
        }

        /* Step cards */
        .step-card {
            background: white;
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 20px 24px;
            margin: 12px 0;
        }
        .step-card .step-number {
            display: inline-block;
            background: var(--blue);
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            text-align: center;
            line-height: 28px;
            font-size: 14px;
            font-weight: 600;
            margin-right: 12px;
        }
        .step-card .step-title {
            font-weight: 600;
            font-size: 15px;
            display: inline;
        }
        .step-card .step-desc {
            margin-top: 8px;
            font-size: 14px;
            color: var(--gray-500);
        }

        /* Layer visualization */
        .layer-stack {
            margin: 24px 0;
        }
        .layer-item {
            display: flex;
            align-items: center;
            padding: 14px 20px;
            border-radius: 10px;
            margin: 6px 0;
            transition: transform 0.2s;
        }
        .layer-item:hover {
            transform: translateX(4px);
        }
        .layer-item .layer-icon {
            font-size: 24px;
            margin-right: 16px;
            width: 36px;
            text-align: center;
        }
        .layer-item .layer-name {
            font-weight: 600;
            font-size: 15px;
            min-width: 160px;
        }
        .layer-item .layer-desc {
            font-size: 13px;
            color: var(--gray-500);
            margin-left: auto;
        }

        /* Homework section */
        .homework {
            background: var(--blue-light);
            border: 2px solid var(--blue-mid);
            border-radius: 16px;
            padding: 36px;
            margin: 48px 0;
        }
        .homework h2 {
            color: var(--blue);
            font-size: 24px;
            margin-bottom: 20px;
        }

        /* Recall box */
        .recall-box {
            background: #FFFBEB;
            border: 2px solid #FCD34D;
            border-radius: 12px;
            padding: 20px 24px;
            margin: 28px 0;
        }
        .recall-box .recall-title {
            font-weight: 700;
            font-size: 15px;
            color: #D97706;
            margin-bottom: 10px;
        }
        .recall-box .recall-question {
            font-size: 15px;
            color: var(--gray-700);
            margin-bottom: 12px;
            line-height: 1.7;
        }
        .recall-box .recall-hint {
            font-size: 13px;
            color: var(--gray-500);
            font-style: italic;
        }

        /* File tree */
        .file-tree {
            background: var(--gray-900);
            color: #E5E7EB;
            padding: 20px 24px;
            border-radius: 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            line-height: 2;
            margin: 16px 0;
            white-space: pre;
            overflow-x: auto;
        }
        .file-tree .dir { color: #93C5FD; }
        .file-tree .file { color: #E5E7EB; }
        .file-tree .comment { color: #6B7280; }
        .file-tree .highlight { color: #86EFAC; }

        /* Recap grid (used in lessons 2+) */
        .recap-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin: 20px 0;
        }
        .recap-grid .recap-item {
            background: var(--gray-50);
            border-left: 3px solid var(--blue);
            border-radius: 6px;
            padding: 12px 16px;
            font-size: 14px;
            color: var(--gray-700);
        }
        .recap-grid .recap-item strong { color: var(--blue); }

        /* Pull quote */
        .pull-quote {
            font-size: 22px;
            font-weight: 600;
            color: var(--gray-900);
            line-height: 1.5;
            margin: 32px 0;
            padding: 8px 24px;
            border-left: 4px solid var(--blue);
        }

        /* Sources box — appears at the end of every lesson before the footer. */
        .sources-box {
            background: var(--gray-50);
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 24px 28px;
            margin: 48px 0 24px;
            font-size: 14px;
            color: var(--gray-700);
            line-height: 1.7;
        }
        .sources-box h3 {
            font-size: 15px;
            font-weight: 700;
            color: var(--gray-900);
            margin-bottom: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .sources-box ol { margin: 0 0 0 22px; padding: 0; }
        .sources-box li { margin-bottom: 10px; }
        .sources-box .src-meta {
            font-size: 12px;
            color: var(--gray-500);
            margin-top: 2px;
        }
        .sources-box a { color: var(--blue); text-decoration: underline; word-break: break-word; }
        .sources-box .src-note {
            margin-top: 14px;
            font-size: 12px;
            color: var(--gray-500);
            font-style: italic;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .container { max-width: 100%; padding: 32px 24px; }
        }

        @media (max-width: 640px) {
            .container { padding: 24px 18px; }
            .header { padding: 32px 0 24px; }
            .header h1 { font-size: 32px; }
            .header .subtitle { font-size: 17px; }
            h2.part-header { font-size: 22px; margin: 40px 0 16px; }
            h3 { font-size: 18px; }
            p, li { font-size: 15px; }
            code { font-size: 13px; }

            /* Grid collapses */
            .recap-grid, .concept-grid { grid-template-columns: 1fr; }

            /* Layer-stack stays flex but reduces padding */
            .layer-item {
                display: flex;
                gap: 14px;
                align-items: flex-start;
                padding: 14px 16px;
            }
            .layer-item .layer-desc { margin-left: 0; }
            .layer-item .layer-name { min-width: 0; }

            /* Boxes scale padding */
            .info-box, .recall-box, .joke-box, .story-box, .goals-box, .homework, .sources-box {
                padding: 16px 18px;
                margin: 20px 0;
            }

            /* Pull quote */
            .pull-quote { font-size: 20px; padding: 16px; }

            /* Code blocks scroll horizontally inside their container */
            pre {
                overflow-x: auto;
                font-size: 12px;
                padding: 14px;
            }

            /* File tree must scroll inside its container, not on page */
            .file-tree {
                white-space: pre;
                overflow-x: auto;
                font-size: 12px;
            }

            /* Tables get horizontal scroll wrapper */
            table {
                display: block;
                overflow-x: auto;
                white-space: nowrap;
            }

            /* Step cards stack tightly */
            .step-card { padding: 14px 16px; margin: 10px 0; }

            /* AI illustrations scale down */
            .lesson-hero { margin-bottom: 24px; }
            .lesson-hero img { border-radius: 10px; }
            .lesson-figure { margin: 20px auto; }
        }

        @media (max-width: 375px) {
            .header h1 { font-size: 28px; }
            .container { padding: 20px 14px; }
            p, li { font-size: 14.5px; }
        }
    `,
};

const COURSE_CSS_BASE: Record<string, keyof typeof SHARED_LESSON_CSS> = {
  nestjs: "skill-course",
  mikroorm: "skill-course",
  "fohlio-domain": "fohlio-domain",
};

export function cssBaseForCourse(courseSlug: string): string | undefined {
  const baseKey = COURSE_CSS_BASE[courseSlug];
  return baseKey ? SHARED_LESSON_CSS[baseKey] : undefined;
}
