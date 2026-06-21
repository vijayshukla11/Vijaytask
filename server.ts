import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Master spreadsheet ID as requested
const MASTER_SPREADSHEET_ID = "1bnqpNP19dTNAe2VH3AS4sRJHd5uNce_-sKN7JgZFyu8";

// Cache for Google Sheet access token
let serverCachedToken: string | null = null;
try {
  if (fs.existsSync("./google_token.json")) {
    const saved = JSON.parse(fs.readFileSync("./google_token.json", "utf-8"));
    serverCachedToken = saved.token;
    console.log("Loaded cached server OAuth token from file system.");
  }
} catch (e) {
  console.log("No initial token file loaded:", e);
}

// Server-side cache for Gemini Briefing and Insights to respect and protect API quotas
let serverCachedBriefing: { content: string; timestamp: number } | null = null;
let serverCachedInsights: { insights: any[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

app.use(express.json());

// Initialize Gemini SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper: Make fetch request with Google OAuth token
async function googleApiCall(url: string, token: string, options: RequestInit = {}) {
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errText = await response.text();
    console.error(`Google API Error on ${url}:`, errText);
    throw new Error(`Google API call failed: ${response.statusText} (${errText})`);
  }
  return response.json();
}

// 1. Get or Create Spreadsheet named 'VijayOS'
async function getOrCreateSpreadsheetId(token: string): Promise<string> {
  // Search for 'VijayOS' spreadsheet
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='VijayOS' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name)`;
  const searchData = await googleApiCall(searchUrl, token);
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create new spreadsheet
  console.log("VijayOS spreadsheet not found, creating a new one...");
  const createUrl = "https://sheets.googleapis.com/v4/spreadsheets";
  const body = {
    properties: {
      title: "VijayOS"
    }
  };
  const createdSheet = await googleApiCall(createUrl, token, {
    method: "POST",
    body: JSON.stringify(body)
  });

  const spreadsheetId = createdSheet.spreadsheetId;

  // Add the required tabs (MASTER_TASKS, BRANDS, DAILY_TASKS, BUSINESS_ANALYST, etc.)
  const tabs = [
    "MASTER_TASKS",
    "BRANDS",
    "DAILY_TASKS",
    "BUSINESS_ANALYST",
    "STOCK_MARKET",
    "WEBSITE_PROJECTS",
    "KPI_DASHBOARD",
    "IDEAS_AND_PROBLEMS"
  ];

  // Sheet creation requests
  const requests = tabs.map(tab => ({
    addSheet: {
      properties: {
        title: tab
      }
    }
  }));

  // Delete the default sheet created index 0 (usually Sheet1)
  if (createdSheet.sheets && createdSheet.sheets.length > 0) {
    const firstSheetId = createdSheet.sheets[0].properties.sheetId;
    requests.push({
      deleteSheet: {
        sheetId: firstSheetId
      }
    } as any);
  }

  const batchUpdateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  await googleApiCall(batchUpdateUrl, token, {
    method: "POST",
    body: JSON.stringify({ requests })
  });

  // Seed initial data and headers
  await seedInitialData(spreadsheetId, token);

  return spreadsheetId;
}

// Seed Mock Data with precise column headers
async function seedInitialData(spreadsheetId: string, token: string) {
  const seedData: Record<string, any[][]> = {
    "MASTER_TASKS": [
      ["Task ID", "Brand", "Title", "Status", "Priority", "Due Date", "Notes", "Updated At"],
      ["MT001", "Clinza Ecommerce", "Complete Clinza Homepage Banner", "Pending", "High", "2026-06-22", "Update hero images and slide animations", "2026-06-21"],
      ["MT002", "JustMySalad", "JustMySalad update menu list", "Pending", "Medium", "2026-06-23", "Add summer salads and fresh drinks", "2026-06-21"],
      ["MT003", "Shiprocket", "Shiprocket claim refund follow-up", "Overdue", "High", "2026-06-18", "Claim value for damaged transit goods", "2026-06-21"],
      ["MT004", "Business Analyst Learning", "Complete Power BI Case Study", "Pending", "High", "2026-06-24", "Finish visual charts and drilldowns", "2026-06-21"],
      ["MT005", "Bharatika News", "News portal SEO audit", "Blocked", "Medium", "2026-06-25", "Waiting for keyword spreadsheet from teammate", "2026-06-21"]
    ],
    "BRANDS": [
      ["Brand", "Overview", "Progress"],
      ["Clinza Ecommerce", "Beauty and personal care ecommerce site development", "60"],
      ["Clinza Social Media", "Social marketing calendar and asset updates", "45"],
      ["JustMySalad", "Salad restaurant POS integrations and physical location setup", "70"],
      ["Love & Latte", "Cafe brand operations management", "40"],
      ["JustMySalad Vending", "Vending machine smart telemetry integration", "30"],
      ["Nymi Vending", "Corporate vending custom dashboards", "20"],
      ["Shiprocket", "Logistics tracking and claim handling automation", "50"],
      ["Bharatika News", "Digital media web design and analytics", "75"],
      ["AI Projects", "RAG apps, agents, and automated workspace tooling", "80"],
      ["Business Analyst Learning", "Learning roadmap: Power BI, SQL, Python", "40"],
      ["Stock Market", "Swing trading log and market analysis journals", "35"],
      ["Resume Development", "ATS-resume and portfolio site updates", "90"],
      ["Personal Growth", "Habits tracker, reading tracker, fitness tracker", "65"]
    ],
    "DAILY_TASKS": [
      ["Task ID", "Title", "Schedule", "Status", "Completed Today"],
      ["DT001", "Update stock market journal", "Daily", "Pending", "No"],
      ["DT002", "Read AI news letter", "Daily", "Completed", "Yes"],
      ["DT003", "SQL exercise on LeetCode", "Daily", "Pending", "No"],
      ["DT004", "Weekly operations review", "Weekly", "Pending", "No"]
    ],
    "BUSINESS_ANALYST": [
      ["Topic", "Progress", "Status", "Notes"],
      ["Power BI dashboarding", "60", "In Progress", "Learning interactive visuals"],
      ["SQL core syntax and Joins", "80", "In Progress", "Intermediate exercises complete"],
      ["Python data analytics", "20", "In Progress", "Pandas and numpy fundamentals"],
      ["Tableau intermediate", "0", "Not Started", "Will start after Power BI"]
    ],
    "STOCK_MARKET": [
      ["Date", "Trade Detail", "Outcome", "Progress"],
      ["2026-06-19", "Nifty Bull Call Spread on breakout", "Profit", "100"],
      ["2026-06-18", "Reliance long target hit", "Profit", "100"],
      ["2026-06-17", "TCS pullback entry failed", "Loss", "100"]
    ],
    "WEBSITE_PROJECTS": [
      ["Project", "Brand", "Status", "Progress", "Target Date"],
      ["Clinza Store Launch", "Clinza Ecommerce", "In Progress", "60", "2026-07-15"],
      ["Bharatika Redesign", "Bharatika News", "In Progress", "80", "2026-06-30"],
      ["JustMySalad Menu App", "JustMySalad", "In Progress", "50", "2026-07-20"]
    ],
    "KPI_DASHBOARD": [
      ["Metric Name", "Value", "Target"],
      ["Total Tasks Daily Target", "8", "10"],
      ["Weekly Completion Rate", "85%", "90%"],
      ["Learning Roadmap Hours", "12 hrs", "15 hrs"]
    ],
    "IDEAS_AND_PROBLEMS": [
      ["Type", "Detail", "Associated Brand", "Status"],
      ["Idea", "Integrate WhatsApp bot for JustMySalad queries", "JustMySalad", "Open"],
      ["Problem", "Shiprocket API webhook drops checkout payload", "Shiprocket", "Open"]
    ]
  };

  const dataValues = Object.entries(seedData).map(([tab, rows]) => ({
    range: `${tab}!A1`,
    values: rows
  }));

  const batchWriteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  await googleApiCall(batchWriteUrl, token, {
    method: "POST",
    body: JSON.stringify({
      valueInputOption: "USER_ENTERED",
      data: dataValues
    })
  });
}

// Fetch all sheet data
async function fetchAllSheetData(spreadsheetId: string, token: string) {
  const tabs = [
    "MASTER_TASKS",
    "BRANDS",
    "DAILY_TASKS",
    "BUSINESS_ANALYST",
    "STOCK_MARKET",
    "WEBSITE_PROJECTS",
    "KPI_DASHBOARD",
    "IDEAS_AND_PROBLEMS"
  ];
  const rangers = tabs.map(tab => `${tab}!A1:Z200`);
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${rangers.join("&ranges=")}`;
  const response = await googleApiCall(valuesUrl, token);

  const data: Record<string, any[]> = {};
  tabs.forEach((tab, index) => {
    const rawRows = response.valueRanges[index]?.values || [];
    if (rawRows.length <= 1) {
      data[tab] = [];
      return;
    }
    const headers = rawRows[0];
    const rows = rawRows.slice(1).map((row: any[]) => {
      const parsedRow: Record<string, any> = {};
      headers.forEach((header: string, hIndex: number) => {
        parsedRow[camelCase(header)] = row[hIndex] !== undefined ? row[hIndex] : "";
      });
      return parsedRow;
    });
    data[tab] = rows;
  });

  return {
    tasks: data["MASTER_TASKS"] || [],
    brands: (data["BRANDS"] || []).map(b => ({ ...b, progress: parseFloat(b.progress) || 0 })),
    dailyTasks: data["DAILY_TASKS"] || [],
    businessAnalyst: (data["BUSINESS_ANALYST"] || []).map(b => ({ ...b, progress: parseFloat(b.progress) || 0 })),
    stockMarket: (data["STOCK_MARKET"] || []).map(s => ({ ...s, progress: parseFloat(s.progress) || 0 })),
    websiteProjects: (data["WEBSITE_PROJECTS"] || []).map(w => ({ ...w, progress: parseFloat(w.progress) || 0 })),
    kpis: data["KPI_DASHBOARD"] || [],
    ideas: data["IDEAS_AND_PROBLEMS"] || []
  };
}

