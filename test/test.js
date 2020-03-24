const fs = require("fs");
const childProcess = require("child_process");
const { promisify } = require("util");
const test = require("ava");

test.beforeEach(() => process.chdir(__dirname));

const readFile = promisify(fs.readFile);
const execFile = promisify(childProcess.execFile);
const eleventy = require.resolve(".bin/eleventy");

async function readOutput(fixture) {
  const output = await readFile(`${fixture}/_site/index.html`, "utf8");
  return output.trim();
}

test("formats dates in templates", async (t) => {
  const fixture = "fixtures/default";
  await execFile(eleventy, { cwd: fixture, windowsHide: true });

  t.is(await readOutput(fixture), "January 1, 2016");
});

test("includeDefaults: false removes readableDate", async (t) => {
  const fixture = "fixtures/exclude-readable-date";
  const { stderr } = await t.throwsAsync(
    execFile(eleventy, {
      cwd: fixture,
      windowsHide: true,
    })
  );
  t.true(stderr.includes("filter not found: readableDate"));
});

test("includeDefaults: false removes isoDate", async (t) => {
  const fixture = "fixtures/exclude-iso-date";
  const { stderr } = await t.throwsAsync(
    execFile(eleventy, {
      cwd: fixture,
      windowsHide: true,
    })
  );
  t.true(stderr.includes("filter not found: isoDate"));
});

test("override built in formats", async (t) => {
  const fixture = "fixtures/override";
  await execFile(eleventy, { cwd: fixture, windowsHide: true });

  t.is(await readOutput(fixture), "01 Jan 2016");
});

test("specify custom format", async (t) => {
  const fixture = "fixtures/custom-format";
  await execFile(eleventy, { cwd: fixture, windowsHide: true });

  t.is(await readOutput(fixture), "January 2016");
});
