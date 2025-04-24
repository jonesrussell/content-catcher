/**
 * Build Error Detector
 * 
 * This module provides functionality to detect and report Next.js build errors
 * in the client environment. It works in conjunction with the GlobalErrorHandler
 * to provide a unified error reporting experience.
 */

import ErrorStackParser from "error-stack-parser";

// Add TypeScript declarations for Next.js error overlay properties
declare global {
	interface Window {
		__NEXT_ERROR_OVERLAY__?: {
			onBuildError?: (error: BuildError | string) => void;
		};
		__NEXT_BUILD_ERROR_LISTENER__?: (errorData: BuildError | string) => void;
	}
}

interface BuildError extends Error {
	rawError?: {
		loc?: {
			line: number;
			column: number;
		};
		moduleId?: string;
	};
	rawEvent?: {
		filename?: string;
		line?: number;
		column?: number;
		lineno?: number;
		colno?: number;
	};
	moduleName?: string;
	moduleIdentifier?: string;
	file?: string;
	loc?: {
		line: number;
		column: number;
	};
	line?: number;
	column?: number;
	buildErrorType?: string;
	origin?: string;
}

type BuildErrorDetails = {
	moduleError: string | null;
	file: string | null;
	location: string | null;
	source: string | null;
	line: number;
	column: number;
	buildErrorType: string;
	origin: string;
};

type ChunkLoadErrorDetails = {
	isChunkLoadError: boolean;
	buildErrorType: string;
	source: string | null;
	origin: string;
	rawEvent: {
		filename?: string;
		lineno?: number;
		colno?: number;
		message?: string;
	};
	file?: string;
	line?: number;
	column?: number;
};

// Function to parse detailed build error information
function parseDetailedBuildError(error: BuildError | string): BuildErrorDetails {
	const details: BuildErrorDetails = {
		moduleError: null,
		file: null,
		location: null,
		source: null,
		line: 0,
		column: 0,
		buildErrorType: "webpack-build",
		origin: "error-overlay-patch"
	};

	if (!error) return details;

	const errorMessage = error instanceof Error ? error.message : error;

	// Log the exact error message for debugging
	console.warn('Build error detected:', errorMessage);

	// Next.js-specific error pattern with file, line, and column in brackets
	// Matches formats like "╭─[/path/to/file.tsx:65:1]"
	const nextjsErrorPattern = /╭─\[(.+?):(\d+):(\d+)\]/;
	const nextjsMatch = errorMessage.match(nextjsErrorPattern);

	if (nextjsMatch) {
		details.file = nextjsMatch[1];
		details.line = parseInt(nextjsMatch[2], 10);
		details.column = parseInt(nextjsMatch[3], 10);
		details.source = details.file;
	}

	// Standard file:line:column pattern
	// Matches formats like "[/path/to/file.tsx:65:1]" or "at /path/to/file.tsx:65:1"
	if (!details.file) {
		const fileLineColPattern = /(?:\[|\s|^)([^()[\]]+?):(\d+):(\d+)(?:\]|\s|$)/;
		const fileLineColMatch = errorMessage.match(fileLineColPattern);

		if (fileLineColMatch) {
			details.file = fileLineColMatch[1];
			details.line = parseInt(fileLineColMatch[2], 10);
			details.column = parseInt(fileLineColMatch[3], 10);
			details.source = details.file;
		}
	}

	// Path shown in "File: path/to/file.js" format
	if (!details.file) {
		const filePattern = /File:\s+(.+?\.[a-zA-Z0-9]+)/;
		const fileMatch = errorMessage.match(filePattern);

		if (fileMatch) {
			details.file = fileMatch[1];
			details.source = details.file;
		}
	}

	// Extract the actual error message without the file info
	// Next.js specific error format (with ×)
	const nextjsErrorDescriptionPattern = /Error:\s+×\s+(.+?)(?:\n|$)/;
	const nextjsErrorMatch = errorMessage.match(nextjsErrorDescriptionPattern);

	if (nextjsErrorMatch) {
		details.moduleError = nextjsErrorMatch[1].trim();
	} else {
		// Standard error message format
		const errorPattern = /Error:\s+(.+?)(?:\n|$)/;
		const errorMatch = errorMessage.match(errorPattern);

		if (errorMatch) {
			details.moduleError = errorMatch[1].trim();
		}
	}

	// Handle raw data from the error-overlay component
	if (error instanceof Error && 'rawError' in error && error.rawError && error.rawError.loc) {
		if (!details.file && error.rawError.moduleId) {
			details.file = error.rawError.moduleId;
		}
		if (!details.line && error.rawError.loc.line) {
			details.line = error.rawError.loc.line;
		}
		if (!details.column && error.rawError.loc.column) {
			details.column = error.rawError.loc.column;
		}
	}

	// Extract information from the raw event if available
	if (error instanceof Error && 'rawEvent' in error && error.rawEvent) {
		if (!details.file && error.rawEvent.filename) {
			details.file = error.rawEvent.filename;
		}
		if (!details.line && error.rawEvent.lineno) {
			details.line = error.rawEvent.lineno;
		}
		if (!details.column && error.rawEvent.colno) {
			details.column = error.rawEvent.colno;
		}
	}

	// Parse stack trace if available
	if (error instanceof Error && error.stack) {
		try {
			const stackFrames = ErrorStackParser.parse(error);
			details.location = stackFrames.map(frame => 
				`${frame.fileName}:${frame.lineNumber}:${frame.columnNumber}`
			).join('\n');
		} catch (e) {
			console.warn('Failed to parse stack trace:', e);
		}
	}

	return details;
}

