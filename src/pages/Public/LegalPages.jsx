import React from "react";
import { Link } from "react-router-dom";
import { DRIVE_DESK_CONTACT_EMAIL } from "../../shared/constants/contactDetails";
import "./PublicPages.css";

const EFFECTIVE_DATE = "11 September 2026";

function LegalPage({ eyebrow, title, summary, children }) {
  return (
    <>
      <section className="public-page-hero public-legal-hero">
        <div className="public-container">
          <span>{eyebrow}</span><h1>{title}</h1><p>{summary}</p>
          <small>Effective date: {EFFECTIVE_DATE}</small>
        </div>
      </section>
      <section className="public-section public-container public-legal-layout">
        <aside aria-label="Legal pages">
          <strong>Legal information</strong>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/cancellation-refund-policy">Cancellation &amp; Refund Policy</Link>
        </aside>
        <article className="public-legal-content">{children}</article>
      </section>
    </>
  );
}

export function PrivacyPolicyPage() {
  return (
    <LegalPage eyebrow="Your information" title="Privacy Policy" summary="This policy explains how DriveDesk collects, uses, stores, and protects information when you visit our website or use our services.">
      <h2>1. Who we are</h2>
      <p>DriveDesk is a driving school management and CRM software product developed and operated by Asteriq Systech. In this policy, “DriveDesk”, “we”, “us”, and “our” refer to Asteriq Systech in connection with the DriveDesk service.</p>

      <h2>2. Information we collect</h2>
      <p>We may collect account and contact information such as names, email addresses, phone numbers, organisation details, roles, and login information. When a driving school uses DriveDesk, the service may also process student, instructor, enquiry, scheduling, payment-record, vehicle, document, and operational information entered by authorised users.</p>
      <p>We may automatically receive technical information such as IP address, browser and device details, pages visited, referral source, campaign parameters, diagnostic information, and usage events. We do not ask users to provide account passwords through support or marketing forms.</p>

      <h2>3. How we use information</h2>
      <ul><li>Provide, maintain, secure, and improve DriveDesk.</li><li>Create and administer accounts and subscriptions.</li><li>Respond to demo requests, support enquiries, and service communications.</li><li>Process records and instructions submitted by authorised customers.</li><li>Detect misuse, troubleshoot issues, and meet legal obligations.</li><li>Measure website and campaign performance where permitted.</li></ul>

      <h2>4. Driving schools and their data</h2>
      <p>A driving school generally controls the personal information it enters into DriveDesk, while we process that information to provide the service. Questions from students or instructors about records held by a school should normally be directed to that school. We assist customers with appropriate requests where required.</p>

      <h2>5. Sharing and service providers</h2>
      <p>We may use carefully selected hosting, infrastructure, communications, analytics, payment, and support providers to operate DriveDesk. Information may also be disclosed when required by law, to protect rights and security, during a business reorganisation, or with your instruction or consent. We do not sell personal information.</p>

      <h2>6. International use and transfers</h2>
      <p>DriveDesk can be accessed internationally. Information may be processed in India or in other locations used by our service providers. Where required, we use reasonable contractual and organisational safeguards for cross-border processing.</p>

      <h2>7. Retention and security</h2>
      <p>We retain information for as long as reasonably necessary to provide the service, satisfy contractual and legal requirements, resolve disputes, and protect the service. Retention can vary by record type and customer instruction. We use reasonable technical and organisational safeguards, but no internet service can guarantee absolute security.</p>

      <h2>8. Cookies and local storage</h2>
      <p>DriveDesk may use cookies, browser storage, and similar technologies for authentication, preferences, security, lead attribution, and analytics. Browser controls can restrict these technologies, although parts of the service may then work incorrectly.</p>

      <h2>9. Your choices and rights</h2>
      <p>Depending on applicable law, you may have rights to request access, correction, deletion, restriction, portability, or objection. You may also withdraw consent where processing relies on consent. We may need to verify your identity and may retain information where legally permitted or required.</p>

      <h2>10. Children</h2>
      <p>DriveDesk is provided to driving schools and authorised business users. Schools are responsible for having an appropriate legal basis and any required parent or guardian authorisation when entering information relating to minors.</p>

      <h2>11. Updates and contact</h2>
      <p>We may update this policy as the service or legal requirements change. Material changes will be reflected by a revised effective date or another appropriate notice. For privacy questions or requests, email <a href={`mailto:${DRIVE_DESK_CONTACT_EMAIL}`}>{DRIVE_DESK_CONTACT_EMAIL}</a>.</p>
    </LegalPage>
  );
}

