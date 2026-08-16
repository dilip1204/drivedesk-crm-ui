import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/img/bg_login.png";
import "./PublicPages.css";

const features = [
  { icon: "bi-people", title: "Student management", text: "Keep applications, plans, payments, training progress, and documents together." },
  { icon: "bi-calendar2-week", title: "Session scheduling", text: "Plan instructor availability, daily sessions, reschedules, and completion updates." },
  { icon: "bi-cash-stack", title: "Payments and expenses", text: "Track receipts, outstanding balances, income, and fleet expenses with clarity." },
  { icon: "bi-file-earmark-bar-graph", title: "Professional reports", text: "Generate branded receipts, progress reports, and operational summaries." },
  { icon: "bi-person-check", title: "Instructor workspace", text: "Manage instructor profiles, working hours, availability, and assigned students." },
  { icon: "bi-phone", title: "Works everywhere", text: "Use a responsive, installable experience across desktop, tablet, and mobile." },
];

const workflow = [
  ["01", "Capture enquiries", "Record prospects and follow-up details before they become students."],
  ["02", "Plan the training", "Assign instructors, choose a plan, and schedule sessions."],
  ["03", "Track every payment", "Record fees, print receipts, and follow outstanding balances."],
  ["04", "Complete and report", "Monitor progress and issue professional completion reports."],
];

