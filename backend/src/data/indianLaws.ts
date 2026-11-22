export interface LawReference {
  code: string;
  title: string;
  summary: string;
}

export const CONSTITUTION_ARTICLES: Record<string, LawReference> = {
  ART_21: {
    code: 'Article 21, Constitution of India',
    title: 'Right to Life & Personal Dignity',
    summary: 'Protects every citizen from physical assault, unlawful intimidation, and violation of human dignity.',
  },
  ART_14: {
    code: 'Article 14, Constitution of India',
    title: 'Equality Before Law',
    summary: 'No person—neither a teacher, landlord, employer, nor officer—is above the law.',
  },
  ART_39A: {
    code: 'Article 39A, Constitution of India',
    title: 'Equal Justice & Free Legal Aid',
    summary: 'Guarantees free legal aid through NALSA/DLSA so money never blocks justice.',
  },
};

export interface IncidentPlaybook {
  id: string;
  category: 'Theft & Cyber' | 'Criminal' | 'Marital' | 'Property' | 'Consumer' | 'Labour' | 'Financial';
  keywords: RegExp;
  wrongedAssurance: string;
  lawsViolated: LawReference[];
  sequentialAdvice: {
    first: string;
    then: string;
    finally: string;
  };
  portals: {
    name: string;
    url: string;
    helpline?: string;
    purpose: string;
    hoverSteps: string[];
  }[];
  needsProfessionalHelpHint: string;
}

