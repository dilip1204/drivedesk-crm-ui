import React from "react";
import { Link } from "react-router-dom";
import rainbowLogo from "../../assets/logo/rainbow-driving-school.png";
import surryaLogo from "../../assets/logo/surrya-driving-schools.png";
import sriRagavendraLogo from "../../assets/logo/srds-logo.png";
import dashboardPreview from "../../assets/img/marketing/dashboard-masked.png";
import enquiriesPreview from "../../assets/img/marketing/enquiries-masked.png";
import paymentDuesPreview from "../../assets/img/marketing/payment-dues-masked.png";
import trainingSessionsPreview from "../../assets/img/marketing/training-sessions-masked.png";
import {
  DRIVE_DESK_CONTACT_EMAIL,
  DRIVE_DESK_WHATSAPP_DISPLAY,
  DRIVE_DESK_WHATSAPP_URL,
} from "../../shared/constants/contactDetails";
import { formatLeadAttribution, trackLeadEvent } from "../../utils/leadTracking";
import "./PublicPages.css";

const features = [
  { icon: "bi-people", title: "Student management", text: "Keep applications, plans, payments, training progress, and documents together." },
  { icon: "bi-calendar2-week", title: "Session scheduling", text: "Plan instructor availability, daily sessions, reschedules, and completion updates." },
  { icon: "bi-cash-stack", title: "Payments and expenses", text: "Track receipts, outstanding balances, income, and fleet expenses with clarity." },
  { icon: "bi-file-earmark-bar-graph", title: "Professional reports", text: "Generate branded receipts, progress reports, and operational summaries." },
  { icon: "bi-person-check", title: "Instructor workspace", text: "Manage instructor profiles, working hours, availability, and assigned students." },
  { icon: "bi-phone", title: "Works everywhere", text: "Use a responsive, installable experience across desktop, tablet, and mobile." },
  { icon: "bi-whatsapp", title: "WhatsApp communication", text: "Use secure WhatsApp OTP login, start enquiry conversations, and send payment reminders from the relevant workflow." },
];

const workflow = [
  ["01", "Capture enquiries", "Record prospects and follow-up details before they become students."],
  ["02", "Plan the training", "Assign instructors, choose a plan, and schedule sessions."],
  ["03", "Track every payment", "Record fees, print receipts, and follow outstanding balances."],
  ["04", "Complete and report", "Monitor progress and issue professional completion reports."],
];

const clients = [
  { name: "Sri Ragavendra Heavy Driving School", mark: "ragavendra", logo: sriRagavendraLogo },
  { name: "Rainbow Driving School", mark: "rainbow", logo: rainbowLogo },
  { name: "Surrya Driving Schools", mark: "surrya", logo: surryaLogo },
];

const businessBenefits = [
  { icon: "bi-clock-history", title: "Spend less time on admin", text: "Keep student records, schedules, payments and documents together instead of updating separate registers." },
  { icon: "bi-wallet2", title: "Follow every pending fee", text: "See balances clearly, record collections and produce professional receipts for students." },
  { icon: "bi-bell", title: "Stay ahead of renewals", text: "Track licence and vehicle-document dates so your team knows what needs attention." },
  { icon: "bi-graph-up-arrow", title: "Make informed decisions", text: "Use operational and financial summaries to understand how the school is performing." },
];

const onboardingSteps = [
  ["01", "Tell us about your school", "We learn how you currently manage students, instructors, fees and training."],
  ["02", "See a tailored demo", "We demonstrate the DriveDesk workflows that are most relevant to your team."],
  ["03", "Choose the right setup", "Select an option based on your school size, users and operational requirements."],
];

const pricingPlans = [
  {
    name: "Starter",
    audience: "For independent and growing driving schools",
    price: "₹16,000",
    period: "/ year in India",
    note: "Start with a 60-day free trial",
    features: ["Student and enquiry management", "Instructor and training schedules", "Fee tracking and receipts", "Operational reports", "WhatsApp workflow tools", "Setup help and ongoing support"],
  },
  {
    name: "Growth",
    audience: "For established schools with larger teams",
    price: "Contact us",
    period: "Tailored to your school",
    note: "60-day trial available",
    featured: true,
    features: ["Everything in Starter", "More users and instructors", "Advanced financial visibility", "Renewal management", "Priority onboarding", "Priority product support"],
  },
  {
    name: "Business",
    audience: "For multi-branch and high-volume operations",
    price: "Contact us",
    period: "Custom business plan",
    note: "Guided evaluation included",
    features: ["Everything in Growth", "Multi-branch requirements", "Higher operational capacity", "Management-level reporting", "Tailored implementation", "Dedicated support coordination"],
  },
];