// Helper: CamelCase conversion for headers
function camelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

// Robust custom state-machine CSV parser that handles quotes and commas correctly
function parseCSV(csvText: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      lines.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    lines.push(row);
  }
  return lines.filter(r => r.length > 0 && r.some(val => val !== ""));
}

function parseCSVToObjects(lines: string[][]): Record<string, any>[] {
  if (lines.length <= 1) return [];
  const headers = lines[0];
  return lines.slice(1).map(row => {
    const parsedRow: Record<string, any> = {};
    headers.forEach((header, index) => {
      parsedRow[camelCase(header)] = row[index] !== undefined ? row[index] : "";
    });
    return parsedRow;
  });
}

async function fetchTabCSV(spreadsheetId: string, tabName: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&sheet=${encodeURIComponent(tabName)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV for tab ${tabName}: ${response.statusText}`);
  }
  const csvText = await response.text();
  return parseCSV(csvText);
}

async function fetchAllSheetDataPublic(spreadsheetId: string) {
  const tabs = [
    "MASTER_TASKS",
    "BRANDS",
    "DAILY_TASKS",
    "BUSINESS_ANALYST",
    "STOCK_MARKET",
    "WEBSITE_PROJECTS",
    "KPI_DASHBOARD",
    "IDEAS_AND_PROBLEMS"
  ];
  
  const data: Record<string, any[]> = {};
  for (const tab of tabs) {
    try {
      const lines = await fetchTabCSV(spreadsheetId, tab);
      data[tab] = parseCSVToObjects(lines);
    } catch (err) {
      console.error(`Error loading tab ${tab} via public CSV:`, err);
      data[tab] = [];
    }
  }

  return {
    tasks: data["MASTER_TASKS"] || [],
    brands: (data["BRANDS"] || []).map(b => ({ ...b, progress: parseFloat(b.progress) || 0 })),
    dailyTasks: data["DAILY_TASKS"] || [],
    businessAnalyst: (data["BUSINESS_ANALYST"] || []).map(b => ({ ...b, progress: parseFloat(b.progress) || 0 })),
    stockMarket: (data["STOCK_MARKET"] || []).map(s => ({ ...s, progress: parseFloat(s.progress) || 0 })),
    websiteProjects: (data["WEBSITE_PROJECTS"] || []).map(w => ({ ...w, progress: parseFloat(w.progress) || 0 })),
    kpis: data["KPI_DASHBOARD"] || [],
    ideas: data["IDEAS_AND_PROBLEMS"] || []
  };
}

// In-sheet search & replace updater
async function updateSheetRow(
  spreadsheetId: string, 
  token: string, 
  tabName: string, 
  searchColIndex: number, 
  searchValue: string, 
  colUpdates: Record<number, any>
): Promise<boolean> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A1:Z500`;
  const response = await googleApiCall(url, token);
  const rows = response.values || [];
  
  let targetRowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    const val = rows[i][searchColIndex];
    if (val && String(val).toLowerCase().includes(searchValue.toLowerCase())) {
      targetRowIndex = i;
      break;
    }
  }
  
  if (targetRowIndex !== -1) {
    const rowData = [...rows[targetRowIndex]];
    const maxCol = Math.max(...Object.keys(colUpdates).map(Number));
    while (rowData.length <= maxCol) {
      rowData.push("");
    }
    
    // Apply cell modifications
    Object.entries(colUpdates).forEach(([colIdx, val]) => {
      rowData[Number(colIdx)] = String(val);
    });
    
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A${targetRowIndex + 1}?valueInputOption=USER_ENTERED`;
    await googleApiCall(updateUrl, token, {
      method: "PUT",
      body: JSON.stringify({ values: [rowData] })
    });
    return true;
  }
  return false;
}

// REST Backend API endpoints
app.post("/api/save-token", async (req, res) => {
  const { token } = req.body;
  if (token) {
    serverCachedToken = token;
    try {
      fs.writeFileSync("./google_token.json", JSON.stringify({ token }));
      console.log("Cached access token persistent update completed.");
    } catch (e) {
      console.error("Token persist failed:", e);
    }
    return res.json({ success: true, cached: true });
  }
  res.status(400).json({ error: "Missing token" });
});

app.get("/api/sheet-data", async (req, res) => {
  try {
    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.replace("Bearer ", "");
    }
    
    if ((!token || token === "anonymous") && serverCachedToken) {
      token = serverCachedToken;
    }

    const spreadsheetId = MASTER_SPREADSHEET_ID;
    let data;
    
    if (token && token !== "anonymous") {
      try {
        data = await fetchAllSheetData(spreadsheetId, token);
      } catch (err) {
        console.warn("OAuth token failed to query sheet, resorting to CSV fallback:", err);
        data = await fetchAllSheetDataPublic(spreadsheetId);
      }
    } else {
      data = await fetchAllSheetDataPublic(spreadsheetId);
    }
    
    res.json({ spreadsheetId, ...data });
  } catch (error: any) {
    console.error("GET /api/sheet-data Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sync-sheet", async (req, res) => {
  try {
    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.replace("Bearer ", "");
    }
    
    if ((!token || token === "anonymous") && serverCachedToken) {
      token = serverCachedToken;
    }

    if (!token || token === "anonymous") {
      return res.status(401).json({ error: "Google Sheets write operations require authentication. Please connect your Google account once in top-right or settings." });
    }

    const spreadsheetId = MASTER_SPREADSHEET_ID;
    
    const { tab, rows, valueInputOption = "USER_ENTERED" } = req.body;
    if (!tab || !rows) {
      return res.status(400).json({ error: "Missing tab or rows in body" });
    }

    // Clear then update tab values
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tab}!A1:Z500:clear`;
    await googleApiCall(clearUrl, token, { method: "POST" });

    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tab}!A1?valueInputOption=${valueInputOption}`;
    await googleApiCall(updateUrl, token, {
      method: "PUT",
      body: JSON.stringify({ values: rows })
    });

    let data;
    try {
      data = await fetchAllSheetData(spreadsheetId, token);
    } catch (err) {
      data = await fetchAllSheetDataPublic(spreadsheetId);
    }
    res.json({ success: true, ...data });
  } catch (error: any) {
    console.error("POST /api/sync-sheet Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 1. CEO Briefing endpoint
app.get("/api/ceo-briefing", async (req, res) => {
  try {
    const now = Date.now();
    if (serverCachedBriefing && (now - serverCachedBriefing.timestamp) < CACHE_TTL_MS) {
      return res.json({ briefing: serverCachedBriefing.content });
    }

    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.replace("Bearer ", "");
    }
    if ((!token || token === "anonymous") && serverCachedToken) {
      token = serverCachedToken;
    }
    
    const spreadsheetId = MASTER_SPREADSHEET_ID;
    let data;
    if (token && token !== "anonymous") {
      try {
        data = await fetchAllSheetData(spreadsheetId, token);
      } catch (err) {
        data = await fetchAllSheetDataPublic(spreadsheetId);
      }
    } else {
      data = await fetchAllSheetDataPublic(spreadsheetId);
    }
    
    // Compute data summaries
    const pendingTasks = data.tasks.filter(t => t.status === "Pending").length;
    const completedTasks = data.tasks.filter(t => t.status === "Completed").length;
    const overdueTasks = data.tasks.filter(t => t.status === "Overdue" || (t.dueDate < "2026-06-21" && t.status !== "Completed")).length;
    const blockedTasks = data.tasks.filter(t => t.status === "Blocked").length;

    // Brand progression safely checked for null/undefined fields
    const clinzaProgress = data.brands.find(b => b.brand && b.brand.toLowerCase().includes("clinza ecommerce"))?.progress || 0;
    const jmsPending = data.tasks.filter(t => t.brand && t.brand.toLowerCase().includes("justmysalad") && t.status !== "Completed").length;
    
    // Shiprocket claims are in ideas (open problems)
    const shiprocketClaims = data.ideas.filter(i => i.associatedBrand && i.associatedBrand.toLowerCase().includes("shiprocket") && i.status === "Open" && i.type === "Problem").length;
    const bharatikaNewsProgress = data.brands.find(b => b.brand && b.brand.toLowerCase().includes("bharatika news"))?.progress || 0;
    const aiProjectsProgress = data.brands.find(b => b.brand && b.brand.toLowerCase().includes("ai projects"))?.progress || 0;

    // Learning safely checked for null/undefined fields
    const ExcelProgressObj = data.businessAnalyst.find(l => l.topic && l.topic.toLowerCase().includes("excel")) || 
                             data.businessAnalyst.find(l => l.topic && l.topic.toLowerCase().includes("dashboard")) || { progress: 40 };
    const sqlProgressObj = data.businessAnalyst.find(l => l.topic && l.topic.toLowerCase().includes("sql")) || { progress: 80 };
    const powerBiProgressObj = data.businessAnalyst.find(l => l.topic && l.topic.toLowerCase().includes("power bi")) || { progress: 60 };
    const pythonProgressObj = data.businessAnalyst.find(l => l.topic && l.topic.toLowerCase().includes("python")) || { progress: 20 };

    const excelProgress = ExcelProgressObj.progress;
    const sqlProgress = sqlProgressObj.progress;
    const powerBiProgress = powerBiProgressObj.progress;
    const pythonProgress = pythonProgressObj.progress;

    // Now call Gemini to compile the custom briefing & suggestions!
    const briefingRequest = `
      Create an elite morning briefing for Vijay Shukla.
      Use the following precise numbers calculated from Google Sheets:
      - Pending tasks: ${pendingTasks}
      - Completed tasks: ${completedTasks}
      - Overdue tasks: ${overdueTasks}
      - Blocked tasks: ${blockedTasks}
      
      Business Status:
      - Clinza Ecommerce Progress: ${clinzaProgress}%
      - JustMySalad Pending Tasks: ${jmsPending}
      - Shiprocket Open Claims: ${shiprocketClaims}
      - Bharatika News Progress: ${bharatikaNewsProgress}%
      - AI Projects Progress: ${aiProjectsProgress}%
      
      Learning Status:
      - Excel / Dashboard Progress: ${excelProgress}%
      - SQL Progress: ${sqlProgress}%
      - Power BI Progress: ${powerBiProgress}%
      - Python Progress: ${pythonProgress}%
      
      Tasks lists for reference (to decide Today's Recommended Focus):
      ${JSON.stringify(data.tasks.filter(t => t.status !== "Completed"))}

      Respond exactly in this structured format with beautiful markdown and details:
      
      Good Morning Vijay,
      
      You have:
      * **${pendingTasks}** pending tasks
      * **${completedTasks}** completed tasks
      * **${overdueTasks}** overdue tasks
      * **${blockedTasks}** blocked tasks
      
      Business Status:
      * **Clinza Ecommerce Progress**: ${clinzaProgress}%
      * **JustMySalad Pending Tasks**: ${jmsPending} tasks pending
      * **Shiprocket Open Claims**: ${shiprocketClaims} open claims
      * **Bharatika News Progress**: ${bharatikaNewsProgress}%
      * **AI Projects Progress**: ${aiProjectsProgress}%
      
      Learning Status:
      * **Excel Progress**: ${excelProgress}% complete
      * **SQL Progress**: ${sqlProgress}% complete
      * **Power BI Progress**: ${powerBiProgress}% complete
      * **Python Progress**: ${pythonProgress}% complete
      
      Today's Recommended Focus:
      1. [Actionable focus item 1 matched to high priority/overdue tasks]
      2. [Actionable focus item 2 matched to learning or branding tasks]
      3. [Actionable focus item 3 matched to pending business tasks]
      
      Keep the briefing concise, actionable, and formatted EXACTLY as requested above. Do not use generic placeholders. Use markdown bold for headers inside lists to maintain high status.
    `;

    let briefingText = "";
    try {
      const aiBrief = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: briefingRequest,
      });
      briefingText = aiBrief.text || "";
      serverCachedBriefing = { content: briefingText, timestamp: now };
    } catch (err: any) {
      console.log("Serving offline morning briefing layout due to API limit.");
      const highTasks = data.tasks.filter((t: any) => t.status !== "Completed" && t.priority === "High");
      const focusItems = highTasks.slice(0, 2).map((t: any, i: number) => {
        return `${i + 1}. **${t.brand || "System"} Plan**: Execute "${t.title || "Roadmap alignment"}" task (Target: ${t.dueDate || "Immediate"})`;
      });
      if (focusItems.length < 3) {
        focusItems.push(`${focusItems.length + 1}. **Learning Growth**: Standard practice session on **SQL queries** & analytics pipeline.`);
      }
      if (focusItems.length < 3) {
        focusItems.push(`${focusItems.length + 1}. **Administrative**: Audit open items, check JustMySalad status or pending ideas.`);
      }

      briefingText = `⚠️ **Local Failover Mode Active (Gemini API Quota Exceeded/Resetting)**

Good Morning Vijay,

Here is your real-time operational status compiled directly from the master Google Sheet database:

You have:
* **${pendingTasks}** pending tasks across segment roadmaps
* **${completedTasks}** completed tasks archived
* **${overdueTasks}** overdue items requiring reschedule action
* **${blockedTasks}** blocked tasks awaiting resolution

Business Status:
* **Clinza Ecommerce Progress**: ${clinzaProgress}%
* **JustMySalad Pending Tasks**: ${jmsPending} tasks pending
* **Shiprocket Open Claims**: ${shiprocketClaims} open claims
* **Bharatika News Progress**: ${bharatikaNewsProgress}%
* **AI Projects Progress**: ${aiProjectsProgress}%

Learning Status:
* **Excel Progress**: ${excelProgress}% complete
* **SQL Progress**: ${sqlProgress}% complete
* **Power BI Progress**: ${powerBiProgress}% complete
* **Python Progress**: ${pythonProgress}% complete

Today's Recommended Focus:
${focusItems.join("\n")}

*(Note: Live generative AI advisor insights will resume automatically once your Gemini API key's hourly quota window resets.)*`;

      // Cache the offline version as well for a minute to limit spamming attempts
      serverCachedBriefing = { content: briefingText, timestamp: now };
    }

    res.json({ briefing: briefingText || "No briefing generated." });
  } catch (error: any) {
    console.log("Cached briefing error handled nicely.");
    res.json({ briefing: "Vijay OS local briefing engine is online." });
  }
});