export function TermsPage() {
  return (
    <LegalPage eyebrow="Using DriveDesk" title="Terms & Conditions" summary="These terms govern access to the DriveDesk website, trials, subscriptions, and driving school management service.">
      <h2>1. Agreement</h2>
      <p>By accessing or using DriveDesk, you agree to these terms and any order, proposal, or plan details accepted by you. If you use DriveDesk for an organisation, you confirm that you are authorised to accept these terms for that organisation.</p>

      <h2>2. Service and eligibility</h2>
      <p>DriveDesk provides web-based tools for driving school administration, including enquiries, students, instructors, schedules, payments, renewals, communications, and reports. Features may vary by plan, region, configuration, and product development. You must provide accurate registration information and be legally capable of entering an agreement.</p>

      <h2>3. Trials and subscriptions</h2>
      <p>Eligible customers may receive a 60-day free trial. Trial scope, start date, and conversion to a paid subscription will be confirmed during onboarding. Paid plans are generally supplied for the agreed subscription period. India Starter pricing may begin at ₹16,000 per year; taxes, regional pricing, users, branches, integrations, and additional services may change the final quotation.</p>

      <h2>4. Accounts and authorised users</h2>
      <p>You are responsible for authorised users, account credentials, access permissions, and activity under your organisation. Keep credentials confidential, promptly remove access that is no longer required, and notify us of suspected unauthorised use.</p>

      <h2>5. Customer responsibilities</h2>
      <ul><li>Use DriveDesk lawfully and only for legitimate business purposes.</li><li>Maintain accurate records and appropriate backups or exports needed by your organisation.</li><li>Obtain required notices, permissions, and lawful bases for personal information entered into the service.</li><li>Do not probe, disrupt, reverse engineer, resell, or misuse the service.</li><li>Do not upload unlawful, harmful, infringing, or malicious content.</li></ul>

      <h2>6. Customer data</h2>
      <p>You retain your rights in data submitted to DriveDesk. You grant us the limited rights necessary to host, process, transmit, back up, and display that data to provide and secure the service. You are responsible for the legality, accuracy, and quality of submitted data.</p>

      <h2>7. Third-party services</h2>
      <p>Features may connect with third-party services such as WhatsApp, hosting, communications, or payment providers. Their availability and terms are controlled by those providers. We are not responsible for a third-party service outside our control.</p>

      <h2>8. Intellectual property</h2>
      <p>DriveDesk, its software, branding, design, documentation, and related materials are owned by Asteriq Systech or its licensors. These terms provide a limited, non-exclusive, non-transferable right to use the service during an authorised trial or subscription; they do not transfer ownership.</p>

      <h2>9. Availability and changes</h2>
      <p>We work to provide a dependable service, but maintenance, security events, internet failures, third-party outages, or other circumstances may affect availability. We may improve, replace, or discontinue features while taking reasonable account of active customer commitments.</p>

      <h2>10. Suspension and termination</h2>
      <p>We may restrict or suspend access where reasonably necessary for security, non-payment, unlawful use, material breach, or protection of users and the service. Either party may end the relationship as provided in the applicable order or our Cancellation &amp; Refund Policy.</p>

      <h2>11. Disclaimers and liability</h2>
      <p>DriveDesk is an administration tool and does not provide legal, regulatory, accounting, tax, or driving-instruction advice. To the extent permitted by law, the service is provided without implied warranties not expressly agreed in writing. Neither party will be liable for indirect or consequential loss where exclusion is legally permitted. Any liability that cannot be excluded remains subject to applicable law and the agreed commercial terms.</p>

      <h2>12. Governing terms and contact</h2>
      <p>These terms are governed by the laws of India, without limiting mandatory protections that apply in a customer’s jurisdiction. The parties should first attempt to resolve disputes in good faith. For questions, contact <a href={`mailto:${DRIVE_DESK_CONTACT_EMAIL}`}>{DRIVE_DESK_CONTACT_EMAIL}</a>.</p>
    </LegalPage>
  );
}

export function CancellationRefundPolicyPage() {
  return (
    <LegalPage eyebrow="Subscriptions" title="Cancellation & Refund Policy" summary="This policy explains how trial cancellation, paid subscription cancellation, and refund requests are handled.">
      <h2>1. Free trial</h2>
      <p>Eligible customers can evaluate DriveDesk during a 60-day free trial. No subscription fee is charged for the trial unless a paid arrangement is separately accepted. You may stop using the trial at any time by contacting us. Trial access may end automatically when the trial period expires.</p>

      <h2>2. Cancelling a paid subscription</h2>
      <p>You may request cancellation by emailing us from an authorised administrator account. Include the organisation name, registered contact details, and requested cancellation date. Unless a signed order states otherwise, cancellation prevents a future renewal but does not normally shorten or refund the current paid subscription period.</p>

      <h2>3. Refund eligibility</h2>
      <p>Subscription payments are generally non-refundable once a paid service period has started, because access, setup, support, and infrastructure are made available for that period. We will review refund requests involving duplicate payments, incorrect charges, failure to activate a purchased service, or situations where a refund is required by applicable law. Customisation, migration, training, and other completed service fees are non-refundable unless otherwise agreed in writing.</p>

      <h2>4. How to request a refund</h2>
      <p>Email <a href={`mailto:${DRIVE_DESK_CONTACT_EMAIL}`}>{DRIVE_DESK_CONTACT_EMAIL}</a> with the account name, invoice or payment reference, payment date, amount, and reason for the request. Do not send card details, passwords, or access tokens. We may request reasonable information to verify the payment and requester’s authority.</p>

      <h2>5. Review and payment</h2>
      <p>We aim to acknowledge requests within five business days. Approved refunds are returned using the original payment method where practical. Bank, card-network, currency-conversion, and payment-provider processing times are outside our control.</p>

      <h2>6. Data after cancellation</h2>
      <p>Before access ends, customers should export records they are required to keep. Following cancellation or expiry, access may be disabled and data may later be deleted according to our retention practices, contractual commitments, and legal obligations. Contact us before expiry if you need reasonable assistance with an available export.</p>

      <h2>7. Changes and statutory rights</h2>
      <p>We may update this policy for future purchases. Changes do not remove non-waivable consumer or statutory rights. If an accepted order contains different cancellation or refund terms, that order controls to the extent of the difference.</p>
    </LegalPage>
  );
}
