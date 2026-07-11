// Knowledge base for RAG — derived from G. Krishna Teja's full resume
// Each entry is a self-contained chunk the LLM can use to answer questions

export const knowledgeChunks = [
  // --- BIO & OBJECTIVE ---
  `G. Krishna Teja was born on 23 March 2003. He is an Integrated M.Sc. Biotechnology student at VIT Vellore with a CGPA of 9.01 (as of 2025). He is passionate about Pharmaceutical Operations, Industrial Biotechnology, Healthcare Systems, and Business Development. He combines deep scientific knowledge with strong leadership, financial management, and automation-driven system-building skills.`,

  `Career objective: Currently working as a Marketing Research Analyst Intern at Agilent Technologies (June - December 2026). Seeking roles in pharmaceutical operations, industrial biotechnology, healthcare systems, and business development — specifically leveraging his experience in marketing research and analytical instrumentation to drive measurable business outcomes in the life sciences industry. He has hands-on experience with analytical instruments (GC, HPLC, UV-Vis) and deep familiarity with pharma/biopharma value chains. Demonstrated ability to deliver high-impact outcomes including managing Rs. 7 crore finances across 150+ events and executing 952 successful blood donations within approximately 7 hours — a university record.`,

  // --- EDUCATION ---
  `Education: Krishna completed his Integrated M.Sc. Biotechnology from Vellore Institute of Technology (VIT), Vellore from 2022 to 2027. His CGPA is 9.01. He received 100% Attendance Awards for 2 times in 2023 and 2025.`,

  `Education: He completed Intermediate (BiPC) from Sri Chaitanya Junior College, Vijayawada from 2019 to 2021, scoring 96% (954/1000).`,

  `Education: He completed his 10th class/Secondary School Certificate (SSC) from Masters EM High School, Sathyavedu, Tirupati district, Andhra Pradesh in 2018-2019, achieving a perfect GPA of 10.0. For this achievement, he was selected for the prestigious Prathiba Award from the Andhra Pradesh Government.`,

  // --- RESEARCH ---
  `Research: Krishna worked on his Master's Thesis — Sustainable Aquafeed from Fruit Peel Waste at VIT Vellore (SBST) from 2025 to 2026 under Dr. R. Sudhakaran, Department of Integrative Biology. He developed antioxidant-rich aquafeed formulations using orange (Citrus sinensis) and pomegranate (Punica granatum) peel waste as sustainable agro-industrial inputs, reducing reliance on fishmeal-based commercial feed. He conducted comprehensive biochemical assays including protein estimation (Bradford, BCA, Lowry), carbohydrate estimation (Anthrone), lipid extraction, and antioxidant evaluation (DPPH) for nutritional profiling. He identified Bradford assay interference due to polyphenol content and proposed alternative strategies. He evaluated binder performance (tapioca starch vs alginate) and water stability (>24h retention). He demonstrated functional feed performance and scalability potential for industrial aquaculture applications and identified 3 viable commercialization pathways through market landscape analysis. This established a circular bioeconomy framework.`,

  `Research: Krishna worked on a Biotechnological E-Waste Leaching System at VIT Vellore (presented at National Entrepreneurship Day — EntrepreNATION, Sept 2025) under Dr. Anand Prem Rajan. He designed a microbial bioleaching system for heavy metal recovery from electronic waste streams (PCBs, cables), integrating bioreactor processing, electrolysis, and material recovery workflows. He proposed real-time monitoring and plastic upcycling modules for circular economy applications. Won 2nd Prize at EntrepreNATION.`,

  `Manuscripts: Krishna has two manuscripts under preparation (2026): (1) Transcriptomic & Immunological Impact of Synthetic Food Colorants and Additives on the Human Gut. (2) Organic, Innovative, and Eco-friendly Feeds for Aquaculture.`,

  // --- INTERNSHIPS ---
  `Internship: Krishna is currently a Marketing Research Analyst Intern at Agilent Technologies in Chennai, India, since 15 June 2026. This 6-month internship continues until 15 December 2026. In this role, he conducts comprehensive market research and competitive intelligence analyses to evaluate trends, customer profiles, and product positioning in the analytical instrumentation market. He analyzes business development metrics and market data to generate insights supporting lead generation and strategic marketing campaigns. He also works on cross-functional initiatives to align biotechnology industry requirements with analytical instrumentation solutions.`,

  `Internship: Krishna was an Industrial Intern at Glory Pharma Chem India Pvt Ltd in June–July 2025. He assisted in GMP-based API intermediate manufacturing workflows including reactor processing, filtration, centrifugation, and drying operations. He performed QC analyses including moisture content, pH testing, and carbon testing, and gained hands-on exposure to Gas Chromatography (GC) instrumentation. He followed SOPs for equipment cleaning and batch documentation, gaining experience in QA, EHS, and pharmaceutical compliance systems (WHO, ICH, CDSCO).`,

  `Internship: Krishna was an Industrial Intern in the Paper Mill Division at GSK Technologies Pvt Ltd in May–June 2024. He studied full-scale paper manufacturing processes from pulping through drying, rolling, and packaging. He observed industrial equipment including pulper, boiler, heat exchanger, and paper machine. He performed QC analyses including GSM measurement, burst factor testing, and pulp quality assessment. He analyzed recycling and water reuse systems, identifying opportunities for sustainable production improvement.`,

  `Additional Exposure: Krishna completed a Clinical Data Management Program at VIT Vellore by BCRI, covering GCP, ICH guidelines, data handling workflows, and regulatory compliance frameworks. He also visited STHREE Chemicals Pvt Ltd in 2024. He has self-directed industry knowledge of analytical instrumentation landscape: Agilent (GC, LC, MS), Thermo Fisher, Waters, Shimadzu; and tracking industry trends in sustainable biotechnology, circular economy applications, and digital transformation in life sciences marketing.`,

  // --- TECHNICAL PROJECTS ---
  `Technical Project: Healthcare Campaign Management System (4 camps, 2023–2025). Managed 1,104+ registrations resulting in 952 successful donations in approximately 7 hours — 86% conversion rate, highest university record. Executed multi-channel digital outreach via social media, campus networks, and hospital partnerships; reduced manual coordination by ~60%, saving 120+ man-hours per camp.`,

  `Technical Project: NSS Bus Attendance Automation System (2024–2025). Automated attendance tracking for 400+ volunteers across NSS rural camp operations, improving logistics accuracy by 85% and reducing manual errors significantly. Streamlined data collection and reporting workflows, enabling real-time visibility into volunteer deployment and transport coordination.`,

  `Technical Project: Drug Repurposing Tool (Bioinformatics). Integrated bioinformatics APIs to streamline drug repurposing workflows and improve candidate identification efficiency; created user-facing documentation and demo materials for stakeholder presentations. Live at rx-discover.vercel.app.`,

  `Technical Project: Token Generation System (Automation). Built a customizable QR/barcode-based token generation platform supporting bulk automated operations for institutional events. Live at token-generator-kappa.vercel.app.`,

  `Technical Project: Cake Ordering Platform (E-Commerce & Marketing). Developed an end-to-end e-commerce platform with automated pricing algorithms, payment integration, and admin analytics dashboard — skills directly transferable to digital commerce operations. Live at shopofkakes.vercel.app.`,
  
  `Technical Project: Dev-Vault — Secure Messaging Platform (Full-Stack Development). Built a secure, anonymous chatting platform with ephemeral messaging and vault-based access control for private developer communication. Live at dev-vault-henna.vercel.app.`,
  
  `Technical Project: Budget Tracker App (Mobile App Development). Developed a personal finance tracking application enabling users to log income, expenses, and visualize spending patterns through a clean mobile interface.`,

  `Technical Project: Personal Portfolio Website built with React and Vite, deployed on Vercel. Features elegant UI, sidebar navigation, resume integration, SplashCursor fluid animation, dark/light mode toggle, AI chat assistant, voice navigation, AI Resume Tailor. Live at gkrishnateja.vercel.app.`,

  // --- SKILLS ---
  `Molecular Biology Skills: PCR, Agarose Gel Electrophoresis, SDS-PAGE, Vector Ligation, DNA Isolation & Quantification, Restriction Enzyme Digestion.`,

  `Analytical Techniques: TLC, HPLC, UV-Vis Spectroscopy, GC (exposure), Bradford Protein Estimation, Antioxidant Assay (DPPH, ABTS), Lipid Estimation, Carbohydrate Estimation (Anthrone), Chromatography, Titrations, RBC & WBC Counting, GLP.`,

  `Microscopy & Cell Biology: Light Microscopy, Scanning Electron Microscopy (SEM), Cell Culture, Bacterial Culture, Media Preparation, Sterilization & Autoclaving, Plant Tissue Culture.`,

  `Bioinformatics Skills: UniProt, NCBI BLAST, PDB, KEGG, Primer-BLAST, REACTOME, STRING, Ensembl, GEO2R, Vaccine Design, Drug Repurposing APIs.`,

  `Business, Management & Operations Skills: Operations Execution, Financial Planning, Budget Management, Business Development, Market Research, Campaign Management, Leadership, GST & TDS Compliance, Vendor Negotiation, Procurement.`,

  `AI & Systems Development Skills: AI Tool Development, Prompt Engineering, API Integration, Automation using Google Apps Script, Workflow Design.`,

  `Clinical & Data Analysis Skills: MS Excel (Advanced — pivot tables, financial tracking, dashboards), Google Sheets Automation, Real-time Data Visualization, Clinical Data Handling, GCP, ICH Guidelines, Documentation Systems.`,

  `Web & Full-Stack Development Skills: Supabase (Auth, DB, Storage), MongoDB, Vercel, REST APIs, QR Code Generation, Payment Gateway Integration (GPay, QR).`,

  `App Development & Tools: Android Studio, React Native, VS Code, Figma, MS Office Suite, Google Workspace, Graphic design, Google Apps Script, Antigravity, Video Editing.`,

  `Languages: English (Fluent), Telugu (Native), Tamil (Conversational), Hindi (Basic).`,

  // --- LEADERSHIP ---
  `Leadership: Finance Manager for Riviera'25 & Riviera'26 (VIT's flagship cultural fest). Managed end-to-end finances for 150+ events over 4 days, overseeing a total budget of Rs. 7 crore. Handled vendor and artist payments; performed GST, TDS, and profit/loss analysis using structured Google Sheets financial systems.`,

  `Leadership: Blood Donation Camp In-Charge at NSS VIT (4 Camps, 2023–2025). Executed healthcare camps with 1,104+ registrations and 952 successful donations — the highest university record. Coordinated with hospitals and 950+ donors for smooth end-to-end operations.`,

  `Leadership: Krishna has a distinguished record with NSS Rural Camps across 4 different villages over 4 years: (1) NSS Rural Camp Volunteer in Thiruvalam (2023), (2) NSS Rural Camp Coordinator in Vandranthangal (2024), (3) NSS Rural Camp Organizer in Anaicut (2025), and (4) NSS Rural Camp Advisory in Kaniyambadi (2026). He has progressed from field volunteer to strategic advisory, managing logistics, team coordination, and community development programs for 400+ volunteers.`,

  `Leadership: Secretary, Board Member at NSS VIT (2024–2025). Led multiple social initiatives, events, and operational programs with measurable community impact at the institutional level.`,

  `Leadership: Purchase Coordinator and Broadcasting Volunteer for Gravitas'24 (VIT's annual technical fest, 2024). Handled procurement, vendor negotiations, and logistics, and supported live broadcasting operations during fest coverage.`,

  `Leadership: Student Organiser for VIT Biosummit (SBST Flagship Event, 2023 & 2024). Led cross-functional teams of 50+ members across outreach, documentation, design, technical, and social media functions, ensuring coordinated and efficient event operations.`,

  // --- ACHIEVEMENTS ---
  `Achievements: 100% Attendance Award from VIT Vellore in 2023 and 2025. EntrepreNATION — 2nd Prize (Entrepreneurship Competition); presented Biotechnological E-Waste Leaching System at National Entrepreneurship Day. Water Conservation Ideathon — 3rd Place. Digital Media & Content Strategy: Managed TIRUPATI UPDATES YouTube channel (1.4M subscribers) and Instagram (775K followers); executed content strategy, audience analytics, and monetization workflows.`,

  // --- CONTACT ---
  `Contact: Krishna can be reached at krishnatejareddy2003@gmail.com or +91-93908-50349. His address is Tiruvallur, Tamil Nadu, India. LinkedIn: linkedin.com/in/gkrishnateja. GitHub: github.com/krishnathejaofficial. Portfolio: gkrishnateja.vercel.app.`,

  // --- FAMILY & PERSONAL ---
  `Family: Krishna's mother is G. Vanitha, who is a dedicated housewife. His father was G. Vasu, a farmer, who unfortunately passed away on January 8, 2025. He has an elder brother, G. Pavan Krishna (born Dec 31, 1999), who completed his B.Tech in Mechanical Engineering from RMK Engineering College and is currently working in the software industry in Hyderabad.`,

  `Friends: Krishna's best friends include Chetana Aashritha (VIT Hyderabad, born Jan 1, 2004), Lokhitha (VIT, from Madurai, born Nov 24, 2004), Surendra (a close friend from 11th and 12th class), Supraja (from VIT, she is from Vellore, she was born in 6th july 2004), and school friends Gowtham and Gnanesh.`,

  // --- SOCIAL MEDIA & CONTENT CREATION ---
  `Social Media: Krishna is involved with a major YouTube channel named "TIRUPATI UPDATES" (https://youtube.com/@tirupathiupdates) which has over 1.4 million (14 lakh) subscribers. The channel was formerly known as "TIRUPATI TREKKING CLUB" and originally featured trekking videos from the Seshachalam forest, but now focuses on devotional content. He is also active on Instagram (@tirupathiupdates) with 775K followers. He executed content strategy, audience analytics, and monetization workflows for this channel. The main owner of the channel is his uncle (mother's brother), N. Madhu Kumar.`,

  // --- CAREER INTERESTS ---
  `Career Interests: Industrial Biotechnology, Pharmaceutical Operations, Healthcare Systems, Business Development, Operations Management, Market Research, Campaign Management, Analytical Instrumentation Marketing, Life Sciences Industry, Industry-Integrated Applied Research.`,

  // --- INDUSTRY KNOWLEDGE ---
  `Industry Knowledge: Krishna is familiar with the analytical instrumentation landscape including Agilent (GC, LC, MS), Thermo Fisher, Waters, and Shimadzu. He has understanding of pharma/biopharma QA/QC workflows and regulatory pathways. He tracks industry trends in sustainable biotechnology, circular economy applications, and digital transformation in life sciences marketing.`,

  // --- ACADEMIC RECORDS & GRADES ---
  `University Grade History (Integrated M.Sc. Biotechnology at VIT Vellore):
- Biological Science (Category: Biology, Grade: A, Score: 9, Credits: 3)
- Bioethics and Biosafety (Category: Biotechnology, Grade: A, Score: 9, Credits: 2)
- Chemistry (Category: Chemistry, Grade: A, Score: 9, Credits: 3)
- Chemistry Lab (Category: Chemistry, Grade: A, Score: 9, Credits: 1)
- Environmental Studies (Category: Environmental Science, Grade: A, Score: 9, Credits: 3)
- Effective English Communication (Category: Communication, Grade: B, Score: 8, Credits: 2)
- Mathematics (Category: Mathematics, Grade: B, Score: 8, Credits: 4)
- Physics (Category: Physics, Grade: A, Score: 9, Credits: 3)
- Physics Lab (Category: Physics, Grade: A, Score: 9, Credits: 1)
- Cell Biology (Category: Biology, Grade: A, Score: 9, Credits: 3)
- Molecular Biology (Category: Biology, Grade: A, Score: 9, Credits: 3)
- Cell and Molecular Biology Lab (Category: Biology, Grade: A, Score: 9, Credits: 2)
- Biochemistry (Category: Biochemistry, Grade: S, Score: 10, Credits: 3)
- Biochemistry Lab (Category: Biochemistry, Grade: S, Score: 10, Credits: 2)
- Industrial Unit Operations (Category: Industrial Biotechnology, Grade: B, Score: 8, Credits: 3)
- Industrial Unit Operations Lab (Category: Industrial Biotechnology, Grade: S, Score: 10, Credits: 1)
- Computer Programming : C (Category: Programming, Grade: A, Score: 9, Credits: 2)
- Computer Programming : C Lab (Category: Programming, Grade: S, Score: 10, Credits: 1)
- Technical English Communication (Category: Communication, Grade: A, Score: 9, Credits: 2)
- Technical English Communication Lab (Category: Communication, Grade: A, Score: 9, Credits: 1)
- Genetics (Category: Genetics, Grade: B, Score: 8, Credits: 3)
- Microbiology (Category: Microbiology, Grade: B, Score: 8, Credits: 3)
- Microbiology Lab (Category: Microbiology, Grade: A, Score: 9, Credits: 2)
- Genetic Engineering (Category: Genetic Engineering, Grade: B, Score: 8, Credits: 3)
- Genetic Engineering Lab (Category: Genetic Engineering, Grade: A, Score: 9, Credits: 2)
- Food Nutrition and Health (Category: Health Science, Grade: A, Score: 9, Credits: 3)
- Computer Programming: Python (Category: Programming, Grade: B, Score: 8, Credits: 2)
- Computer Programming: Python Lab (Category: Programming, Grade: B, Score: 8, Credits: 1)
- Technical Report Writing (Category: Communication, Grade: A, Score: 9, Credits: 1)
- Probability and Statistics (Category: Mathematics, Grade: C, Score: 7, Credits: 3)
- Probability and Statistics Lab (Category: Mathematics, Grade: S, Score: 10, Credits: 1)
- Bioinformatics (Category: Bioinformatics, Grade: B, Score: 8, Credits: 3)
- Bioinformatics Lab (Category: Bioinformatics, Grade: S, Score: 10, Credits: 2)
- Systems Biology (Category: Systems Biology, Grade: S, Score: 10, Credits: 4)
- Vaccinology (Category: Biotechnology, Grade: A, Score: 9, Credits: 3)
- Research Methodology (Category: Research, Grade: A, Score: 9, Credits: 3)
Grade mapping at VIT Vellore is: S = 10 (Outstanding), A = 9 (Excellent), B = 8 (Very Good), C = 7 (Good).`,

  `Intermediate Education Academic Profile (12th Class / Intermediate Public Examination):
- Board: Board of Intermediate Education, Andhra Pradesh, India.
- Stream: BiPC (Biology, Physics, Chemistry).
- Medium: English.
- Registered Number: 2105210109.
- Certificate Serial Number: U196689.
- Issue Date: 23-07-2021.
- Exam Session: March-2021.
- Total Marks Obtained: 954 out of 1000. Result Grade: A.
- Masked Aadhaar Number: 760215286226.
Subjects and Marks:
- English (Language): First Year 92, Second Year 94, Total 186.
- Sanskrit (Language): First Year 97, Second Year 98, Total 195.
- Botany (Biology): First Year 56, Second Year 57, Total 113.
- Zoology (Biology): First Year 58, Second Year 59, Total 117.
- Physics: First Year 60, Second Year 60, Total 120.
- Chemistry: First Year 52, Second Year 54, Total 106.
- Botany Practical: Second Year 30, Total 30.
- Zoology Practical: Second Year 30, Total 30.
- Physics Practical: Second Year 30, Total 30.
- Chemistry Practical: Second Year 27, Total 27.
Qualifications: Environmental Education (Qualified), Ethics and Human Values (Qualified).`,

  `Secondary School Certificate (SSC / 10th Class) Academic Profile:
- Board: Board of Secondary Education, Andhra Pradesh, India.
- Certificate Type: Regular Secondary School Certificate (SSC).
- Certificate Number: PC/19/18212/0390137/G4. Serial Number: SS 390137.
- Hall Ticket Number: 1919110004.
- Examination Year: March 2019. Result Date: 23-03-2003 (Note: date in certificate represents G. Krishna Teja's date of birth or result issue date).
- Medium: English.
- Overall GPA: 10.0 (Perfect 10 CGPA).
- School Name: MASTER'S EM/TM H S GANGAMITTA SATHYAVEDU, CHITTOOR DISTRICT.
Academic Performance (Subject-by-Subject Grades and Points):
- Telugu: Internal A1, External A1, Overall A1, Grade Points: 10.
- Hindi: Internal A1, External A1, Overall A1, Grade Points: 10.
- English: Internal A1, External A1, Overall A1, Grade Points: 10.
- Mathematics: Internal A1, External A1, Overall A1, Grade Points: 10.
- General Science: Internal A1, External A1, Overall A1, Grade Points: 10.
- Social Studies: Internal A1, External A1, Overall A1, Grade Points: 10.
Co-Curricular Grades:
- Value Education & Life Skills: A+
- Work & Computer Education: A+
- Art & Cultural Education: B
- Health & Physical Education: B
Identification Marks on Certificate:
- A black mole is on right middle finger.
- A black mole is on left middle finger.`
];

