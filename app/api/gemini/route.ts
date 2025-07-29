import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
  let resolvedCwd = process.cwd(); // Initialize here for scope access
  
  try {
    const body = await request.json();
    const { command, cwd } = body;

    console.log('Received command:', command);
    console.log('Working directory:', cwd);

    // Use the provided working directory if available, otherwise fallback to user profile
    const userProfileDir = process.env.USERPROFILE || process.env.HOME || process.cwd();
    
    // Resolve the working directory
    if (cwd && cwd !== '.' && cwd !== '~') {
      // Check if the provided directory exists
      try {
        if (fs.existsSync(cwd) && fs.statSync(cwd).isDirectory()) {
          resolvedCwd = cwd;
          console.log('Using provided directory:', cwd);
        } else {
          console.log('Provided directory does not exist, falling back to user profile');
          resolvedCwd = userProfileDir;
        }
      } catch (error) {
        console.log('Error accessing provided directory, falling back to user profile:', error);
        resolvedCwd = userProfileDir;
      }
    } else if (cwd === '~') {
      // If it's ~, use the user profile directory
      resolvedCwd = userProfileDir;
    } else {
      // Default fallback
      resolvedCwd = userProfileDir;
    }

    console.log('Using working directory:', resolvedCwd);

    const { stdout, stderr } = await execPromise(command, {
      cwd: resolvedCwd,
      timeout: 60000, // Increased to 60 seconds
      maxBuffer: 1024 * 1024 * 10,
      env: { 
        ...process.env,
        PWD: resolvedCwd,
        HOME: userProfileDir,
      },
    });

    console.log('Command stdout:', stdout);
    console.log('Command stderr:', stderr);

    const cleanedStdout = stdout
      .split("\n")
      .filter((line: string) => !line.includes("Loaded cached credentials."))
      .join("\n")
      .trim();

    return NextResponse.json({ 
      stdout: cleanedStdout, 
      stderr: stderr?.trim() || '', 
      cwd: resolvedCwd 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    
    // Check if we got output even though the command was killed/timed out
    if (error.stdout && error.stdout.length > 0) {
      console.log('Command was interrupted but got partial response');
      const cleanedStdout = error.stdout
        .split("\n")
        .filter((line: string) => !line.includes("Loaded cached credentials."))
        .join("\n")
        .trim();
      
      return NextResponse.json({ 
        stdout: cleanedStdout, 
        stderr: error.stderr?.trim() || '', 
        cwd: resolvedCwd || process.cwd(),
        warning: 'Response may be incomplete due to timeout'
      });
    }
    
    return NextResponse.json(
      {
        error: error.message,
        stderr: error.stderr || null,
        stdout: error.stdout || null,
        cwd: process.cwd(),
      },
      { status: 500 }
    );
  }
}
