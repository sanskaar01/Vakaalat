import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { db, initSchema } from './database.js';

const CELEBRITY_FIRST = [
  'Amitabh', 'Shahrukh', 'Priyanka', 'Deepika', 'Ranveer', 'Alia', 'Hrithik', 'Kareena',
  'Vikram', 'Anushka', 'Rajkumar', 'Kangana', 'Ayushmann', 'Tabu', 'Pankaj', 'Nawaz',
  'Vidya', 'Irrfan', 'Madhuri', 'Sushmita', 'Manoj', 'Konkona', 'Randeep', 'Radhika', 'Farhan',
];

const CELEBRITY_LAST = [
  'Bachchan', 'Kapoor', 'Chopra', 'Padukone', 'Singh', 'Roshan', 'Sharma', 'Rao',
  'Khurrana', 'Tripathi', 'Siddiqui', 'Balan', 'Dixit', 'Sen', 'Bajpayee', 'Apte',
  'Akhtar', 'Khan', 'Verma', 'Mehta', 'Malhotra', 'Bhatt', 'Deol', 'Deshmukh', 'Joshi',
];

const ATTORNEYS = [
  {
    real_name: 'Adv. Raghavendra Mishra',
    stage_name: 'Adv. Raghav Mishra',
    email: 'raghav.mishra@vakaalat.in',
    college: 'Dr. Ram Manohar Lohiya National Law University (RMLNLU), Lucknow',
    experience_years: 11,
    domains: ['Criminal', 'Theft & Cyber', 'Consumer'],
    city: 'Kanpur',
    profile_views: 1842,
    avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=RaghavMishra&backgroundColor=e7e2d8',
    bio_prefix:
      'I am a practicing advocate at the Kanpur District & Sessions Court and Allahabad High Court with over eleven years of courtroom experience defending citizens against false FIRs, cyber fraud, and unlawful police detention. My legal education at RMLNLU Lucknow instilled in me a deep commitment to constitutional due process and procedural fairness under the Bharatiya Nagarik Suraksha Sanhita (BNSS). ',
  },
  {
    real_name: 'Adv. Meenakshi Awasthi',
    stage_name: 'Adv. Meenakshi Awasthi',
    email: 'meenakshi.awasthi@vakaalat.in',
    college: 'Faculty of Law, University of Delhi',
    experience_years: 9,
    domains: ['Marital', 'Criminal', 'Consumer'],
    city: 'Kanpur',
    profile_views: 2150,
    avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=MeenakshiAwasthi&backgroundColor=e7e2d8',
    bio_prefix:
      'Over the past nine years in Kanpur Family Courts and Mediation Centres, I have guided more than four hundred families through sensitive matrimonial disputes, maintenance petitions, domestic violence protection orders, and mutual-consent separations with dignity. Graduating from Faculty of Law, University of Delhi taught me that family law requires equal parts sharp statutory precision and calm human empathy. ',
  },
  {
    real_name: 'Adv. Siddharth Chaturvedi',
    stage_name: 'Adv. Siddharth Chaturvedi',
    email: 'siddharth.chaturvedi@vakaalat.in',
    college: 'Banaras Hindu University (BHU) Law School, Varanasi',
    experience_years: 14,
    domains: ['Property', 'Consumer', 'Labour'],
    city: 'Kanpur',
    profile_views: 1620,
    avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=SiddharthChaturvedi&backgroundColor=e7e2d8',
    bio_prefix:
      'For fourteen years I have represented homebuyers, tenants, and ancestral property co-owners across Kanpur Nagar, Unnao, and Lucknow RERA benches. A proud alumnus of BHU Law School, I specialize in title verification, illegal possession injunctions, builder delay compensation, and security deposit recovery without dragging ordinary citizens into decades-long civil suits. ',
  },
  {
    real_name: 'Adv. Farhana Siddiqui',
    stage_name: 'Adv. Farhana Siddiqui',
    email: 'farhana.siddiqui@vakaalat.in',
    college: 'Aligarh Muslim University (AMU), Faculty of Law',
    experience_years: 8,
    domains: ['Marital', 'Labour', 'Consumer'],
    city: 'Kanpur',
    profile_views: 1490,
    avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=FarhanaSiddiqui&backgroundColor=e7e2d8',
    bio_prefix:
      'Trained at Aligarh Muslim University Faculty of Law, I focus on workplace harassment (POSH Act), unpaid salary recovery before the Labour Commissioner, and women’s matrimonial and inheritance rights across Uttar Pradesh. Many working professionals in Kanpur hesitate to challenge illegal termination or withheld gratuity because they fear retaliation; my goal is to demystify statutory notices. ',
  },
  {
    real_name: 'Adv. Devansh Tripathi',
    stage_name: 'Adv. Devansh Tripathi',
    email: 'devansh.tripathi@vakaalat.in',
    college: 'Chhatrapati Shahu Ji Maharaj University (CSJMU), Kanpur',
    experience_years: 7,
    domains: ['Theft & Cyber', 'Criminal', 'Financial'],
    city: 'Kanpur',
    profile_views: 1930,
    avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=DevanshTripathi&backgroundColor=e7e2d8',
    bio_prefix:
      'Based in Civil Lines, Kanpur, and an alumnus of CSJMU Kanpur, I handle urgent cybercrime bank-lien removals, UPI scam trace applications, stolen identity PAN/Aadhaar misuse defenses, and Section 138 Negotiable Instruments Act cheque bounce cases. When someone loses hard-earned savings to an online fraudster, the first 48 hours determine whether funds can be frozen. ',
  },
  {
    real_name: 'Adv. Ananya Bajpai',
    stage_name: 'Adv. Ananya Bajpai',
    email: 'ananya.bajpai@vakaalat.in',
    college: 'Symbiosis Law School, Pune',
    experience_years: 6,
    domains: ['Consumer', 'Theft & Cyber', 'Corporate'],
    city: 'Kanpur',
    profile_views: 1315,
    avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=AnanyaBajpai&backgroundColor=e7e2d8',
    bio_prefix:
      'After graduating from Symbiosis Law School Pune, I returned to my hometown Kanpur to make consumer justice accessible through e-Daakhil and District Consumer Disputes Redressal Commissions. Whether it is a defective vehicle, denied health insurance claim, or e-commerce non-delivery, ordinary consumers rarely know that they can file claims without paying exorbitant retainers. ',
  },
  {
    real_name: 'Adv. Harshit Dixit',
    stage_name: 'Adv. Harshit Dixit',
    email: 'harshit.dixit@vakaalat.in',
    college: 'University of Allahabad, Faculty of Law',
    experience_years: 12,
    domains: ['Criminal', 'Property', 'Marital'],
    city: 'Kanpur',
    profile_views: 1740,
    avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=HarshitDixit&backgroundColor=e7e2d8',
    bio_prefix:
      'With twelve years of practice before the Allahabad High Court and Kanpur Sessions Courts, I handle anticipatory bail, quashing petitions under Section 528 BNSS, and contested partition suits. My legal training at Allahabad University taught me that clear documentation and early preventive action save families from years of unnecessary litigation. ',
  },
  {
    real_name: 'Adv. Kritika Srivastava',
    stage_name: 'Adv. Kritika Srivastava',
    email: 'kritika.srivastava@vakaalat.in',
    college: 'National Law University Odisha (NLUO)',
    experience_years: 5,
    domains: ['Labour', 'Consumer', 'Theft & Cyber'],
    city: 'Kanpur',
    profile_views: 1120,
    avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=KritikaSrivastava&backgroundColor=e7e2d8',
    bio_prefix:
      'As an NLU Odisha graduate practicing in Kanpur and Lucknow, I assist startup employees, factory workers, and freelancers with employment bond disputes, PF/ESI non-deposit complaints, and digital privacy violations. Most young earners sign one-sided offer letters without realizing that post-termination non-compete clauses are largely unenforceable under Section 27 of the Indian Contract Act. ',
  },
  {
    real_name: 'Adv. Prabhakar Tiwari',
    stage_name: 'Adv. Prabhakar Tiwari',
    email: 'prabhakar.tiwari@vakaalat.in',
    college: 'Lucknow University, Faculty of Law',
    experience_years: 16,
    domains: ['Property', 'Criminal', 'Financial'],
    city: 'Kanpur',
    profile_views: 2040,
    avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=PrabhakarTiwari&backgroundColor=e7e2d8',
    bio_prefix:
      'Practicing for sixteen years across Kanpur Dehat and Kanpur Nagar revenue and civil courts, I handle agricultural land mutation disputes, forged sale-deed cancellations, and banking recovery tribunal matters. My focus on Vakaalat is to give clear, jargon-free first-aid guidance so citizens know which Tehsil or court document actually matters. ',
  },
  {
    real_name: 'Adv. Zoya Khan',
    stage_name: 'Adv. Zoya Khan',
    email: 'zoya.khan@vakaalat.in',
    college: 'Jamia Millia Islamia, Faculty of Law',
    experience_years: 6,
    domains: ['Marital', 'Theft & Cyber', 'Consumer'],
    city: 'Kanpur',
    profile_views: 1380,
    avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=ZoyaKhan&backgroundColor=e7e2d8',
    bio_prefix:
      'An alumna of Jamia Millia Islamia Faculty of Law, I advise clients on cyberstalking, non-consensual image sharing, domestic protection orders, and digital lending app harassment. Victims of online blackmail often panic and pay extortionists; my mission on this platform is to show them immediate legal shields and police cyber-cell procedures that stop harassment fast. ',
  },
];

