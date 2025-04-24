# JSON Parsing Rules

## General Principles

1. **Use JSON5 for Parsing**
   - Always use `json5` instead of native `JSON.parse`
   - Benefits:
     - Handles comments (both single-line and multi-line)
     - Allows trailing commas
     - Supports unquoted property names
     - Better error messages
     - More lenient with formatting

2. **Clean Input First**
   - Remove markdown code blocks before parsing
   ```typescript
   if (content.includes('```')) {
     content = content.replace(/```json\n?|\n?```/g, '').trim();
   }
   ```

3. **Error Handling**
   - Always wrap JSON parsing in try-catch blocks
   - Log the original content when parsing fails
   - Provide clear error messages
   ```typescript
   try {
     parsed = JSON5.parse(content);
   } catch (error) {
     console.error("Failed to parse:", content);
     throw new Error("Could not parse as JSON");
   }
   ```

4. **Validation**
   - Always validate the parsed structure
   - Check for required fields
   - Verify array types
   ```typescript
   if (!parsed?.suggestions || !Array.isArray(parsed.suggestions)) {
     throw new Error("Invalid format: missing suggestions array");
   }
   ```

## Anti-Patterns to Avoid

1. **Don't Use Regex for JSON Parsing**
   - Avoid complex regex patterns to extract JSON
   - Don't try to clean JSON with multiple regex replacements
   - Don't attempt to reconstruct JSON from partial matches

2. **Don't Assume Clean Input**
   - Don't assume API responses will always be clean JSON
   - Don't skip input cleaning steps
   - Don't ignore markdown formatting

3. **Don't Use Multiple Parsing Attempts**
   - Avoid trying different parsing strategies
   - Don't fall back to partial JSON extraction
   - Don't attempt to fix malformed JSON manually

## Best Practices

1. **Dependencies**
   - Use `json5` for all JSON parsing
   - Keep the dependency up to date
   - Document the dependency in package.json

2. **Type Safety**
   - Define clear interfaces for expected JSON structures
   - Use TypeScript to enforce types
   - Validate parsed data against interfaces

3. **Error Messages**
   - Provide specific error messages
   - Include context in error logs
   - Don't expose raw parsing errors to users

4. **Testing**
   - Test with various input formats
   - Include markdown-wrapped JSON
   - Test with commented JSON
   - Test with trailing commas
   - Test error cases

## Example Implementation

```typescript
import JSON5 from "json5";

interface ExpectedResponse {
  suggestions: Array<{
    id: string;
    suggestion: string;
    type: string;
  }>;
}

function parseResponse(content: string): ExpectedResponse {
  // Clean input
  let cleaned = content;
  if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/```json\n?|\n?```/g, '').trim();
  }

  // Parse with JSON5
  let parsed;
  try {
    parsed = JSON5.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse response:", cleaned);
    throw new Error("Invalid JSON response");
  }

  // Validate structure
  if (!parsed?.suggestions || !Array.isArray(parsed.suggestions)) {
    throw new Error("Response missing suggestions array");
  }

  return parsed;
} 