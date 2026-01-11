/**
 * Legal Notice / Impressum Page
 *
 * Legal notice compliant with German §5 TMG requirements
 */
export default function Legal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">
            Legal Notice
          </h1>

          {/* Information according to §5 TMG */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Information according to § 5 DDG
            </h2>
            <div className="bg-slate-50 p-6 rounded-lg">
              <p className="text-slate-700 mb-1">
                <strong>Name:</strong> sqlforfiles - Stefan Graf
              </p>
              <p className="text-slate-700 mb-1">
                <strong>Address:</strong>
              </p>
              <p className="text-slate-700 ml-4">
                c/o Online-Impressum.de #20871
                <br />
                Europaring 90
                <br />
                53757 Sankt Augustin
                <br />
                Germany
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact</h2>
            <div className="bg-slate-50 p-6 rounded-lg">
              <p className="text-slate-700">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:info@sqlforfiles.app"
                  className="text-blue-600 hover:text-blue-700"
                >
                  info@sqlforfiles.app
                </a>
              </p>
            </div>
          </section>

          {/* Responsible for content */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Responsible for content according to § 55 Abs. 2 RStV
            </h2>
            <div className="bg-slate-50 p-6 rounded-lg">
              <p className="text-slate-700">
                Stefan Graf
                <br />
                c/o Online-Impressum.de #20871
                <br />
                Europaring 90
                <br />
                53757 Sankt Augustin
                <br />
                Germany
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Disclaimer
            </h2>

            {/* Limitation of Liability */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Limitation of Liability
              </h3>
              <p className="text-slate-700 mb-3">
                SQL for Files is provided as a free tool "as is" without any
                warranties. While we strive to ensure the tool functions
                correctly, we cannot guarantee:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-3">
                <li>Accuracy of query results</li>
                <li>Data integrity or prevention of data loss</li>
                <li>Compatibility with all file formats or browsers</li>
                <li>Uninterrupted or error-free operation</li>
              </ul>
              <p className="text-slate-700">
                Users are responsible for backing up their own data. We are not
                liable for any data loss, business interruption, or other
                damages arising from the use of this tool.
              </p>
            </div>
          </section>

          {/* Liability for Links */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Liability for Links
            </h3>
            <p className="text-slate-700 mb-3">
              Our website contains links to external third-party websites over
              whose content we have no control. Therefore, we cannot assume any
              liability for this external content. The respective provider or
              operator of the pages is always responsible for the content of the
              linked pages.
            </p>
            <p className="text-slate-700">
              The linked pages were checked for possible legal violations at the
              time of linking. Illegal content was not recognizable at the time
              of linking. However, permanent monitoring of the content of the
              linked pages is not reasonable without concrete evidence of a
              legal violation. Upon becoming aware of legal violations, we will
              remove such links immediately.
            </p>
          </div>

          {/* Copyright */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Copyright
            </h3>
            <p className="text-slate-700 mb-3">
              The content and works created by the site operators on these pages
              are subject to German copyright law. The reproduction, editing,
              distribution, and any kind of exploitation outside the limits of
              copyright law require the written consent of the respective author
              or creator.
            </p>
            <p className="text-slate-700">
              Downloads and copies of this site are only permitted for private,
              non-commercial use. Insofar as the content on this site was not
              created by the operator, the copyrights of third parties are
              respected. In particular, third-party content is marked as such.
              Should you nevertheless become aware of a copyright infringement,
              please inform us accordingly. Upon becoming aware of legal
              violations, we will remove such content immediately.
            </p>
          </div>

          {/* Data Protection */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Data Protection
            </h3>
            <p className="text-slate-700 mb-3">
              The use of our website is generally possible without providing
              personal data. As far as personal data (such as name, address, or
              email addresses) is collected on our pages, this is done on a
              voluntary basis as far as possible. This data will not be passed
              on to third parties without your express consent.
            </p>
            <p className="text-slate-700 mb-3">
              We would like to point out that data transmission over the
              Internet (e.g., communication by email) can have security gaps.
              Complete protection of data from access by third parties is not
              possible.
            </p>
            <p className="text-slate-700">
              The use of contact data published as part of our imprint
              obligation by third parties for sending unsolicited advertising
              and information materials is hereby expressly prohibited. The
              operators of these pages expressly reserve the right to take legal
              action in the event of the unsolicited sending of advertising
              information, such as spam emails.
            </p>
          </div>

          {/* Open Source */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Open Source
            </h2>
            <p className="text-slate-700 mb-3">
              SQL for Files is built using open-source technologies, including:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>
                <a
                  href="https://duckdb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  DuckDB WASM
                </a>{" "}
                - High-performance analytical database
              </li>
              <li>
                <a
                  href="https://reactjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  React
                </a>{" "}
                - UI framework
              </li>
              <li>
                <a
                  href="https://microsoft.github.io/monaco-editor/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Monaco Editor
                </a>{" "}
                - Code editor
              </li>
            </ul>
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
  );
}
