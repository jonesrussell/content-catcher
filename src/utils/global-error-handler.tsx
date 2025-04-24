"use client";

import { useEffect } from "react";
import type { JSX } from "react";
import ErrorStackParser from "error-stack-parser";
import { initBuildErrorDetector } from "./build-error-detector";

// Define the interface for error location info, matching the one in creatr.scripts.tsx
interface ErrorLocationInfo {
  functionName: string;
  source: string;
  line: number;
  column: number;
  message: string;
  stack:
    | Array<{
        fileName: string;
        lineNumber: number;
        columnNumber: number;
        functionName: string;
      }>
    | string;
}

// Helper function to clean webpack internal paths from file paths
function cleanWebpackPath(path: string): string {
  if (!path) return path;

  // Common webpack internal path patterns
  const patterns = [
    "webpack-internal:///app-pages-browser/.",
    "webpack-internal:///",
    "webpack://",
    "webpack:///./",
    "webpack:///",
    "webpack:/(_N_E)/",
  ];

  let cleanedPath = path;
  for (const pattern of patterns) {
    cleanedPath = cleanedPath.replace(pattern, "");
  }

  // Also clean up any remaining webpack paths with a more generic regex
  cleanedPath = cleanedPath.replace(
    /webpack[:\-][\/\\]{2,}[^\/\\]*[\/\\]?/g,
    "",
  );

  return cleanedPath;
}

// Implementation of getErrorLocation similar to the one in creatr.scripts.tsx
async function getErrorLocation(error: Error): Promise<ErrorLocationInfo> {
  try {
    // Remove NextAuth error detection
    // Parse the error stack
    const stackFrames = ErrorStackParser.parse(error);

    // Filter out frames from global-error-handler.tsx to avoid showing our handler as the source
    const filteredFrames = stackFrames.filter(
      (frame) =>
        !frame.fileName || !frame.fileName.includes("global-error-handler.tsx"),
    );

    // Remove NextAuth specific code and just use filtered frames
    const relevantFrames = filteredFrames;

    const bundledLocations = relevantFrames.map((frame) => ({
      fileName: frame.fileName ? cleanWebpackPath(frame.fileName) : "",
      lineNumber: frame.lineNumber,
      columnNumber: frame.columnNumber,
      functionName: frame.functionName,
    }));

    // Use first relevant frame for source location
    const firstFrame = bundledLocations[0] || {
      fileName: "",
      lineNumber: 0,
      columnNumber: 0,
      functionName: "",
    };

    return {
      source: firstFrame.fileName || "",
      line: firstFrame.lineNumber || 0,
      column: firstFrame.columnNumber || 0,
      functionName: firstFrame.functionName || "",
      message: error.message,
      stack:
        (bundledLocations.splice(0, 50) || []).map((frame) => ({
          fileName: frame.fileName || "",
          lineNumber: frame.lineNumber || 0,
          columnNumber: frame.columnNumber || 0,
          functionName: frame.functionName || "",
        })) ?? error.stack,
    };
  } catch (parseError) {
    // If stack parsing fails, return basic info
    console.error("Error parsing stack:", parseError);
    return {
      source: "unknown",
      line: 0,
      column: 0,
      functionName: "",
      message: error.message,
      stack: error.stack || "",
    };
  }
}

// New function to handle build errors - generalized to detect different types of build errors
function isBuildError(error: Error | unknown): boolean {
  if (!error) return false;

  // Check if it's a build error from webpack without hardcoding specific error messages
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : "";

  const isBuildErrorMessage = Boolean(
    (errorMessage &&
      typeof errorMessage === "string" &&
      (errorMessage.includes("Failed to compile") ||
        errorMessage.includes("Build error") ||
        errorMessage.includes("Module build failed") ||
        errorMessage.includes("webpack") ||
        errorMessage.includes("Compilation error") ||
        errorMessage.includes("Module not found"))) ||
      (errorStack &&
        typeof errorStack === "string" &&
        (errorStack.includes("webpack") ||
          errorStack.includes("HotModuleReplacement") ||
          errorStack.includes("Module not found"))),
  );

  return isBuildErrorMessage;
}

interface BuildErrorEventDetail {
  error: Error | string;
  source?: string;
  line?: number;
  column?: number;
  sentToParent?: boolean;
  buildErrorType?: string;
  moduleError?: Error;
  file?: string;
  location?: string;
  isChunkLoadError?: boolean;
  improvedStack?: Array<{
    fileName: string;
    lineNumber: number;
    columnNumber: number;
    functionName?: string;
  }>;
}