const productTour = [
  { eyebrow: "Lead management", title: "Turn enquiries into enrolled students", text: "Keep each prospect, contact detail, follow-up status, and next action visible so promising enquiries do not get lost.", image: enquiriesPreview, alt: "DriveDesk enquiries workspace with customer details masked", points: ["One enquiry pipeline", "Faster WhatsApp follow-up", "Clear status ownership"] },
  { eyebrow: "Training operations", title: "Keep instructors and sessions coordinated", text: "Plan the day from a shared schedule and see the students, instructors, vehicles, and session status in one operational view.", image: trainingSessionsPreview, alt: "DriveDesk training session schedule with customer details masked", points: ["Daily schedule visibility", "Instructor coordination", "Progress updates"] },
  { eyebrow: "Fee collection", title: "Follow every outstanding payment", text: "Give the team a clear list of pending balances, payment history, and direct reminder actions without checking separate books.", image: paymentDuesPreview, alt: "DriveDesk outstanding fees workspace with customer details masked", points: ["Outstanding balance view", "Payment history", "WhatsApp reminders"] },
];

const frequentlyAskedQuestions = [
  ["Is DriveDesk available outside India?", "Yes. DriveDesk is a web-based product available to driving schools worldwide, with remote demos, onboarding, and support. Regional pricing, currency, tax, and payment arrangements are confirmed with our team."],
  ["Does DriveDesk work on mobile?", "Yes. DriveDesk provides a responsive experience across supported desktop, tablet and mobile browsers."],
  ["Can we manage students and instructors separately?", "Yes. Student records, instructor profiles, availability and assigned training activity are managed through dedicated workflows."],
  ["Can DriveDesk track fees and pending balances?", "Yes. Teams can record payments, review outstanding balances and produce receipts and reports."],
  ["Does it support renewals and document dates?", "Yes. DriveDesk includes workflows for licence, vehicle-document and external-customer renewal tracking."],
  ["What WhatsApp features are included?", "DriveDesk supports secure WhatsApp OTP login, direct WhatsApp conversations from enquiries, and payment-reminder messages from outstanding-fee workflows. Availability can depend on the school’s configured plan."],
  ["How is pricing decided?", "Plans are discussed based on school size and required capabilities. Contact us for a suitable option and a tailored demonstration."],
  ["How do we get started?", "Book a free demo and tell us about your current workflow. We will show the relevant features and discuss an appropriate setup."],
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
            <span className="public-pill"><i className="bi bi-globe2" /> Driving school software with worldwide support</span>
            <h1>Run your entire driving school from one simple system.</h1>
            <p>Turn enquiries into students, coordinate instructors and training, collect fees, follow renewals, and understand your business without scattered registers or spreadsheets.</p>
            <div className="public-hero-offer">
              <span><i className="bi bi-gift" /> 60-day free trial</span>
              <span><i className="bi bi-tag" /> From ₹16,000/year in India</span>
              <span><i className="bi bi-headset" /> Worldwide onboarding and support</span>
            </div>
            <div className="public-hero-actions">
              <Link className="public-button is-primary" to="/contact?plan=starter" onClick={() => trackLeadEvent("trial_cta_click", { placement: "home_hero", plan: "Starter" })}>Start your 60-day free trial <i className="bi bi-arrow-right" /></Link>
              <Link className="public-button is-secondary" to="/demo" onClick={() => trackLeadEvent("demo_cta_click", { placement: "home_hero" })}><i className="bi bi-play-circle" /> View product demo</Link>
            </div>
            <div className="public-trust-row">
              <span><i className="bi bi-check-circle-fill" /> No payment to start</span>
              <span><i className="bi bi-check-circle-fill" /> Guided setup</span>
              <span><i className="bi bi-check-circle-fill" /> Mobile and desktop</span>
            </div>
          </div>

          <div className="public-hero-visual">
            <div className="public-hero-image-wrap">
              <div className="public-hero-product-bar"><span /><small>DriveDesk business dashboard</small><i className="bi bi-shield-check" /></div>
              <img src={dashboardPreview} alt="DriveDesk driving school business dashboard with customer details masked" />
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

      <section className="public-clients" aria-labelledby="public-clients-title">
        <div className="public-container">
          <div className="public-clients-heading">
            <span>Trusted by driving schools</span>
            <h2 id="public-clients-title">Helping our clients run smoother every day</h2>
          </div>
          <div className="public-client-grid">
            {clients.map((client) => (
              <article className="public-client-card" key={client.name}>
                <div className={`public-client-logo is-${client.mark}`} aria-hidden="true">
                  {client.logo ? (
                    <img src={client.logo} alt="" />
                  ) : (
                    <span>{client.initials}</span>
                  )}
                </div>
                <strong>{client.name}</strong>
                <small>DriveDesk client</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-global-strip">
        <div className="public-container">
          <i className="bi bi-globe2" aria-hidden="true" />
          <div><strong>Built for driving schools worldwide</strong><span>Remote demos, guided onboarding, and ongoing support wherever your school operates.</span></div>
          <Link to="/contact" onClick={() => trackLeadEvent("demo_cta_click", { placement: "global_strip" })}>Talk to our team <i className="bi bi-arrow-right" /></Link>
        </div>
      </section>

      <section className="public-section public-container">
        <SectionHeading eyebrow="Everything connected" title="The tools your team uses every day" text="A focused workspace designed around the real workflow of a driving school." />
        <div className="public-feature-grid">
          {features.map((feature) => (
            <article className={`public-feature-card${feature.icon === "bi-whatsapp" ? " is-whatsapp" : ""}`} key={feature.title}>
              <span><i className={`bi ${feature.icon}`} /></span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section public-whatsapp-product-section">
        <div className="public-container public-whatsapp-product-grid">
          <div className="public-whatsapp-product-copy">
            <span className="public-whatsapp-badge"><i className="bi bi-whatsapp" /> WhatsApp integration</span>
            <h2>Keep important customer conversations close to the work.</h2>
            <p>DriveDesk connects everyday school workflows with WhatsApp, helping your team sign in securely and follow up with customers from the records already on screen.</p>
            <Link className="public-button is-whatsapp" to="/contact" onClick={() => trackLeadEvent("demo_cta_click", { placement: "whatsapp_feature" })}>See WhatsApp features in a demo <i className="bi bi-arrow-right" /></Link>
          </div>
          <div className="public-whatsapp-capabilities">
            <article><i className="bi bi-shield-lock" /><div><h3>Secure WhatsApp OTP</h3><p>Registered users can receive an OTP on WhatsApp for secure account access.</p></div></article>
            <article><i className="bi bi-chat-dots" /><div><h3>Enquiry conversations</h3><p>Open a WhatsApp conversation directly from an enquiry record for faster follow-up.</p></div></article>
            <article><i className="bi bi-receipt" /><div><h3>Payment reminders</h3><p>Contact students about pending balances from the outstanding-fees workflow.</p></div></article>
          </div>
        </div>
      </section>

      <section className="public-section public-business-section">
        <div className="public-container">
          <SectionHeading eyebrow="Built for better operations" title="Turn daily administration into a clear business process" text="DriveDesk helps owners and teams spend less time finding information and more time serving students." />
          <div className="public-benefit-grid">
            {businessBenefits.map((benefit) => (
              <article key={benefit.title}>
                <i className={`bi ${benefit.icon}`} aria-hidden="true" />
                <div><h3>{benefit.title}</h3><p>{benefit.text}</p></div>
              </article>
            ))}
          </div>
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

      <section className="public-section public-container public-onboarding-section">
        <div className="public-onboarding-copy">
          <SectionHeading eyebrow="Simple onboarding" title="A practical way to get started" text="No complicated buying process. Start with a conversation and see whether DriveDesk fits your school." align="left" />
          <div className="public-onboarding-actions">
            <Link className="public-button is-primary" to="/contact">Book a free demo <i className="bi bi-arrow-right" /></Link>
            <a className="public-button is-secondary" href={`${DRIVE_DESK_WHATSAPP_URL}?text=${encodeURIComponent("Hello DriveDesk, I would like to discuss a plan for my driving school.")}`} target="_blank" rel="noopener noreferrer"><i className="bi bi-whatsapp" /> Ask about plans</a>
          </div>
        </div>
        <div className="public-onboarding-card">
          {onboardingSteps.map(([number, title, text]) => (
            <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>
          ))}
          <div className="public-plan-note"><i className="bi bi-building-check" /><span><strong>Flexible plans</strong><small>Pricing is based on school size and required capabilities. Contact us for a suitable option.</small></span></div>
        </div>
      </section>

      <section className="public-section public-pricing-section" id="pricing">
        <div className="public-container">
          <SectionHeading eyebrow="Simple pricing guidance" title="Choose a plan that fits your school" text="Try DriveDesk for 60 days before committing. We will help you choose the right setup for your team and workflow." />
          <div className="public-pricing-grid">
            {pricingPlans.map((plan) => (
              <article className={`public-pricing-card${plan.featured ? " is-featured" : ""}`} key={plan.name}>
                {plan.featured && <span className="public-pricing-popular">Recommended</span>}
                <div className="public-pricing-head">
                  <h3>{plan.name}</h3><p>{plan.audience}</p>
                  <strong>{plan.price}</strong><small>{plan.period}</small>
                </div>
                <div className="public-trial-note"><i className="bi bi-gift" /><span>{plan.note}</span></div>
                <ul>{plan.features.map((feature) => <li key={feature}><i className="bi bi-check-circle-fill" />{feature}</li>)}</ul>
                <Link className={`public-button ${plan.featured ? "is-primary" : "is-secondary"}`} to={`/contact?plan=${plan.name.toLowerCase()}`} onClick={() => trackLeadEvent("pricing_cta_click", { plan: plan.name })}>{plan.name === "Starter" ? "Start your free trial" : "Discuss this plan"} <i className="bi bi-arrow-right" /></Link>
              </article>
            ))}
          </div>
          <p className="public-pricing-footnote">₹16,000/year is the India Starter price. International pricing is quoted in an appropriate supported currency. All plans include onboarding assistance, product updates, and support; final scope may vary by users, branches, region, taxes, and required capabilities.</p>
        </div>
      </section>

      <section className="public-section public-section-muted public-comparison-section">
        <div className="public-container">
          <SectionHeading eyebrow="A clearer way to work" title="Move beyond scattered registers and spreadsheets" text="Bring the information your team uses every day into one connected workflow." />
          <div className="public-comparison-table" role="table" aria-label="Manual administration compared with DriveDesk">
            <div className="public-comparison-head" role="row"><strong role="columnheader">Manual administration</strong><strong role="columnheader">With DriveDesk</strong></div>
            {[
              ["Records kept in different places", "Students, instructors and activity in one workspace"],
              ["Balances checked manually", "Pending fees and payment history remain visible"],
              ["Important dates depend on reminders", "Renewal and document dates can be tracked"],
              ["Reports assembled by hand", "Branded operational and financial reports"],
            ].map(([before, after]) => <div className="public-comparison-row" role="row" key={before}><span role="cell"><i className="bi bi-dash-circle" />{before}</span><span role="cell"><i className="bi bi-check-circle-fill" />{after}</span></div>)}
          </div>
        </div>
      </section>

      <section className="public-section public-container public-faq-section">
        <SectionHeading eyebrow="Frequently asked questions" title="What driving schools ask before a demo" />
        <div className="public-faq-list">
          {frequentlyAskedQuestions.map(([question, answer], index) => (
            <details key={question} open={index === 0}><summary>{question}<i className="bi bi-plus-lg" /></summary><p>{answer}</p></details>
          ))}
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
          <h1>See the work that matters, all in one place.</h1>
          <p>Explore how DriveDesk helps a driving school capture leads, coordinate training, collect fees, and understand daily performance.</p>
          <div className="public-page-hero-actions">
            <Link className="public-button is-primary" to="/contact" onClick={() => trackLeadEvent("demo_cta_click", { placement: "demo_hero" })}>Book your free demo <i className="bi bi-arrow-right" /></Link>
            <a className="public-button is-secondary" href={`${DRIVE_DESK_WHATSAPP_URL}?text=${encodeURIComponent("Hello DriveDesk, I would like a product demo for my driving school.")}`} target="_blank" rel="noopener noreferrer" onClick={() => trackLeadEvent("whatsapp_click", { placement: "demo_hero" })}><i className="bi bi-whatsapp" /> Ask on WhatsApp</a>
          </div>
        </div>
      </section>

      <section className="public-section public-container public-demo-grid">
        <div className="public-demo-copy">
          <SectionHeading eyebrow="Dashboard overview" title="Know what needs attention" text="The dashboard turns daily activity into clear, actionable information." align="left" />
          <ul className="public-check-list">
            <li><i className="bi bi-check2" /> New registrations and pending students</li>
            <li><i className="bi bi-check2" /> Completed and outstanding payments</li>
            <li><i className="bi bi-check2" /> Income, expenses, and net position</li>
            <li><i className="bi bi-check2" /> WhatsApp OTP, enquiry follow-up, and payment reminders</li>
            <li><i className="bi bi-check2" /> Quick links to the underlying records</li>
          </ul>
        </div>

        <div className="public-product-window">
          <div className="public-product-window-bar"><span /><small>DriveDesk dashboard</small><i className="bi bi-shield-check" /></div>
          <img src={dashboardPreview} alt="DriveDesk business dashboard with customer details masked" />
        </div>
      </section>

      <section className="public-section public-section-muted public-tour-section">
        <div className="public-container">
          <SectionHeading eyebrow="Inside DriveDesk" title="A practical workflow your team can use every day" text="Real product views, with customer information masked for privacy." />
          <div className="public-tour-list">
            {productTour.map((item, index) => (
              <article className={`public-tour-item${index % 2 ? " is-reversed" : ""}`} key={item.title}>
                <div className="public-tour-image"><img src={item.image} alt={item.alt} loading="lazy" /></div>
                <div className="public-tour-copy">
                  <span>{item.eyebrow}</span><h2>{item.title}</h2><p>{item.text}</p>
                  <ul>{item.points.map((point) => <li key={point}><i className="bi bi-check-circle-fill" /> {point}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
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
  const requestedPlan = new URLSearchParams(window.location.search).get("plan") || "";

  const handleDemoRequest = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "Hello DriveDesk, I would like to book a free demo.",
      `Name: ${data.get("name")}`,
      `Driving school: ${data.get("school")}`,
      `Phone: ${data.get("phone")}`,
      `Location: ${data.get("location") || "Not provided"}`,
      `Instructors: ${data.get("instructors") || "Not provided"}`,
      `Plan interest: ${data.get("plan") || "Not decided"}`,
      "",
      ...formatLeadAttribution(),
    ].join("\n");

    trackLeadEvent("demo_form_submit", { placement: "contact_page" });
    window.open(`${DRIVE_DESK_WHATSAPP_URL}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <section className="public-page-hero">
        <div className="public-container">
          <span>Contact Us</span>
          <h1>Let’s talk about your driving school workflow.</h1>
          <p>Choose the right next step for product questions, a guided demo, or help with an existing DriveDesk account.</p>
        </div>
      </section>

      <section className="public-section public-container public-lead-section">
        <div className="public-lead-copy">
          <SectionHeading
            eyebrow="Free product demo"
            title="See DriveDesk with your school’s workflow"
            text="Share a few details and continue on WhatsApp. Our team can then arrange a suitable demonstration time."
            align="left"
          />
          <div className="public-direct-contact">
            <a href={`${DRIVE_DESK_WHATSAPP_URL}?text=${encodeURIComponent("Hello DriveDesk, I would like to book a demo.")}`} target="_blank" rel="noopener noreferrer">
              <i className="bi bi-whatsapp" /><span><small>WhatsApp</small><strong>{DRIVE_DESK_WHATSAPP_DISPLAY}</strong></span>
            </a>
            <a href={`mailto:${DRIVE_DESK_CONTACT_EMAIL}`}>
              <i className="bi bi-envelope" /><span><small>Email</small><strong>{DRIVE_DESK_CONTACT_EMAIL}</strong></span>
            </a>
          </div>
        </div>

        <form className="public-lead-form" onSubmit={handleDemoRequest}>
          <div className="public-form-field"><label htmlFor="demo-name">Your name</label><input id="demo-name" name="name" type="text" autoComplete="name" required /></div>
          <div className="public-form-field"><label htmlFor="demo-school">Driving school name</label><input id="demo-school" name="school" type="text" autoComplete="organization" required /></div>
          <div className="public-form-field"><label htmlFor="demo-phone">Phone / WhatsApp</label><input id="demo-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required /></div>
          <div className="public-form-field"><label htmlFor="demo-location">Country and city</label><input id="demo-location" name="location" type="text" autoComplete="address-level2" placeholder="e.g. Sri Lanka, Colombo" /></div>
          <div className="public-form-field"><label htmlFor="demo-instructors">Number of instructors</label><select id="demo-instructors" name="instructors" defaultValue=""><option value="">Select school size</option><option value="1–3">1–3 instructors</option><option value="4–10">4–10 instructors</option><option value="11+">11+ instructors</option></select></div>
          <div className="public-form-field"><label htmlFor="demo-plan">Plan interest</label><select id="demo-plan" name="plan" defaultValue={requestedPlan}><option value="">Help me choose</option><option value="starter">Starter — ₹16,000/year in India</option><option value="growth">Growth</option><option value="business">Business</option></select></div>
          <button type="submit" className="public-button is-whatsapp"><i className="bi bi-whatsapp" /> Continue on WhatsApp</button>
          <p>Submitting opens WhatsApp with your details. Nothing is sent until you choose to send the message.</p>
        </form>
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