function buildLongBio(prefix: string, name: string, city: string): string {
  const filler = `Every citizen who walks into a courtroom or police station deserves to understand their rights before signing a single paper or paying a single rupee. On Vakaalat, I dedicate time each week to answering public threads in the Court of People because legal literacy is the strongest shield against exploitation in ${city} and across India. When you read my responses, you will always receive structured statutory steps—whether that means obtaining a General Diary receipt, filing on an official government portal like e-Daakhil or cybercrime.gov.in, or sending a crisp registered legal notice before escalating to litigation. My chambers operate on transparency, empathy, and respect for every help-seeker's privacy. Even if you never hire an advocate, knowing which document to preserve and which authority holds jurisdiction puts power back in your hands. Together, we can make justice approachable, dignified, and genuinely accessible for ordinary people.`;
  let full = `${prefix}${filler}`;
  while (full.length < 1750) {
    full += ` Furthermore, ${name} believes that preventive legal awareness—understanding FIR rights, consumer warranties, rental agreements, and digital evidence preservation—empowers every citizen in ${city} to stand firm without fear.`;
  }
  return full;
}

const SAMPLE_THREADS = [
  {
    category: 'Theft & Cyber',
    title: 'My PAN card and wallet were stolen near Naveen Market — worried about loan fraud',
    raw_content:
      'Yesterday evening around 7 PM my wallet containing my PAN card (ABCDE1234F) and ₹4,500 cash was stolen near Naveen Market, Kanpur. My real name is Ramesh Verma. I am terrified someone will take instant loans on my PAN.',
    masked_content:
      'Yesterday evening around 7 PM my wallet containing my PAN card ([MASKED-ID]) and [BLURRED AMOUNT: ₹X,XXX] cash was stolen near Naveen Market, Kanpur. My name is [Alias: Amitabh Bachchan]. I am terrified someone will take instant loans on my PAN.',
    aliases: { 'Ramesh Verma': 'Amitabh Bachchan', '₹4,500': '₹X,XXX', 'ABCDE1234F': 'MASKED-PAN' },
    amounts: ['₹4,500'],
    upvotes: 64,
  },
  {
    category: 'Property',
    title: 'Landlord in Swaroop Nagar refusing to return ₹48,000 security deposit after vacating',
    raw_content:
      'I vacated my 2BHK flat in Swaroop Nagar on 1st November after giving 30 days notice on WhatsApp. My landlord Suresh Gupta is withholding ₹48,000 claiming fake painting charges even though the flat was spotless.',
    masked_content:
      'I vacated my 2BHK flat in Swaroop Nagar on 1st November after giving 30 days notice on WhatsApp. My landlord [Alias: Pankaj Tripathi] is withholding [BLURRED AMOUNT: ₹XX,XXX] claiming fake painting charges even though the flat was spotless.',
    aliases: { 'Suresh Gupta': 'Pankaj Tripathi', '₹48,000': '₹XX,XXX' },
    amounts: ['₹48,000'],
    upvotes: 89,
  },
  {
    category: 'Marital',
    title: 'Husband and in-laws demanding ₹5,00,000 more after 1 year of marriage and threatening to throw me out',
    raw_content:
      'My name is Neha Sharma. After 1 year of marriage in Kakadeo, my in-laws are demanding ₹5,00,000 for a car and locked me out of my room yesterday. I have my stridhan receipts.',
    masked_content:
      'My name is [Alias: Deepika Padukone]. After 1 year of marriage in Kakadeo, my in-laws are demanding [BLURRED AMOUNT: ₹X,XX,XXX] for a car and locked me out of my room yesterday. I have my stridhan receipts.',
    aliases: { 'Neha Sharma': 'Deepika Padukone', '₹5,00,000': '₹X,XX,XXX' },
    amounts: ['₹5,00,000'],
    upvotes: 112,
  },
  {
    category: 'Consumer',
    title: 'Ordered a laptop worth ₹72,000 online — received bricks in the box, platform closed ticket',
    raw_content:
      'I paid ₹72,000 via UPI on a major e-commerce site. I have an unboxing video showing bricks inside. Their support closed my ticket twice.',
    masked_content:
      'I paid [BLURRED AMOUNT: ₹XX,XXX] via UPI on a major e-commerce site. I have an unboxing video showing bricks inside. Their support closed my ticket twice.',
    aliases: { '₹72,000': '₹XX,XXX' },
    amounts: ['₹72,000'],
    upvotes: 95,
  },
  {
    category: 'Labour',
    title: 'Company in Fazalganj withheld 2 months salary (₹68,000) after I resigned properly',
    raw_content:
      'I served my full 30-day notice period and handed over all assets. HR is ignoring emails and holding ₹68,000 full and final settlement.',
    masked_content:
      'I served my full 30-day notice period and handed over all assets. HR is ignoring emails and holding [BLURRED AMOUNT: ₹XX,XXX] full and final settlement.',
    aliases: { '₹68,000': '₹XX,XXX' },
    amounts: ['₹68,000'],
    upvotes: 73,
  },
  {
    category: 'Criminal',
    title: 'Local police station refused to register my FIR for bike theft in Kidwai Nagar',
    raw_content:
      'My motorcycle was stolen outside a clinic in Kidwai Nagar. The duty officer told me to come back next week instead of writing an FIR.',
    masked_content:
      'My motorcycle was stolen outside a clinic in Kidwai Nagar. The duty officer told me to come back next week instead of writing an FIR.',
    aliases: {},
    amounts: [],
    upvotes: 104,
  },
  {
    category: 'Theft & Cyber',
    title: 'Fake loan app morphed my contacts photo and is blackmailing me for ₹18,500',
    raw_content:
      'I downloaded an instant loan app by mistake. They already took ₹9,000 and are now demanding ₹18,500 more or they will message my family.',
    masked_content:
      'I downloaded an instant loan app by mistake. They already took [BLURRED AMOUNT: ₹X,XXX] and are now demanding [BLURRED AMOUNT: ₹XX,XXX] more or they will message my family.',
    aliases: { '₹9,000': '₹X,XXX', '₹18,500': '₹XX,XXX' },
    amounts: ['₹9,000', '₹18,500'],
    upvotes: 121,
  },
  {
    category: 'Financial',
    title: 'Friend took ₹1,50,000 on a signed cheque that bounced twice — what is the deadline?',
    raw_content:
      'My acquaintance Rajesh Tiwari gave me a cheque for ₹1,50,000 which bounced due to insufficient funds on 10th November. Bank gave return memo.',
    masked_content:
      'My acquaintance [Alias: Nawazuddin Siddiqui] gave me a cheque for [BLURRED AMOUNT: ₹X,XX,XXX] which bounced due to insufficient funds on 10th November. Bank gave return memo.',
    aliases: { 'Rajesh Tiwari': 'Nawazuddin Siddiqui', '₹1,50,000': '₹X,XX,XXX' },
    amounts: ['₹1,50,000'],
    upvotes: 58,
  },
  {
    category: 'Property',
    title: 'Builder delayed possession of flat on GT Road by 2.5 years — can I demand refund with interest?',
    raw_content:
      'I paid ₹24,00,000 as booking and installment amount. The RERA promised date was March 2024 and construction is still incomplete.',
    masked_content:
      'I paid [BLURRED AMOUNT: ₹XX,XX,XXX] as booking and installment amount. The RERA promised date was March 2024 and construction is still incomplete.',
    aliases: { '₹24,00,000': '₹XX,XX,XXX' },
    amounts: ['₹24,00,000'],
    upvotes: 82,
  },
  {
    category: 'Consumer',
    title: 'Health insurance rejected ₹1,15,000 hospital bill citing pre-existing condition without proof',
    raw_content:
      'My father was hospitalized in Regency Hospital Kanpur. Policy is 4 years old, yet insurer rejected ₹1,15,000 cashless claim.',
    masked_content:
      'My father was hospitalized in a Kanpur hospital. Policy is 4 years old, yet insurer rejected [BLURRED AMOUNT: ₹X,XX,XXX] cashless claim.',
    aliases: { '₹1,15,000': '₹X,XX,XXX' },
    amounts: ['₹1,15,000'],
    upvotes: 77,
  },
  {
    category: 'Marital',
    title: 'Can a husband and wife file mutual consent divorce if living separately for 14 months?',
    raw_content:
      'We have been living separately since September 2025 with no children and no pending disputes. Both want a peaceful closure.',
    masked_content:
      'We have been living separately since September 2025 with no children and no pending disputes. Both want a peaceful closure.',
    aliases: {},
    amounts: [],
    upvotes: 49,
  },
  {
    category: 'Labour',
    title: 'IT company asking for ₹2,00,000 bond money because I resigned after 8 months',
    raw_content:
      'I joined as a junior developer with no special foreign training provided, yet HR threatens legal notice for ₹2,00,000 bond.',
    masked_content:
      'I joined as a junior developer with no special foreign training provided, yet HR threatens legal notice for [BLURRED AMOUNT: ₹X,XX,XXX] bond.',
    aliases: { '₹2,00,000': '₹X,XX,XXX' },
    amounts: ['₹2,00,000'],
    upvotes: 93,
  },
];

