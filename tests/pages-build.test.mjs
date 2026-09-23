import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve('dist-pages');
const base = process.env.PAGES_BASE_PATH || '/tesla/';
for (const route of ['index.html', 'library/index.html']) {
  test(`static ${route} resolves scripts and styles under the Pages base`, async () => {
    const html = await readFile(resolve(root, route), 'utf8');
    assert.match(html, /<div id="root"><\/div>/);
    assert.doesNotMatch(html, /\/pages\/main\.tsx|\/server\//);
    const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
    assert.ok(assets.some(asset => asset.endsWith('.js')));
    assert.ok(assets.some(asset => asset.endsWith('.css')));
    for (const asset of assets) {
      assert.ok(asset.startsWith(base), `${asset} must start with ${base}`);
      await access(resolve(root, asset.slice(base.length)));
    }
  });
}
test('includes local fonts and disables Jekyll', async () => {
  await access(resolve(root, '.nojekyll'));
  await access(resolve(root, 'fonts/lexend.woff2'));
  const cssFile = (await readdir(resolve(root, 'assets'))).find(name => name.endsWith('.css'));
  const css = await readFile(resolve(root, 'assets', cssFile), 'utf8');
  assert.ok(css.includes(`${base}fonts/lexend.woff2`));
});
