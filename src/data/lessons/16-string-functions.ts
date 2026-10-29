import type { Chapter } from "../../types/learn";
import type { QueryResult } from "../../types/query";

const CONTACTS_SETUP = [
  `CREATE OR REPLACE TABLE contacts_raw (
    id INTEGER,
    full_name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    city VARCHAR
  )`,
  `INSERT INTO contacts_raw VALUES
    (1, '  alice JOHNSON ', 'Alice.Johnson@Example.com', '+1 (555) 010-1234', 'new york'),
    (2, 'Bob Lee', 'BOB@example.org ', '555.010.5678', 'Boston '),
    (3, 'Carla Diaz', 'carla.diaz@example.com', '+49 30 1234567', 'berlin'),
    (4, 'Dev Patel', '  dev.patel@Example.COM', NULL, ' Mumbai'),
    (5, 'Emma Stone', NULL, '555-010-9999', 'new york')`,
];

const SAMPLE_DATA = {
  label: "contacts_raw table (5 rows of messy contact data)",
  setupSql: CONTACTS_SETUP,
  tableNames: ["contacts_raw"],
};

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

/**
 * Compare a text column against expected values keyed by id, in id order.
 * Values are compared exactly, so stray spaces or casing count as differences.
 */
function checkTextColumn(result: QueryResult, column: string, expected: Record<number, string>) {
  const lowerColumns = result.columns.map((name) => name.toLowerCase());
  if (!lowerColumns.includes("id") || !lowerColumns.includes(column)) {
    return { passed: false, message: `Return id and a column named ${column}.` };
  }

  const expectedIds = Object.keys(expected).map(Number);
  if (result.rowCount !== expectedIds.length) {
    return { passed: false, message: `Expected ${expectedIds.length} rows but got ${result.rowCount}.` };
  }

  for (let index = 0; index < expectedIds.length; index += 1) {
    const row = result.data[index];
    const id = Number(getValue(row, "id"));
    const value = getValue(row, column);

    if (id !== expectedIds[index]) {
      return { passed: false, message: "Order the result by id." };
    }

    if (value !== expected[id]) {
      return {
        passed: false,
        message: `Row ${id} should be '${expected[id]}' but got '${String(value)}'. Check spaces and letter case.`,
      };
    }
  }

  return null;
}

