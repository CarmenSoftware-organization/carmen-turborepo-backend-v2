import { PrismaClient } from '@repo/prisma-shared-schema-platform';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, readFileSync, existsSync } from 'fs';
import { gunzipSync } from 'zlib';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma_platform = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SYSTEM_DIRECT_URL,
    },
  },
});

// ==================== Blueledgers Configuration ====================

const BLUELEDGERS_BASE_URL =
  'https://dev.blueledgers.com/support/DeevanaPhuket/Blueledgers';

const BL_USERNAME = 'support@carmen';
const BL_PASSWORD = 'alpha2011';

const COOKIE_FILE = '/tmp/bl_seed_cookies.txt';

// ==================== Report Map: Blueledgers ID -> { name, report_group } ====================

const REPORT_MAP: Record<string, { name: string; report_group: string }> = {
  // === Procurement (PC) ===
  '864B40AF-2202-4894-A7BE-E4CB8F2204F0': { name: 'Credit Note Detail', report_group: 'PC' },
  'FB243B5E-FA57-4CA6-8EC1-A071910321DC': { name: 'Deviation by Item', report_group: 'PC' },
  '8A5F1E34-C27C-4583-BF84-77347D40DEAF': { name: 'Extra Cost Summary By Type', report_group: 'PC' },
  '877438AD-5818-405E-8C6A-CA069E80AAD8': { name: 'Item Expiry', report_group: 'PC' },
  '585794F2-100B-453E-AA69-706B172062CE': { name: 'Order Pending By Item report', report_group: 'PC' },
  'DB34256C-B9EB-4E4D-9FE8-9E80ABF8703C': { name: 'Order Pending By Vendor Report', report_group: 'PC' },
  'F56D6233-EEEA-4EE9-9B19-98616461D5E9': { name: 'PO Log Book Report', report_group: 'PC' },
  '265F1095-8053-4F27-8CC6-5FEF86259FC3': { name: 'Price List Detail by Product Report', report_group: 'PC' },
  '21CD4DEA-E5C7-4FCA-9B51-A5ADF5C4FFD5': { name: 'Pricelist Comparison by Vendor', report_group: 'PC' },
  'AA0E1E07-D909-4BA3-BC95-FA0154B2F4A9': { name: 'Product Category', report_group: 'PC' },
  '177AC38A-B320-4962-A88C-A908E4B2A6FA': { name: 'Product List', report_group: 'PC' },
  '9BB660CA-EDD7-488B-B209-FA009E98EADF': { name: 'Purchase Analysis by Item Report', report_group: 'PC' },
  'CA04701A-9D3D-4532-82B3-A31356194F1F': { name: 'Purchase Order By Department', report_group: 'PC' },
  '747CCE5C-ADB0-4126-A490-751D44F68543': { name: 'Purchase Order Detail by Date', report_group: 'PC' },
  'AB203D41-9394-40A6-857D-372C0682F5E3': { name: 'Purchase Request by Department', report_group: 'PC' },
  '303B78EF-FE9F-4378-8714-518DE51A0DAA': { name: 'Receiving Audit Report - (Committed Date)', report_group: 'PC' },
  '555C2406-37C6-4BE6-8E8D-CC9ED1EBB9B7': { name: 'Receiving Daily Detailed Summary Report by Location Type', report_group: 'PC' },
  '0B8DBC79-F8CE-4EDC-846E-9C4C727EE1CF': { name: 'Receiving Daily Summary by Location and Category', report_group: 'PC' },
  '7EF577CC-BA31-467F-B979-BC4DEBEEA8FB': { name: 'Receiving Detail', report_group: 'PC' },
  '21DE2E80-1F6E-46BB-86DF-17EC4D9B26C9': { name: 'Receiving Detail with Currency', report_group: 'PC' },
  '48BFC093-74CC-45F7-9313-55F33D17B72D': { name: 'Receiving Monthly Summary by Location and Category', report_group: 'PC' },
  'EE851565-059C-453B-BBB2-12F9FE265CCB': { name: 'Receiving Monthly Summary by Receving Date and Category', report_group: 'PC' },
  '025218DE-B5C7-4AA2-93D3-EB3736107C84': { name: 'Receiving Summary', report_group: 'PC' },
  'D05CC687-F4C7-4285-A47D-2359C4799E89': { name: 'Receiving Summary with Currency', report_group: 'PC' },
  'FC14D023-2DA1-4399-A707-0DF5B15FD07C': { name: 'Reject Purchase Request Report Report', report_group: 'PC' },
  '70F40213-3159-4B5F-9F51-0A1A5B05A20E': { name: 'Store Location', report_group: 'PC' },
  'A7EA8272-51CC-4AC5-B4BA-671D49FEF210': { name: 'Summary Cost Receiving Report', report_group: 'PC' },
  'FC5F93EA-1EA8-4795-8491-07FF83712654': { name: 'Top Receiving by Product', report_group: 'PC' },
  '3D947571-51D0-4ADA-82EF-0FEA206F5B7B': { name: 'Top Receiving by Vendor', report_group: 'PC' },
  '42D1E497-B29E-4A5A-BB1D-C025295EA283': { name: 'Total Purchase by Vendor Report', report_group: 'PC' },
  'B0255CFB-84A4-445C-9EA6-C48F22223D92': { name: 'Transaction Summary', report_group: 'PC' },
  '31FB0D6C-F243-4E6F-B385-42D1445EACBF': { name: 'Vendor by Purchase Order', report_group: 'PC' },
  '0DDC1AEF-B908-4E16-A433-DBBA9955FD5F': { name: 'Vendor Detailed', report_group: 'PC' },
  'D92B8607-5538-4B71-9FB3-81F3B2C68F09': { name: 'Vendor List', report_group: 'PC' },

  // === Inventory (IN) ===
  'D33094D9-7C56-412F-83E3-F71520284D9A': { name: 'End Of Month Balanced', report_group: 'IN' },
  '3DB3DD73-54C6-4ACD-82E4-31D5CACB5D5B': { name: 'EOP Adjustment Report', report_group: 'IN' },
  'C3BC3BE3-349B-452E-91FE-AA673D781C94': { name: 'Inventory Aging Detailed', report_group: 'IN' },
  'EB49A685-3553-41B8-89C0-589612E4CA15': { name: 'Inventory Aging Summary', report_group: 'IN' },
  '49F579C5-3927-4D08-93BE-A26C7F6B2635': { name: 'Inventory Balance', report_group: 'IN' },
  '201D9A8E-3CE8-4264-838C-22E34B1081ED': { name: 'Inventory Balance Summary by Category', report_group: 'IN' },
  '1AA68C25-D3D8-4FF6-BD14-4B7D2368C7E8': { name: 'Inventory Balance Summary by Item', report_group: 'IN' },
  '9E529B13-6BA6-451A-AF5A-9F0B0E4378EB': { name: 'Inventory By ExpiryDate', report_group: 'IN' },
  'B8EE945E-99E1-4E14-9A08-EEED519EFFFC': { name: 'Inventory Movement Detailed By Product', report_group: 'IN' },
  '8AD03C96-DC8E-453C-83D2-8DBB4F4698B1': { name: 'Inventory Movement Summary By Location', report_group: 'IN' },
  'DDD51537-F289-472C-862F-F9649C575157': { name: 'Issue Detail', report_group: 'IN' },
  '15FC9F5E-EE29-42A6-8C3E-0A18049B0C3D': { name: 'Physical Count Qty Difference Report', report_group: 'IN' },
  'DCF858C8-21F7-4033-9E93-8E0DCB3B2C7A': { name: 'Slow Moving Report', report_group: 'IN' },
  '1BAEFCBE-67BE-49E0-9C90-660E391691EE': { name: 'Stock Card Detailed', report_group: 'IN' },
  '87826B1C-2AA9-4E5B-BD59-8662070FB126': { name: 'Stock Card Summary', report_group: 'IN' },
  'E8E21178-F1D8-4309-8BA9-1F4A24A38E36': { name: 'Stock In Detail', report_group: 'IN' },
  'B7B0001B-2AD0-44EC-B61B-79D1373EF362': { name: 'Stock Out Detail', report_group: 'IN' },
  'EA4867FA-FC86-42AD-A51A-2F49CC2595D5': { name: 'Store Requisition By Request Store Is Void', report_group: 'IN' },
  'A97B16CA-0C8E-4E5A-B997-0DAE6EE57BE3': { name: 'Store Requisition By Request Store On Daily Summary Void', report_group: 'IN' },
  '920A925B-D250-4BEB-894F-CAE4C82FBF53': { name: 'Store Requisition By Request Store On Summary', report_group: 'IN' },
  '0FCB892B-B8CF-4725-AB37-5A28C0712B56': { name: 'Store Requisition By Request Store On Summary (Show Void Only)', report_group: 'IN' },
  'D2B40155-397B-463C-AA2F-6621C889F271': { name: 'Store Requisition Detail', report_group: 'IN' },
  '59D7DA4C-F189-443A-B031-99A55E22AC6D': { name: 'Store Requisition Details \u2013 Issue from any/some location', report_group: 'IN' },
  '177604A4-DD5B-4C3B-B1FD-C379B49B4C71': { name: 'Store Requisition Details \u2013 Request to any/some location', report_group: 'IN' },
  '5196BEEC-BFAC-4515-A23F-F2AF205690E9': { name: 'Store Requisition Inventory - Summary (All)', report_group: 'IN' },
  'B9D5CB4B-8135-4A02-AFE7-8AB2966A555B': { name: 'Store Requisition Inventory - Summary (Type Shipment)', report_group: 'IN' },
  '2F0CC70A-3FEC-43E2-B9EA-6ED4DEE73F3F': { name: 'Store Requisition Inventory - Summary (Type Transfer)', report_group: 'IN' },
  '692555A6-CE40-46A9-A54D-8AEA5A6D7E10': { name: 'Store Requisition Summary \u2013 Issue from any/some location', report_group: 'IN' },

  // === Others (OT) ===
  'EECBCA7F-66AE-41EB-A65A-6C31E6191CCE': { name: 'Project Job Function', report_group: 'OT' },
  'C82288F7-02DA-47B5-846D-BA00461808B6': { name: 'Vat Report', report_group: 'OT' },
};