const ATTORNEY_COMMENTS = [
  'First-Aid Steps: (1) File an online lost-document / e-FIR report with UP Police immediately and save the PDF receipt. (2) Place a free CIBIL/Experian credit alert so no lender approves a loan without OTP/biometric verification. (3) Apply for a duplicate PAN on Protean/NSDL citing the GD receipt number. Never skip the written police receipt.',
  'Under Section 173 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), a police station cannot refuse to register a cognizable offence like vehicle theft. If the Station House Officer refuses, send the written complaint by Registered Post to the Superintendent of Police (SP/DCP Kanpur) and file an application under Section 175(3) BNSS before the Magistrate.',
  'Send a formal Legal Notice via Speed Post giving 15 days to refund the security deposit along with your move-out video and WhatsApp notice screenshots. If unpaid, you can approach the Rent Authority / Small Causes Court in Kanpur without needing an expensive trial.',
  'With an unboxing video and UPI transaction ID, file a formal grievance on the National Consumer Helpline (consumerhelpline.gov.in or dial 1915). If unresolved within 15 days, file online on e-Daakhil (edaakhil.nic.in) before the Kanpur District Consumer Commission — no lawyer is mandatory for filing.',
  'Section 27 of the Indian Contract Act makes restraint-of-trade clauses void, and employment bonds are only enforceable to the extent of *actual, provable* specialized training expenses—not arbitrary penalty figures. Reply calmly requesting itemized proof of training expenditure.',
  'For Section 138 NI Act cheque bounce, strict statutory timelines apply: send a written Legal Demand Notice within **30 days** of receiving the bank return memo, wait 15 days for payment, and if unpaid, file the complaint within 30 days thereafter before the Magistrate.',
  'Do not pay a single rupee to illegal loan-app extortionists—paying encourages further demands. Immediately file on cybercrime.gov.in, call 1930, take screenshots of all threats, and send a brief broadcast message to close contacts stating your phone was compromised.',
  'Under the Domestic Violence Act (PWDVA 2005), you have an immediate right to reside in the shared household and seek a Protection Order + Stridhan return order before the Magistrate. Dial 181 (Women Helpline UP) or approach DLSA Kanpur for free urgent assistance.',
];

