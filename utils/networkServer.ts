import * as FileSystemLegacy from "expo-file-system/legacy";
import * as Network from "expo-network";
import TcpSocket from "react-native-tcp-socket";

const SERVER_PORT = 8888;
const CHUNK_SIZE = 4096; // 4KB chunks

// Get cache directory path - use legacy API for directory constants
const getCacheDirectory = (): string => {
  // Use legacy API to access cacheDirectory constant
  return (
    FileSystemLegacy.cacheDirectory || FileSystemLegacy.documentDirectory || ""
  );
};

export interface ServerInfo {
  ip: string;
  port: number;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

export interface TransferProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

// Get the local IP address of the device
export async function getLocalIPAddress(): Promise<string | null> {
  try {
    const ip = await Network.getIpAddressAsync();
    return ip;
  } catch (error) {
    console.error("Error getting IP address:", error);
    return null;
  }
}

// Create a TCP server for file sharing
export function createServer(
  onConnection: (clientSocket: any) => void,
  onError: (error: Error) => void,
): any {
  try {
    const server = TcpSocket.createServer((socket) => {
      console.log("Client connected");
      onConnection(socket);
    });

    server.listen({ port: SERVER_PORT, host: "0.0.0.0" }, () => {
      console.log(`Server listening on port ${SERVER_PORT}`);
    });

    server.on("error", (error) => {
      console.error("Server error:", error);
      onError(error);
    });

    return server;
  } catch (error) {
    console.error("Error creating server:", error);
    onError(error as Error);
    return null;
  }
}

// Send file to connected client
export async function sendFile(
  socket: any,
  fileUri: string,
  onProgress?: (progress: TransferProgress) => void,
): Promise<void> {
  try {
    // Check file existence using legacy API (new File API doesn't check existence reliably)
    const fileInfo = await FileSystemLegacy.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    const fileName = fileUri.split("/").pop() || "unknown";
    const fileSize = fileInfo.size || 0;

    // Send metadata first
    const metadata: FileMetadata = {
      name: fileName,
      size: fileSize,
      type: "audio/mpeg",
    };

    socket.write(JSON.stringify(metadata) + "\n");

    // Wait for client acknowledgment
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Client did not acknowledge")),
        5000,
      );

      socket.once("data", (data: Buffer) => {
        clearTimeout(timeout);
        const response = data.toString().trim();
        if (response === "READY") {
          resolve();
        } else {
          reject(new Error("Invalid client response"));
        }
      });
    });

    // Read file content using legacy API (new File API has issues with special characters)
    const fileContent = await FileSystemLegacy.readAsStringAsync(fileUri, {
      encoding: FileSystemLegacy.EncodingType.Base64,
    });

    let bytesSent = 0;
    const totalBytes = fileContent.length;

    for (let i = 0; i < totalBytes; i += CHUNK_SIZE) {
      const chunk = fileContent.slice(i, Math.min(i + CHUNK_SIZE, totalBytes));
      socket.write(chunk);

      bytesSent = Math.min(i + CHUNK_SIZE, totalBytes);

      if (onProgress) {
        onProgress({
          bytesTransferred: bytesSent,
          totalBytes,
          percentage: (bytesSent / totalBytes) * 100,
        });
      }

      // Small delay to avoid overwhelming the connection
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Send end marker
    socket.write("\nEND_OF_FILE\n");
    console.log("File sent successfully");
  } catch (error) {
    console.error("Error sending file:", error);
    throw error;
  }
}

// Connect to server as a client
export function connectToServer(
  ip: string,
  port: number,
  onConnect: () => void,
  onError: (error: Error) => void,
): any {
  try {
    const client = TcpSocket.createConnection({ port, host: ip }, () => {
      console.log("Connected to server");
      onConnect();
    });

    client.on("error", (error) => {
      console.error("Connection error:", error);
      onError(error);
    });

    return client;
  } catch (error) {
    console.error("Error connecting to server:", error);
    onError(error as Error);
    return null;
  }
}

// Receive file from server
export async function receiveFile(
  socket: any,
  onProgress?: (progress: TransferProgress) => void,
  onMetadata?: (metadata: FileMetadata) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let metadata: FileMetadata | null = null;
    let receivedData = "";
    let metadataReceived = false;

    socket.on("data", async (data: Buffer) => {
      const chunk = data.toString();

      if (!metadataReceived) {
        // First message is metadata
        try {
          const lines = chunk.split("\n");
          metadata = JSON.parse(lines[0]);
          metadataReceived = true;

          if (onMetadata && metadata) {
            onMetadata(metadata);
          }

          // Send acknowledgment
          socket.write("READY");

          // Handle any data that came with metadata
          if (lines.length > 1) {
            receivedData += lines.slice(1).join("\n");
          }
        } catch (error) {
          reject(new Error("Invalid metadata"));
          return;
        }
      } else {
        // Receiving file data
        if (chunk.includes("END_OF_FILE")) {
          // File transfer complete
          receivedData += chunk.split("END_OF_FILE")[0];

          try {
            // Save file to local storage using legacy API for base64 writing
            const fileName = metadata?.name || `received_${Date.now()}.mp3`;
            const cacheDir = getCacheDirectory();

            // Ensure proper path construction
            if (!cacheDir) {
              throw new Error("Cache directory is not available");
            }

            const fileUri = cacheDir + fileName;
            console.log("Saving file to:", fileUri);

            // Use legacy API for writing base64 data
            await FileSystemLegacy.writeAsStringAsync(fileUri, receivedData, {
              encoding: FileSystemLegacy.EncodingType.Base64,
            });

            console.log("File received and saved:", fileUri);
            resolve(fileUri);
          } catch (error) {
            console.error("Error saving received file:", error);
            reject(error);
          }
        } else {
          receivedData += chunk;

          if (onProgress && metadata) {
            onProgress({
              bytesTransferred: receivedData.length,
              totalBytes: metadata.size,
              percentage: (receivedData.length / metadata.size) * 100,
            });
          }
        }
      }
    });

    socket.on("error", (error: Error) => {
      reject(error);
    });

    socket.on("close", () => {
      if (!metadata || receivedData.length === 0) {
        reject(new Error("Connection closed prematurely"));
      }
    });
  });
}

// Close server
export function closeServer(server: any): void {
  if (server) {
    server.close();
    console.log("Server closed");
  }
}

// Disconnect client
export function disconnect(socket: any): void {
  if (socket) {
    socket.destroy();
    console.log("Disconnected from server");
  }
}

export { SERVER_PORT };
