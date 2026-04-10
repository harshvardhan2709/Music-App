import { Buffer } from 'buffer';
import process from 'process';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

if (typeof global.process === 'undefined') {
  global.process = process;
} else {
  // Merge process if it already exists (unlikely in pure RN)
  Object.assign(global.process, process);
}