// Function to send error to parent window
function sendErrorToParent(error: BuildError | string, additionalDetails: Partial<BuildErrorDetails> = {}) {
	try {
		const errorMessage = error instanceof Error ? error.message : error;
		const errorObj = new Error(errorMessage);

		// Preserve original stack if available
		if (error instanceof Error && error.stack) {
			errorObj.stack = error.stack;
		}

		// Extract additional details from the error object
		const details = parseDetailedBuildError(error);

		// Send error to parent window
		window.parent.postMessage({
			type: 'build-error',
			error: errorObj.message,
			...details,
			...additionalDetails
		}, '*');
	} catch (e) {
		console.error('Failed to send error to parent:', e);
	}
}

// Set up the global build error handler for Next.js
if (typeof window !== 'undefined') {
	// Hook into Next.js error overlay system
	// This will capture errors from webpack HMR updates
	const originalErrorOverlay = window.__NEXT_ERROR_OVERLAY__;

	if (originalErrorOverlay) {
		const originalOnBuildError = originalErrorOverlay.onBuildError;

		// Patch the Next.js build error handler
		originalErrorOverlay.onBuildError = (error: Error | string) => {
			// First, call the original handler to maintain default behavior
			if (originalOnBuildError) {
				originalOnBuildError(error);
			}

			// Then, send error to parent window
			try {
				const errorMessage = error instanceof Error ? error.message : error;
				const errorObj = new Error(errorMessage);

				// Preserve original stack if available
				if (error instanceof Error && error.stack) {
					errorObj.stack = error.stack;
				}

				// Extract additional details from the error object
				const details = parseDetailedBuildError(error);

				console.warn('Build error intercepted by detector:', details);

				// Send to parent window
				sendErrorToParent(errorObj, details);

				// Also dispatch event for GlobalErrorHandler
				const event = new CustomEvent('webpack-build-error', {
					detail: {
						error: errorObj,
						...details,
						sentToParent: true // Mark as already sent to parent
					}
				});
				window.dispatchEvent(event);
			} catch (e) {
				console.error('Failed to handle build error:', e);
			}
		};
	}

	// Also listen for webpack chunk loading errors
	window.addEventListener('error', (event) => {
		const error = event.error || event;

		// Check if this is a chunk loading error from webpack
		if (error &&
			typeof error.message === 'string' &&
			(error.message.includes('Loading chunk') ||
				error.message.includes('Loading CSS chunk') ||
				error.message.includes('webpack') ||
				error.message.includes('Module build failed'))) {

			console.warn('Webpack chunk loading error detected:', error);

			try {
				const errorObj = error instanceof Error
					? error
					: new Error(error.message || 'Chunk loading error');

				// Preserve original stack if available
				if (error.stack && !errorObj.stack) {
					errorObj.stack = error.stack;
				}

				const details: ChunkLoadErrorDetails = {
					isChunkLoadError: true,
					buildErrorType: "chunk-loading",
					source: null, // Let the parser find the actual source
					origin: "chunk-load-event",
					// Add raw event data
					rawEvent: {
						filename: event.filename,
						lineno: event.lineno,
						colno: event.colno,
						message: event.message
					}
				};

				// If the event has filename/line info, use it
				if (event.filename && !details.source) {
					details.source = event.filename;
					details.file = event.filename;
				}

				if (event.lineno) {
					details.line = event.lineno;
				}

				if (event.colno) {
					details.column = event.colno;
				}

				// Send to parent window directly
				sendErrorToParent(errorObj, details);

				// Also dispatch event for GlobalErrorHandler
				const errorEvent = new CustomEvent('webpack-build-error', {
					detail: {
						error: errorObj,
						...details,
						timestamp: new Date().toISOString(),
						sentToParent: true // Mark as already sent to parent
					}
				});
				window.dispatchEvent(errorEvent);
			} catch (e) {
				console.error('Failed to dispatch chunk error event:', e);
			}
		}
	}, true); // Use capture phase to catch errors before they're handled elsewhere

	// Listen for raw webpack errors via console messages
	const originalConsoleError = console.error;
	console.error = function (...args) {
		// Call the original first
		originalConsoleError.apply(console, args);

		// Try to detect build errors in console output
		try {
			const errorString = args.join(' ');

			// Check if this looks like a build error
			const isBuildError =
				errorString.includes('Failed to compile') ||
				errorString.includes('Module build failed') ||
				errorString.includes('Module not found') ||
				errorString.includes('Compilation error') ||
				errorString.includes('ErrorBoundaryClient');

			if (isBuildError) {

				// Try to create a proper error object
				const errorObj = new Error(errorString);

				// Send it to the parent
				sendErrorToParent(errorObj, {
					origin: 'console-error',
					buildErrorType: 'webpack'
				});
			}
		} catch (e) {
			// Don't break if our detection fails
			console.warn('Error processing console output:', e);
		}
	};

	// Set up global error listener function for webpack
	// This can be called directly from webpack error hooks
	window.__NEXT_BUILD_ERROR_LISTENER__ = function (errorData: BuildError | string) {
		try {
			console.warn('Build error reported via global listener:', errorData);

			const errorMessage = errorData instanceof Error ? errorData.message : errorData;
			const errorObj = new Error(errorMessage);

			// Preserve original stack if available
			if (errorData instanceof Error && errorData.stack) {
				errorObj.stack = errorData.stack;
			}

			// Extract additional details from the error object
			const details = parseDetailedBuildError(errorData);

			// Send error to parent window
			window.parent.postMessage({
				type: 'build-error',
				error: errorObj.message,
				...details
			}, '*');
		} catch (e) {
			console.error('Failed to send error to parent:', e);
		}
	};
}

// Export a dummy function to allow importing this file
export function initBuildErrorDetector(): void {
	// Initialization happens automatically when this file is imported
	console.log('Build error detector initialized');
} 