// 2. Advanced Insights endpoint
app.get("/api/advanced-insights", async (req, res) => {
  try {
    const now = Date.now();
    if (serverCachedInsights && (now - serverCachedInsights.timestamp) < CACHE_TTL_MS) {
      return res.json({ insights: serverCachedInsights.insights });
    }

    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.replace("Bearer ", "");
    }
    if ((!token || token === "anonymous") && serverCachedToken) {
      token = serverCachedToken;
    }
    
    const spreadsheetId = MASTER_SPREADSHEET_ID;
    let data;
    if (token && token !== "anonymous") {
      try {
        data = await fetchAllSheetData(spreadsheetId, token);
      } catch (err) {
        data = await fetchAllSheetDataPublic(spreadsheetId);
      }
    } else {
      data = await fetchAllSheetDataPublic(spreadsheetId);
    }

    const insightsRequest = `
      You are VJ AI Coach, providing Vijay Shukla with advanced, predictive operational warnings.
      Analyze the current portfolio data from Google Sheets:
      ${JSON.stringify(data)}
      
      Generate exactly 4 advanced insights. For each insight:
      - Perform predictive analysis for project timelines (e.g. estimate if website projects or learning milestones are on track or will face delays based on progress and remaining tasks).
      - Identify potential risks based on task dependencies and progress (e.g. if task MT001 is blocked or overdue, what is the risk to Clinza Ecommerce?).
      - Suggest proactive measures to mitigate delays.

      Input Date: 2026-06-21.
      
      Format the response as a JSON array of exactly 4 objects:
      [
        {
          "text": "Insight 1 text showing predictive timeline, risks, and proactive measures",
          "type": "danger" | "warning" | "info",
          "title": "Insight Title [e.g. Clinza Timeline Slip]"
        },
        ...
      ]
      
      Ensure each insight is extremely specific to Vijay's exact projects (Clinza, JustMySalad, Shiprocket claim, SQL, etc.) and contains real, actionable suggestions. Return ONLY the raw JSON array.
    `;

    let insights = [];
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: insightsRequest,
        config: {
          responseMimeType: "application/json",
        }
      });

      const resultText = response.text || "[]";
      try {
        insights = JSON.parse(resultText);
        serverCachedInsights = { insights, timestamp: now };
      } catch (e) {
        console.log("Malformed generative JSON parsed, falling back.");
        throw e; // drop to fallback
      }
    } catch (e: any) {
      console.log("Serving offline business metrics advisory logs due to API limits.");

      // Compute simple stats for the fallback text
      const pendingTasks = data.tasks.filter((t: any) => t.status === "Pending").length;
      const overdueTasks = data.tasks.filter((t: any) => t.status === "Overdue" || (t.dueDate < "2026-06-21" && t.status !== "Completed")).length;
      const clinzaProgress = data.brands.find((b: any) => b.brand && b.brand.toLowerCase().includes("clinza ecommerce"))?.progress || 0;
      const shiprocketClaims = data.ideas.filter((i: any) => i.associatedBrand && i.associatedBrand.toLowerCase().includes("shiprocket") && i.status === "Open" && i.type === "Problem").length;
      const sqlProgressObj = data.businessAnalyst.find((l: any) => l.topic && l.topic.toLowerCase().includes("sql")) || { progress: 80 };

      insights = [
        { 
          title: "Clinza Ecommerce Roadmap", 
          text: `Clinza Ecommerce is currently at ${clinzaProgress}% development. We recommend finalizing the outstanding homepage and marketing assets this week to satisfy launch timelines.`, 
          type: "warning" 
        },
        { 
          title: "Shiprocket Claims Resolution", 
          text: shiprocketClaims > 0 
            ? `You have ${shiprocketClaims} open refund claims listed. Immediate follow up with shiprocket courier partner is advised to resolve pending cashflow blocks.` 
            : "No active Shiprocket claims are pending. Courier performance accounts are stable and balanced.", 
          type: shiprocketClaims > 0 ? "danger" : "info" 
        },
        { 
          title: "Business Analytics Milestone", 
          text: `Your SQL learning database tracks at ${sqlProgressObj.progress}% progress. Set aside 15 minutes today to practice JOIN queries and syntax.`, 
          type: "info" 
        },
        { 
          title: "Overdue Roadmap Items Check", 
          text: overdueTasks > 0 
            ? `There are ${overdueTasks} overdue tasks in your backlog. Consider editing their due dates in the Task Manager to maintain an accurate momentum.` 
            : "Superb! All scheduled task dates are current or completed. Clear momentum maintained.", 
          type: overdueTasks > 0 ? "warning" : "info" 
        }
      ];

      // Cache fallback insights
      serverCachedInsights = { insights, timestamp: now };
    }

    res.json({ insights });
  } catch (error: any) {
    console.log("Local Advanced Insights engine online.");
    res.json({ insights: [] });
  }
});

