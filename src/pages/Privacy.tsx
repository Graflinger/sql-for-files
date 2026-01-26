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
        description="Learn how SQL for Files protects your privacy with 100% local, in-browser data processing."
        canonicalPath="/privacy"
        ogType="article"
        imageAlt="SQL for Files privacy policy"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-8 md:p-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">
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
              data processing happens entirely in your browser - your files and
              queries never leave your device.
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
                ✓ Your data never touches our servers
              </p>
              <p className="text-green-800 font-semibold">
                ✓ No user tracking, behavioral analytics, or cookies
              </p>
              <p className="text-green-800 font-semibold text-sm mt-1">
                (Only essential server logs for website operation)
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
                Cloudflare Germany GmbH
                <br />
                Rosental 7, c/o Mindspace
                <br />
                80331 München, Germany
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
              Diese Website nutzt Cloudflare Web Analytics zur Erhebung von
              Nutzungskennzahlen. Im Gegensatz zu vielen anderen
              Analytics-Anbietern verfolgt Cloudflare ein datenschutzfreundliches
              Modell:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>
                Es werden <strong>keine clientseitigen Informationen</strong>{" "}
                verwendet, die etwa mithilfe von Cookies oder localStorage erfasst
                werden
              </li>
              <li>
                Es werden <strong>keine "Fingerabdrücke"</strong> von
                Einzelpersonen in Form ihrer IP-Adresse, User Agent Strings oder
                anderer Daten für Analysezwecke erstellt
              </li>
              <li>
                Es werden <strong>keine Besucherprofile</strong> erstellt und
                Besucher werden nicht mit Werbung erneut angesprochen
              </li>
            </ul>
            <p className="text-slate-700 mt-4">
              Die Analytics sind nicht invasiv und respektieren die Privatsphäre
              der Besucher.
            </p>
            <p className="text-slate-700 mt-4">
              Weitere Informationen:{" "}
              <a
                href="https://www.cloudflare.com/de-de/web-analytics/"
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
              SQL for Files uses your browser's IndexedDB to store:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Your uploaded files (stored locally on your device only)</li>
              <li>
                Your SQL query history (stored locally on your device only)
              </li>
              <li>
                Application preferences (stored locally on your device only)
              </li>
            </ul>
            <p className="text-slate-700 mt-4">
              <strong>Important:</strong> This data is stored entirely in your
              browser's local storage and never transmitted to any server. You
              can delete this data at any time by clearing your browser's
              storage or using your browser's developer tools.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies</h2>
            <p className="text-slate-700 mb-4">
              Currently, SQL for Files <strong>does not use any cookies</strong>
              . All data is stored in your browser's local IndexedDB storage.
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
              <li>All data processing occurs locally in your browser</li>
              <li>This website is served over HTTPS (encrypted connection)</li>
              <li>
                We do not collect or store your personal data on our servers
              </li>
              <li>No third-party analytics or tracking services are used</li>
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
