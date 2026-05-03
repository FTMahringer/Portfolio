#!/usr/bin/env node

/**
 * Content Validation Script
 * 
 * Validates MDX frontmatter against TypeScript types
 * Run with: npm run validate:content
 * Add to pre-commit hook for automatic validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '..', 'content');

// Define required fields per content type
const SCHEMAS = {
  blog: {
    required: ['title', 'date', 'summary', 'slug'],
    optional: ['tags', 'image', 'draft', 'author'],
    types: {
      title: 'string',
      date: 'date',
      summary: 'string',
      slug: 'string',
      tags: 'array',
      image: 'string',
      draft: 'boolean',
      author: 'string',
    }
  },
  projects: {
    required: ['title', 'status', 'summary'],
    optional: ['slug', 'category', 'stack', 'tags', 'image', 'images', 'github', 'demo', 'featured', 'startDate', 'endDate', 'tech'],
    types: {
      title: 'string',
      status: 'string', // 'active', 'completed', 'maintenance', 'archived'
      summary: 'string',
      slug: 'string',
      category: 'string',
      stack: 'array',
      tags: 'array',
      image: 'string',
      images: 'array',
      github: 'string',
      demo: 'string',
      featured: 'boolean',
      startDate: 'date',
      endDate: 'date',
      tech: 'array',
    }
  },
  experience: {
    required: ['title', 'company', 'startDate'],
    optional: ['slug', 'endDate', 'location', 'description', 'tags', 'current', 'type', 'stack', 'highlights', 'link'],
    types: {
      title: 'string',
      company: 'string',
      startDate: 'date',
      endDate: 'date',
      location: 'string',
      description: 'string',
      tags: 'array',
      slug: 'string',
      current: 'boolean',
      type: 'string',
      stack: 'array',
      highlights: 'array',
      link: 'string',
    }
  }
};

function validateType(value, expectedType, field) {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'date':
      // Check if it's a valid ISO date string or Date object
      if (value instanceof Date) return !isNaN(value);
      if (typeof value === 'string') {
        const parsed = new Date(value);
        return !isNaN(parsed.getTime());
      }
      return false;
    default:
      return true;
  }
}

function validateFile(filePath, contentType) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter } = matter(content);
  
  const schema = SCHEMAS[contentType];
  if (!schema) {
    console.warn(`⚠️  Unknown content type: ${contentType}`);
    return true;
  }

  const errors = [];
  const warnings = [];

  // Check required fields
  for (const field of schema.required) {
    if (!(field in frontmatter) || frontmatter[field] === null || frontmatter[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    } else {
      // Validate type
      const expectedType = schema.types[field];
      if (expectedType && !validateType(frontmatter[field], expectedType, field)) {
        errors.push(`Field '${field}' has wrong type. Expected: ${expectedType}, got: ${typeof frontmatter[field]}`);
      }
    }
  }

  // Check optional field types if present
  for (const field of schema.optional) {
    if (field in frontmatter && frontmatter[field] !== null && frontmatter[field] !== undefined) {
      const expectedType = schema.types[field];
      if (expectedType && !validateType(frontmatter[field], expectedType, field)) {
        warnings.push(`Field '${field}' has wrong type. Expected: ${expectedType}, got: ${typeof frontmatter[field]}`);
      }
    }
  }

  // Check for unknown fields
  const allKnownFields = [...schema.required, ...schema.optional];
  for (const field of Object.keys(frontmatter)) {
    if (!allKnownFields.includes(field)) {
      warnings.push(`Unknown field: ${field}`);
    }
  }

  return { errors, warnings };
}

function validateDirectory(dirPath, contentType) {
  if (!fs.existsSync(dirPath)) {
    console.log(`ℹ️  Skipping ${contentType} (directory not found)`);
    return { totalErrors: 0, totalWarnings: 0 };
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.mdx'));
  let totalErrors = 0;
  let totalWarnings = 0;

  console.log(`\n📁 Validating ${contentType}/`);
  console.log(`   Found ${files.length} file(s)\n`);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const { errors, warnings } = validateFile(filePath, contentType);

    if (errors.length > 0) {
      console.log(`❌ ${file}`);
      errors.forEach(err => console.log(`   - ${err}`));
      totalErrors += errors.length;
    } else if (warnings.length > 0) {
      console.log(`⚠️  ${file}`);
      warnings.forEach(warn => console.log(`   - ${warn}`));
      totalWarnings += warnings.length;
    } else {
      console.log(`✅ ${file}`);
    }
  }

  return { totalErrors, totalWarnings };
}

// Main execution
console.log('🔍 Content Validation');
console.log('='.repeat(50));

let allErrors = 0;
let allWarnings = 0;

// Validate each content type
const results = {
  blog: validateDirectory(path.join(CONTENT_DIR, 'blog'), 'blog'),
  projects: validateDirectory(path.join(CONTENT_DIR, 'projects'), 'projects'),
  experience: validateDirectory(path.join(CONTENT_DIR, 'experience'), 'experience'),
};

allErrors = results.blog.totalErrors + results.projects.totalErrors + results.experience.totalErrors;
allWarnings = results.blog.totalWarnings + results.projects.totalWarnings + results.experience.totalWarnings;

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Summary:`);
console.log(`   Errors: ${allErrors}`);
console.log(`   Warnings: ${allWarnings}\n`);

if (allErrors > 0) {
  console.log('❌ Validation failed! Fix errors before committing.\n');
  process.exit(1);
} else if (allWarnings > 0) {
  console.log('✅ Validation passed with warnings.\n');
  process.exit(0);
} else {
  console.log('✅ All content valid!\n');
  process.exit(0);
}