// VJ AI chat endpoint (Uses Gemini 3.5 Flash)
app.post("/api/chat", async (req, res) => {
  try {
    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.replace("Bearer ", "");
    }
    if ((!token || token === "anonymous") && serverCachedToken) {
      token = serverCachedToken;
    }
    
    const { message, previousMessages = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message payload" });
    }

    const spreadsheetId = MASTER_SPREADSHEET_ID;
    
    let currentData;
    if (token && token !== "anonymous") {
      try {
        currentData = await fetchAllSheetData(spreadsheetId, token);
      } catch (err) {
        currentData = await fetchAllSheetDataPublic(spreadsheetId);
      }
    } else {
      currentData = await fetchAllSheetDataPublic(spreadsheetId);
    }

    // Let's frame the system instructions for Gemini
    const systemInstruction = `
      You are VJ AI, the elite premium personal operating system AI assistant built exclusively for Vijay Shukla.
      Vijay OS is his life operating system containing his master tasks, daily routines, brands, learning pathways, website projects, ideas, and stock market journal.
      
      You must read his current sheets data (provided as JSON context) and execute or answer his requests.

      CURRENT DATE/TIME: 2026-06-21T05:17:58-07:00

      You are fully authorized to execute ACTIONS on his spreadsheets. If his query implies an action, formulate a detailed JSON list of sheets operations.
      
      IMPORTANT: Map brand mentions correctly (e.g., "salad" -> "JustMySalad", "clinza" -> "Clinza Ecommerce", "news" -> "Bharatika News").
      
      Valid Action Types:
      - "create_task": Add a task to "MASTER_TASKS" sheet.
        Payload keys: brand, title, status ("Pending"), priority ("High"|"Medium"|"Low"), dueDate (YYYY-MM-DD), notes.
      - "update_task": Modify task inside "MASTER_TASKS" sheet.
        Payload keys: taskId (e.g. "MT001"), title (exact or partial keyword), status, priority, dueDate, notes.
      - "update_daily": Toggle/Update habit log in "DAILY_TASKS".
        Payload keys: title, status, completedToday.
      - "update_learning": Update progress in "BUSINESS_ANALYST" learning sheet.
        Payload keys: topic, progress, status, notes.
      - "update_brand": Update progress or overview in "BRANDS".
        Payload keys: brand, overview, progress.
      - "update_project": Modify status / progress in "WEBSITE_PROJECTS".
        Payload keys: project, status, progress, targetDate.
      - "update_kpi": Update KPIs in "KPI_DASHBOARD".
        Payload keys: metricName, value, target.
      - "create_idea": Append idea or problem in "IDEAS_AND_PROBLEMS".
        Payload keys: type ("Idea"|"Problem"), detail, associatedBrand, status ("Open"|"Resolved").

      Structure your responses strictly in this JSON format:
      {
        "text": "Your direct reply to Vijay explaining what you have deduced or done. Respond with respect and high status.",
        "actions": [
          {
            "type": "create_task" | "update_task" | "update_daily" | "update_learning" | "update_brand" | "update_project" | "update_kpi" | "create_idea",
            "sheet": "MASTER_TASKS" | "DAILY_TASKS" | "BUSINESS_ANALYST" | "BRANDS" | "WEBSITE_PROJECTS" | "KPI_DASHBOARD" | "IDEAS_AND_PROBLEMS",
            "payload": { ... }
          }
        ]
      }
      
      Respond directly as JSON without any code blocks or raw formatting. Only return the JSON.
    `;

    const userMessageContext = `
      CURRENT SHEETS STATE COMPILED:
      ${JSON.stringify(currentData)}

      RECONCILE LOGIC FOR ENVELOPE:
      Vijay says: "${message}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: userMessageContext }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const parsedText = response.text || "{}";
    let aiResponse;
    try {
      aiResponse = JSON.parse(parsedText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", parsedText);
      aiResponse = {
        text: parsedText,
        actions: []
      };
    }

    // Execute actions if they are returned AND we are authorized
    if (aiResponse.actions && aiResponse.actions.length > 0) {
      if (!token || token === "anonymous") {
        aiResponse.text = `${aiResponse.text}\n\n⚠️ **Read-Only Preview:** I prepared your requested operations (${aiResponse.actions.map((a: any) => a.type).join(", ")}), but writing is currently in preview. To synchronize instantly, connect Vijay's Google account using the **Link Sync** option in the header.`;
        aiResponse.actions = []; // skip executions
      } else {
        console.log("VJ AI executing modifications:", aiResponse.actions);
        for (const action of aiResponse.actions) {
          try {
            if (action.type === "create_task" && action.sheet === "MASTER_TASKS") {
              const payload = action.payload || {};
              const newRow = [
                payload.taskId || `MT00${currentData.tasks.length + 1}`,
                payload.brand || "Personal Growth",
                payload.title || "New Task",
                payload.status || "Pending",
                payload.priority || "Medium",
                payload.dueDate || "2026-06-22",
                payload.notes || "",
                "2026-06-21"
              ];
              const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/MASTER_TASKS!A1:append?valueInputOption=USER_ENTERED`;
              await googleApiCall(appendUrl, token, {
                method: "POST",
                body: JSON.stringify({ values: [newRow] })
              });
            } 
            else if (action.type === "update_task" && action.sheet === "MASTER_TASKS") {
              const payload = action.payload || {};
              if (payload.taskId) {
                await updateSheetRow(spreadsheetId, token, "MASTER_TASKS", 0, payload.taskId, {
                  3: payload.status,
                  4: payload.priority,
                  5: payload.dueDate,
                  6: payload.notes,
                  7: "2026-06-21"
                });
              } else if (payload.title) {
                await updateSheetRow(spreadsheetId, token, "MASTER_TASKS", 2, payload.title, {
                  3: payload.status,
                  4: payload.priority,
                  5: payload.dueDate,
                  6: payload.notes,
                  7: "2026-06-21"
                });
              }
            } 
            else if (action.type === "update_daily" && action.sheet === "DAILY_TASKS") {
              const payload = action.payload || {};
              await updateSheetRow(spreadsheetId, token, "DAILY_TASKS", 1, payload.title || "", {
                3: payload.status,
                4: payload.completedToday
              });
            }
            else if (action.type === "update_learning" && action.sheet === "BUSINESS_ANALYST") {
              const payload = action.payload || {};
              await updateSheetRow(spreadsheetId, token, "BUSINESS_ANALYST", 0, payload.topic || "", {
                1: payload.progress,
                2: payload.status,
                3: payload.notes
              });
            }
            else if (action.type === "update_brand" && action.sheet === "BRANDS") {
              const payload = action.payload || {};
              await updateSheetRow(spreadsheetId, token, "BRANDS", 0, payload.brand || "", {
                1: payload.overview,
                2: payload.progress
              });
            }
            else if (action.type === "update_project" && action.sheet === "WEBSITE_PROJECTS") {
              const payload = action.payload || {};
              await updateSheetRow(spreadsheetId, token, "WEBSITE_PROJECTS", 0, payload.project || "", {
                2: payload.status,
                3: payload.progress,
                4: payload.targetDate
              });
            }
            else if (action.type === "update_kpi" && action.sheet === "KPI_DASHBOARD") {
              const payload = action.payload || {};
              await updateSheetRow(spreadsheetId, token, "KPI_DASHBOARD", 0, payload.metricName || "", {
                1: payload.value,
                2: payload.target
              });
            }
            else if (action.type === "create_idea" && action.sheet === "IDEAS_AND_PROBLEMS") {
              const payload = action.payload || {};
              const newRow = [
                payload.type || "Idea",
                payload.detail || "",
                payload.associatedBrand || "Personal Growth",
                payload.status || "Open"
              ];
              const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/IDEAS_AND_PROBLEMS!A1:append?valueInputOption=USER_ENTERED`;
              await googleApiCall(appendUrl, token, {
                method: "POST",
                body: JSON.stringify({ values: [newRow] })
              });
            }
          } catch (execErr) {
            console.error(`Failed to execute sheet modification ${action.type}:`, execErr);
          }
        }
      }
    }

    // Refresh after modifications
    let freshData;
    if (token && token !== "anonymous") {
      try {
        freshData = await fetchAllSheetData(spreadsheetId, token);
      } catch (err) {
        freshData = await fetchAllSheetDataPublic(spreadsheetId);
      }
    } else {
      freshData = await fetchAllSheetDataPublic(spreadsheetId);
    }

    res.json({
      text: aiResponse.text || "Synchronized.",
      actions: aiResponse.actions || [],
      updatedData: freshData
    });

  } catch (error: any) {
    console.error("POST /api/chat Catch-all Error:", error);
    const isQuotaError = error.message && (
      error.message.includes("429") || 
      error.message.toLowerCase().includes("quota") || 
      error.message.toLowerCase().includes("limit")
    );
    
    res.json({
      text: isQuotaError 
        ? "⚠️ **Central AI Advisor Quota Limit Active:** The live generative AI session has temporarily crossed its hourly free-tier limit. I've safely processed your interface context, and you can make updates directly on the relative tabs (Home, Tasks, or Ideas) which remain 100% active. Try prompting me again in a short while!" 
        : `⚠️ Operational anomaly parsed inside Gemini AI module: ${error.message}. Please verify settings configuration or database connection.`,
      actions: [],
      updatedData: null
    });
  }
});

// Configure Vite integration for dev vs. prod
const rootDir = process.cwd();
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development Server is active at http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error("Vite creation error:", err);
  });
} else {
  const distPath = path.join(rootDir, "dist");
  app.use(express.static(distPath));
  // Serve single page index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production Server running on port ${PORT}`);
  });
}
