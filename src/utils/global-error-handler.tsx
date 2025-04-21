"use client";

import { useEffect } from "react";
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
		"webpack:/(_N_E)/"
	];

	let cleanedPath = path;
	for (const pattern of patterns) {
		cleanedPath = cleanedPath.replace(pattern, "");
	}

	// Also clean up any remaining webpack paths with a more generic regex
	cleanedPath = cleanedPath.replace(/webpack[:\-][\/\\]{2,}[^\/\\]*[\/\\]?/g, "");

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
			fileName: frame.fileName
				? cleanWebpackPath(frame.fileName)
				: "",
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
			source: firstFrame.fileName,
			line: firstFrame.lineNumber,
			column: firstFrame.columnNumber,
			functionName: firstFrame.functionName,
			message: error.message,
			stack: bundledLocations.splice(0, 50) ?? error.stack,
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
function isBuildError(error: Error | any): boolean {
	if (!error) return false;

	// Check if it's a build error from webpack without hardcoding specific error messages
	const isBuildErrorMessage =
		(error.message && typeof error.message === 'string' && (
			error.message.includes('Failed to compile') ||
			error.message.includes('Build error') ||
			error.message.includes('Module build failed') ||
			error.message.includes('webpack') ||
			error.message.includes('Compilation error') ||
			error.message.includes('Module not found')
		)) ||
		(error.stack && typeof error.stack === 'string' && (
			error.stack.includes('webpack') ||
			error.stack.includes('HotModuleReplacement') ||
			error.stack.includes('Module not found')
		));

	return isBuildErrorMessage;
}