export function GlobalErrorHandler(): JSX.Element | null {
  useEffect(() => {
    // Initialize the build error detector
    initBuildErrorDetector();

    // Handle unhandled rejections
    const handleGlobalRejection = (event: PromiseRejectionEvent) => {
      // Prevent default handling
      event.preventDefault();

      console.log("GLOBAL HANDLER CAUGHT:", event.reason);

      // Check if it's a build error
      const isBuildErrorDetected = isBuildError(event.reason);

      if (isBuildErrorDetected) {
        console.warn("Build error intercepted:", {
          message: event.reason?.message,
          stack: event.reason?.stack,
        });

        // Create an error object if the reason isn't already one
        const errorObject =
          event.reason instanceof Error
            ? event.reason
            : new Error(
                typeof event.reason === "string"
                  ? event.reason
                  : String(event.reason),
              );

        getErrorLocation(errorObject)
          .then((locationInfo: ErrorLocationInfo) => {
            try {
              // Ensure source path is cleaned
              const source = cleanWebpackPath(locationInfo.source);

              // First window.parent.postMessage call - build error from unhandled rejection
              console.log(
                "[SENDING TO PARENT] Build error from unhandled rejection:",
                {
                  source,
                  message: locationInfo.message || String(event.reason),
                  stack: locationInfo.stack,
                  url: window.location.href,
                  timestamp: new Date().toISOString(),
                  isBuildError: true,
                  origin: "unhandled rejection",
                },
              );
              window.parent.postMessage(
                {
                  type: "ERROR",
                  payload: {
                    source,
                    message: locationInfo.message || String(event.reason),
                    stack: locationInfo.stack,
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                    isBuildError: true,
                  },
                },
                "*",
              );
            } catch (e) {
              console.error("Failed to post message:", e);
            }
          })
          .catch((e) => {
            console.error("Failed to get error location:", e);
          });

        return;
      }
    };

    // Intercept console.error to catch build errors that are directly logged
    const originalConsoleError = console.error;
    console.error = function (...args) {
      // Call the original console.error first to maintain normal behavior
      originalConsoleError.apply(console, args);

      // Show raw args for debugging
      console.debug(
        "ORIGINAL CONSOLE ERROR ARGS:",
        JSON.stringify(args, null, 2),
      );

      // Create a string representation of the error
      const errorString = args.join(" ");

      // Check if this is a build error - using generic patterns
      const isBuildErrorDetected =
        errorString.includes("Failed to compile") ||
        errorString.includes("Build error") ||
        errorString.includes("Module build failed") ||
        errorString.includes("webpack") ||
        errorString.includes("Compilation error") ||
        errorString.includes("Module not found");

      if (isBuildErrorDetected) {
        console.log("INTERCEPTED BUILD ERROR:", ...args);

        // First, check if any argument is already an Error object
        let errorObj: Error | null = null;
        for (const arg of args) {
          if (arg instanceof Error) {
            errorObj = arg;
            break;
          } else if (
            arg &&
            typeof arg === "object" &&
            arg.error instanceof Error
          ) {
            errorObj = arg.error;
            break;
          }
        }

        // If no Error object found, create one but try to avoid interfering with stack trace
        if (!errorObj) {
          // Create error with minimal stack impact
          errorObj = new Error(errorString);
          // Remove the first few frames of stack that would point to our handler
          if (errorObj.stack) {
            const stackLines = errorObj.stack.split("\n");
            // Skip frames related to our error handler
            const filteredStack = [stackLines[0]];
            for (let i = 1; i < stackLines.length; i++) {
              if (!stackLines[i].includes("global-error-handler.tsx")) {
                filteredStack.push(stackLines[i]);
              }
            }
            errorObj.stack = filteredStack.join("\n");
          }
        }

        // Look for file path in the error message
        // Look for .tsx, .ts, .js, .jsx, or .css files in the error message
        const filePathMatches = errorString.match(
          /[^\s"']+?\.(tsx|ts|js|jsx|css)(?::\d+(?::\d+)?)?/g,
        );
        let filePath = null;
        let line = 0;
        let column = 0;

        if (filePathMatches) {
          // Extract the first file path
          const filePathWithLine = filePathMatches[0];
          const filePathParts = filePathWithLine.split(":");

          filePath = cleanWebpackPath(filePathParts[0]);
          if (filePathParts.length > 1) {
            line = parseInt(filePathParts[1], 10) || 0;
          }
          if (filePathParts.length > 2) {
            column = parseInt(filePathParts[2], 10) || 0;
          }
        }

        // Send error to parent window
        try {
          const source = filePath || "webpack-build";

          // Build error - direct from console.error
          console.log("[SENDING TO PARENT] Build error from console.error:", {
            source,
            message: errorString,
            stack: errorObj.stack,
            timestamp: new Date().toISOString(),
            type: "build error",
            origin: "console error - direct",
          });
          window.parent.postMessage(
            {
              type: "ERROR",
              payload: {
                source,
                file: filePath,
                line,
                column,
                message: errorString,
                stack: errorObj.stack || "",
                url: window.location.href,
                timestamp: new Date().toISOString(),
                isBuildError: true,
                consoleError: true,
                rawError: {
                  errorObj: {
                    message: errorObj.message,
                    name: errorObj.name,
                    stack: errorObj.stack,
                  },
                },
              },
            },
            "*",
          );
        } catch (e) {
          console.error("Failed to post message:", e);
        }

        // Only run stack parsing if we need rich error info
        getErrorLocation(errorObj)
          .then((locationInfo: ErrorLocationInfo) => {
            try {
              // Ensure source path is cleaned
              const source =
                cleanWebpackPath(locationInfo.source) ||
                filePath ||
                "webpack-build";

              // Parsed build error from console.error
              console.log(
                "[SENDING TO PARENT] Parsed build error from console.error:",
                {
                  source,
                  message: errorString,
                  stack: locationInfo.stack,
                  line: locationInfo.line || line,
                  column: locationInfo.column || column,
                  timestamp: new Date().toISOString(),
                  type: "build error",
                  origin: "console error - parsed",
                },
              );
              window.parent.postMessage(
                {
                  type: "ERROR",
                  payload: {
                    source,
                    message: errorString,
                    stack: locationInfo.stack,
                    url: window.location.href,
                    line: locationInfo.line || line,
                    column: locationInfo.column || column,
                    timestamp: new Date().toISOString(),
                    isBuildError: true,
                    consoleError: true,
                  },
                },
                "*",
              );
            } catch (e) {
              console.error("Failed to post message:", e);
            }
          })
          .catch((e) => {
            console.error("Failed to get error location:", e);
          });
      }

      // Remove NextAuth error check
    };

    // Listen for build error events from the webpack hot module replacement system
    const handleBuildErrorEvent = (
      event: CustomEvent<BuildErrorEventDetail>,
    ): void => {
      if (event.detail && event.detail.error) {
        console.warn("Build error event detected:", event.detail);
        const error = event.detail.error;
        const source = event.detail.source || "unknown";
        const line = event.detail.line;
        const column = event.detail.column;
        const buildErrorType = event.detail.buildErrorType || "unknown";
        const moduleError = event.detail.moduleError;
        const file = event.detail.file || "unknown";
        const location = event.detail.location || "unknown";
        const isChunkLoadError = event.detail.isChunkLoadError || false;
        const improvedStack = event.detail.improvedStack || [];

        // Log the error to the console
        console.error("Build Error:", {
          error,
          source,
          line,
          column,
          buildErrorType,
          moduleError,
          file,
          location,
          isChunkLoadError,
          improvedStack,
        });

        // Send the error to the parent window if not already sent
        if (!event.detail.sentToParent && window.parent !== window) {
          window.parent.postMessage(
            {
              type: "build-error",
              error: error instanceof Error ? error.message : error,
              source,
              line,
              column,
              buildErrorType,
              moduleError:
                moduleError instanceof Error
                  ? moduleError.message
                  : moduleError,
              file,
              location,
              isChunkLoadError,
              improvedStack,
            },
            "*",
          );
          event.detail.sentToParent = true;
        }
      }
    };

    // Add listener for custom webpack build error events
    window.addEventListener("webpack-build-error", (event: Event) => {
      const customEvent = event as CustomEvent<BuildErrorEventDetail>;
      handleBuildErrorEvent(customEvent);
    });

    // Remove NextAuth fetch API patching

    window.addEventListener("unhandledrejection", handleGlobalRejection);

    return () => {
      // Restore original functions when component unmounts
      console.error = originalConsoleError;
      // Remove fetch patching restoration
      window.removeEventListener("unhandledrejection", handleGlobalRejection);
      window.removeEventListener("webpack-build-error", (event: Event) => {
        const customEvent = event as CustomEvent<BuildErrorEventDetail>;
        handleBuildErrorEvent(customEvent);
      });
    };
  }, []);

  return null;
}
