import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface DeepDiveRequest {
  id: string;
  businessName: string;
  businessUrl: string;
  aiEngines: string[];
  queryCount: number;
  queryTypes: string[];
  notes?: string;
  status: 'pending' | 'completed';
  competitorsMentioned?: string;
  yourMentions?: string;
  extractedQueries?: string;
  recommendations?: string;
  createdAt: string;
  completedAt?: string;
}

const DATA_DIR = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'deep-dive-requests.json');

// Ensure data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

// Read all requests
export async function getAllRequests(): Promise<DeepDiveRequest[]> {
  await ensureDataDir();

  try {
    if (!existsSync(DATA_FILE)) {
      return [];
    }
    const data = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading deep dive requests:', error);
    return [];
  }
}

// Get single request by ID
export async function getRequestById(id: string): Promise<DeepDiveRequest | null> {
  const requests = await getAllRequests();
  return requests.find(r => r.id === id) || null;
}

// Create new request
export async function createRequest(data: Omit<DeepDiveRequest, 'id' | 'status' | 'createdAt'>): Promise<DeepDiveRequest> {
  await ensureDataDir();

  const requests = await getAllRequests();

  // Generate unique ID
  const id = `DD-${Date.now()}`;

  const newRequest: DeepDiveRequest = {
    ...data,
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  requests.push(newRequest);
  await writeFile(DATA_FILE, JSON.stringify(requests, null, 2));

  return newRequest;
}

// Update request with results
export async function updateRequestResults(
  id: string,
  results: {
    competitorsMentioned: string;
    yourMentions: string;
    extractedQueries: string;
    recommendations: string;
  }
): Promise<DeepDiveRequest | null> {
  await ensureDataDir();

  const requests = await getAllRequests();
  const index = requests.findIndex(r => r.id === id);

  if (index === -1) return null;

  requests[index] = {
    ...requests[index],
    ...results,
    status: 'completed',
    completedAt: new Date().toISOString(),
  };

  await writeFile(DATA_FILE, JSON.stringify(requests, null, 2));

  return requests[index];
}

// Delete request
export async function deleteRequest(id: string): Promise<boolean> {
  await ensureDataDir();

  const requests = await getAllRequests();
  const filteredRequests = requests.filter(r => r.id !== id);

  if (filteredRequests.length === requests.length) {
    return false; // Not found
  }

  await writeFile(DATA_FILE, JSON.stringify(filteredRequests, null, 2));
  return true;
}