function SectionHeading({ eyebrow, title, text, align = "center" }) {
  return (
    <div className={`public-section-heading is-${align}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function PublicCta({ title = "Ready to simplify your driving school?", text = "See how DriveDesk brings your daily operations into one clear workspace." }) {
  return (
    <section className="public-container public-cta">
      <div>
        <span>Move your school forward</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="public-cta-actions">
        <Link className="public-button is-light" to="/demo">View demo</Link>
        <Link className="public-button is-outline-light" to="/contact">Contact us</Link>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <section className="public-hero">
        <div className="public-container public-hero-grid">
          <div className="public-hero-copy">
            <span className="public-pill"><i className="bi bi-stars" /> Driving school management, simplified</span>
            <h1>Run your driving school from one clear dashboard.</h1>
            <p>DriveDesk helps teams manage students, instructors, sessions, fees, expenses, and reports without scattered registers or spreadsheets.</p>
            <div className="public-hero-actions">
              <Link className="public-button is-primary" to="/demo">Explore the demo <i className="bi bi-arrow-right" /></Link>
              <Link className="public-button is-secondary" to="/login">Customer sign in</Link>
            </div>
            <div className="public-trust-row">
              <span><i className="bi bi-check-circle-fill" /> Responsive</span>
              <span><i className="bi bi-check-circle-fill" /> Installable PWA</span>
              <span><i className="bi bi-check-circle-fill" /> Role based</span>
            </div>
          </div>

          <div className="public-hero-visual">
            <div className="public-hero-image-wrap">
              <img src={heroImage} alt="Driving instructor guiding a student in a simulator" />
              <div className="public-floating-card is-top">
                <span className="public-floating-icon is-success"><i className="bi bi-check2-circle" /></span>
                <div><strong>Training progress</strong><span>Sessions stay organised</span></div>
              </div>
              <div className="public-floating-card is-bottom">
                <span className="public-floating-icon"><i className="bi bi-receipt" /></span>
                <div><strong>Payment tracking</strong><span>Receipts and balances in one place</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section public-container">
        <SectionHeading eyebrow="Everything connected" title="The tools your team uses every day" text="A focused workspace designed around the real workflow of a driving school." />
        <div className="public-feature-grid">
          {features.map((feature) => (
            <article className="public-feature-card" key={feature.title}>
              <span><i className={`bi ${feature.icon}`} /></span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section public-section-muted">
        <div className="public-container">
          <SectionHeading eyebrow="A simple workflow" title="From first enquiry to completed training" text="Keep every handoff visible so students receive a consistent experience." />
          <div className="public-workflow-grid">
            {workflow.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span><h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PublicCta />
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <section className="public-page-hero">
        <div className="public-container">
          <span>About DriveDesk</span>
          <h1>Built around the way driving schools actually work.</h1>
          <p>DriveDesk replaces disconnected registers and repetitive administration with one organised, practical workspace.</p>
          <p className="public-ownership-statement">
            DriveDesk is a driving school management and CRM software product developed and operated by Asteriq Systech.
          </p>
        </div>
      </section>

      <section className="public-section public-container public-story-grid">
        <div>
          <SectionHeading eyebrow="Our purpose" title="Give every school a clearer day" text="Driving schools coordinate people, vehicles, schedules, fees, tests, and reports every day. DriveDesk keeps those moving parts visible and manageable." align="left" />
          <p className="public-story-copy">The product is designed to reduce repeated data entry, make follow-ups easier, and help owners understand what needs attention. It stays focused on useful workflows rather than unnecessary complexity.</p>
        </div>
        <div className="public-principles-card">
          <div><i className="bi bi-eye" /><span><strong>Clarity first</strong><small>Important information should be easy to find and understand.</small></span></div>
          <div><i className="bi bi-shield-check" /><span><strong>Dependable records</strong><small>Payments, sessions, and reports should remain consistent.</small></span></div>
          <div><i className="bi bi-phone" /><span><strong>Practical access</strong><small>The experience should work from the office or on the move.</small></span></div>
        </div>
      </section>

      <section className="public-section public-section-muted">
        <div className="public-container">
          <SectionHeading eyebrow="Designed for the whole team" title="One system, different responsibilities" />
          <div className="public-role-grid">
            <article><i className="bi bi-building" /><h3>School owners</h3><p>See registrations, collections, expenses, outstanding balances, and operational health.</p></article>
            <article><i className="bi bi-person-badge" /><h3>Administrators</h3><p>Manage enquiries, student records, payments, schedules, and printed documents.</p></article>
            <article><i className="bi bi-speedometer2" /><h3>Instructors</h3><p>Review assigned students, availability, daily sessions, and training completion.</p></article>
          </div>
        </div>
      </section>

      <PublicCta title="A calmer way to manage daily operations" />
    </>
  );
}

export function DemoPage() {
  return (
    <>
      <section className="public-page-hero">
        <div className="public-container">
          <span>Product demo</span>
          <h1>See how DriveDesk keeps the whole school in view.</h1>
          <p>Explore the core workflow, from new registrations and training sessions to payments and completion reports.</p>
        </div>
      </section>

      <section className="public-section public-container public-demo-grid">
        <div className="public-demo-copy">
          <SectionHeading eyebrow="Dashboard overview" title="Know what needs attention" text="The dashboard turns daily activity into clear, actionable information." align="left" />
          <ul className="public-check-list">
            <li><i className="bi bi-check2" /> New registrations and pending students</li>
            <li><i className="bi bi-check2" /> Completed and outstanding payments</li>
            <li><i className="bi bi-check2" /> Income, expenses, and net position</li>
            <li><i className="bi bi-check2" /> Quick links to the underlying records</li>
          </ul>
        </div>

        <div className="public-dashboard-mock" aria-label="DriveDesk dashboard preview">
          <div className="public-mock-toolbar"><span /><span>Dashboard</span><i className="bi bi-person-circle" /></div>
          <div className="public-mock-body">
            <div className="public-mock-heading"><div><strong>Monthly snapshot</strong><small>Business performance</small></div><span>August 2026</span></div>
            <div className="public-mock-kpis">
              <div><i className="bi bi-person-plus" /><span>New students</span><strong>68</strong></div>
              <div><i className="bi bi-check-circle" /><span>Completed</span><strong>42</strong></div>
              <div><i className="bi bi-wallet2" /><span>Collected</span><strong>₹1.56L</strong></div>
              <div><i className="bi bi-exclamation-circle" /><span>Outstanding</span><strong>₹7.27L</strong></div>
            </div>
            <div className="public-mock-lower"><div><strong>Operational health</strong><span><i style={{ width: "72%" }} /></span><small>72% collection progress</small></div><div><strong>Quick access</strong><button>Students</button><button>Sessions</button></div></div>
          </div>
        </div>
      </section>

      <section className="public-section public-section-muted">
        <div className="public-container">
          <SectionHeading eyebrow="What the demo covers" title="Follow a complete student journey" />
          <div className="public-demo-step-grid">
            {workflow.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
        </div>
      </section>

      <PublicCta title="Want to explore DriveDesk for your school?" text="Contact the DriveDesk team to discuss your workflow and access options." />
    </>
  );
}

export function ContactPage() {
  return (
    <>
      <section className="public-page-hero">
        <div className="public-container">
          <span>Contact Us</span>
          <h1>Let’s talk about your driving school workflow.</h1>
          <p>Choose the right next step for product questions, a guided demo, or help with an existing DriveDesk account.</p>
        </div>
      </section>

      <section className="public-section public-container">
        <div className="public-contact-grid">
          <article>
            <span><i className="bi bi-display" /></span>
            <h2>Request a product demo</h2>
            <p>Walk through students, schedules, fees, expenses, reports, and mobile access with the DriveDesk team.</p>
            <Link to="/demo">Preview the product <i className="bi bi-arrow-right" /></Link>
          </article>
          <article>
            <span><i className="bi bi-headset" /></span>
            <h2>Existing customer support</h2>
            <p>Sign in to your account and use your registered DriveDesk support channel for account-specific assistance.</p>
            <Link to="/login">Sign in to DriveDesk <i className="bi bi-arrow-right" /></Link>
          </article>
          <article>
            <span><i className="bi bi-chat-square-text" /></span>
            <h2>General enquiry</h2>
            <p>Prepare your school name, location, number of instructors, and preferred contact time for a faster response.</p>
            <Link to="/about">Learn about DriveDesk <i className="bi bi-arrow-right" /></Link>
          </article>
        </div>
      </section>

      <section className="public-section public-section-muted">
        <div className="public-container public-contact-note">
          <i className="bi bi-info-circle" />
          <div><h2>Before contacting support</h2><p>For account or login issues, keep your organisation name and registered administrator email ready. Never share your password or access token.</p></div>
        </div>
      </section>
    </>
  );
}
