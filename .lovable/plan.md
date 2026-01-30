

# Plan: Improve Signature Block Deletion Visibility

## Summary

The delete functionality for signature blocks already exists in the code, but it may be hard to discover since it only appears on hover. I'll make the delete button more visible and easier to use.

## Current Behavior

- In Step 2 (Prepare), when you hover over a signature block, a small red X button appears in the top-right corner
- The button uses `hidden group-hover:flex` which may not be working reliably

## Proposed Changes

### Make delete button always visible during Step 2

**File: `src/components/PdfPage.jsx`**

Change the delete button to always be visible (not just on hover) when in preparation mode:

- Remove `hidden group-hover:flex` 
- Make the button always visible with `flex`
- Add a slight opacity transition for polish

### Technical Details

Lines 207-217 will be updated:
```jsx
{currentStep === 2 && (
  <div className="absolute -top-3 -right-3 flex">
    <button
      onClick={() =>
        setBlocks((prev) => prev.filter((b) => b.id !== block.id))
      }
      className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
)}
```

## Result

- Delete button will always be visible on signature blocks during the Prepare step
- Users can easily remove accidentally added signature blocks by clicking the red X button
- No style changes to other parts of the application