// ==================== Curl Helpers ====================

function curl(args: string): string {
  return execSync(`curl -sk ${args}`, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
}

function curlBinary(args: string, outputFile: string): void {
  execSync(`curl -sk ${args} -o "${outputFile}"`, { maxBuffer: 50 * 1024 * 1024 });
}

// ==================== XML Helpers ====================

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Parse FastReport dialog HTML into structured XML
 *
 * Extracts labels, text inputs, date inputs, and select/dropdown controls
 * from the rendered HTML dialog and converts them into:
 *
 * <dialog>
 *   <field name="TextDate1" type="date" label="Date From" />
 *   <field name="cb_Vendor" type="select" label="Vendor">
 *     <option value="ALL">ALL</option>
 *   </field>
 * </dialog>
 */
function parseDialogHtmlToXml(html: string, previewObj: string): string {
  // Extract only the Dialog div
  const dialogDivMatch = html.match(
    new RegExp(`<div id="${previewObj}Dialog"[\\s\\S]*$`),
  );
  const dialogHtml = dialogDivMatch ? dialogDivMatch[0] : html;

  // Extract labels with their positions
  const labelRegex =
    /<div[^>]*style="[^"]*left:(\d+(?:\.\d+)?)px[^"]*top:(\d+(?:\.\d+)?)px[^"]*"[^>]*>([A-Za-z][A-Za-z0-9 /()]+?)<\/div>/g;
  const labels: Array<{ text: string; left: number; top: number }> = [];
  let labelMatch;
  while ((labelMatch = labelRegex.exec(dialogHtml)) !== null) {
    labels.push({
      left: parseFloat(labelMatch[1]),
      top: parseFloat(labelMatch[2]),
      text: labelMatch[3].trim(),
    });
  }

  // Extract text/date inputs with positions
  const inputRegex =
    /<input[^>]*style="[^"]*left:(\d+(?:\.\d+)?)px[^"]*top:(\d+(?:\.\d+)?)px[^"]*"[^>]*name="([^"]*)"[^>]*(?:value="([^"]*)")?[^>]*\/>/g;
  const inputs: Array<{
    name: string;
    value: string;
    left: number;
    top: number;
  }> = [];
  let inputMatch;
  while ((inputMatch = inputRegex.exec(dialogHtml)) !== null) {
    const name = inputMatch[3];
    if (name === 'btnOk' || name === 'btnCancel' || name === 'object') continue;
    inputs.push({
      left: parseFloat(inputMatch[1]),
      top: parseFloat(inputMatch[2]),
      name,
      value: inputMatch[4] || '',
    });
  }

  // Also try alternate input format (style with top before left)
  const inputRegex2 =
    /<input[^>]*name="([^"]*)"[^>]*style="[^"]*left:(\d+(?:\.\d+)?)px[^"]*top:(\d+(?:\.\d+)?)px[^"]*"[^>]*(?:value="([^"]*)")?[^>]*\/>/g;
  let inputMatch2;
  while ((inputMatch2 = inputRegex2.exec(dialogHtml)) !== null) {
    const name = inputMatch2[1];
    if (
      name === 'btnOk' ||
      name === 'btnCancel' ||
      name === 'object' ||
      inputs.find((i) => i.name === name)
    )
      continue;
    inputs.push({
      left: parseFloat(inputMatch2[2]),
      top: parseFloat(inputMatch2[3]),
      name,
      value: inputMatch2[4] || '',
    });
  }

  // Extract select/dropdown controls with positions and options
  const selectRegex =
    /<select[^>]*style="[^"]*left:(\d+(?:\.\d+)?)px[^"]*top:(\d+(?:\.\d+)?)px[^"]*"[^>]*name="([^"]*)"[^>]*>([\s\S]*?)<\/select>/g;
  const selects: Array<{
    name: string;
    left: number;
    top: number;
    options: Array<{ value: string; text: string; selected: boolean }>;
  }> = [];
  let selectMatch;
  while ((selectMatch = selectRegex.exec(dialogHtml)) !== null) {
    const optionsHtml = selectMatch[4];
    const optionRegex =
      /<option\s*(selected)?[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/g;
    const options: Array<{ value: string; text: string; selected: boolean }> =
      [];
    let optMatch;
    while ((optMatch = optionRegex.exec(optionsHtml)) !== null) {
      options.push({
        selected: !!optMatch[1],
        value: optMatch[2].trim(),
        text: optMatch[3].trim(),
      });
    }
    selects.push({
      left: parseFloat(selectMatch[1]),
      top: parseFloat(selectMatch[2]),
      name: selectMatch[3],
      options,
    });
  }

  // Extract checkbox controls
  const checkboxRegex =
    /<input[^>]*type="checkbox"[^>]*style="[^"]*left:(\d+(?:\.\d+)?)px[^"]*top:(\d+(?:\.\d+)?)px[^"]*"[^>]*name="([^"]*)"[^>]*(checked)?[^>]*\/>/g;
  const checkboxes: Array<{
    name: string;
    left: number;
    top: number;
    checked: boolean;
  }> = [];
  let cbMatch;
  while ((cbMatch = checkboxRegex.exec(dialogHtml)) !== null) {
    checkboxes.push({
      left: parseFloat(cbMatch[1]),
      top: parseFloat(cbMatch[2]),
      name: cbMatch[3],
      checked: !!cbMatch[4],
    });
  }

  // Match labels to controls by proximity (same row = similar top position)
  function findLabel(
    controlTop: number,
    controlLeft: number,
  ): string | undefined {
    const tolerance = 12;
    const candidates = labels.filter(
      (l) => Math.abs(l.top - controlTop) <= tolerance && l.left < controlLeft,
    );
    if (candidates.length === 0) return undefined;
    // Pick the closest label to the left
    candidates.sort((a, b) => b.left - a.left);
    return candidates[0].text;
  }

  // Determine field type
  function getFieldType(name: string, value: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('date') || /^\d{1,2}\/\d{2}\/\d{4}$/.test(value))
      return 'date';
    if (lower.includes('text') || lower.includes('txt')) return 'text';
    return 'text';
  }

  // Build XML
  const xmlLines: string[] = ['<?xml version="1.0" encoding="utf-8"?>', '<dialog>'];

  // Add text/date inputs
  for (const input of inputs) {
    const label = findLabel(input.top, input.left);
    const type = getFieldType(input.name, input.value);
    const labelAttr = label ? ` label="${escapeXml(label)}"` : '';
    const defaultAttr = input.value
      ? ` default="${escapeXml(input.value)}"`
      : '';
    xmlLines.push(
      `  <field name="${escapeXml(input.name)}" type="${type}"${labelAttr}${defaultAttr} />`,
    );
  }

  // Add selects
  for (const select of selects) {
    const label = findLabel(select.top, select.left);
    const labelAttr = label ? ` label="${escapeXml(label)}"` : '';
    xmlLines.push(
      `  <field name="${escapeXml(select.name)}" type="select"${labelAttr}>`,
    );
    for (const opt of select.options) {
      const selectedAttr = opt.selected ? ' selected="true"' : '';
      xmlLines.push(
        `    <option value="${escapeXml(opt.value)}"${selectedAttr}>${escapeXml(opt.text)}</option>`,
      );
    }
    xmlLines.push('  </field>');
  }

  // Add checkboxes
  for (const cb of checkboxes) {
    const label = findLabel(cb.top, cb.left);
    const labelAttr = label ? ` label="${escapeXml(label)}"` : '';
    const checkedAttr = cb.checked ? ' default="true"' : ' default="false"';
    xmlLines.push(
      `  <field name="${escapeXml(cb.name)}" type="checkbox"${labelAttr}${checkedAttr} />`,
    );
  }

  xmlLines.push('</dialog>');
  return xmlLines.join('\n');
}

/**
 * Decompress FPX (gzip) to XML string
 * FPX = gzip compressed FastReport prepared report XML
 */
function decompressFpxToXml(buffer: Buffer): string | null {
  try {
    // Check gzip magic number
    if (buffer[0] !== 0x1f || buffer[1] !== 0x8b) {
      console.log('    Not gzip format');
      return null;
    }
    const decompressed = gunzipSync(buffer);
    const xml = decompressed.toString('utf-8');
    // Verify it's XML
    if (!xml.includes('<?xml') && !xml.includes('<preparedreport')) {
      console.log('    Decompressed content is not XML');
      return null;
    }
    return xml;
  } catch (err) {
    console.log(`    Decompress error: ${(err as Error).message}`);
    return null;
  }
}

// ==================== Blueledgers Auth ====================

function loginBlueledgers(): void {
  console.log('Logging in to Blueledgers...');

  const loginHtml = curl(`-c ${COOKIE_FILE} "${BLUELEDGERS_BASE_URL}/login.aspx"`);

  const viewState = loginHtml.match(/__VIEWSTATE" id="__VIEWSTATE" value="([^"]*)/)?.[1] || '';
  const viewStateGen =
    loginHtml.match(/__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="([^"]*)/)?.[1] || '';
  const eventValidation =
    loginHtml.match(/__EVENTVALIDATION" id="__EVENTVALIDATION" value="([^"]*)/)?.[1] || '';

  const formData = [
    `__VIEWSTATE=${encodeURIComponent(viewState)}`,
    `__VIEWSTATEGENERATOR=${encodeURIComponent(viewStateGen)}`,
    `__EVENTVALIDATION=${encodeURIComponent(eventValidation)}`,
    `LoginControl%24UserName=${encodeURIComponent(BL_USERNAME)}`,
    `LoginControl%24Password=${encodeURIComponent(BL_PASSWORD)}`,
    `LoginControl%24LoginButton=${encodeURIComponent('Log In')}`,
  ].join('&');

  const formFile = '/tmp/bl_seed_form.txt';
  writeFileSync(formFile, formData);

  const loginResult = curl(
    `-b ${COOKIE_FILE} -c ${COOKIE_FILE} -D - ` +
      `"${BLUELEDGERS_BASE_URL}/login.aspx" ` +
      `-d @${formFile}`,
  );

  unlinkSync(formFile);

  if (loginResult.includes('302') || loginResult.includes('.ASPXAUTH')) {
    console.log('Login successful!\n');
  } else {
    throw new Error('Login failed');
  }
}

// ==================== Fetch Report List from Blueledgers ====================

function fetchReportListFromBlueledgers(): Array<{ id: string; name: string }> {
  console.log('Fetching report list from Blueledgers...');

  const html = curl(
    `-b ${COOKIE_FILE} -c ${COOKIE_FILE} ` +
      `"${BLUELEDGERS_BASE_URL}/RPT/ReportList2.aspx"`,
  );

  const matches = html.matchAll(
    /href="Report\.aspx\?id=([A-F0-9\-]{36})"[^>]*>([^<]*)<\/a>/gi,
  );

  const reports: Array<{ id: string; name: string }> = [];
  for (const match of matches) {
    reports.push({ id: match[1], name: match[2].trim() });
  }

  console.log(`Found ${reports.length} reports on Blueledgers.\n`);
  return reports;
}

// ==================== Fetch Dialog & Content as XML ====================

function fetchDialogAndContent(
  reportId: string,
): { dialog: string; content: string } | null {
  const tmpFile = `/tmp/bl_rpt_${reportId}.fpx`;

  try {
    // Step 1: Load report page to get preview object
    const reportHtml = curl(
      `-b ${COOKIE_FILE} -c ${COOKIE_FILE} ` +
        `"${BLUELEDGERS_BASE_URL}/RPT/Report.aspx?id=${reportId}"`,
    );

    const previewMatch = reportHtml.match(/previewobject=(fr[A-Za-z0-9_\-]+)/);
    if (!previewMatch) {
      console.log('    Could not find preview object');
      return null;
    }
    const previewObj = previewMatch[1];

    // Step 2: Fetch the FastReport dialog HTML
    const dialogHtml = curl(
      `-b ${COOKIE_FILE} -c ${COOKIE_FILE} ` +
        `"${BLUELEDGERS_BASE_URL}/FastReport.Export.axd?previewobject=${previewObj}"`,
    );

    // Parse dialog HTML to structured XML
    const dialogXml = parseDialogHtmlToXml(dialogHtml, previewObj);

    // Step 3: Submit dialog OK to prepare the report
    curl(
      `-b ${COOKIE_FILE} -c ${COOKIE_FILE} ` +
        `"${BLUELEDGERS_BASE_URL}/FastReport.Export.axd?object=${previewObj}&dialog=0&control=btnOk&event=onclick&data="`,
    );

    // Step 4: Download FPX file (gzip compressed XML report template)
    curlBinary(
      `-L --max-time 120 -b ${COOKIE_FILE} -c ${COOKIE_FILE} ` +
        `"${BLUELEDGERS_BASE_URL}/FastReport.Export.axd?previewobject=${previewObj}&export_fpx=1&s=${Date.now()}"`,
      tmpFile,
    );

    let contentXml = '';
    if (existsSync(tmpFile)) {
      const buffer = readFileSync(tmpFile);
      unlinkSync(tmpFile);

      if (buffer.length >= 100) {
        const xml = decompressFpxToXml(buffer);
        if (xml) {
          contentXml = xml;
          console.log(
            `    Dialog XML: ${(dialogXml.length / 1024).toFixed(1)} KB, Content XML: ${(contentXml.length / 1024).toFixed(1)} KB`,
          );
        } else {
          console.log(`    FPX decompress failed, content will be empty`);
        }
      } else {
        console.log(
          `    FPX too small (${buffer.length} bytes), content will be empty`,
        );
      }
    } else {
      console.log('    FPX file not created, content will be empty');
    }

    return { dialog: dialogXml, content: contentXml };
  } catch (err) {
    console.log(`    Error: ${(err as Error).message}`);
    if (existsSync(tmpFile)) unlinkSync(tmpFile);
    return null;
  }
}

// ==================== Main ====================

async function main() {
  // Get all existing report templates from DB
  const existing = await prisma_platform.tb_report_template.findMany({
    where: { deleted_at: null },
    select: { id: true, name: true },
  });
  const existingByName = new Map(existing.map((r) => [r.name, r]));

  console.log(`Found ${existing.length} existing report templates in DB.`);

  // Login to Blueledgers
  loginBlueledgers();

  // Fetch live report list from Blueledgers
  const blReports = fetchReportListFromBlueledgers();

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < blReports.length; i++) {
    const { id: reportId, name } = blReports[i];
    const progress = `[${i + 1}/${blReports.length}]`;

    const mapping = REPORT_MAP[reportId];
    if (!mapping) {
      console.log(`${progress} SKIP (unknown): ${name}`);
      skippedCount++;
      continue;
    }

    console.log(`${progress} Fetching: ${name}...`);

    const result = fetchDialogAndContent(reportId);
    if (!result) {
      console.log(`${progress} FAILED: ${name}`);
      failedCount++;
      continue;
    }

    const existingRecord = existingByName.get(name);

    if (existingRecord) {
      await prisma_platform.tb_report_template.update({
        where: { id: existingRecord.id },
        data: {
          dialog: result.dialog,
          content: result.content,
        },
      });
      console.log(`    UPDATE: ${name} -> ${existingRecord.id}`);
      updatedCount++;
    } else {
      const record = await prisma_platform.tb_report_template.create({
        data: {
          name: mapping.name,
          description: mapping.name,
          report_group: mapping.report_group,
          dialog: result.dialog,
          content: result.content,
          is_standard: true,
          is_active: true,
        },
      });
      console.log(`    CREATE: ${name} (${mapping.report_group}) -> ${record.id}`);
      createdCount++;
    }
  }

  console.log(`\n==================== Summary ====================`);
  console.log(`Created: ${createdCount}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Failed:  ${failedCount}`);
  console.log(`Total:   ${blReports.length}`);

  try {
    unlinkSync(COOKIE_FILE);
  } catch {}
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma_platform.$disconnect();
  });
