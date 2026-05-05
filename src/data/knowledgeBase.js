// Knowledge base for RAG — derived from G. Krishna Teja's full resume
// Each entry is a self-contained chunk the LLM can use to answer questions

export const knowledgeChunks = [
  // --- BIO & OBJECTIVE ---
  `G. Krishna Teja was born on 23 March 2003. He is an Integrated M.Sc. Biotechnology student at VIT Vellore with a CGPA of 9.01 (as of 2025). He is passionate about Pharmaceutical Operations, Industrial Biotechnology, Healthcare Systems, and Business Development. He combines deep scientific knowledge with strong leadership, financial management, and automation-driven system-building skills.`,

  `Career objective: Seeking roles in pharmaceutical operations, industrial biotechnology, healthcare systems, and business development with long-term interest in industry-integrated applied research. He has demonstrated ability to deliver high-impact outcomes including managing Rs. 7 crore finances across 150+ events and executing 952 successful blood donations within approximately 7 hours — a university record.`,

  // --- EDUCATION ---
  `Education: Krishna completed his Integrated M.Sc. Biotechnology from Vellore Institute of Technology (VIT), Vellore from 2022 to 2027. His CGPA is 9.01. He received 100% Attendance Awards for 2 times in 2023 and 2025.`,

  `Education: He completed Intermediate (BiPC) from Sri Chaitanya Junior College, Vijayawada from 2019 to 2021, scoring 96% (954/1000).`,

  `Education: He completed his 10th class/Secondary School Certificate (SSC) from Masters EM High School, Sathyavedu, Tirupati district, Andhra Pradesh in 2018-2019, achieving a perfect GPA of 10.0. For this achievement, he was selected for the prestigious Prathiba Award from the Andhra Pradesh Government.`,

  // --- RESEARCH ---
  `Research: Krishna worked on Fruit Peel-Based Sustainable Aquafeed Development at VIT Vellore (SBST) from Jun 2025 to Apr 2026 under Dr. R. Sudhakaran. He designed and optimized aquafeed formulations utilizing orange (Citrus sinensis) and pomegranate (Punica granatum) agro-industrial waste as sustainable alternatives to fishmeal. He performed comprehensive biochemical characterization including protein estimation (Bradford, BCA, Lowry), carbohydrates (Anthrone), lipids (Bligh & Dyer), and antioxidant activity (DPPH). He critically analyzed polyphenol interference in the Bradford protein assay, proposing alternative quantification strategies. He developed multiple feed formulations (F0–F6/F9) with varying peel compositions, evaluated water stability using binders like tapioca starch (which demonstrated superior pellet integrity >24h) and sodium alginate, assessed palatability in crab models, and achieved floatability via hot-air puffing and CMC incorporation. This established a circular bioeconomy framework by converting fruit waste into cost-effective, antioxidant-rich aquafeed for scalable aquaculture.`,

  `Research: Krishna worked on a Multidisciplinary Biotechnological E-Waste Leaching System at VIT Vellore (presented at EntreprenaTION, Sept 2025) under Dr. Anand Prem Rajan. He designed a closed-loop, microbe-driven bioleaching system for recovering valuable metals (Au, Ag, Cu, Al, rare elements) from e-waste like PCBs and cables. He developed an integrated process workflow including dismantling, microbial leaching in a bioreactor, electrolysis-based metal recovery, and downstream material segregation. He incorporated real-time monitoring using inline sensing to track leaching efficiency and engineered value-added plastic upcycling pathways, converting shredded plastics into functional products like plant pots. This eco-friendly alternative to conventional smelting reduces chemical usage, energy demand, and toxic emissions, featuring a scalability model with modular bioreactors and community-based e-waste sourcing.`,

  `Manuscripts: Krishna has two manuscripts under preparation (2026): (1) Transcriptomic & Immunological Impact of Synthetic Food Colorants and Additives on the Human Gut. (2) Organic, Innovative, and Eco-friendly Feeds for Aquaculture.`,

  // --- INTERNSHIPS ---
  `Internship: Krishna was an Industrial Intern at Glory Pharma Chem India Pvt Ltd in June–July 2025. He observed and assisted in GMP-compliant manufacturing of pharmaceutical intermediates (Rec SA Lamivudine) involving reactor processing, filtration, centrifugation, drying, and milling. He participated in quality control (QC) testing, including moisture analysis, pH measurement, carbon residue testing, and exposure to gas chromatography for residual solvent analysis. He assisted in equipment cleaning and SOP-based operations, gaining exposure to QA documentation, batch records, warehouse operations, and EHS practices. Through this, he gained a practical understanding of pharmaceutical manufacturing workflows, GMP, regulatory standards (WHO, ICH, CDSCO), and the importance of inter-departmental coordination (Production-QC-QA-EHS).`,

  `Internship: Krishna was an Industrial Intern in the Paper Mill Division at GSK Technologies Pvt Ltd in May–June 2024. He observed and analyzed the end-to-end paper manufacturing process, including pulping, filtration, steam-based processing, paper formation, drying, rolling, and packaging. He studied the operation of key industrial equipment like pulper machines, heat exchangers, boilers, and rewinders. He participated in quality control procedures including GSM measurement, burst factor testing, and pulp consistency. He also examined waste management systems, paper recycling, and water treatment/reuse processes. This provided a strong foundation in bioprocess engineering, process flow analysis, and sustainable industrial practices.`,

  `Additional Exposure: Krishna completed a Clinical Data Management Program at VIT Vellore by BCRI, covering GCP, ICH guidelines, data handling workflows, and regulatory compliance frameworks. He also visited STHREE Chemicals Pvt Ltd in 2024 and acquired practical understanding of chemical manufacturing operations, warehouse management, and QA protocols.`,

  // --- TECHNICAL PROJECTS ---
  `Technical Project: Blood Donation Management System (4 camps, 2023–2025). Managed 1,104+ registrations resulting in 952 successful donations in approximately 7 hours — the highest university record. Reduced manual coordination effort by ~60% through real-time tracking, digital registration, and automated reporting using Google Apps Script and Google Sheets.`,

  `Technical Project: NSS Bus Attendance Automation System (2024–2025). Automated attendance tracking for 400+ volunteers across NSS rural camp operations using Google Sheets automation. This reduced manual errors and improved logistics accuracy with real-time visibility into volunteer deployment and transport coordination.`,

  `Technical Project: Drug Repurposing Tool (Bioinformatics). Integrated bioinformatics APIs to streamline drug repurposing workflows and improve candidate identification efficiency.`,

  `Technical Project: Token Generation System (Automation). Built a customizable QR/barcode-based token generation platform supporting bulk automated operations for institutional events.`,

  `Technical Project: Cake Ordering Platform (Full-Stack Development). Developed an end-to-end e-commerce platform featuring automated pricing, payment integration, and an admin management dashboard.`,
  
  `Technical Project: Secret Chatting "dev-vault" (Full-Stack App). Developed a secure, real-time messaging platform enabling confidential communication and secret chatting features.`,
  
  `Technical Project: Budget Tracker App (Finance App). Built a personal finance application to effectively track expenses, manage budgets, and visualize financial data.`,

  `Technical Project: Personal Portfolio Website built with React and Vite, deployed on Vercel. Features elegant UI, sidebar navigation, resume integration, SplashCursor fluid animation, dark/light mode toggle. Live at gkrishnateja.vercel.app.`,

  // --- SKILLS ---
  `Molecular Biology Skills: PCR, Agarose Gel Electrophoresis, SDS-PAGE, Vector Ligation, DNA Isolation & Quantification, Restriction Enzyme Digestion.`,

  `Analytical Techniques: TLC, UV-Vis Spectroscopy, Bradford Protein Estimation, Antioxidant Assay (DPPH, ABTS), Lipid Estimation, Carbohydrate Estimation, Chromatography, Titrations, RBC & WBC Counting, GLP.`,

  `Microscopy & Cell Biology: Light Microscopy, Scanning Electron Microscopy (SEM), Transmission Electron Microscopy (TEM), Cell Culture, Bacterial Culture, Media Preparation, Sterilization & Autoclaving, Plant Tissue Culture.`,

  `Bioinformatics Skills: UniProt, NCBI BLAST, PDB, KEGG, Primer-BLAST, REACTOME, STRING, Ensembl, GEO2R, Vaccine Design, Drug Repurposing APIs.`,

  `Business, Management & Operations Skills: Operations Execution, Financial Planning, Budget Management, Business Development, Leadership, GST & TDS Compliance, Vendor Negotiation, Procurement.`,

  `AI & Systems Development Skills: AI Tool Development, Prompt Engineering, API Integration, Automation using Google Apps Script, Workflow Design.`,

  `Clinical & Data Analysis Skills: MS Excel (Advanced — pivot tables, financial tracking, dashboards), Google Sheets Automation, Real-time Data Visualization, Clinical Data Handling, GCP, ICH Guidelines, Documentation Systems.`,

  `Web & App Development Skills: App Development, Supabase (Auth, DB, Storage), Vercel, REST APIs, QR Code Generation, Payment Gateway Integration (GPay, QR).`,

  `Programming & Tools: Android Studio, R, HTML (Basic), VS Code, Figma, MS Office Suite, Google Workspace, Canva, PowerPoint, Google Apps Script, Video Editing.`,

  `Languages: English (Fluent), Telugu (Native), Tamil (Conversational), Hindi (Basic).`,

  // --- LEADERSHIP ---
  `Leadership: Finance Manager for Riviera'25 & Riviera'26 (VIT's flagship cultural fest). Managed end-to-end finances for 150+ events over 4 days, overseeing a total budget of Rs. 7 crore. Handled vendor and artist payments; performed GST, TDS, and profit/loss analysis using structured Google Sheets financial systems.`,

  `Leadership: Blood Donation Camp In-Charge at NSS VIT (4 Camps, 2023–2025). Executed healthcare camps with 1,104+ registrations and 952 successful donations — the highest university record. Coordinated with hospitals and 950+ donors for smooth end-to-end operations.`,

  `Leadership: Krishna has a distinguished record with NSS Rural Camps across 4 different villages over 4 years: (1) NSS Rural Camp Volunteer in Thiruvalam (2023), (2) NSS Rural Camp Coordinator in Vandranthangal (2024), (3) NSS Rural Camp Organizer in Anaicut (2025), and (4) NSS Rural Camp Advisory in Kaniyambadi (2026). He has progressed from field volunteer to strategic advisory, managing logistics, team coordination, and community development programs for 400+ volunteers.`,

  `Leadership: Secretary, Board Member at NSS VIT (2024–2025). Led multiple social initiatives, events, and operational programs with measurable community impact at the institutional level.`,

  `Leadership: Purchase Coordinator and Broadcasting Volunteer for Gravitas'24 (VIT's annual technical fest, 2024). Handled procurement, vendor negotiations, and logistics, and assisted in broadcasting operations.`,

  `Leadership: Student Organiser for VIT Biosummit (SBST Flagship Event, 2023 & 2024). Led cross-functional execution across outreach, documentation, design, technical, and social media teams.`,

  // --- ACHIEVEMENTS ---
  `Achievements: 100% Attendance Award from VIT Vellore in 2023 and 2025. EntrepreNATION — 2nd Prize (Entrepreneurship Competition). Water Conservation Ideathon — 3rd Place.`,

  // --- CONTACT ---
  `Contact: Krishna can be reached at krishnatejareddy2003@gmail.com or +91-93908-50349. His address is 4/335 A, 23 Budur, Gummidipoondi TK, Madharapakkam, Tiruvallur, Tamil Nadu - 601202, India. LinkedIn: linkedin.com/in/gkrishnateja. GitHub: github.com/krishnathejaofficial. Portfolio: gkrishnateja.vercel.app.`,

  // --- FAMILY & PERSONAL ---
  `Family: Krishna's mother is G. Vanitha, who is a dedicated housewife. His father was G. Vasu, a farmer, who unfortunately passed away on January 8, 2025. He has an elder brother, G. Pavan Krishna (born Dec 31, 1999), who completed his B.Tech in Mechanical Engineering from RMK Engineering College and is currently working in the software industry in Hyderabad.`,

  `Friends: Krishna's best friends include Chetana Aashritha (VIT Hyderabad, born Jan 1, 2004), Lokhitha (VIT, from Madurai, born Nov 24, 2004), Surendra (a close friend from 11th and 12th class), Supraja (from VIT, she is from Vellore, she was born in 6th july 2004), and school friends Gowtham and Gnanesh.`,

  // --- SOCIAL MEDIA & CONTENT CREATION ---
  `Social Media: Krishna is involved with a major YouTube channel named "TIRUPATHI UPDATES" (https://youtube.com/@tirupathiupdates) which has over 14 lakh subscribers. The channel was formerly known as "TIRUPATI TREKKING CLUB" (changed due to naming issues) and originally featured trekking videos from the Seshachalam forest, but now focuses on devotional content. He is also active on Instagram (@tirupathiupdates) with 768k followers. The main owner of the channel is his uncle (mother's brother), N. Madhu Kumar.`,

  // --- CAREER INTERESTS ---
  `Career Interests: Industrial Biotechnology, Pharmaceutical Operations, Healthcare Systems, Business Development, Operations Management, Industry-Integrated Applied Research.`,
];