export const INDIAN_LAW_PLAYBOOKS: IncidentPlaybook[] = [
  {
    id: 'assault_extortion',
    category: 'Criminal',
    keywords: /\b(beat|beaten|slapped|hit|teacher|extort|extorted|blackmail|threaten|grudge|windshield|forced to pay|money taken)\b/i,
    wrongedAssurance:
      'Better Call Jolly! Hey, call karu baccha??? Listen to me carefully: YES, you were 100% wronged! Accidentally breaking a windshield is a minor civil/insurance issue—nobody on earth gets a license to beat you or extort ₹8,000 out of you because of a personal grudge.',
    lawsViolated: [
      {
        code: 'Section 115(2) BNS (old IPC 323)',
        title: 'Voluntarily Causing Hurt',
        summary: 'Beating or physically assaulting someone is a punishable criminal offence.',
      },
      {
        code: 'Section 308 BNS (old IPC 384)',
        title: 'Extortion',
        summary: 'Putting someone in fear of injury/trouble to force them to hand over money (like ₹8,000) is straight-up extortion.',
      },
      {
        code: 'Section 17 RTE Act & Sec 75 JJ Act (if student/minor)',
        title: 'Prohibition of Corporal Punishment',
        summary: 'Teachers are strictly barred by law from physically punishing or harassing students.',
      },
      CONSTITUTION_ARTICLES.ART_21,
    ],
    sequentialAdvice: {
      first:
        'I suggest you do this FIRST: Write down the exact date, time, colony location, and save any UPI/cash proof of that ₹8,000 + get a quick medical checkup/prescription if there are any marks or pain (that paper becomes solid gold evidence).',
      then:
        'THEN do this: File an online complaint on the UP Police / Jansunwai portal (or walk into the local chowki with a trusted adult) asking for a General Diary (GD) / NCR or FIR receipt—never leave without a stamped receiving.',
      finally:
        'AND THEN: If this was a school/college teacher, drop a formal complaint to the District Inspector of Schools (DIOS Kanpur) / Principal in writing. If she still threatens you, tap "Seek Professional Help" below.',
    },
    portals: [
      {
        name: 'UP Police Citizen Portal',
        url: 'https://uppolice.gov.in',
        helpline: '112 / 1090',
        purpose: 'Register e-complaint / track FIR & General Diary entries in Uttar Pradesh.',
        hoverSteps: [
          'Open uppolice.gov.in → Click "Citizen Services" → "Complaint / e-FIR".',
          'Mention both the physical assault (Sec 115 BNS) and forced ₹8,000 extortion (Sec 308 BNS).',
          'Download the PDF acknowledgment receipt immediately and keep 2 copies.',
        ],
      },
      {
        name: 'Jansunwai UP (CM Grievance Portal)',
        url: 'https://jansunwai.up.nic.in',
        purpose: 'Escalate if local police or school authorities ignore your complaint.',
        hoverSteps: [
          'Click "Register Grievance" → Verify mobile via OTP.',
          'Select Department: "Police" or "Secondary Education (DIOS Kanpur)".',
          'Upload your written timeline & payment proof; note the tracking number.',
        ],
      },
      {
        name: 'NALSA Free Legal Aid',
        url: 'https://nalsa.gov.in',
        helpline: '15100',
        purpose: 'Free legal aid under Article 39A if you need an advocate without high fees.',
        hoverSteps: [
          'Call 15100 or click "Apply for Legal Aid" on nalsa.gov.in.',
          'Select Uttar Pradesh → Kanpur Nagar DLSA.',
          'Describe the assault & extortion briefly to get assigned a panel advocate.',
        ],
      },
    ],
    needsProfessionalHelpHint:
      'If she threatens retaliation, refuses to return the extorted money, or police stall your complaint, post this anonymously in the Court of People or reach out to a Kanpur Criminal Advocate.',
  },
  {
    id: 'stolen_pan_cyber',
    category: 'Theft & Cyber',
    keywords: /\b(pan|aadhaar|wallet|stolen|theft|scam|upi|otp|fraud|cyber|loan app|hacked|phishing)\b/i,
    wrongedAssurance:
      'Better Call Jolly! Call karu baccha??? Deep breath—yes, you were wronged, and your panic is totally valid. When a PAN card or UPI money is stolen, speed beats everything.',
    lawsViolated: [
      {
        code: 'Section 303(2) BNS (old IPC 379)',
        title: 'Theft of Property / Identity Document',
        summary: 'Stealing a wallet, phone, or PAN card is a cognizable offence.',
      },
      {
        code: 'Section 66C & 66D, Information Technology Act 2000',
        title: 'Identity Theft & Cheating by Personation',
        summary: 'Anyone misusing your PAN/OTP for fake loans faces up to 3 years imprisonment.',
      },
      CONSTITUTION_ARTICLES.ART_21,
    ],
    sequentialAdvice: {
      first:
        'I suggest you do this FIRST: Call 1930 immediately if money was debited, OR file an online Lost Article / e-FIR on UP Police within the hour so you have an official timestamp proving the PAN was NOT with you.',
      then:
        'THEN do this: Check your free CIBIL / Experian credit report and place a fraud alert, so no instant-loan app can approve credit on your PAN.',
      finally:
        'AND THEN: Apply for a duplicate PAN on Protean (NSDL) using that police receipt number—and keep 3 copies of the receipt safe.',
    },
    portals: [
      {
        name: 'National Cyber Crime Portal',
        url: 'https://cybercrime.gov.in',
        helpline: '1930',
        purpose: 'Freeze stolen UPI/bank funds and log cyber identity theft.',
        hoverSteps: [
          'Click "Report Cyber Crime" → "Report Financial Fraud".',
          'Keep transaction IDs, fraudster phone numbers, and screenshots ready.',
          'Save the Acknowledgement Number—banks act only on this ID.',
        ],
      },
      {
        name: 'UP Police Lost Article / e-FIR',
        url: 'https://uppolice.gov.in',
        helpline: '112',
        purpose: 'Instant PDF receipt for stolen PAN/wallet so you are shielded from fake loans.',
        hoverSteps: [
          'Go to Citizen Services → "Lost Article Report".',
          'Enter PAN number, approximate time, and Kanpur location (e.g. Naveen Market).',
          'Download the digitally signed PDF immediately—no station visit needed for Lost Report.',
        ],
      },
      {
        name: 'Protean (NSDL) PAN Reprint',
        url: 'https://www.onlineservices.nsdl.com',
        purpose: 'Order a replacement PAN card using your police receipt.',
        hoverSteps: [
          'Choose "Reprint of PAN Card" or "Changes/Correction".',
          'Enter your existing PAN and Aadhaar for e-KYC.',
          'Attach the UP Police Lost Report PDF if requested.',
        ],
      },
    ],
    needsProfessionalHelpHint:
      'If a fake loan already shows up on your CIBIL or recovery agents harass you, lodge this in the Court of People so our Cyber Advocates can guide your RBI/police escalation.',
  },
  {
    id: 'property_deposit',
    category: 'Property',
    keywords: /\b(landlord|tenant|deposit|rent|flat|builder|rera|property|land|possession|eviction|lease)\b/i,
    wrongedAssurance:
      'Better Call Jolly! Call karu baccha??? Oh, classic landlord "sudden painting charges" drama—yes, you were wronged! Normal wear and tear is NOT your bill to pay.',
    lawsViolated: [
      {
        code: 'UP Regulation of Urban Premises Tenancy Act, 2021',
        title: 'Security Deposit Refund Mandate',
        summary: 'Landlords must refund the security deposit upon vacation after lawful deductions only.',
      },
      {
        code: 'Section 316 BNS (old IPC 406)',
        title: 'Criminal Breach of Trust',
        summary: 'Dishonestly misappropriating entrusted security money can attract criminal liability.',
      },
      CONSTITUTION_ARTICLES.ART_14,
    ],
    sequentialAdvice: {
      first:
        'I suggest you do this FIRST: Save your move-out video walkthrough, electricity bill clearance, and WhatsApp notice screenshots in one folder.',
      then:
        'THEN do this: Send a crisp 15-day Legal Demand Notice via India Post Speed Post (never just WhatsApp) demanding the exact deposit back.',
      finally:
        'AND THEN: If they still ghost you, file before the Kanpur Rent Authority / Small Causes Court—you do not even need a long civil trial.',
    },
    portals: [
      {
        name: 'UP RERA Portal',
        url: 'https://www.up-rera.in',
        purpose: 'For builder possession delays or refund with interest.',
        hoverSteps: [
          'Click "Complaints" → "Register Complaint".',
          'Enter project registration number and upload allotment/payment receipts.',
          'Pay nominal online fee and track hearing dates online.',
        ],
      },
      {
        name: 'Jansunwai UP',
        url: 'https://jansunwai.up.nic.in',
        purpose: 'Escalate unlawful lockouts or harassment by landlords.',
        hoverSteps: [
          'Log in with mobile OTP → Select District: Kanpur Nagar.',
          'Attach rent agreement & move-out proof.',
          'Track action taken by local administration.',
        ],
      },
    ],
    needsProfessionalHelpHint:
      'Need a sharp Speed Post legal notice drafted? Lodge your matter in the Court of People and let Kanpur Property Advocates review it.',
  },
  {
    id: 'consumer_fraud',
    category: 'Consumer',
    keywords: /\b(laptop|phone|ecommerce|amazon|flipkart|insurance|refund|defective|warranty|hospital|consumer|bill|bricks)\b/i,
    wrongedAssurance:
      'Better Call Jolly! Call karu baccha??? Receiving bricks instead of a laptop (or a closed support ticket) is 100% unfair—you were wronged, and big companies fear consumer court more than you think.',
    lawsViolated: [
      {
        code: 'Section 2(47) Consumer Protection Act, 2019',
        title: 'Unfair Trade Practice & Deficiency in Service',
        summary: 'Delivering wrong/defective goods or denying valid claims entitles you to full refund + compensation.',
      },
      CONSTITUTION_ARTICLES.ART_14,
    ],
    sequentialAdvice: {
      first:
        'I suggest you do this FIRST: Keep your unboxing video, invoice, UPI reference ID, and ticket-closure screenshot safe.',
      then:
        'THEN do this: File a formal complaint on the National Consumer Helpline (1915) — companies have a strict SLA to answer government-tagged grievances.',
      finally:
        'AND THEN: If unresolved in 15 days, file online on e-Daakhil before the Kanpur District Consumer Commission for refund + harassment compensation.',
    },
    portals: [
      {
        name: 'National Consumer Helpline (NCH)',
        url: 'https://consumerhelpline.gov.in',
        helpline: '1915',
        purpose: 'Official govt escalation that forces e-commerce & insurers to respond.',
        hoverSteps: [
          'Register on consumerhelpline.gov.in → Click "Register Grievance".',
          'Select Company Name, Order ID, and upload invoice + ticket screenshot.',
          'Save your Docket Number—it is valid proof for Consumer Court.',
        ],
      },
      {
        name: 'e-Daakhil Consumer Court',
        url: 'https://edaakhil.nic.in',
        purpose: 'File a full Consumer Commission case online from home.',
        hoverSteps: [
          'Create Complainant account → Select "District Commission: Kanpur Nagar".',
          'Upload brief facts, NCH docket, and invoice PDFs.',
          'Zero court fee for claims up to ₹5 lakh!',
        ],
      },
    ],
    needsProfessionalHelpHint:
      'If the amount is large or the insurer/brand sends corporate lawyers, share your thread in the Court of People to get Consumer Advocates backing you.',
  },
  {
    id: 'marital_family',
    category: 'Marital',
    keywords: /\b(husband|wife|in-laws|dowry|divorce|stridhan|domestic|maintenance|marriage|marital|alimony)\b/i,
    wrongedAssurance:
      'Better Call Jolly! Call karu baccha??? I am right here with you. Yes, you were wronged—no one has the right to lock you out, demand dowry, or make you feel small in your own home.',
    lawsViolated: [
      {
        code: 'Protection of Women from Domestic Violence Act, 2005 (PWDVA)',
        title: 'Right to Residence & Protection Order',
        summary: 'Guarantees your right to live in the shared household and claim maintenance + stridhan.',
      },
      {
        code: 'Section 85 BNS (old IPC 498A) & Dowry Prohibition Act',
        title: 'Cruelty & Unlawful Dowry Demand',
        summary: 'Demanding cash/car after marriage or harassing a spouse is a serious criminal offence.',
      },
      CONSTITUTION_ARTICLES.ART_21,
    ],
    sequentialAdvice: {
      first:
        'I suggest you do this FIRST: Quietly back up stridhan bills, wedding photos, chats, and any threatening voice notes to a private email/cloud.',
      then:
        'THEN do this: If you are locked out or unsafe right now, dial 181 (UP Women Helpline) or 112 immediately for shelter & police protection.',
      finally:
        'AND THEN: File a complaint with NCW or approach Kanpur Mahila Thana / DLSA for a Protection & Maintenance Order.',
    },
    portals: [
      {
        name: 'National Commission for Women (NCW)',
        url: 'https://ncw.nic.in',
        helpline: '7827170170 / 181',
        purpose: '24x7 online complaint for domestic abuse or dowry harassment.',
        hoverSteps: [
          'Click "Register Online Complaint" on ncw.nic.in.',
          'Choose category: "Domestic Violence" or "Dowry Harassment".',
          'NCW forwards urgent cases directly to Kanpur Police for action.',
        ],
      },
      {
        name: 'NALSA Free Legal Aid',
        url: 'https://nalsa.gov.in',
        helpline: '15100',
        purpose: 'Free family-court advocate under Article 39A.',
        hoverSteps: [
          'Dial 15100 or apply online selecting Kanpur Nagar.',
          'Women are entitled to free legal aid regardless of income!',
        ],
      },
    ],
    needsProfessionalHelpHint:
      'Family matters need steady hands. Share anonymously in the Court of People or connect with verified Kanpur Family Advocates.',
  },
  {
    id: 'labour_salary',
    category: 'Labour',
    keywords: /\b(salary|hr|resigned|bond|terminated|pf|epf|gratuity|company|employer|posh|wages)\b/i,
    wrongedAssurance:
      'Better Call Jolly! Call karu baccha??? Withholding earned salary or waving fake ₹2 lakh "bond" threats is classic corporate bullying—yes, you were wronged!',
    lawsViolated: [
      {
        code: 'Payment of Wages Act / Industrial Disputes Act',
        title: 'Unlawful Withholding of Earned Wages',
        summary: 'An employer cannot withhold salary for days already worked.',
      },
      {
        code: 'Section 27, Indian Contract Act, 1872',
        title: 'Void Restraint of Trade',
        summary: 'Arbitrary employment bonds without actual provable training cost are unenforceable.',
      },
    ],
    sequentialAdvice: {
      first:
        'I suggest you do this FIRST: Export your offer letter, resignation email, asset handover proof, and payslips to your personal Gmail before work access is cut.',
      then:
        'THEN do this: Send one calm, formal email giving HR 7 working days to clear Full & Final settlement.',
      finally:
        'AND THEN: File on the Ministry of Labour Samadhan portal (and EPFiGMS if PF is missing).',
    },
    portals: [
      {
        name: 'Samadhan (Ministry of Labour)',
        url: 'https://samadhan.labour.gov.in',
        purpose: 'Official Labour Commissioner dispute portal for unpaid salary/termination.',
        hoverSteps: [
          'Log in via mobile OTP → Select "Raise Industrial Dispute".',
          'Attach offer letter, resignation, and unpaid salary calculation.',
          'Labour Commissioner summons HR for conciliation.',
        ],
      },
      {
        name: 'EPFiGMS (EPFO Grievance)',
        url: 'https://epfigms.gov.in',
        purpose: 'Report unpaid PF or employer blocking UAN exit.',
        hoverSteps: [
          'Click "Register Grievance" → Enter your UAN.',
          'Select "Non-deposit of PF" or "Exit date not updated".',
        ],
      },
    ],
    needsProfessionalHelpHint:
      'If HR sends an advocate notice, post it anonymously in the Court of People so Labour Law Advocates can help you draft a counter-reply.',
  },
];
