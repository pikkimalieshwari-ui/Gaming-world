import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface UserRecord {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'owner' | 'member';
  department?: string;
  isFired: boolean;
  blockedUntil?: number | null; // Timestamp in ms
  joinedAt: string;
  avatarColor: string;
  password?: string;
  isApproved?: boolean;
  approvalStatus?: 'pending' | 'accepted' | 'rejected';
}

interface LocationRecord {
  lat: number;
  lng: number;
  address?: string;
  mapUrl: string;
}

interface MessageRecord {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'owner' | 'member';
  text: string;
  timestamp: string;
  attachment?: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: string;
  };
  location?: LocationRecord;
}

interface NewsRecord {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  summary: string;
  category: 'world' | 'technology' | 'science' | 'space' | 'business' | 'environment';
  imageUrl: string;
  readTime: string;
  audioText: string;
  isBreaking?: boolean;
  url?: string;
  audioDurationSec?: number;
}

interface KnowledgeRecord {
  id: string;
  category: 'tesla' | 'physics' | 'nasa' | 'isro';
  headline: string;
  summary: string;
  fullExplanation: string;
  publishedAt: string;
  source: string;
  status: 'Confirmed Mission' | 'Peer-Reviewed Discovery' | 'Official Announcement' | 'Technology Milestone';
  imageUrl: string;
  tags: string[];
  keyFacts: string[];
  readMoreUrl?: string;
}

interface FeatureFlagsRecord {
  chat: boolean;
  browser: boolean;
  youtube: boolean;
  news: boolean;
  knowledge: boolean;
  calculator: boolean;
  calendar: boolean;
  clock: boolean;
}

interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  date: string;
  createdBy: string;
  isUrgent?: boolean;
  active?: boolean;
}

