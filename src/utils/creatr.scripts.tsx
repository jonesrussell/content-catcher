//@ts-nocheck
"use client";

import React, { useEffect, useState, useRef, PropsWithChildren } from "react";
import ErrorStackParser from "error-stack-parser";

// Types and Interfaces
interface ElementMetadata {
	tagName: string;
	classNames: string;
	elementId: string | null;
	textContent: string | null;
	boundingBox: DOMRect;
	attributes: Array<{
		name: string;
		value: string;
	}>;
	uniqueId: string;
}

interface ErrorLocationInfo {
	source: string;
	line: number;
	column: number;
	message: string;
	stack: string;
	functionName: string;
	improvedStack: Array<{
		fileName: string;
		lineNumber: number;
		columnNumber: number;
		functionName: string;
	}>;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

// Check for server-side rendering
const isServer = typeof window === "undefined";

// Handle Node.js modules conditionally
let fs: any = null;
let path: any = null;
let SourceMapConsumer: any = null;

// Use dynamic imports to avoid bundling server-only modules in client code
if (isServer) {
	// Server-side only imports
	import("fs").then((module) => {
		fs = module;
	});
	import("path").then((module) => {
		path = module;
	});
	import("source-map").then((module) => {
		SourceMapConsumer = module.SourceMapConsumer;
	});
}

interface ErrorLocationInfo {
	source: string;
	line: number;
	column: number;
	message: string;
	stack: string;
	functionName: string;
	improvedStack: Array<{
		fileName: string;
		lineNumber: number;
		columnNumber: number;
		functionName: string;
	}>;
}

async function getErrorLocation(error: Error): Promise<ErrorLocationInfo> {
	// Parse the error stack
	const stackFrames = ErrorStackParser.parse(error);

	const bundledLocations = stackFrames
		// .filter((frame) => frame.fileName.includes("src"))
		.map((frame) => ({
			fileName: frame.fileName
				? frame.fileName.replace("webpack-internal:///app-pages-browser/.", "")
				: "",
			lineNumber: frame.lineNumber,
			columnNumber: frame.columnNumber,
			functionName: frame.functionName,
		}));

	return {
		source: bundledLocations[0].fileName,
		line: bundledLocations[0].lineNumber,
		column: bundledLocations[0].columnNumber,
		functionName: bundledLocations[0].functionName,
		message: error.message,
		stack: error.stack || "",
		improvedStack: bundledLocations.splice(0, 50),
	};
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundaryClient extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	// Add cleanup property to the class
	private cleanup?: () => void;

	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	async componentDidCatch(
		error: Error,
		errorInfo: React.ErrorInfo,
	): Promise<void> {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		this.setState({ hasError: true, error });

		const locationInfo = await getErrorLocation(error);

		try {
			window.parent.postMessage(
				{
					type: "ERROR",
					payload: {
						message: locationInfo.message,
						source: locationInfo.source,
						line: locationInfo.line,
						column: locationInfo.column,
						functionName: locationInfo.functionName,
						improvedStack: locationInfo.improvedStack,
						stack: locationInfo.stack,
						componentStack: errorInfo.componentStack,
						url: window.location.href,
						timestamp: new Date().toISOString(),
					},
				},
				"*",
			);
		} catch (e) {
			console.error("Failed to post message:", e);
		}
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		console.error("ErrorBoundaryClient getDerivedStateFromError:", error);
		return { hasError: true, error };
	}

	async componentDidMount(): Promise<void> {
		const handleError = async (event: ErrorEvent): Promise<void> => {
			console.error("Runtime Error:", event);
			this.setState({ hasError: true, error: event.error });

			const locationInfo = await getErrorLocation(event.error);

			try {
				window.parent.postMessage(
					{
						type: "ERROR",
						payload: {
							message: locationInfo.message,
							source: locationInfo.source,
							lineno: locationInfo.line,
							colno: locationInfo.column,
							functionName: locationInfo.functionName,
							stack: locationInfo.stack,
							improvedStack: locationInfo.improvedStack,
							url: window.location.href,
							timestamp: new Date().toISOString(),
							// stack: event.error?.stack,
						},
					},
					"*",
				);
			} catch (e) {
				console.error("Failed to post message:", e);
			}
		};

		const handlePromiseRejection = async (
			event: PromiseRejectionEvent,
		): Promise<void> => {
			console.error("Unhandled Promise Rejection:", event.reason);
			this.setState({ hasError: true, error: event.reason });

			const locationInfo = await getErrorLocation(event.reason);

			try {
				window.parent.postMessage(
					{
						type: "ERROR",
						payload: {
							source: locationInfo.source,
							message: locationInfo.message || String(event.reason),
							stack: locationInfo.stack,
							improvedStack: locationInfo.improvedStack,
							url: window.location.href,
							timestamp: new Date().toISOString(),
						},
					},
					"*",
				);
			} catch (e) {
				console.error("Failed to post message:", e);
			}
		};

		window.addEventListener("error", handleError);
		window.addEventListener("unhandledrejection", handlePromiseRejection);

		// Store cleanup function in a class property
		this.cleanup = () => {
			window.removeEventListener("error", handleError);
			window.removeEventListener("unhandledrejection", handlePromiseRejection);
		};
	}

	componentWillUnmount(): void {
		// Call cleanup function if it exists
		if (this.cleanup) {
			this.cleanup();
		}
	}

	render() {
		return this.props.children;
	}
}

/******************
 * Branding
 ******************/
export function Branding() {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		// Handle incoming messages
		const handleMessage = (event: MessageEvent) => {
			if (event.data.type === "TOGGLE_BRANDING") {
				setIsVisible(event.data.visible);
			}
		};

		// Check if running in iframe
		const isInIframe = window !== window.parent;
		if (isInIframe) {
			setIsVisible(false);
		}

		// Add message listener
		window.addEventListener("message", handleMessage);

		// Cleanup
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	if (!isVisible) return null;

	return (
		<a
			href="https://getcreatr.com"
			target="_blank"
			rel="noopener noreferrer"
			className="group fixed bottom-4 right-4 z-50 flex items-center rounded-md bg-black/90 px-2.5 py-1.5 font-sans text-xs text-white shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-black hover:shadow-xl"
		>
			<span className="mr-1.5">Powered by</span>
			<span className="font-semibold">Creatr</span>
		</a>
	);
}

/******************
 * DOM Inspector
 ******************/
interface ElementMetadata {
	tagName: string;
	classNames: string;
	elementId: string | null;
	textContent: string | null;
	boundingBox: DOMRect;
	attributes: Array<{
		name: string;
		value: string;
	}>;
	uniqueId: string;
}

type InspectorMessage =
	| {
		type: "TOGGLE_INSPECTOR" | "TOGGLE_IMAGE_INSPECTOR";
		enabled: boolean;
	}
	| {
		type: "UPDATE_IMAGE_URL";
		url: string;
	};

interface InspectorEvent extends MessageEvent {
	data: InspectorMessage;
}

interface InspectedElementMessage {
	type: "ELEMENT_INSPECTED";
	metadata: ElementMetadata | null;
	isShiftPressed: boolean;
}

interface DOMInspectorProps {
	highlightColor?: string;
	highlightWidth?: number;
}

interface HoverTooltipPosition {
	x: number;
	y: number;
}

export const DOMInspector: React.FC<PropsWithChildren<DOMInspectorProps>> = ({
	children,
	highlightColor = "#4CAF50",
	highlightWidth = 2,
}) => {
	const [isInspectorActive, setIsInspectorActive] = useState(false);
	const [isImageInspectorActive, setIsImageInspectorActive] = useState(false);

	// Refs for hover/active highlight boxes
	const hoverHighlightRef = useRef<HTMLDivElement>(null);
	const activeHighlightRef = useRef<HTMLDivElement>(null);
	const selectedHighlightsRef = useRef<HTMLDivElement[]>([]);

	// Container for the inspector
	const containerRef = useRef<HTMLDivElement>(null);

	// Track hovered/active elements
	const hoveredElementRef = useRef<HTMLElement | null>(null);
	const activeElementRef = useRef<HTMLElement | null>(null);

	// Optional tooltip data
	const [tooltipPosition, setTooltipPosition] = useState<HoverTooltipPosition>({
		x: 0,
		y: 0,
	});
	const [hoveredMetadata, setHoveredMetadata] = useState<string | null>(null);

	// If you need to handle "loading" images
	const [loadingImages, setLoadingImages] = useState<Set<HTMLImageElement>>(
		new Set(),
	);

	/**
	 * Helper: position the highlight box over an element
	 */
	function positionHighlightBox(
		highlightEl: HTMLDivElement | null,
		element: HTMLElement | null,
	) {
		if (!highlightEl || !element || !containerRef.current) {
			if (highlightEl) highlightEl.style.display = "none";
			return;
		}
		const containerRect = containerRef.current.getBoundingClientRect();
		const elemRect = element.getBoundingClientRect();

		const offsetLeft =
			elemRect.left - containerRect.left + containerRef.current.scrollLeft;
		const offsetTop =
			elemRect.top - containerRect.top + containerRef.current.scrollTop;

		highlightEl.style.display = "block";
		highlightEl.style.left = `${offsetLeft}px`;
		highlightEl.style.top = `${offsetTop}px`;
		highlightEl.style.width = `${elemRect.width}px`;
		highlightEl.style.height = `${elemRect.height}px`;
		highlightEl.style.boxSizing = "border-box";
		highlightEl.style.backgroundColor =
			highlightEl === activeHighlightRef.current
				? "rgba(76, 175, 80, 0.1)"
				: "rgba(33, 150, 243, 0.1)";
	}

	/**
	 * Create a highlight element
	 */
	function createHighlight(element: HTMLElement) {
		const highlight = document.createElement("div");
		highlight.style.position = "absolute";
		highlight.style.pointerEvents = "none";
		highlight.style.border = `${highlightWidth}px solid ${highlightColor}`;
		highlight.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
		highlight.style.zIndex = "999999";
		highlight.style.boxSizing = "border-box";
		// Store reference to the target element
		highlight.dataset.targetElement = element.outerHTML;
		containerRef.current?.appendChild(highlight);
		positionHighlightBox(highlight, element);
		return highlight;
	}

	function clearHighlights() {
		console.log("Clearing all highlights");
		console.log(
			"Before clear - selected highlights:",
			selectedHighlightsRef.current.length,
		);

		hoveredElementRef.current = null;
		activeElementRef.current = null;

		if (activeHighlightRef.current) {
			activeHighlightRef.current.style.display = "none";
		}
		if (hoverHighlightRef.current) {
			hoverHighlightRef.current.style.display = "none";
		}

		// Remove all highlight elements from the DOM
		selectedHighlightsRef.current.forEach((highlight) => {
			if (highlight.parentNode) {
				highlight.parentNode.removeChild(highlight);
			}
		});
		selectedHighlightsRef.current = [];

		console.log(
			"After clear - selected highlights:",
			selectedHighlightsRef.current.length,
		);
	}

	// Add URL tracking effect
	useEffect(() => {
		// Send initial URL
		window.parent.postMessage(
			{
				type: "URL_CHANGE",
				url: window.location.href,
			},
			"*",
		);

		// Track navigation events
		const handleNavigation = () => {
			window.parent.postMessage(
				{
					type: "URL_CHANGE",
					url: window.location.href,
				},
				"*",
			);
		};

		window.addEventListener("popstate", handleNavigation);

		return () => {
			window.removeEventListener("popstate", handleNavigation);
		};
	}, []);

	/**
	 * Inject <style> to disable pointer-events on all elements,
	 * then re-enable them only for <img>
	 */
	useEffect(() => {
		let styleEl: HTMLStyleElement | null = null;

		if (isImageInspectorActive) {
			styleEl = document.createElement("style");
			styleEl.id = "only-images-clickable";
			styleEl.textContent = `
        /* Disable pointer events on everything... */
        * {
          pointer-events: none !important;
        }
        /* ...re-enable for <img> and <video> */
        img, video {
          pointer-events: auto !important;
        }
      `;
			document.head.appendChild(styleEl);
		}

		return () => {
			// Remove style on cleanup or when turning image-inspector mode off
			if (styleEl && styleEl.parentNode) {
				styleEl.parentNode.removeChild(styleEl);
			}
		};
	}, [isImageInspectorActive]);

	/**
	 * Handle messages from the parent window
	 */
	useEffect(() => {
		const handleMessage = (event: InspectorEvent) => {
			const { type, enabled } = event.data;
			if (type === "TOGGLE_INSPECTOR") {
				setIsInspectorActive(!!enabled);
				if (enabled) setIsImageInspectorActive(false);
				if (!enabled) clearHighlights();
				if (containerRef.current) {
					containerRef.current.style.cursor = enabled ? "crosshair" : "";
				}
			} else if (type === "TOGGLE_IMAGE_INSPECTOR") {
				setIsImageInspectorActive(!!enabled);
				if (enabled) setIsInspectorActive(false);
				if (!enabled) clearHighlights();
				if (containerRef.current) {
					containerRef.current.style.cursor = enabled ? "crosshair" : "";
				}
			} else if (type === "UPDATE_IMAGE_URL") {
				const { url } = event.data;
				if (activeElementRef.current && url) {
					const activeEl = activeElementRef.current;
					const currentTagName = activeEl.tagName.toLowerCase();

					// Determine if the new URL is a video or image
					const isVideoUrl = url.match(/\.(mp4|webm|ogg)$/i);
					const shouldBeVideo = isVideoUrl !== null;

					try {
						if (shouldBeVideo && currentTagName === "img") {
							// Convert img to video
							const videoEl = document.createElement("video");
							videoEl.autoplay = true;
							videoEl.loop = true;
							videoEl.muted = true;
							videoEl.playsInline = true;

							// Copy over relevant attributes and styles
							Array.from(activeEl.attributes).forEach((attr) => {
								if (attr.name !== "src" && attr.name !== "alt") {
									videoEl.setAttribute(attr.name, attr.value);
								}
							});

							// Copy computed styles
							const styles = window.getComputedStyle(activeEl);
							Array.from(styles).forEach((key) => {
								try {
									videoEl.style[key as any] = styles.getPropertyValue(key);
								} catch (e) {
									// Ignore invalid style properties
								}
							});

							videoEl.src = url;
							if (activeEl.parentNode) {
								activeEl.parentNode.replaceChild(videoEl, activeEl);
								activeElementRef.current = videoEl;

								// Update highlights
								positionHighlightBox(activeHighlightRef.current, videoEl);
								selectedHighlightsRef.current.forEach((highlight) => {
									if (highlight.dataset.targetElement === activeEl.outerHTML) {
										positionHighlightBox(highlight, videoEl);
										highlight.dataset.targetElement = videoEl.outerHTML;
									}
								});
							}
						} else if (!shouldBeVideo && currentTagName === "video") {
							// Convert video to img
							const imgEl = document.createElement("img");

							// Copy over relevant attributes and styles
							Array.from(activeEl.attributes).forEach((attr) => {
								if (attr.name !== "src" && !attr.name.startsWith("autoplay")) {
									imgEl.setAttribute(attr.name, attr.value);
								}
							});

							// Copy computed styles
							const styles = window.getComputedStyle(activeEl);
							Array.from(styles).forEach((key) => {
								try {
									imgEl.style[key as any] = styles.getPropertyValue(key);
								} catch (e) {
									// Ignore invalid style properties
								}
							});

							imgEl.src = url;
							if (activeEl.parentNode) {
								activeEl.parentNode.replaceChild(imgEl, activeEl);
								activeElementRef.current = imgEl;

								// Update highlights
								positionHighlightBox(activeHighlightRef.current, imgEl);
								selectedHighlightsRef.current.forEach((highlight) => {
									if (highlight.dataset.targetElement === activeEl.outerHTML) {
										positionHighlightBox(highlight, imgEl);
										highlight.dataset.targetElement = imgEl.outerHTML;
									}
								});
							}
						} else {
							// Just update the source if no conversion needed
							if (currentTagName === "img") {
								(activeEl as HTMLImageElement).src = url;
							} else if (currentTagName === "video") {
								(activeEl as HTMLVideoElement).src = url;
							}
						}
					} catch (error) {
						console.error("Error during element conversion:", error);
					}
				}
			}
		};

		window.addEventListener("message", handleMessage as EventListener);
		return () => {
			window.removeEventListener("message", handleMessage as EventListener);
		};
	}, []);

	/**
	 * Attach the inspector event listeners
	 */
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		function preventDefault(e: Event) {
			if (isInspectorActive || isImageInspectorActive) {
				e.preventDefault();
			}
		}

		function getElementMetadata(element: HTMLElement): ElementMetadata {
			return {
				tagName: element.tagName.toLowerCase(),
				classNames: element?.className,
				elementId: element.id || null,
				textContent: element.textContent,
				boundingBox: element.getBoundingClientRect(),
				attributes: Array.from(element.attributes).map((attr) => ({
					name: attr.name,
					value: attr.value,
				})),
				uniqueId: element.dataset.imageInspectorId || "",
			};
		}

		const handleMouseMove = (e: MouseEvent) => {
			if (!isInspectorActive && !isImageInspectorActive) return;
			const target = e.target as HTMLElement;

			if (
				isImageInspectorActive &&
				target.tagName.toLowerCase() !== "img" &&
				target.tagName.toLowerCase() !== "video"
			) {
				// If in image-only mode, ignore hovers on non-img/video elements
				hoveredElementRef.current = null;
				positionHighlightBox(hoverHighlightRef.current, null);
				setHoveredMetadata(null);
				return;
			}

			// Hover changed
			if (hoveredElementRef.current !== target) {
				hoveredElementRef.current = target;
				positionHighlightBox(hoverHighlightRef.current, target);
				setTooltipPosition({ x: e.pageX + 10, y: e.pageY + 10 });
				// For optional tooltip
				const id = target.id ? `#${target.id}` : "";
				const classes =
					typeof target.className === "string" && target.className.trim()
						? `.${target.className.trim().split(" ").filter(Boolean).join(".")}`
						: "";
				setHoveredMetadata(`<${target.tagName.toLowerCase()}>${id}${classes}`);
			}
		};

		const handleMouseLeave = () => {
			hoveredElementRef.current = null;
			positionHighlightBox(hoverHighlightRef.current, null);
			setHoveredMetadata(null);
		};

		const handleClick = (e: MouseEvent) => {
			if (!isInspectorActive && !isImageInspectorActive) {
				return;
			}

			const targetElement = e.target as HTMLElement;
			e.preventDefault();
			e.stopPropagation();

			// Handle image inspector mode
			if (isImageInspectorActive) {
				const tagName = targetElement.tagName.toLowerCase();
				if (tagName !== "img" && tagName !== "video") {
					return;
				}

				// Add unique identifier if not present
				if (!targetElement.dataset.imageInspectorId) {
					const uniqueId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
					targetElement.dataset.imageInspectorId = uniqueId;
				}
			}

			const isAlreadySelected = selectedHighlightsRef.current.some(
				(highlight) => {
					const targetRect = targetElement.getBoundingClientRect();
					const highlightRect = highlight.getBoundingClientRect();

					// More lenient comparison focusing on height and vertical position
					const heightMatch =
						Math.abs(highlightRect.height - targetRect.height) < 1;
					const widthMatch =
						Math.abs(highlightRect.width - targetRect.width) < 1;
					const topMatch = Math.abs(highlightRect.top - targetRect.top) < 1;

					// Check if the elements overlap significantly
					const horizontalOverlap = !(
						highlightRect.right < targetRect.left ||
						highlightRect.left > targetRect.right
					);

					const isMatch =
						heightMatch && widthMatch && topMatch && horizontalOverlap;
					return isMatch;
				},
			);

			// Clear existing selection if clicking same element in single select mode
			if (!e.shiftKey && isAlreadySelected) {
				clearHighlights();
				activeElementRef.current = null;

				// Only send null metadata for normal inspector mode
				if (!isImageInspectorActive) {
					const msg: InspectedElementMessage = {
						type: "ELEMENT_INSPECTED",
						metadata: null,
						isShiftPressed: false,
					};
					window.parent.postMessage(msg, "*");
				}
				return;
			}

			if (e.shiftKey) {
				if (isAlreadySelected) {
					// Remove the highlight for this element using the same comparison logic
					selectedHighlightsRef.current = selectedHighlightsRef.current.filter(
						(highlight) => {
							const highlightRect = highlight.getBoundingClientRect();
							const targetRect = targetElement.getBoundingClientRect();

							// Use the same comparison logic as in isAlreadySelected
							const heightMatch =
								Math.abs(highlightRect.height - targetRect.height) < 1;
							const widthMatch =
								Math.abs(highlightRect.width - targetRect.width) < 1;
							const topMatch = Math.abs(highlightRect.top - targetRect.top) < 1;
							const horizontalOverlap = !(
								highlightRect.right < targetRect.left ||
								highlightRect.left > targetRect.right
							);

							const shouldRemove =
								heightMatch && widthMatch && topMatch && horizontalOverlap;

							if (shouldRemove && highlight.parentNode) {
								highlight.parentNode.removeChild(highlight);
							}
							return !shouldRemove;
						},
					);
				} else {
					const highlight = createHighlight(targetElement);
					selectedHighlightsRef.current.push(highlight);
				}
			} else {
				// Single selection mode
				selectedHighlightsRef.current.forEach((highlight) => {
					if (highlight.parentNode) {
						highlight.parentNode.removeChild(highlight);
					}
				});
				selectedHighlightsRef.current = [];

				// Create new highlight
				const highlight = createHighlight(targetElement);
				selectedHighlightsRef.current = [highlight];
			}

			activeElementRef.current = targetElement;

			const msg: InspectedElementMessage = {
				type: "ELEMENT_INSPECTED",
				metadata: getElementMetadata(targetElement),
				isShiftPressed: e.shiftKey,
			};
			window.parent.postMessage(msg, "*");
		};

		// Add the events on container
		container.addEventListener("click", preventDefault, true);
		container.addEventListener("mousedown", preventDefault, true);
		container.addEventListener("mouseup", preventDefault, true);
		container.addEventListener("submit", preventDefault, true);

		container.addEventListener("mousemove", handleMouseMove as EventListener);
		container.addEventListener("mouseleave", handleMouseLeave);

		// The actual click is listened globally (capture) so we can stop it
		document.addEventListener("click", handleClick, true);

		return () => {
			container.removeEventListener("click", preventDefault, true);
			container.removeEventListener("mousedown", preventDefault, true);
			container.removeEventListener("mouseup", preventDefault, true);
			container.removeEventListener("submit", preventDefault, true);

			container.removeEventListener(
				"mousemove",
				handleMouseMove as EventListener,
			);
			container.removeEventListener("mouseleave", handleMouseLeave);
			document.removeEventListener("click", handleClick, true);
		};
	}, [isInspectorActive, isImageInspectorActive]);

	return (
		<div
			ref={containerRef}
			className={`relative h-full w-full ${isInspectorActive || isImageInspectorActive ? "cursor-crosshair" : ""}`}
		>
			{/* Hover highlight */}
			<div
				ref={hoverHighlightRef}
				style={{
					position: "absolute",
					display: "none",
					pointerEvents: "none",
					border: `${highlightWidth}px dashed #2196F3`,
					backgroundColor: "rgba(33, 150, 243, 0.1)", // Light blue with 10% opacity
					zIndex: 999999,
				}}
			/>
			{/* Selected highlight */}
			<div
				ref={activeHighlightRef}
				style={{
					position: "absolute",
					display: "none",
					pointerEvents: "none",
					border: `${highlightWidth}px solid ${highlightColor}`,
					backgroundColor: "rgba(76, 175, 80, 0.1)", // Light green with 10% opacity
					zIndex: 999999,
				}}
			/>

			{/* Optional tooltip for hovered element */}
			{(isInspectorActive || isImageInspectorActive) && hoveredMetadata && (
				<div
					className="pointer-events-none fixed z-[999999] rounded bg-gray-800 px-2 py-1 text-sm text-white"
					style={{
						left: tooltipPosition.x,
						top: tooltipPosition.y,
					}}
				>
					{hoveredMetadata}
				</div>
			)}

			{children}
		</div>
	);
};