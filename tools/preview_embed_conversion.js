#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

function extractNoteId(url) {
  if (typeof url !== 'string') {
    return null;
  }

  const articleMatch = url.match(/\/n\/([^/?#]+)/);
  if (articleMatch && articleMatch[1]) {
    return articleMatch[1];
  }

  const embedMatch = url.match(/\/embed\/notes\/([^/?#]+)/);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  return null;
}

function normalizeToEmbed(url) {
  const noteId = extractNoteId(url);
  if (!noteId) {
    return null;
  }

  return {
    input: url,
    note_id: noteId,
    article_url: `https://note.com/n/${noteId}`,
    embed_url: `https://note.com/embed/notes/${noteId}`,
  };
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const url = args[0];
  let outputPath = null;

  for (let i = 1; i < args.length; i += 1) {
    if (args[i] === '--output') {
      outputPath = args[i + 1] ?? null;
      i += 1;
    }
  }

  return { url, outputPath };
}

function main() {
  const { url, outputPath } = parseArgs(process.argv);

  if (!url) {
    console.error('Usage: node tools/preview_embed_conversion.js <url> [--output <path>]');
    process.exit(1);
  }

  const result = normalizeToEmbed(url);
  if (!result) {
    console.error('Could not extract note id from given URL');
    process.exit(1);
  }

  const output = JSON.stringify(result, null, 2);
  console.log(output);

  if (outputPath) {
    const dir = path.dirname(outputPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, `${output}\n`, 'utf8');
  }
}

main();
