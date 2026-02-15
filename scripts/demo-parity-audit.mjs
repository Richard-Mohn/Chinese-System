import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const demoDir = path.join(root, 'app', 'demo');
const roleConfigFile = path.join(demoDir, '_components', 'demoRoleConfigs.ts');
const demoIndexFile = path.join(demoDir, 'page.tsx');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function getTopLevelDemoRoutes() {
  return fs
    .readdirSync(demoDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => !name.startsWith('_'))
    .filter(name => fs.existsSync(path.join(demoDir, name, 'page.tsx')))
    .sort();
}

function parseRoleConfigKeys(content) {
  const keys = new Set();
  const regex = /^\s{2}['"]?([a-z0-9-]+)['"]?:\s*createConfig\(/gim;
  let match;
  while ((match = regex.exec(content))) {
    keys.add(match[1]);
  }
  return keys;
}

function parseTemplateRouteKeys(content) {
  const keys = new Set();
  const blockMatch = content.match(/const\s+TEMPLATE_PAGE_TYPES\s*:[\s\S]*?=\s*\{([\s\S]*?)\};/m);
  if (!blockMatch) return keys;

  const regex = /^\s*['"]?([a-z0-9-]+)['"]?\s*:\s*['"][a-z0-9-]+['"],?\s*$/gim;
  let match;
  while ((match = regex.exec(blockMatch[1]))) {
    keys.add(match[1]);
  }
  return keys;
}

function parseDemoIndexRoutes(content) {
  const listedDemoRoutes = new Set();
  const nonDemoStorefronts = [];

  const regex = /slug:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content))) {
    const slug = match[1];
    if (slug.startsWith('demo/')) {
      listedDemoRoutes.add(slug.replace('demo/', ''));
    } else {
      nonDemoStorefronts.push(slug);
    }
  }

  return { listedDemoRoutes, nonDemoStorefronts };
}

const roleConfigContent = read(roleConfigFile);
const demoIndexContent = read(demoIndexFile);

const topLevelRoutes = getTopLevelDemoRoutes();
const roleConfigKeys = parseRoleConfigKeys(roleConfigContent);
const templateRouteKeys = parseTemplateRouteKeys(roleConfigContent);
const { listedDemoRoutes, nonDemoStorefronts } = parseDemoIndexRoutes(demoIndexContent);

const routesCoveredByConfig = topLevelRoutes.filter(route => roleConfigKeys.has(route) || templateRouteKeys.has(route));
const routesMissingConfigCoverage = topLevelRoutes.filter(route => !roleConfigKeys.has(route) && !templateRouteKeys.has(route));
const routesNotInDemoIndex = topLevelRoutes.filter(route => !listedDemoRoutes.has(route));

const result = {
  totals: {
    topLevelDemoRoutes: topLevelRoutes.length,
    configuredRoutes: routesCoveredByConfig.length,
    missingConfigRoutes: routesMissingConfigCoverage.length,
    listedDemoRoutes: listedDemoRoutes.size,
    unlistedDemoRoutes: routesNotInDemoIndex.length,
    nonDemoStorefrontCards: nonDemoStorefronts.length,
    configCoveragePercent: Math.round((routesCoveredByConfig.length / Math.max(topLevelRoutes.length, 1)) * 100),
    indexCoveragePercent: Math.round(((topLevelRoutes.length - routesNotInDemoIndex.length) / Math.max(topLevelRoutes.length, 1)) * 100),
  },
  routes: {
    topLevel: topLevelRoutes,
    configuredByRoleConfigs: Array.from(roleConfigKeys).sort(),
    configuredByTemplateMap: Array.from(templateRouteKeys).sort(),
    missingConfigCoverage: routesMissingConfigCoverage,
    missingFromDemoIndex: routesNotInDemoIndex,
    nonDemoStorefronts,
  },
};

const reportDir = path.join(root, 'tmp');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const reportPath = path.join(reportDir, 'demo-parity-report.json');
fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));

console.log('Demo parity audit complete.');
console.log(`Report: ${reportPath}`);
console.log(`Config coverage: ${result.totals.configCoveragePercent}%`);
console.log(`Demo index coverage: ${result.totals.indexCoveragePercent}%`);
if (routesMissingConfigCoverage.length) {
  console.log('Missing config coverage routes:', routesMissingConfigCoverage.join(', '));
}
if (routesNotInDemoIndex.length) {
  console.log('Routes missing from demo index listing:', routesNotInDemoIndex.join(', '));
}
