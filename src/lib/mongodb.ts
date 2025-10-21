import { MongoClient, type Db, type Collection } from "mongodb";
import type {
  ExpertiseDoc,
  JobPositionDoc,
  ProjectDoc,
  ToolDoc,
} from "./types";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const getClientPromise = (): Promise<MongoClient> => {
  if (!uri) {
    throw new Error("MONGODB_URI n'est pas défini dans l'environnement.");
  }

  if (!client) {
    client = new MongoClient(uri);
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClientPromise) {
      globalThis._mongoClientPromise = client.connect();
    }
    return (clientPromise = globalThis._mongoClientPromise);
  }

  if (!clientPromise) {
    clientPromise = client.connect();
  }

  return clientPromise;
};

export const getDb = async (): Promise<Db> => {
  if (!dbName) {
    throw new Error("MONGODB_DB n'est pas défini dans l'environnement.");
  }
  const connectedClient = await getClientPromise();
  return connectedClient.db(dbName);
};

export const projects = async (): Promise<Collection<ProjectDoc>> => {
  const db = await getDb();
  return db.collection<ProjectDoc>("projects");
};

export const expertises = async (): Promise<Collection<ExpertiseDoc>> => {
  const db = await getDb();
  return db.collection<ExpertiseDoc>("expertises");
};

export const jobpositions = async (): Promise<Collection<JobPositionDoc>> => {
  const db = await getDb();
  return db.collection<JobPositionDoc>("jobpositions");
};

export const tools = async (): Promise<Collection<ToolDoc>> => {
  const db = await getDb();
  return db.collection<ToolDoc>("tools");
};
