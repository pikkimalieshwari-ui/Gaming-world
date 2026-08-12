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

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

// Default Seed Data
let usersStore: UserRecord[] = [
  {
    id: "usr_owner_primary",
    email: "pikkimalieshwari@gmail.com",
    phone: "+15550100000",
    name: "Primary Owner",
    role: "owner",
    department: "Executive HQ",
    isFired: false,
    joinedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    avatarColor: "from-zinc-100 to-zinc-400",
    password: "MK 0010",
    isApproved: true,
    approvalStatus: "accepted"
  },
  {
    id: "usr_owner_1",
    email: "owner@mkcreativex.com",
    phone: "+15550100001",
    name: "MK Owner",
    role: "owner",
    department: "Executive HQ",
    isFired: false,
    joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    avatarColor: "from-zinc-100 to-zinc-400",
    password: "MK 0010",
    isApproved: true,
    approvalStatus: "accepted"
  },
  {
    id: "usr_member_1",
    email: "alex.tech@example.com",
    phone: "+15550101111",
    name: "Alex Rivera",
    role: "member",
    department: "Engineering",
    isFired: false,
    joinedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    avatarColor: "from-zinc-200 to-zinc-500",
    password: "password123",
    isApproved: true,
    approvalStatus: "accepted"
  },
  {
    id: "usr_member_2",
    email: "sarah.design@example.com",
    phone: "+15550102222",
    name: "Sarah Chen",
    role: "member",
    department: "Design & Media",
    isFired: false,
    joinedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    avatarColor: "from-zinc-300 to-zinc-600",
    password: "password123",
    isApproved: true,
    approvalStatus: "accepted"
  }
];

let messagesStore: MessageRecord[] = [
  {
    id: "msg_1",
    channelId: "general",
    senderId: "usr_owner_1",
    senderName: "MK Owner",
    senderEmail: "owner@mkcreativex.com",
    senderRole: "owner",
    text: "Welcome to MK creative X! Secure accounts, 100MB file transfer & live location sharing are online.",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "msg_2",
    channelId: "general",
    senderId: "usr_member_1",
    senderName: "Alex Rivera",
    senderEmail: "alex.tech@example.com",
    senderRole: "member",
    text: "System checks complete. User sessions and files are active.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
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
      ownerBlockedUntil,
      lastSavedAt: new Date().toISOString()
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed saving store to disk:", err);
  }
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

  // 2. Owner Password Verification
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

    const { password } = req.body;
    const cleanPass = String(password || "").trim();

    if (cleanPass === "MK 0010") {
      return res.json({
        success: true,
        isBlocked: false,
        message: "Owner access granted."
      });
    } else {
      // WRONG PASSWORD -> 10 Minute Lockout! (600,000 ms)
      const tenMinutesMs = 10 * 60 * 1000;
      ownerBlockedUntil = Date.now() + tenMinutesMs;
      saveStoreToDisk();
      const newStatus = getLockoutStatus();

      return res.status(401).json({
        success: false,
        isBlocked: true,
        remainingSeconds: newStatus.remainingSeconds,
        message: "Incorrect Password! Owner security lock activated for 10 minutes."
      });
    }
  });

  // Emergency Stop Password to cancel 10-minute lockout
  app.post("/api/owner/unlock-lockout", (req, res) => {
    const { stopPassword } = req.body;
    const cleanStop = String(stopPassword || "").trim().toUpperCase();

    if (cleanStop === "STOP" || cleanStop === "STOP 0010" || cleanStop === "MK STOP" || cleanStop === "UNBLOCK" || cleanStop === "MK 0010") {
      ownerBlockedUntil = null;
      saveStoreToDisk();
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

  // 4. User Registration (Direct registration & instant sign in - no email/verification requirement)
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

    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      message: `Sign in successful! Welcome to MK creative X.`
    });
  });

  // 5. Owner Console & Email Approval Endpoints
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

    res.json({
      success: true,
      message: `Registration accepted! ${user.name} (${user.email}) can now log in to the website.`,
      user: { id: user.id, name: user.name, email: user.email, isApproved: true, approvalStatus: "accepted" }
    });
  });

  // GET Direct Link Approval endpoint for pikkimalieshwari@gmail.com
  app.get("/api/owner/approve", (req, res) => {
    const email = (req.query.email as string || "").toLowerCase();
    const user = usersStore.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      return res.status(404).send(`<h3>User account ${email} not found.</h3>`);
    }

    user.isApproved = true;
    user.approvalStatus = "accepted";
    saveStoreToDisk();

    res.send(`
      <div style="font-family: sans-serif; padding: 40px; background: #000; color: #fff; text-align: center;">
        <h2 style="color: #4ade80;">✓ Approval Confirmed by pikkimalieshwari@gmail.com</h2>
        <p>User <strong>${user.name} (${user.email})</strong> has been accepted and can now log into MK creative X.</p>
        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #fff; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">Return to App</a>
      </div>
    `);
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

    res.json({ success: true, message: `${target.name} access restored.`, user: target });
  });

  // 6. Chat & Messages Routes
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
