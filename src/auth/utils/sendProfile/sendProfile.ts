import * as fs from 'fs/promises';
import * as path from 'path';
export async function male() {
  const dirPah = path.join(process.cwd(), 'uploads/Profile/boy/');
  const files = await fs.readdir(dirPah);
  const randomFile = files[Math.floor(Math.random() * files.length)];
  return `http://localhost:3000/Profile/boy/${randomFile}`;
}
export async function female() {
  const dirPah = path.join(process.cwd(), 'uploads/Profile/girl/');
  const files = await fs.readdir(dirPah);
  const randomFile = files[Math.floor(Math.random() * files.length)];
  return `http://localhost:3000/Profile/girl/${randomFile}`;
}