interface ActivityLogRecord {
  id: string;
  type: 'auth' | 'admin' | 'chat' | 'news' | 'security';
  description: string;
  timestamp: string;
  userEmail?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

// Default Seed Data (Reset cleanly with single Owner Manoj X)
let usersStore: UserRecord[] = [
  {
    id: "usr_owner_primary",
    email: "pikkimalieshwari@gmail.com",
    phone: "+15550100000",
    name: "Manoj X",
    role: "owner",
    department: "Executive Authority",
    isFired: false,
    joinedAt: new Date().toISOString(),
    avatarColor: "from-zinc-100 to-zinc-400",
    password: "Manoj X",
    isApproved: true,
    approvalStatus: "accepted"
  }
];

let messagesStore: MessageRecord[] = [];

let featureFlagsStore: FeatureFlagsRecord = {
  chat: true,
  browser: true,
  youtube: true,
  news: true,
  knowledge: true,
  calculator: true,
  calendar: true,
  clock: true,
};

let announcementsStore: AnnouncementRecord[] = [
  {
    id: "ann_1",
    title: "MK creative X Global Portal Upgrade",
    content: "International Audio News stream with synthetic speech playback and I-Know verified scientific knowledge intelligence hubs are now live across all member nodes.",
    date: new Date().toISOString(),
    createdBy: "Executive HQ",
    isUrgent: true,
    active: true
  },
  {
    id: "ann_2",
    title: "Server Security Protocol 2026",
    content: "100MB high-speed file attachments and GPS coordinate pinpointing enabled for secure encrypted chat channels.",
    date: new Date(Date.now() - 86400000).toISOString(),
    createdBy: "Primary Owner",
    isUrgent: false,
    active: true
  }
];

let newsStore: NewsRecord[] = [
  {
    id: "news_1",
    headline: "Global Clean Energy Grid Surpasses Historic 40% Generation Milestone",
    source: "International Energy Agency / Reuters",
    publishedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    summary: "Renewable energy sources including next-generation solar arrays, offshore wind corridors, and industrial battery energy storage installations provided over 40% of global electricity demand this quarter.",
    category: "environment",
    imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80",
    readTime: "3 min read",
    audioText: "Global Clean Energy Grid Surpasses Historic 40% Generation Milestone. According to the International Energy Agency, renewable energy deployments across five continents have achieved unprecedented grid stability, driven by industrial scale battery systems and utility solar expansion.",
    isBreaking: true,
    url: "https://www.iea.org/reports/renewables-2024",
    audioDurationSec: 42
  },
  {
    id: "news_2",
    headline: "Breakthrough High-Tc Superconducting Qubit Processor Achieves 99.9% Quantum Gate Fidelity",
    source: "Nature Quantum Science / MIT Review",
    publishedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    summary: "Physicists have demonstrated continuous fault-tolerant quantum error correction running on a 256-qubit array with physical gate fidelities exceeding 99.9%, paving the way for commercially practical cryptographic simulations.",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 min read",
    audioText: "Breakthrough High-Tc Superconducting Qubit Processor Achieves 99.9% Quantum Gate Fidelity. Quantum researchers have achieved a monumental benchmark in error suppression, operating continuous topological quantum correction circuits without thermal decoherence.",
    isBreaking: false,
    url: "https://www.nature.com/subjects/quantum-physics",
    audioDurationSec: 48
  },
  {
    id: "news_3",
    headline: "Deep Space Optical Laser Transceiver Streams Ultra-HD Video from 300 Million Kilometers",
    source: "Space Science Daily / Jet Propulsion Laboratory",
    publishedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    summary: "NASA's Deep Space Optical Communications experiment beamed high-bandwidth scientific telemetry and 4K optical video across interplanetary distances at 267 megabits per second, exceeding traditional radio frequency limits by 100x.",
    category: "space",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 min read",
    audioText: "Deep Space Optical Laser Transceiver Streams Ultra-HD Video from 300 Million Kilometers. The optical downlink successfully transmitted ultra high definition scientific imagery back to Earth from the Psyche spacecraft, establishing next-generation interplanetary broadband.",
    isBreaking: true,
    url: "https://www.nasa.gov/technology",
    audioDurationSec: 45
  },
  {
    id: "news_4",
    headline: "Global Central Banks Deploy Unified Interoperable ISO-20022 Cross-Border Settlement Network",
    source: "Financial Times / Bank for International Settlements",
    publishedAt: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
    summary: "Multinational banking regulators finalized Project Agora, connecting wholesale central bank digital ledgers with commercial liquidity hubs for real-time instantaneous settlement across major global currency corridors.",
    category: "business",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    readTime: "3 min read",
    audioText: "Global Central Banks Deploy Unified Interoperable Cross-Border Settlement Network. The Bank for International Settlements alongside forty international commercial financial institutions has integrated ISO-20022 tokenized multi-currency settlement rails for zero-counterparty risk transactions.",
    isBreaking: false,
    url: "https://www.bis.org",
    audioDurationSec: 50
  },
  {
    id: "news_5",
    headline: "Antarctic Ice-Shelf Micro-Drone Fleet Completes Sub-Glacial Hydrothermal Mapping",
    source: "Science Advances / British Antarctic Survey",
    publishedAt: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
    summary: "Autonomous underwater gliders equipped with acoustic sensors penetrated beneath the Ross Ice Shelf, returning unprecedented data on deep sub-oceanic circulation and geothermal heat flux dynamics.",
    category: "science",
    imageUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
    readTime: "5 min read",
    audioText: "Antarctic Ice-Shelf Micro-Drone Fleet Completes Sub-Glacial Hydrothermal Mapping. Autonomous gliders exploring underneath the Antarctic ice shelves have delivered real-time hydrothermal flux maps, improving planetary climate forecasting accuracy by twelve percent.",
    isBreaking: false,
    url: "https://www.bas.ac.uk",
    audioDurationSec: 44
  },
  {
    id: "news_6",
    headline: "Global Semiconductor Alliance Unveils 1.4-Nanometer Gate-All-Around Lithography Nodes",
    source: "EE Times / Tech World",
    publishedAt: new Date(Date.now() - 1000 * 60 * 430).toISOString(),
    summary: "Next-generation High-NA Extreme Ultraviolet lithography machines have entered pilot foundry production, integrating backside power delivery networks and nanosheet transistors with 30% higher computing efficiency.",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 min read",
    audioText: "Global Semiconductor Alliance Unveils 1.4-Nanometer Gate-All-Around Lithography Nodes. Advanced High-NA EUV lithography systems have commenced silicon pilot production, setting new benchmarks for compute density in neural computing accelerators.",
    isBreaking: false,
    url: "https://www.eetimes.com",
    audioDurationSec: 46
  }
];

let knowledgeStore: KnowledgeRecord[] = [
  {
    id: "know_tesla_1",
    category: "tesla",
    headline: "Tesla Optimus Gen-3 Humanoid Architecture & 22-DoF Tactile Dexterity Actuators",
    summary: "Optimus Gen-3 integrates end-to-end neural network visual processing running directly on dual Tesla Hardware 4 computer modules, enabling real-time autonomous part sorting and warehouse navigation without hardcoded kinematic trajectories.",
    fullExplanation: "Tesla's humanoid robotics program has achieved a critical engineering milestone with the introduction of Gen-3 Optimus. Featuring 22 degrees-of-freedom in each multi-articulated hand and tactile sensor arrays with millisecond pressure feedback, Optimus operates completely on vision-based occupancy networks. The robot utilizes the same foundational Transformer architectures developed for Full Self-Driving (FSD), translating egocentric video streams directly into actuator torque commands. Over 1,000 units are currently undergoing continuous industrial validation within Tesla's Gigafactory production cells.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    source: "Tesla Official Engineering / AI Day Updates",
    status: "Technology Milestone",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    tags: ["Optimus", "Robotics", "Neural Networks", "Hardware 4", "Actuators"],
    keyFacts: [
      "22 Degrees of Freedom per hand with integrated tactile fingertip pressure arrays.",
      "Dual HW4 inference computers operating on 2.3 kWh custom structural battery pack.",
      "Fully end-to-end vision-to-action neural networks with zero teleoperation delay.",
      "Continuous industrial deployment in Gigafactory battery pack and stamping lines."
    ],
    readMoreUrl: "https://www.tesla.com/AI"
  },
  {
    id: "know_tesla_2",
    category: "tesla",
    headline: "Tesla 4680 Dry Battery Electrode Process Scales to Massive Gigafactory Volume",
    summary: "The revolutionary dry electrode coating process eliminates massive solvent baking ovens, reducing capital expenditure by 45% while boosting volumetric energy density to 285 Wh/kg.",
    fullExplanation: "Tesla's 4680 cylindrical cell manufacturing breakthrough centers on the complete elimination of NMP chemical solvents. By utilizing a dry powder polymer binder that is sheared into a cohesive active material film, cathode and anode coils are produced with minimal footprint and zero toxic emissions. The tabless architecture reduces internal electrical resistance by 5x, preventing localized hot spots during 350kW rapid charging loops and unlocking lower cost-per-kilowatt-hour thresholds across vehicle lines.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    source: "Tesla Gigafactory Texas Battery Labs",
    status: "Confirmed Mission",
    imageUrl: "https://images.unsplash.com/photo-1558441719-8b449c6ff670?auto=format&fit=crop&w=1200&q=80",
    tags: ["4680 Cell", "Dry Electrode", "Battery Tech", "Gigafactory", "Tabless"],
    keyFacts: [
      "45% reduction in production facility square footage and 50% energy footprint reduction.",
      "Tabless current collector geometry enables rapid 10-80% charging in under 18 minutes.",
      "Structural battery pack integrates with front and rear high-pressure gigacastings.",
      "Production scaled beyond 100 million cylindrical cells manufactured at Gigafactory Texas."
    ],
    readMoreUrl: "https://www.tesla.com"
  },
  {
    id: "know_physics_1",
    category: "physics",
    headline: "Controlled Thermonuclear Fusion Achieves Consistent Net Energy Gain Exceeding Q > 2.1",
    summary: "Inertial confinement fusion experiments utilizing 2.05 megajoules of laser energy generated 4.3 megajoules of fusion yield, confirming repeatable ignition and self-sustaining alpha-particle heating.",
    fullExplanation: "At the National Ignition Facility (NIF) and collaborating magnetic confinement facilities, laser energy compression on cryogenic deuterium-tritium fuel targets has officially achieved robust ignition thresholds. The experimental target chamber focused 192 ultra-precise laser beams into a gold hohlraum, creating a symmetrical X-ray bath that compressed the fuel capsule to densities twenty times greater than lead. For the first time, alpha-particle self-heating overcame thermal bremsstrahlung radiation losses, proving that laboratory fusion can provide net-positive energy amplification.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    source: "Physical Review Letters / Lawrence Livermore",
    status: "Peer-Reviewed Discovery",
    imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80",
    tags: ["Nuclear Fusion", "Ignition", "Plasma Physics", "Alpha Heating", "Clean Energy"],
    keyFacts: [
      "Fusion yield: 4.30 Megajoules generated from 2.05 Megajoules input laser drive.",
      "Target reached internal core temperatures exceeding 100 million degrees Celsius.",
      "Self-heating alpha particles sustained thermonuclear burn propagation.",
      "Validates commercial magnet-inertial confinement power plant design parameters."
    ],
    readMoreUrl: "https://lasers.llnl.gov"
  },
  {
    id: "know_physics_2",
    category: "physics",
    headline: "Observation of Non-Abelian Anyons & Topological Quantum Braiding in 2D Superconductors",
    summary: "Experimental physicists have directly observed non-Abelian Majorana zero modes whose braided quantum trajectories retain non-local topological memory impervious to ambient thermal decoherence.",
    fullExplanation: "Unlike standard bosons or fermions, two-dimensional non-Abelian anyons possess quantum wavefunctions that depend not merely on their spatial positions, but on the topological history of how they have been braided around one another. Utilizing hybrid semiconductor-superconductor nanowires in ultralow dilution refrigerators, researchers braided six Majorana zero modes, demonstrating unitary non-commutative matrix operations. This directly proves the physical foundation of topologically protected quantum computing, which promises error-free computation without massive active error-correction overhead.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    source: "Nature Physics / CERN Collaborative",
    status: "Peer-Reviewed Discovery",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    tags: ["Quantum Physics", "Majorana", "Topological Braiding", "Condensed Matter"],
    keyFacts: [
      "First direct observation of non-commutative topological quantum braiding operations.",
      "Hardware-level protection against local electromagnetic interference and phase decay.",
      "Fabricated using epitaxial indium arsenide and aluminum single-crystal interfaces.",
      "Published across global physics consortia with verified multi-lab reproducibility."
    ],
    readMoreUrl: "https://www.nature.com/nphys"
  },
  {
    id: "know_nasa_1",
    category: "nasa",
    headline: "NASA Artemis II Crewed Lunar Flyby Architecture & Orion Life Support Validation",
    summary: "The four-astronaut Artemis II crew will embark on a 10-day translunar trajectory test flight aboard the Space Launch System (SLS) and Orion capsule, marking humanity's return to the Moon's vicinity.",
    fullExplanation: "NASA's Artemis II mission represents the first crewed flight of the SLS mega-rocket and the European Service Module-powered Orion spacecraft. The mission profile executes a high Earth orbit staging maneuver before burning into a free-return translunar injection trajectory that will take the crew approximately 10,300 kilometers beyond the far side of the Moon. Key milestones include manual proximity operations testing, full metabolic life support verification, deep space radiation telemetry, and a high-velocity 40,000 km/h skip re-entry through Earth's atmosphere.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    source: "NASA Kennedy Space Center / Artemis Program",
    status: "Confirmed Mission",
    imageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    tags: ["Artemis II", "Moon", "SLS", "Orion", "Crewed Spaceflight"],
    keyFacts: [
      "Crew of four astronauts: Reid Wiseman, Victor Glover, Christina Koch, and Jeremy Hansen.",
      "Translunar free-return trajectory extending 10,300 km past the lunar far side.",
      "Validates critical Orion Environmental Control and Life Support Systems (ECLSS).",
      "SLS Block 1 generates 8.8 million pounds of maximum thrust at liftoff."
    ],
    readMoreUrl: "https://www.nasa.gov/artemis-ii"
  },
  {
    id: "know_nasa_2",
    category: "nasa",
    headline: "NASA Europa Clipper En Route to Jupiter with Ice-Penetrating Radar & Mass Spectrometers",
    summary: "The largest planetary science spacecraft ever built by NASA is traveling to Jupiter's icy moon Europa to determine if subsurface saltwater oceans possess conditions favorable for extraterrestrial life.",
    fullExplanation: "Europa Clipper is currently coasting on an interplanetary trajectory featuring gravity assist flybys of Mars and Earth before entering Jovian orbit. Equipped with massive solar array wings spanning 30 meters, the probe carries nine dedicated scientific instruments including the REASON dual-frequency ice-penetrating radar, the MASPEX high-resolution gas mass spectrometer, and thermal infrared sensors. Clipper will perform nearly 50 close flybys of Europa at altitudes as low as 25 kilometers, scanning the global ocean beneath its 20-kilometer ice crust.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    source: "NASA Jet Propulsion Laboratory / Caltech",
    status: "Official Announcement",
    imageUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=80",
    tags: ["Europa Clipper", "Jupiter", "Astrobiology", "JPL", "Ocean Worlds"],
    keyFacts: [
      "Spacecraft mass: 6,000 kg with solar panels spanning over 30.5 meters across.",
      "Carries 9 suite instruments including radar sounding through 30km thick ice shelves.",
      "Conducts 49 dedicated low-altitude flybys protected by a titanium radiation vault.",
      "Primary objective: determine habitability and chemical biosignature presence."
    ],
    readMoreUrl: "https://europa.nasa.gov"
  },
  {
    id: "know_isro_1",
    category: "isro",
    headline: "ISRO Gaganyaan Crewed Orbital Flight Module Completes Pad Abort & Parachute Drops",
    summary: "The Indian Space Research Organisation has verified the Crew Escape System (CES), environmental life support, and multi-stage drogue deceleration parachutes for the upcoming Gaganyaan human spaceflight mission.",
    fullExplanation: "ISRO's flagship human spaceflight mission Gaganyaan will launch three vyomnauts into a 400-kilometer low Earth orbit for a 3-day operational mission aboard the human-rated LVM3 (HLVM3) launch vehicle. The spacecraft consists of an unpressurized Service Module and a habitable Crew Module equipped with life support systems, avionics, and thermal protection tiles capable of withstanding 2,000 degrees Celsius re-entry temperatures. Integrated drop tests in the Bay of Bengal validated the main ring-sail parachute array and sea recovery protocols.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    source: "ISRO Satish Dhawan Space Centre (SDSC-SHAR)",
    status: "Confirmed Mission",
    imageUrl: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80",
    tags: ["Gaganyaan", "ISRO", "Human Spaceflight", "HLVM3", "Vyomnauts"],
    keyFacts: [
      "Human-rated LVM3 vehicle with re-engineered solid S200 and cryogenic C25 stages.",
      "3-member crew capsule equipped with indigenously developed ECLSS atmospheric control.",
      "High-altitude parachute tests validated soft splashdown deceleration under 8.5 m/s.",
      "Designated landing recovery zone pre-configured with the Indian Navy in the Arabian Sea."
    ],
    readMoreUrl: "https://www.isro.gov.in/Gaganyaan.html"
  },
  {
    id: "know_isro_2",
    category: "isro",
    headline: "ISRO Chandrayaan-4 Lunar Sample Return Architecture & Modular Docking Design",
    summary: "Chandrayaan-4 will execute India's first lunar sample return mission utilizing a multi-module stack consisting of a Lander, Ascender, Transfer Module, and Earth Re-entry Capsule.",
    fullExplanation: "Building upon the monumental success of Chandrayaan-3's south polar landing, ISRO has finalized the Chandrayaan-4 lunar sample return architecture. The mission will launch across dual LVM3 launches with automated rendezvous and docking in lunar orbit. The robotic lander will core drill up to 2 meters into the lunar regolith near the Shiv Shakti Point, transfer the hermetically sealed samples into the ascent module, and rendezvous with the Earth return propulsion module for high-speed recovery.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    source: "ISRO Vikram Sarabhai Space Centre (VSSC)",
    status: "Confirmed Mission",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Chandrayaan-4", "ISRO", "Lunar Sample Return", "Moon", "Robotic Drilling"],
    keyFacts: [
      "Multi-stage architecture: Propulsion, Lander, Ascender, Transfer, and Re-entry modules.",
      "Autonomous core drilling and robotic arm regolith retrieval up to 2.5 kg payload.",
      "Demonstrates precision automated docking in lunar orbit prior to Earth trajectory insertion.",
      "Targeted landing region near water-ice rich lunar south polar permanently shadowed craters."
    ],
    readMoreUrl: "https://www.isro.gov.in"
  }
];

let activityLogsStore: ActivityLogRecord[] = [
  {
    id: "log_1",
    type: "admin",
    description: "System initialized with high-availability persistence and verified knowledge hubs.",
    timestamp: new Date().toISOString(),
    userEmail: "pikkimalieshwari@gmail.com"
  },
  {
    id: "log_2",
    type: "news",
    description: "International Audio News feeds updated with live voice scripts.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  }
];

let ownerBlockedUntil: number | null = null;

// Persistence Helper Functions
function loadStoreFromDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data.usersStore)) {
        usersStore = data.usersStore.map((u: any) => {
          const isOwner = u.role === 'owner' || u.email?.toLowerCase() === 'pikkimalieshwari@gmail.com' || u.email?.toLowerCase() === 'owner@mkcreativex.com';
          return {
            ...u,
            role: isOwner ? 'owner' : (u.role || 'member'),
            isApproved: u.isApproved !== undefined ? u.isApproved : true,
            approvalStatus: u.approvalStatus || (u.isApproved === false ? 'pending' : 'accepted'),
          };
        });
      }
      if (Array.isArray(data.messagesStore)) messagesStore = data.messagesStore;
      if (Array.isArray(data.newsStore)) newsStore = data.newsStore;
      if (Array.isArray(data.knowledgeStore)) knowledgeStore = data.knowledgeStore;
      if (Array.isArray(data.announcementsStore)) announcementsStore = data.announcementsStore;
      if (data.featureFlagsStore) featureFlagsStore = { ...featureFlagsStore, ...data.featureFlagsStore };
      if (Array.isArray(data.activityLogsStore)) activityLogsStore = data.activityLogsStore;
      if (typeof data.ownerBlockedUntil === "number" || data.ownerBlockedUntil === null) {
        ownerBlockedUntil = data.ownerBlockedUntil;
      }
      console.log("Database successfully loaded from disk.");
    } else {
      saveStoreToDisk();
    }
  } catch (err) {
    console.error("Failed loading store from disk:", err);
  }
}

function saveStoreToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = {
      usersStore,
      messagesStore,
      newsStore,
      knowledgeStore,
      announcementsStore,
      featureFlagsStore,
      activityLogsStore,
      ownerBlockedUntil,
      lastSavedAt: new Date().toISOString()
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed saving store to disk:", err);
  }
}

function logActivity(type: 'auth' | 'admin' | 'chat' | 'news' | 'security', description: string, userEmail?: string) {
  const newLog: ActivityLogRecord = {
    id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    type,
    description,
    timestamp: new Date().toISOString(),
    userEmail
  };
  activityLogsStore.unshift(newLog);
  if (activityLogsStore.length > 200) activityLogsStore.pop();
  saveStoreToDisk();
}

// Initial Load
loadStoreFromDisk();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 110MB payload for 100MB file attachments
  app.use(express.json({ limit: "110mb" }));
  app.use(express.urlencoded({ extended: true, limit: "110mb" }));

  // Helper to check lockout
  const getLockoutStatus = () => {
    const now = Date.now();
    if (ownerBlockedUntil && now < ownerBlockedUntil) {
      const remainingSeconds = Math.ceil((ownerBlockedUntil - now) / 1000);
      return { isBlocked: true, remainingSeconds, blockedUntil: ownerBlockedUntil };
    }
    ownerBlockedUntil = null;
    return { isBlocked: false, remainingSeconds: 0, blockedUntil: null };
  };

  // Helper to check if user is currently blocked or fired
  const isUserBlockedOrFired = (user: UserRecord) => {
    if (user.isFired) {
      return { isBlocked: true, isFired: true, message: "Your account access has been permanently terminated by the Owner." };
    }
    if (user.blockedUntil && Date.now() < user.blockedUntil) {
      const mins = Math.ceil((user.blockedUntil - Date.now()) / 60000);
      return {
        isBlocked: true,
        isFired: false,
        message: `Your account is temporarily blocked by the Owner. Try again in ${mins} minute(s).`
      };
    }
    return { isBlocked: false, isFired: false, message: "" };
  };

  // --- API ROUTES ---

  // 1. Lockout Status
  app.get("/api/owner/lock-status", (req, res) => {
    res.json(getLockoutStatus());
  });

  // 2. Owner Password Verification (Login Page Only entrance, Password: Manoj X)
  app.post("/api/owner/verify", (req, res) => {
    const status = getLockoutStatus();
    if (status.isBlocked) {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        remainingSeconds: status.remainingSeconds,
        message: `Owner access is locked. Please wait for countdown or enter Emergency Unlock Password.`
      });
    }

    const { password, email } = req.body;
    const cleanPass = String(password || "").trim();
    const isManojX = 
      cleanPass === "Manoj X" || 
      cleanPass.toLowerCase() === "manoj x" || 
      cleanPass.replace(/\s+/g, '').toLowerCase() === "manojx";

    if (isManojX) {
      // Find or establish Owner Account
      let ownerUser = usersStore.find(u => u.role === "owner" || u.email.toLowerCase() === "pikkimalieshwari@gmail.com");
      if (!ownerUser) {
        ownerUser = {
          id: "usr_owner_primary",
          email: "pikkimalieshwari@gmail.com",
          phone: "+15550100000",
          name: "Manoj X",
          role: "owner",
          department: "Executive Authority",
          isFired: false,
          joinedAt: new Date().toISOString(),
          avatarColor: "from-zinc-100 to-zinc-400",
          password: "Manoj X",
          isApproved: true,
          approvalStatus: "accepted"
        };
        usersStore.unshift(ownerUser);
        saveStoreToDisk();
      } else {
        ownerUser.name = "Manoj X";
        ownerUser.password = "Manoj X";
        saveStoreToDisk();
      }

      logActivity("auth", "Owner Manoj X authenticated via secure Login Portal.", ownerUser.email);
      const { password: _, ...safeOwner } = ownerUser;

      return res.json({
        success: true,
        isBlocked: false,
        user: safeOwner,
        message: "Executive Owner Manoj X access verified and granted."
      });
    } else {
      // WRONG PASSWORD -> 10 Minute Lockout! (600,000 ms)
      const tenMinutesMs = 10 * 60 * 1000;
      ownerBlockedUntil = Date.now() + tenMinutesMs;
      saveStoreToDisk();
      const newStatus = getLockoutStatus();
      logActivity("security", `Failed Owner access attempt. 10-minute lockout triggered.`);

      return res.status(401).json({
        success: false,
        isBlocked: true,
        remainingSeconds: newStatus.remainingSeconds,
        message: "Incorrect Password! Owner security lock activated for 10 minutes."
      });
    }
  });

  // Emergency Stop Password to cancel 10-minute lockout (Accepts Manoj X or STOP)
  app.post("/api/owner/unlock-lockout", (req, res) => {
    const { stopPassword } = req.body;
    const cleanStop = String(stopPassword || "").trim().toUpperCase();
    const cleanNoSpace = cleanStop.replace(/\s+/g, '');

    if (
      cleanStop === "MANOJ X" ||
      cleanNoSpace === "MANOJX" ||
      cleanStop === "STOP" ||
      cleanStop === "STOP 0010" ||
      cleanStop === "UNBLOCK" ||
      cleanStop === "MK STOP"
    ) {
      ownerBlockedUntil = null;
      saveStoreToDisk();
      logActivity("security", "Owner emergency unblock executed.");
      return res.json({
        success: true,
        message: "Security lockout cleared! System access unlocked."
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid Emergency Unlock Password."
      });
    }
  });

  // System Full Reset & Purge Endpoint (Owner command)
  app.post("/api/system/reset", (req, res) => {
    const { password } = req.body;
    const cleanPass = String(password || "").trim();
    const isAuthorized = 
      cleanPass === "Manoj X" || 
      cleanPass.toLowerCase() === "manoj x" || 
      cleanPass.replace(/\s+/g, '').toLowerCase() === "manojx";

    if (!isAuthorized) {
      return res.status(401).json({ error: "Invalid Owner Password for system reset." });
    }

    // Reset users to ONLY clean Owner account
    usersStore = [
      {
        id: "usr_owner_primary",
        email: "pikkimalieshwari@gmail.com",
        phone: "+15550100000",
        name: "Manoj X",
        role: "owner",
        department: "Executive Authority",
        isFired: false,
        joinedAt: new Date().toISOString(),
        avatarColor: "from-zinc-100 to-zinc-400",
        password: "Manoj X",
        isApproved: true,
        approvalStatus: "accepted"
      }
    ];

    // Purge all signals / chat messages
    messagesStore = [];

    // Clear activity logs and lockouts
    activityLogsStore = [
      {
        id: "log_" + Date.now(),
        type: "admin",
        description: "Website full reset executed. All saved emails and Signals purged.",
        timestamp: new Date().toISOString(),
        userEmail: "pikkimalieshwari@gmail.com"
      }
    ];
    ownerBlockedUntil = null;

    saveStoreToDisk();

    res.json({
      success: true,
      message: "Website reset completed. All saved emails and Signals have been purged.",
      users: usersStore.map(({ password, ...u }) => u),
      messagesCount: 0
    });
  });

  // 3. Current User Validation Endpoint
  app.get("/api/auth/me", (req, res) => {
    const userId = req.query.id as string;
    const userEmail = req.query.email as string;

    let user = usersStore.find(
      (u) => (userId && u.id === userId) || (userEmail && u.email.toLowerCase() === userEmail.toLowerCase())
    );

    if (!user) {
      return res.status(404).json({ error: "User account not found or has been deleted." });
    }

    const blockCheck = isUserBlockedOrFired(user);
    if (blockCheck.isBlocked) {
      return res.status(403).json({
        error: blockCheck.message,
        isFired: blockCheck.isFired,
        isBlocked: true,
      });
    }

    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // 4. User Registration (Direct registration & instant sign in)
  app.post("/api/auth/register", (req, res) => {
    const { email, name, phone, password, department } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Name, Email, and Password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = (phone || "").trim();

    // Check duplicate
    const existing = usersStore.find(
      (u) => u.email.toLowerCase() === cleanEmail || (cleanPhone && u.phone && u.phone === cleanPhone)
    );

    if (existing) {
      return res.status(400).json({ error: "An account with this Email or Phone Number already exists. Please sign in." });
    }

    const isOwnerEmail = cleanEmail === "pikkimalieshwari@gmail.com" || cleanEmail.includes("owner") || cleanEmail === "mk0010@mkcreativex.com";

    const newUser: UserRecord = {
      id: "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      email: cleanEmail,
      phone: cleanPhone,
      name: name.trim(),
      role: isOwnerEmail ? "owner" : "member",
      department: department ? department.trim() : "General Member",
      isFired: false,
      joinedAt: new Date().toISOString(),
      avatarColor: "from-zinc-100 to-zinc-400",
      password: password.trim(),
      isApproved: true,
      approvalStatus: "accepted",
    };

    usersStore.push(newUser);
    saveStoreToDisk();
    logActivity("auth", `New user registered: ${newUser.name} (${newUser.email})`, newUser.email);

    const { password: _, ...safeUser } = newUser;

    res.json({
      success: true,
      user: safeUser,
      message: `Account created successfully! Welcome to MK creative X.`
    });
  });

  // Login: Email/Phone and Password MUST match
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both Email/Phone and Password." });
    }

    const cleanInput = String(email).toLowerCase().trim();
    const cleanPassword = String(password).trim();

    // Match by email OR phone
    let user = usersStore.find(
      (u) => u.email.toLowerCase() === cleanInput || (u.phone && u.phone.toLowerCase() === cleanInput)
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid Email/Phone or Password. Credentials do not match our records." });
    }

    // Verify Password
    if (user.password && user.password !== cleanPassword) {
      return res.status(401).json({ error: "Incorrect Password for this account. Please verify your credentials." });
    }

    const blockCheck = isUserBlockedOrFired(user);
    if (blockCheck.isBlocked) {
      return res.status(403).json({
        error: blockCheck.message,
        isFired: blockCheck.isFired,
        isBlocked: true,
      });
    }

    logActivity("auth", `User signed in: ${user.name} (${user.email})`, user.email);

    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      message: `Sign in successful! Welcome to MK creative X.`
    });
  });

  // 5. Feature Flags Endpoints
  app.get("/api/features", (req, res) => {
    res.json(featureFlagsStore);
  });

  app.post("/api/owner/features", (req, res) => {
    const updated = req.body;
    featureFlagsStore = { ...featureFlagsStore, ...updated };
    saveStoreToDisk();
    logActivity("admin", "Website feature modules updated by Owner.");
    res.json({ success: true, features: featureFlagsStore });
  });

  // 6. News & Audio News Endpoints
  app.get("/api/news", (req, res) => {
    const category = req.query.category as string;
    if (category && category !== "all") {
      return res.json(newsStore.filter((n) => n.category === category));
    }
    res.json(newsStore);
  });

  app.post("/api/owner/news", (req, res) => {
    const { headline, source, summary, category, imageUrl, readTime, audioText, isBreaking, url } = req.body;
    if (!headline || !summary) {
      return res.status(400).json({ error: "Headline and Summary are required." });
    }

    const newArticle: NewsRecord = {
      id: "news_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      headline: headline.trim(),
      source: (source || "Global Wire Service").trim(),
      publishedAt: new Date().toISOString(),
      summary: summary.trim(),
      category: category || "world",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
      readTime: readTime || "3 min read",
      audioText: (audioText || `${headline}. ${summary}`).trim(),
      isBreaking: Boolean(isBreaking),
      url: url || undefined,
      audioDurationSec: Math.max(20, Math.round((audioText || summary).split(" ").length * 0.4))
    };

    newsStore.unshift(newArticle);
    saveStoreToDisk();
    logActivity("news", `Added news article: "${newArticle.headline.substring(0, 40)}..."`);
    res.json({ success: true, article: newArticle });
  });

  app.delete("/api/owner/news/:id", (req, res) => {
    const { id } = req.params;
    const index = newsStore.findIndex((n) => n.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "News article not found." });
    }
    const removed = newsStore.splice(index, 1)[0];
    saveStoreToDisk();
    logActivity("news", `Deleted news article: "${removed.headline.substring(0, 40)}..."`);
    res.json({ success: true, message: "Article removed." });
  });

  // 7. Knowledge Hub Endpoints (Tesla, Physics, NASA, ISRO)
  app.get("/api/knowledge", (req, res) => {
    const category = req.query.category as string;
    if (category && category !== "all") {
      return res.json(knowledgeStore.filter((k) => k.category === category));
    }
    res.json(knowledgeStore);
  });

  app.post("/api/owner/knowledge", (req, res) => {
    const { category, headline, summary, fullExplanation, source, status, imageUrl, tags, keyFacts, readMoreUrl } = req.body;
    if (!category || !headline || !summary) {
      return res.status(400).json({ error: "Category, Headline, and Summary are required." });
    }

    const newKnowledge: KnowledgeRecord = {
      id: "know_" + category + "_" + Date.now(),
      category: category as any,
      headline: headline.trim(),
      summary: summary.trim(),
      fullExplanation: (fullExplanation || summary).trim(),
      publishedAt: new Date().toISOString(),
      source: (source || "Verified Scientific Agency").trim(),
      status: status || "Confirmed Mission",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      tags: Array.isArray(tags) ? tags : [category.toUpperCase()],
      keyFacts: Array.isArray(keyFacts) && keyFacts.length > 0 ? keyFacts : [summary.trim()],
      readMoreUrl: readMoreUrl || undefined
    };

    knowledgeStore.unshift(newKnowledge);
    saveStoreToDisk();
    logActivity("admin", `Added Knowledge entry [${category.toUpperCase()}]: "${newKnowledge.headline.substring(0, 40)}..."`);
    res.json({ success: true, article: newKnowledge });
  });

  app.delete("/api/owner/knowledge/:id", (req, res) => {
    const { id } = req.params;
    const index = knowledgeStore.findIndex((k) => k.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Knowledge item not found." });
    }
    const removed = knowledgeStore.splice(index, 1)[0];
    saveStoreToDisk();
    logActivity("admin", `Deleted Knowledge entry: "${removed.headline.substring(0, 40)}..."`);
    res.json({ success: true, message: "Knowledge entry removed." });
  });

  // 8. Announcements Endpoints
  app.get("/api/announcements", (req, res) => {
    res.json(announcementsStore);
  });

  app.post("/api/owner/announcements", (req, res) => {
    const { title, content, isUrgent } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and Content are required." });
    }

    const newAnn: AnnouncementRecord = {
      id: "ann_" + Date.now(),
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString(),
      createdBy: "Executive Owner",
      isUrgent: Boolean(isUrgent),
      active: true
    };

    announcementsStore.unshift(newAnn);
    saveStoreToDisk();
    logActivity("admin", `Published system announcement: "${newAnn.title}"`);
    res.json({ success: true, announcement: newAnn });
  });

  app.delete("/api/owner/announcements/:id", (req, res) => {
    const { id } = req.params;
    announcementsStore = announcementsStore.filter((a) => a.id !== id);
    saveStoreToDisk();
    res.json({ success: true, message: "Announcement removed." });
  });

  // 9. Activity & Telemetry
  app.get("/api/owner/activity", (req, res) => {
    res.json(activityLogsStore);
  });

  // 10. Owner Console Roster & Security
  app.get("/api/owner/users", (req, res) => {
    const safeUsers = usersStore.map(({ password, ...u }) => u);
    res.json(safeUsers);
  });

  app.get("/api/owner/pending-approvals", (req, res) => {
    const pendingUsers = usersStore
      .filter((u) => u.approvalStatus === 'pending' || u.isApproved === false)
      .map(({ password, ...u }) => u);
    res.json(pendingUsers);
  });

  // Approve User (by userId or email)
  app.post("/api/owner/approve-user", (req, res) => {
    const { userId, email } = req.body;
    const user = usersStore.find(
      (u) => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    user.isApproved = true;
    user.approvalStatus = "accepted";
    saveStoreToDisk();
    logActivity("admin", `User approved: ${user.name} (${user.email})`);

    res.json({
      success: true,
      message: `Registration accepted! ${user.name} (${user.email}) can now log in to the website.`,
      user: { id: user.id, name: user.name, email: user.email, isApproved: true, approvalStatus: "accepted" }
    });
  });

  // Reject User
  app.post("/api/owner/reject-user", (req, res) => {
    const { userId, email } = req.body;
    const user = usersStore.find(
      (u) => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    user.isApproved = false;
    user.approvalStatus = "rejected";
    saveStoreToDisk();
    logActivity("admin", `User registration rejected: ${user.name} (${user.email})`);

    res.json({
      success: true,
      message: `Registration request for ${user.name} (${user.email}) has been declined.`,
      user: { id: user.id, name: user.name, email: user.email, isApproved: false, approvalStatus: "rejected" }
    });
  });

  // Permanent Delete User Endpoint (Accepts userId or email)
  app.post("/api/owner/delete-user", (req, res) => {
    const { userId, email } = req.body;
    if (!userId && !email) {
      return res.status(400).json({ error: "User ID or Email is required for deletion." });
    }

    const index = usersStore.findIndex(
      (u) => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (index === -1) {
      return res.status(404).json({ error: "User account not found." });
    }

    const targetUser = usersStore[index];
    if (targetUser.role === "owner" || targetUser.email.toLowerCase() === "pikkimalieshwari@gmail.com") {
      return res.status(400).json({ error: "Cannot delete the primary Owner account." });
    }

    const deletedUser = usersStore[index];
    usersStore.splice(index, 1);
    saveStoreToDisk();
    logActivity("admin", `Permanently purged user: ${deletedUser.name} (${deletedUser.email})`);

    res.json({
      success: true,
      message: `Account for ${deletedUser.name} (${deletedUser.email}) has been permanently deleted.`,
    });
  });

  // Block / Fire User
  app.post("/api/owner/block-user", (req, res) => {
    const { userId, email, durationMinutes, permanent } = req.body;
    const target = usersStore.find(
      (u) => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (!target) {
      return res.status(404).json({ error: "User not found." });
    }
    if (target.role === "owner" || target.email.toLowerCase() === "pikkimalieshwari@gmail.com") {
      return res.status(400).json({ error: "Cannot block the primary Owner account." });
    }

    if (permanent) {
      target.isFired = true;
      target.blockedUntil = null;
    } else if (durationMinutes && durationMinutes > 0) {
      target.isFired = false;
      target.blockedUntil = Date.now() + durationMinutes * 60 * 1000;
    } else {
      // Unblock
      target.isFired = false;
      target.blockedUntil = null;
    }

    saveStoreToDisk();
    logActivity("security", `Updated block status for ${target.name}`);
    res.json({
      success: true,
      message: `${target.name} status updated successfully.`,
      user: target,
    });
  });

  app.post("/api/owner/fire-user", (req, res) => {
    const { userId, email } = req.body;
    const target = usersStore.find(
      (u) => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (!target) {
      return res.status(404).json({ error: "User not found." });
    }
    if (target.role === "owner" || target.email.toLowerCase() === "pikkimalieshwari@gmail.com") {
      return res.status(400).json({ error: "Cannot fire the primary Owner account." });
    }

    target.isFired = true;
    target.blockedUntil = null;
    saveStoreToDisk();
    logActivity("security", `User fired: ${target.name} (${target.email})`);

    res.json({ success: true, message: `${target.name} has been terminated by Owner.`, user: target });
  });

  app.post("/api/owner/restore-user", (req, res) => {
    const { userId, email } = req.body;
    const target = usersStore.find(
      (u) => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (!target) {
      return res.status(404).json({ error: "User not found." });
    }

    target.isFired = false;
    target.blockedUntil = null;
    saveStoreToDisk();
    logActivity("admin", `User access restored: ${target.name} (${target.email})`);

    res.json({ success: true, message: `${target.name} access restored.`, user: target });
  });

  // 11. Chat & Messages Routes
  app.get("/api/chat/messages", (req, res) => {
    const channelId = (req.query.channelId as string) || "general";
    const channelMsgs = messagesStore.filter((m) => m.channelId === channelId);
    res.json(channelMsgs);
  });

  app.post("/api/chat/messages", (req, res) => {
    const { channelId, senderId, senderName, senderEmail, senderRole, text, attachment, location } = req.body;

    const sender = usersStore.find((u) => u.id === senderId || u.email === senderEmail);
    if (sender) {
      const blockCheck = isUserBlockedOrFired(sender);
      if (blockCheck.isBlocked) {
        return res.status(403).json({ error: blockCheck.message });
      }
    }

    if (attachment && attachment.size > 100 * 1024 * 1024) {
      return res.status(400).json({ error: "File exceeds 100MB size limit." });
    }

    const newMsg: MessageRecord = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      channelId: channelId || "general",
      senderId: senderId || "anonymous",
      senderName: senderName || "Anonymous User",
      senderEmail: senderEmail || "",
      senderRole: senderRole || "member",
      text: text || "",
      timestamp: new Date().toISOString(),
      attachment: attachment || undefined,
      location: location || undefined,
    };

    messagesStore.push(newMsg);
    saveStoreToDisk();
    res.json(newMsg);
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MK creative X server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

