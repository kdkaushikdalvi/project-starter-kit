import { PDFDocument } from "pdf-lib";
import { FIELD_TYPES } from "../context/SignatureContext";

/**
 * Build normalized fields for DocuSeal API submission
 * Each field includes: name, type, required, and areas with page/x/y/w/h
 */
export async function buildNormalizedFields(pdfFile, blocks) {
  const pdfBytes = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  return blocks.map((block, index) => {
    const pageIndex = (block.pageNumber ?? 1) - 1;
    const page = pages[pageIndex] || pages[0];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Map internal field types to DocuSeal types
    const fieldTypeMap = {
      [FIELD_TYPES.SIGNATURE]: "signature",
      [FIELD_TYPES.TEXT]: "text",
      [FIELD_TYPES.DATE]: "date",
    };

    const docuSealType = fieldTypeMap[block.fieldType] || "signature";

    // Generate field name based on type
    const typeCount = blocks
      .slice(0, index + 1)
      .filter((b) => b.fieldType === block.fieldType).length;

    const fieldName = `${docuSealType}_${typeCount}`;

    return {
      name: fieldName,
      type: docuSealType,
      required: block.required ?? true,
      readonly: block.fieldType === FIELD_TYPES.TEXT || block.fieldType === FIELD_TYPES.DATE,
      areas: [
        {
          page: block.pageNumber ?? 1,
          x: Number((block.x / pageWidth).toFixed(4)),
          y: Number((block.y / pageHeight).toFixed(4)),
          w: Number((block.width / pageWidth).toFixed(4)),
          h: Number((block.height / pageHeight).toFixed(4)),
        },
      ],
    };
  });
}

/**
 * Build field values for DocuSeal submission
 * Maps block IDs to their signed/filled values
 */
export function buildFieldValues(blocks, signatures, fieldUuids) {
  const values = {};

  blocks.forEach((block, index) => {
    const field = fieldUuids[index];
    if (field?.uuid && signatures[block.id]) {
      values[field.uuid] = signatures[block.id];
    }
  });

  return values;
}

/**
 * Validate all required fields are filled
 */
export function validateAllFieldsFilled(blocks, signatures) {
  return blocks.length > 0 && blocks.every((block) => {
    if (!block.required) return true;
    return !!signatures[block.id];
  });
}

/**
 * Get auto-fill value for a field type
 */
export function getAutoFillValue(fieldType, signerName) {
  switch (fieldType) {
    case FIELD_TYPES.TEXT:
      return signerName || "Signer Name";
    case FIELD_TYPES.DATE:
      return new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    default:
      return null;
  }
}
