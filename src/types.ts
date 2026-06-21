export interface Task {
  id: string;
  brand: string;
  title: string;
  status: 'Pending' | 'Completed' | 'Waiting' | 'Blocked' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  notes: string;
  updatedAt: string;
  category?: string; // e.g. Development, Admin, Research, etc.
}

export interface BrandInfo {
  brand: string;
  overview: string;
  progress: number; // 0 to 100
}

export interface DailyTask {
  id: string;
  title: string;
  schedule: string; // e.g. "Daily", "Weekly", "Monday"
  status: 'Pending' | 'Completed';
  completedToday: 'Yes' | 'No';
}

export interface BusinessAnalystLearning {
  topic: string;
  progress: number; // 0 to 100
  status: 'Not Started' | 'In Progress' | 'Completed';
  notes: string;
}

export interface StockMarketJournal {
  date: string;
  tradeDetail: string;
  outcome: string; // "Profit" | "Loss" | "No Trade"
  progress: number; // e.g. learning progress or metric value
}

export interface WebsiteProject {
  project: string;
  brand: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'Stalled';
  progress: number;
  targetDate: string;
}

export interface KPIMetric {
  metricName: string;
  value: string;
  target: string;
}

export interface IdeaOrProblem {
  type: 'Idea' | 'Problem';
  detail: string;
  associatedBrand: string;
  status: 'Open' | 'Resolved' | 'Snoozed';
}

// Full Sheet State
export interface SheetDataState {
  tasks: Task[];
  brands: BrandInfo[];
  dailyTasks: DailyTask[];
  businessAnalyst: BusinessAnalystLearning[];
  stockMarket: StockMarketJournal[];
  websiteProjects: WebsiteProject[];
  kpis: KPIMetric[];
  ideas: IdeaOrProblem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actions?: Array<{
    type: 'create' | 'update' | 'delete';
    sheet: string;
    details: string;
  }>;
}