const stringFunctions: Chapter = {
  id: "string-functions",
  title: "String Functions",
  description:
    "Clean and reshape text with SQL string functions: change case, trim spaces, concatenate values, extract parts of strings, and replace patterns with regular expressions.",
  guideSlug: "sql-string-functions-clean-text",
  recommendedAfter: "filtering",
  lessons: [
    {
      id: "string-functions-case-trim",
      title: "Changing Case and Trimming Spaces",
      summary:
        "Normalize messy text with LOWER, UPPER, and TRIM so values that look the same really compare as equal, such as emails with stray capitals and spaces.",
      content: `Text exported from forms, spreadsheets, and other systems is rarely tidy. Two values can look the same to a person and still be different to SQL:

~~~sql
SELECT 'BOB@example.org ' = 'bob@example.org' AS same
-- false
~~~

Three functions fix most of these problems:

• \`LOWER(text)\` and \`UPPER(text)\` change letter case.
• \`TRIM(text)\` removes spaces at the start and end. \`LTRIM\` and \`RTRIM\` trim only one side.

Functions can be nested. The inner one runs first:

~~~sql
SELECT id, email, LOWER(TRIM(email)) AS clean_email
FROM contacts_raw
~~~

Most string functions, including \`LOWER\`, \`UPPER\`, and \`TRIM\`, return \`NULL\` when their input is \`NULL\`, so a missing email stays missing. Filter those rows with \`WHERE email IS NOT NULL\` when you only want real values.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "For contacts that have an email, return id and clean_email: the email with surrounding spaces removed and converted to lowercase. Order by id.",
        hint: "LOWER(TRIM(email)) AS clean_email ... WHERE email IS NOT NULL ORDER BY id",
        initialSql: "-- Normalize email addresses\nSELECT id, email\nFROM contacts_raw\nORDER BY id;\n",
        solutionSql:
          "SELECT id, LOWER(TRIM(email)) AS clean_email\nFROM contacts_raw\nWHERE email IS NOT NULL\nORDER BY id;",
        validate: (result) =>
          checkTextColumn(result, "clean_email", {
            1: "alice.johnson@example.com",
            2: "bob@example.org",
            3: "carla.diaz@example.com",
            4: "dev.patel@example.com",
          }) ?? { passed: true, message: "Correct! Every email is now trimmed and lowercase." },
      },
    },
    {
      id: "string-functions-concat",
      title: "Concatenating Text",
      summary:
        "Join text values with the || operator, concat, and concat_ws, and learn how each one treats NULL so missing values do not wipe out the whole result.",
      content: `To join text values, use the \`||\` operator:

~~~sql
SELECT id, TRIM(full_name) || ' from ' || TRIM(city) AS display_name
FROM contacts_raw
~~~

\`||\` has one sharp edge: if any part is \`NULL\`, the whole result is \`NULL\`.

~~~sql
SELECT 'Phone: ' || NULL
-- NULL
~~~

DuckDB offers two functions that are friendlier to missing values:

• \`concat(a, b, ...)\` joins its arguments and skips \`NULL\` values.
• \`concat_ws(separator, a, b, ...)\` joins with a separator and also skips \`NULL\` values, so you do not get doubled separators.

~~~sql
SELECT id, concat_ws(' | ', TRIM(full_name), email, phone) AS contact_card
FROM contacts_raw
~~~

Use \`||\` when every part is required, and \`concat_ws\` when some parts are optional.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "Return id and display_name, built as the trimmed full_name, then ' from ', then the trimmed city (for example 'Bob Lee from Boston'). Order by id.",
        hint: "TRIM(full_name) || ' from ' || TRIM(city) AS display_name",
        initialSql: "-- Build a display name for each contact\nSELECT id, full_name, city\nFROM contacts_raw\nORDER BY id;\n",
        solutionSql:
          "SELECT id, TRIM(full_name) || ' from ' || TRIM(city) AS display_name\nFROM contacts_raw\nORDER BY id;",
        validate: (result) =>
          checkTextColumn(result, "display_name", {
            1: "alice JOHNSON from new york",
            2: "Bob Lee from Boston",
            3: "Carla Diaz from berlin",
            4: "Dev Patel from Mumbai",
            5: "Emma Stone from new york",
          }) ?? { passed: true, message: "Nice! The pieces are joined without stray spaces." },
      },
    },
    {
      id: "string-functions-extract",
      title: "Extracting Parts of a String",
      summary:
        "Pull pieces out of text with LENGTH, LEFT, RIGHT, SUBSTRING, STRPOS, and SPLIT_PART, such as extracting the domain from every email address.",
      content: `Often you need only part of a text value. DuckDB has functions for the common cases:

• \`LENGTH(text)\` counts characters.
• \`LEFT(text, n)\` and \`RIGHT(text, n)\` take characters from either end.
• \`SUBSTRING(text, start, length)\` takes characters from the middle. Positions start at 1.
• \`STRPOS(text, search)\` returns the position of a substring, or 0 when it is missing.
• \`SPLIT_PART(text, separator, n)\` splits text on a separator and returns the n-th part.

~~~sql
SELECT
  email,
  STRPOS(email, '@') AS at_position,
  SPLIT_PART(email, '@', 1) AS mailbox,
  SPLIT_PART(email, '@', 2) AS domain
FROM contacts_raw
~~~

\`SPLIT_PART\` is usually the clearest choice when a value has a clear separator, like the \`@\` in an email or the \`-\` in a product code. Clean the value first with \`TRIM\` and \`LOWER\` so the extracted parts are consistent.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "For contacts that have an email, return id and email_domain: the part after '@', trimmed and lowercase (for example 'example.com'). Order by id.",
        hint: "SPLIT_PART(LOWER(TRIM(email)), '@', 2) AS email_domain",
        initialSql: "-- Extract the email domain\nSELECT id, email\nFROM contacts_raw\nWHERE email IS NOT NULL\nORDER BY id;\n",
        solutionSql:
          "SELECT id, SPLIT_PART(LOWER(TRIM(email)), '@', 2) AS email_domain\nFROM contacts_raw\nWHERE email IS NOT NULL\nORDER BY id;",
        validate: (result) =>
          checkTextColumn(result, "email_domain", {
            1: "example.com",
            2: "example.org",
            3: "example.com",
            4: "example.com",
          }) ?? { passed: true, message: "Exactly right. SPLIT_PART pulled out each domain." },
      },
    },
    {
      id: "string-functions-replace",
      title: "Cleaning Text with REPLACE and REGEXP_REPLACE",
      summary:
        "Remove or swap characters with REPLACE, and use REGEXP_REPLACE with the global flag to strip every non-digit from phone numbers in one step.",
      content: `\`REPLACE(text, search, replacement)\` swaps every occurrence of a fixed string:

~~~sql
SELECT phone, REPLACE(phone, '-', '') AS without_dashes
FROM contacts_raw
~~~

That works for one character at a time. Phone numbers, though, contain spaces, dots, dashes, parentheses, and plus signs. A **regular expression** describes all of them at once. \`[^0-9]\` means "any character that is not a digit":

~~~sql
SELECT phone, REGEXP_REPLACE(phone, '[^0-9]', '', 'g') AS phone_digits
FROM contacts_raw
~~~

The fourth argument, \`'g'\`, means **global**: replace every match. Without it, DuckDB replaces only the first match, which is an easy mistake to miss.

To test whether text matches a pattern without changing it, use \`REGEXP_MATCHES(text, pattern)\`, which returns true or false.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "For contacts that have a phone number, return id and phone_digits: the phone with every non-digit character removed. Order by id.",
        hint: "REGEXP_REPLACE(phone, '[^0-9]', '', 'g') AS phone_digits ... WHERE phone IS NOT NULL",
        initialSql: "-- Keep only the digits of each phone number\nSELECT id, phone\nFROM contacts_raw\nWHERE phone IS NOT NULL\nORDER BY id;\n",
        solutionSql:
          "SELECT id, REGEXP_REPLACE(phone, '[^0-9]', '', 'g') AS phone_digits\nFROM contacts_raw\nWHERE phone IS NOT NULL\nORDER BY id;",
        validate: (result) => {
          const check = checkTextColumn(result, "phone_digits", {
            1: "15550101234",
            2: "5550105678",
            3: "49301234567",
            5: "5550109999",
          });

          if (check && check.message.startsWith("Row 1 ")) {
            return {
              passed: false,
              message: "Row 1 still has non-digits. Did you pass 'g' as the fourth argument to replace every match?",
            };
          }

          return check ?? { passed: true, message: "Great! REGEXP_REPLACE with 'g' stripped every non-digit." };
        },
      },
    },
  ],
};

export default stringFunctions;
