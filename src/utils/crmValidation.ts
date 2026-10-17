import { Customer } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCustomerInput(
  data: Partial<Customer>,
  existingCustomers: Customer[],
  currentCustomerId?: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required Name Check
  if (!data.name || !data.name.trim()) {
    errors.push({ field: 'name', message: 'Customer full name is required.' });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long.' });
  }

  // Email Validation & Duplicate Check
  if (!data.email || !data.email.trim()) {
    errors.push({ field: 'email', message: 'Email address is required.' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push({ field: 'email', message: 'Please enter a valid email address.' });
    } else {
      // Check for duplicate email among non-archived customers
      const duplicate = existingCustomers.find(
        (c) =>
          c.id !== currentCustomerId &&
          !c.archived &&
          c.email.trim().toLowerCase() === data.email!.trim().toLowerCase()
      );
      if (duplicate) {
        errors.push({
          field: 'email',
          message: `An active customer with email "${data.email}" already exists (${duplicate.name}).`,
        });
      }
    }
  }

  // Phone Validation (Optional format check if provided)
  if (data.phone && data.phone.trim()) {
    const phoneClean = data.phone.replace(/[\s\-\(\)\+]/g, '');
    if (phoneClean.length < 7 || !/^\d+$/.test(phoneClean)) {
      errors.push({ field: 'phone', message: 'Please enter a valid telephone number.' });
    }
  }

  // Deal Value check
  if (data.dealValue !== undefined && (isNaN(data.dealValue) || data.dealValue < 0)) {
    errors.push({ field: 'dealValue', message: 'Deal value must be a non-negative number.' });
  }

  return errors;
}

/**
 * Parses raw CSV content into array of partial Customer objects
 */
export function parseCSVContent(csvText: string): {
  data: Partial<Customer>[];
  errors: string[];
} {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return { data: [], errors: ['CSV file must contain a header row and at least one data row.'] };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  const rows = lines.slice(1);
  const parsedCustomers: Partial<Customer>[] = [];
  const parseErrors: string[] = [];

  const nameIndex = headers.findIndex((h) => h.includes('name'));
  const emailIndex = headers.findIndex((h) => h.includes('email'));
  const phoneIndex = headers.findIndex((h) => h.includes('phone'));
  const companyIndex = headers.findIndex((h) => h.includes('company'));
  const statusIndex = headers.findIndex((h) => h.includes('status'));
  const dealValueIndex = headers.findIndex((h) => h.includes('deal') || h.includes('value'));
  const industryIndex = headers.findIndex((h) => h.includes('industry'));
  const sourceIndex = headers.findIndex((h) => h.includes('source'));

  if (nameIndex === -1 || emailIndex === -1) {
    return {
      data: [],
      errors: ['CSV missing required columns: "Name" and "Email".'],
    };
  }

  rows.forEach((row, idx) => {
    // Simple CSV parser handling quotes
    const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
    const cleanVals = values.map((v) => v.trim().replace(/^"|"$/g, ''));

    const name = cleanVals[nameIndex] || '';
    const email = cleanVals[emailIndex] || '';

    if (!name || !email) {
      parseErrors.push(`Row ${idx + 2}: Skipped due to missing name or email.`);
      return;
    }

    const company = companyIndex !== -1 ? cleanVals[companyIndex] || 'Individual' : 'Individual';
    const phone = phoneIndex !== -1 ? cleanVals[phoneIndex] || '' : '';
    const rawStatus = statusIndex !== -1 ? cleanVals[statusIndex]?.toLowerCase() : 'lead';
    const validStatuses = ['lead', 'prospect', 'active', 'vip', 'inactive'];
    const status = validStatuses.includes(rawStatus) ? (rawStatus as Customer['status']) : 'lead';
    const rawValue = dealValueIndex !== -1 ? parseFloat(cleanVals[dealValueIndex]) : 0;
    const dealValue = isNaN(rawValue) ? 0 : rawValue;
    const industry = industryIndex !== -1 ? cleanVals[industryIndex] || 'General' : 'General';
    const source = sourceIndex !== -1 ? cleanVals[sourceIndex] || 'CSV Import' : 'CSV Import';

    parsedCustomers.push({
      name,
      email,
      phone,
      company,
      status,
      dealValue,
      industry,
      source,
      tags: [status, industry],
      notes: 'Imported via CSV',
    });
  });

  return { data: parsedCustomers, errors: parseErrors };
}

/**
 * Converts array of customers into CSV string for export
 */
export function generateCustomerCSV(customers: Customer[]): string {
  const headers = [
    'Name',
    'Company',
    'Email',
    'Phone',
    'Status',
    'Deal Value',
    'Industry',
    'Source',
    'Assigned User',
    'Tags',
    'Favorite',
    'Archived',
    'Created At',
  ];

  const rows = customers.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.company.replace(/"/g, '""')}"`,
    `"${c.email.replace(/"/g, '""')}"`,
    `"${c.phone || ''}"`,
    `"${c.status}"`,
    c.dealValue || 0,
    `"${c.industry || 'General'}"`,
    `"${c.source || 'Direct'}"`,
    `"${c.assignedUser || 'Owner'}"`,
    `"${(c.tags || []).join(';')}"`,
    c.favorite ? 'Yes' : 'No',
    c.archived ? 'Yes' : 'No',
    `"${c.createdAt}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