const CLIENT_COMMENTS = [
  'Same thing happened to my cousin in Gumti No. 5 last month—the online UP Police e-FIR receipt worked smoothly for getting a duplicate card.',
  'Thank you for sharing this openly, reading the replies here gave me courage to send a proper Speed Post notice instead of just arguing on WhatsApp.',
  'Keep all screenshots backed up on Google Drive with timestamps. That helped us a lot in consumer court.',
  'Also check your CIBIL report immediately after losing PAN, it takes 2 minutes.',
];

export function seedIfEmpty(): void {
  initSchema();
  const countRow = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (countRow.c > 0) return;

  const passwordHash = bcrypt.hashSync('Vakaalat@2026', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, role, real_name, stage_name, email, password_hash, avatar_url, has_subscription)
    VALUES (@id, @role, @real_name, @stage_name, @email, @password_hash, @avatar_url, @has_subscription)
  `);

  const insertLawyer = db.prepare(`
    INSERT INTO lawyer_profiles (user_id, bio_text, input_mode, college, experience_years, domains, city, video_cv_url, verification_status, profile_views, total_likes)
    VALUES (@user_id, @bio_text, @input_mode, @college, @experience_years, @domains, @city, @video_cv_url, @verification_status, @profile_views, @total_likes)
  `);

  const insertThread = db.prepare(`
    INSERT INTO threads (id, author_id, category, title, raw_content, masked_content, celebrity_alias_map, sensitive_amounts, upvotes)
    VALUES (@id, @author_id, @category, @title, @raw_content, @masked_content, @celebrity_alias_map, @sensitive_amounts, @upvotes)
  `);

  const insertComment = db.prepare(`
    INSERT INTO comments (id, thread_id, author_id, content, likes_count, importance_score)
    VALUES (@id, @thread_id, @author_id, @content, @likes_count, @importance_score)
  `);

  const insertVisit = db.prepare(`
    INSERT INTO profile_visit_logs (id, lawyer_id, visitor_stage_name, visitor_domain_interest, seconds_spent)
    VALUES (@id, @lawyer_id, @visitor_stage_name, @visitor_domain_interest, @seconds_spent)
  `);

  const clientIds: string[] = [];
  const clientStageNames: string[] = [];
  const lawyerIds: string[] = [];

  const runSeed = db.transaction(() => {
    // 1. Seed 50 Dummy Client Users (no profile pictures!)
    for (let i = 0; i < 50; i++) {
      const id = randomUUID();
      const first = CELEBRITY_FIRST[i % CELEBRITY_FIRST.length];
      const last = CELEBRITY_LAST[(i * 7 + 3) % CELEBRITY_LAST.length];
      const stageName = `${first} ${last} #${101 + i}`;
      clientIds.push(id);
      clientStageNames.push(stageName);

      insertUser.run({
        id,
        role: 'client',
        real_name: `Citizen User ${i + 1}`,
        stage_name: stageName,
        email: `citizen${i + 1}@vakaalat.demo`,
        password_hash: passwordHash,
        avatar_url: null, // Clients never have profile pictures
        has_subscription: i % 10 === 0 ? 1 : 0,
      });
    }

    // 2. Seed 10 Dummy Kanpur Attorneys (with 1750+ char bios & avatars)
    ATTORNEYS.forEach((att, idx) => {
      const id = randomUUID();
      lawyerIds.push(id);

      insertUser.run({
        id,
        role: 'lawyer',
        real_name: att.real_name,
        stage_name: att.stage_name,
        email: att.email,
        password_hash: passwordHash,
        avatar_url: att.avatar_url,
        has_subscription: 1,
      });

      const longBio = buildLongBio(att.bio_prefix, att.stage_name, att.city);
      const initialLikes = 140 - idx * 9 + (idx % 3) * 12;

      insertLawyer.run({
        user_id: id,
        bio_text: longBio,
        input_mode: idx % 3 === 0 ? 'voice' : 'typed',
        college: att.college,
        experience_years: att.experience_years,
        domains: JSON.stringify(att.domains),
        city: att.city,
        video_cv_url: `https://vakaalat.demo/video-cv/attorney-${idx + 1}.mp4`,
        verification_status: 'verified',
        profile_views: att.profile_views,
        total_likes: initialLikes,
      });

      // Seed "People who spent most time on your profile" logs
      for (let v = 0; v < 5; v++) {
        insertVisit.run({
          id: randomUUID(),
          lawyer_id: id,
          visitor_stage_name: clientStageNames[(idx * 4 + v) % clientStageNames.length],
          visitor_domain_interest: att.domains[v % att.domains.length],
          seconds_spent: 185 - v * 28 + idx * 7,
        });
      }
    });

    // 3. Seed 12+ Rich Threads + Sorted Comments
    SAMPLE_THREADS.forEach((t, tIdx) => {
      const threadId = randomUUID();
      const authorId = clientIds[tIdx % clientIds.length];

      insertThread.run({
        id: threadId,
        author_id: authorId,
        category: t.category,
        title: t.title,
        raw_content: t.raw_content,
        masked_content: t.masked_content,
        celebrity_alias_map: JSON.stringify(t.aliases),
        sensitive_amounts: JSON.stringify(t.amounts),
        upvotes: t.upvotes,
      });

      // Add 2-3 helpful attorney comments + 1-2 client comments per thread
      const primaryLawyerIdx = tIdx % lawyerIds.length;
      const secondaryLawyerIdx = (tIdx + 3) % lawyerIds.length;

      const primaryLikes = 42 - (tIdx % 5) * 4;
      const secondaryLikes = 24 - (tIdx % 4) * 3;

      insertComment.run({
        id: randomUUID(),
        thread_id: threadId,
        author_id: lawyerIds[primaryLawyerIdx],
        content: ATTORNEY_COMMENTS[tIdx % ATTORNEY_COMMENTS.length],
        likes_count: primaryLikes,
        importance_score: primaryLikes * 1.5,
      });

      insertComment.run({
        id: randomUUID(),
        thread_id: threadId,
        author_id: lawyerIds[secondaryLawyerIdx],
        content: ATTORNEY_COMMENTS[(tIdx + 2) % ATTORNEY_COMMENTS.length],
        likes_count: secondaryLikes,
        importance_score: secondaryLikes * 1.3,
      });

      insertComment.run({
        id: randomUUID(),
        thread_id: threadId,
        author_id: clientIds[(tIdx + 12) % clientIds.length],
        content: CLIENT_COMMENTS[tIdx % CLIENT_COMMENTS.length],
        likes_count: 9 + (tIdx % 6),
        importance_score: 9 + (tIdx % 6),
      });
    });
  });

  runSeed();
  console.log('[Vakaalat DB] Seeded 50 clients, 10 Kanpur attorneys, 12 threads, and sorted comments.');
}

// Allow running directly via `npm run seed`
if (process.argv[1]?.endsWith('seed.ts')) {
  seedIfEmpty();
}
