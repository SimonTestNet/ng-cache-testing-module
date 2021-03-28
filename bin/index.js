#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const testFiles = [];

if (process.argv.includes("-h")) {
  console.log(`
  This script helps you apply cacheTestingModule() to the first describe block of every test file that configures a testing module.

  Options:
  
  -ext=...           The extension of the test files. Default: .spec.ts
  -h                 Show help
  -l                 List the files that need updating.
  -q=...             Quotes to use. Default: ' (single)
  -s                 Save changes
  -src=...           The source folder to start looking for test files. Default: ./src
  -t                 Use tab for indentation
  `);
  return;
} else {
  console.log("For options use the parameter -h\n");
}

function getArgValue(argName, argDefault) {
  var index = process.argv.findIndex(arg => arg.startsWith(`-${argName}=`));
  return index === -1 ? argDefault : process.argv[index].substring(`-${argName}=`.length);
}

const testExtension = getArgValue("ext", ".spec.ts");
const save = process.argv.includes("-s");
const list = process.argv.includes("-l");
const quote = getArgValue("q", "'");
const indent = process.argv.includes("-t") ? "\t" : "  ";

const srcFolder = getArgValue("src", "./src");
if (!fs.existsSync(srcFolder)) {
  console.log(
    `Can't find folder: ${srcFolder}. Use the option -src=SourceFolder. Use -h for more options.`
  );
  return;
}

function fromDir(startPath, filter) {
  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      fromDir(filename, filter);
    } else if (filename.indexOf(filter) >= 0) {
      testFiles.push(filename);
    }
  }
}

fromDir(srcFolder, testExtension);

const importStatement = `import { cacheTestingModule } from ${quote}ng-cache-testing-module${quote};`;
const cacheStatement = `cacheTestingModule();`;

let count = 0;

for (let testFile of testFiles) {
  let content = fs.readFileSync(testFile) + "";
  let needsSave = false;
  if (!content.includes("TestBed.configureTestingModule")) {
    continue;
  }

  if (!content.includes(importStatement)) {
    content = importStatement + "\n" + content;
    needsSave = true;
  }

  if (!content.includes(cacheStatement)) {
    content = content.replace(
      /^describe\((.*)\{$/gm,
      "describe($1{\n" + indent + "cacheTestingModule();"
    );
    needsSave = true;
  }

  if (needsSave) {
    count++;
    if (list) {
      console.log(testFile);
    }
    if (save) {
      fs.writeFileSync(testFile, content);
    }
  }
}

if (save) {
  console.log(`\nUpdated ${count} file${count === 1 ? "" : "s"}.`);
} else {
  console.log(
    `\nFound ${count} test file${count === 1 ? "" : "s"} which can be updated.${
      count ? " To update use the option -s" : ""
    }`
  );
}
