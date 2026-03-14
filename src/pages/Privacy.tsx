import SEO from "../components/SEO/SEO";

/**
 * Privacy Policy Page
 *
 * GDPR-compliant privacy policy for SQL for Files
 */
export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy | SQL for Files"
        description="Learn how SQL for Files keeps files, SQL queries, and query results local in your browser."
        canonicalPath="/privacy"
        ogType="article"
        imageAlt="SQL for Files privacy policy"
      />
      <div className="theme-page min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 p-8 md:p-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">
              Privacy Policy
            </h1>

          {/* Contact Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact</h2>
            <p className="text-slate-700 mb-4">Questions can be directed to:</p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-slate-700">
                <strong>sqlforfiles - Stefan Graf</strong>
                <br />
                c/o Online-Impressum.de #1285
                <br />
                Europaring 90
                <br />
                53757 Sankt Augustin
                <br />
                Germany
              </p>
              <p className="text-slate-700 mt-2">
                Email:{" "}
                <a
                  href="mailto:info@sqlforfiles.app"
                  className="text-blue-600 hover:text-blue-700"
                >
                  info@sqlforfiles.app
                </a>
              </p>
            </div>
          </section>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Introduction
            </h2>
            <p className="text-slate-700 mb-4">
              The protection of your data is important to us, which is why we
              implement data protection regulations applicable in Germany and
              the European Union.
            </p>
            <p className="text-slate-700">
              SQL for Files is designed with privacy as a core principle. All
              file and query processing happens in your browser - the app does
              not upload your files, SQL queries, or query results.
            </p>
          </section>

          {/* Data Processing Philosophy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Our Privacy-First Approach
            </h2>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-semibold">
                ✓ Your files are processed entirely in your browser using
                WebAssembly technology
              </p>
              <p className="text-green-800 font-semibold">
                ✓ Files, SQL queries, and query results are not uploaded by the
                app
              </p>
              <p className="text-green-800 font-semibold">
                ✓ No cookies, no fingerprinting, and no tracking of file or
                query content
              </p>
              <p className="text-green-800 font-semibold text-sm mt-1">
                (Only privacy-friendly, aggregate analytics via Cloudflare Web
                Analytics and essential server logs)
              </p>
            </div>
          </section>

          {/* Website Hosting */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Website Hosting
            </h2>
            <p className="text-slate-700 mb-4">
              This website is hosted by Cloudflare. Requests from Europe are
              typically processed within Europe, unless your internet provider
              routes traffic outside of Europe.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <p className="text-slate-700 font-semibold mb-2">
                Hosting Provider:
              </p>
              <p className="text-slate-700">
                Cloudflare, Inc.
                <br />
                101 Townsend St
                <br />
                San Francisco, CA 94107
                <br />
                United States
              </p>
            </div>
            <p className="text-slate-700 mb-2">
              <strong>GDPR Compliance Information:</strong>
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
              <li>
                <a
                  href="https://www.cloudflare.com/gdpr/introduction/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Cloudflare GDPR Compliance
                </a>
              </li>
              <li>
                <a
                  href="https://www.cloudflare.com/cloudflare-customer-dpa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Data Processing Agreement
                </a>
              </li>
              <li>
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </section>

          {/* Cloudflare Web Analytics */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Cloudflare Web Analytics
            </h2>
            <p className="text-slate-700 mb-4">
              This website uses Cloudflare Web Analytics to collect usage
              metrics. Unlike many other analytics providers, Cloudflare follows
              a privacy-friendly model:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>
                <strong>No client-side information</strong> is used, such as
                data collected via cookies or localStorage
              </li>
              <li>
                <strong>No fingerprinting</strong> of individuals via their IP
                address, User Agent string, or other data for analytics purposes
              </li>
              <li>
                <strong>No visitor profiles</strong> are created and visitors are
                not retargeted with advertising
              </li>
            </ul>
            <p className="text-slate-700 mt-4">
              The analytics are non-invasive and respect the privacy of
              visitors.
            </p>
            <p className="text-slate-700 mt-4">
              More information:{" "}
              <a
                href="https://www.cloudflare.com/web-analytics/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                Cloudflare Web Analytics
              </a>
            </p>
          </section>

          {/* Technical Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Technical or Necessary Data
            </h2>
            <p className="text-slate-700 mb-4">
              When you use this website, the following necessary data is
              collected by our hosting provider:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>IP address used</li>
              <li>Webpage visited</li>
              <li>Browser used</li>
              <li>Operating system used</li>
              <li>Time of access</li>
              <li>Amount of data sent in bytes</li>
              <li>Source/referrer from which you accessed the page</li>
            </ul>
            <p className="text-slate-700 mt-4">
              This data is collected for technical reasons to ensure the website
              functions properly and is stored temporarily in server logs. This
              data is not combined with other data sources and is automatically
              deleted after a short period.
            </p>
          </section>

          {/* Local Data Storage */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Local Data Storage
            </h2>
            <p className="text-slate-700 mb-4">
              SQL for Files uses browser storage on your device to store:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
               <li>
                Imported file copies and persisted tables in IndexedDB
               </li>
              <li>
                Your SQL query history in IndexedDB
              </li>
              <li>
                Application preferences such as theme, layout, and editor tabs
                in localStorage
              </li>
            </ul>
            <p className="text-slate-700 mt-4">
              <strong>Important:</strong> This data stays in browser storage on
              your device and is not uploaded by the app. You can delete it at
              any time through your browser's site-data settings for
              sqlforfiles.app. This clears imported file copies, persisted
              tables, query history, and UI preferences stored in IndexedDB and
              localStorage.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies</h2>
            <p className="text-slate-700 mb-4">
              Currently, SQL for Files <strong>does not use any cookies</strong>
              . Local app data is stored in browser storage, including
              IndexedDB and localStorage.
            </p>
            <p className="text-slate-700">
              If we add cookies in the future (for example, for analytics or
              advertising), we will:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mt-2">
              <li>Update this privacy policy</li>
              <li>Display a cookie consent banner</li>
              <li>Allow you to opt-out of non-essential cookies</li>
              <li>Provide clear information about which cookies are used</li>
            </ul>
          </section>

          {/* External Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              External Links
            </h2>
            <p className="text-slate-700">
              This website may contain links to external websites. We have no
              control over the content or data protection practices of these
              third-party sites and assume no liability for them. Please refer
              to the privacy policies of those external websites.
            </p>
          </section>

          {/* Data Subject Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Your Rights (GDPR)
            </h2>
            <p className="text-slate-700 mb-4">
              Under the General Data Protection Regulation (GDPR), you have the
              following rights:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>
                <strong>Right to Access:</strong> You can request information
                about the personal data we process about you
              </li>
              <li>
                <strong>Right to Rectification:</strong> You can request
                correction of inaccurate data
              </li>
              <li>
                <strong>Right to Erasure:</strong> You can request deletion of
                your personal data
              </li>
              <li>
                <strong>Right to Data Portability:</strong> You can request your
                data in a machine-readable format
              </li>
              <li>
                <strong>Right to Object:</strong> You can object to the
                processing of your data
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> You can withdraw
                consent at any time
              </li>
            </ul>
            <p className="text-slate-700 mt-4">
              <strong>Note:</strong> Since all data processing happens locally
              in your browser, most of these rights can be exercised directly by
              you through your browser settings. We do not have access to your
              files or queries.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Data Security
            </h2>
            <p className="text-slate-700 mb-4">
              We take the protection of your data very seriously and implement
              appropriate technical and organizational measures to protect your
              data:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>
                Files, SQL queries, and query results are processed locally in
                your browser
              </li>
              <li>This website is served over HTTPS (encrypted connection)</li>
              <li>
                We do not collect or store your personal data on our servers
              </li>
              <li>
                Only privacy-friendly, aggregate analytics (Cloudflare Web
                Analytics) — no individual tracking
              </li>
            </ul>
            <p className="text-slate-700 mt-4">
              Please note that data transmission over the internet (e.g., via
              email) may have security vulnerabilities. Complete protection of
              data from access by third parties is not possible.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-slate-700">
              We reserve the right to update this privacy policy to reflect
              changes in our practices or legal requirements. We recommend
              checking this page periodically for any updates. The current
              version is always available at this URL.
            </p>
          </section>

          {/* Last Updated */}
          <section className="mb-4">
            <p className="text-slate-600 text-sm">
              <strong>Last Updated:</strong> January 9, 2026
            </p>
          </section>
          </div>
        </div>
      </div>
    </>
  );
}