export function GlobalErrorHandler(): JSX.Element {

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
							console.log("[SENDING TO PARENT] Build error from unhandled rejection:", {
								source,
								message: locationInfo.message || String(event.reason),
								stack: locationInfo.stack,
								url: window.location.href,
								timestamp: new Date().toISOString(),
								isBuildError: true,
								origin: "unhandled rejection"
							});
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
				const filePathMatches = errorString.match(/[^\s"']+?\.(tsx|ts|js|jsx|css)(?::\d+(?::\d+)?)?/g);
				let filePath = null;
				let line = 0;
				let column = 0;

				if (filePathMatches) {
					// Extract the first file path
					const filePathWithLine = filePathMatches[0];
					const filePathParts = filePathWithLine.split(':');

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
						origin: "console error - direct"
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
							const source = cleanWebpackPath(locationInfo.source) || (filePath || "webpack-build");

							// Parsed build error from console.error
							console.log("[SENDING TO PARENT] Parsed build error from console.error:", {
								source,
								message: errorString,
								stack: locationInfo.stack,
								line: locationInfo.line || line,
								column: locationInfo.column || column,
								timestamp: new Date().toISOString(),
								type: "build error",
								origin: "console error - parsed"
							});
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
		const handleBuildErrorEvent = (event: any) => {
			if (event.detail && event.detail.error) {
				console.warn("Build error event detected:", event.detail);

				// Get the error object from the event
				const errorObj = event.detail.error instanceof Error
					? event.detail.error
					: new Error(String(event.detail.error));

				// Check if we've already sent this error to parent window
				if (event.detail.sentToParent) {
					return;
				}

				// Clean any webpack paths in the event details
				if (event.detail.source) {
					event.detail.source = cleanWebpackPath(event.detail.source);
				}
				if (event.detail.file) {
					event.detail.file = cleanWebpackPath(event.detail.file);
				}

				// If the error already has location information from build-error-detector.ts,
				// use it directly to send to the parent window
				if (event.detail.source !== undefined &&
					event.detail.line !== undefined &&
					event.detail.column !== undefined) {

					try {
						const source = cleanWebpackPath(event.detail.source) || "webpack-build";

						// Build error - direct from build event
						console.log("[SENDING TO PARENT] Direct build error from build event:", {
							source,
							message: errorObj.message,
							line: event.detail.line || 0,
							column: event.detail.column || 0,
							buildErrorType: event.detail.buildErrorType || "unknown",
							file: event.detail.file || null,
							moduleError: event.detail.moduleError || null,
							timestamp: new Date().toISOString(),
							type: "build error",
							origin: "build event - direct"
						});
						window.parent.postMessage(
							{
								type: "ERROR",
								payload: {
									message: errorObj.message,
									source,
									line: event.detail.line || 0,
									column: event.detail.column || 0,
									stack: errorObj.stack || "",
									functionName: event.detail.functionName || "",
									improvedStack: event.detail.improvedStack || [],
									url: window.location.href,
									timestamp: new Date().toISOString(),
									isBuildError: true,
									buildErrorType: event.detail.buildErrorType || "unknown",
									moduleError: event.detail.moduleError || null,
									file: event.detail.file || null,
									location: event.detail.location || null,
									buildEvent: true
								},
							},
							"*"
						);

						// Mark as sent
						event.detail.sentToParent = true;

						console.log("Sent build error to parent window with direct location info:", {
							source,
							message: errorObj.message,
						});
					} catch (e) {
						console.error("Failed to post direct error message:", e);
					}
				} else {
					// Parse the error stack to get detailed location information
					getErrorLocation(errorObj)
						.then((locationInfo: ErrorLocationInfo) => {
							try {
								const source = cleanWebpackPath(locationInfo.source) || "webpack-build";
								const file = cleanWebpackPath(event.detail.file) || source;

								// Build error - parsed from build event
								console.log("[SENDING TO PARENT] Parsed build error from build event:", {
									source,
									message: errorObj.message,
									stack: locationInfo.stack,
									line: locationInfo.line,
									column: locationInfo.column,
									buildErrorType: event.detail.buildErrorType || "unknown",
									file,
									timestamp: new Date().toISOString(),
									type: "build error",
									origin: "build event - parsed"
								});
								window.parent.postMessage(
									{
										type: "ERROR",
										payload: {
											source,
											message: errorObj.message || "Build error",
											stack: locationInfo.stack,
											url: window.location.href,
											timestamp: new Date().toISOString(),
											isBuildError: true,
											buildEvent: true,
											functionName: locationInfo.functionName,
											line: locationInfo.line,
											column: locationInfo.column,
											buildErrorType: event.detail.buildErrorType || "unknown",
											moduleError: event.detail.moduleError || null,
											file,
											isChunkLoadError: event.detail.isChunkLoadError || false
										},
									},
									"*"
								);

								// Mark as sent
								event.detail.sentToParent = true;

								console.log("Sent parsed build error to parent window:", {
									source,
									message: errorObj.message,
								});
							} catch (e) {
								console.error("Failed to post parsed message:", e);
							}
						})
						.catch((e) => {
							console.error("Failed to get error location:", e);

							// If parsing fails, still try to send basic error info
							try {
								// Build error - fallback from build event
								console.log("[SENDING TO PARENT] Fallback build error from build event:", {
									source: "webpack-build",
									message: errorObj.message,
									stack: errorObj.stack,
									buildErrorType: event.detail.buildErrorType || "unknown",
									timestamp: new Date().toISOString(),
									type: "build error",
									origin: "build event - fallback",
									parseError: true
								});
								window.parent.postMessage(
									{
										type: "ERROR",
										payload: {
											source: "webpack-build",
											message: errorObj.message || "Build error",
											stack: errorObj.stack || "",
											url: window.location.href,
											timestamp: new Date().toISOString(),
											isBuildError: true,
											buildEvent: true,
											buildErrorType: event.detail.buildErrorType || "unknown",
											parseError: true
										},
									},
									"*"
								);
							} catch (err) {
								console.error("Failed to post fallback message:", err);
							}
						});
				}
			}
		};

		// Add listener for custom webpack build error events
		window.addEventListener('webpack-build-error', handleBuildErrorEvent);

		// Remove NextAuth fetch API patching

		window.addEventListener("unhandledrejection", handleGlobalRejection);

		return () => {
			// Restore original functions when component unmounts
			console.error = originalConsoleError;
			// Remove fetch patching restoration
			window.removeEventListener("unhandledrejection", handleGlobalRejection);
			window.removeEventListener('webpack-build-error', handleBuildErrorEvent);
		};
	}, []);

	return null;
}