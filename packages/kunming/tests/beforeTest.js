/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const { execSync } = require('child_process');
const { join } = require('path');
const findChrome = require('carlo/lib/find_chrome');
const detectInstaller = require('detect-installer');

const installPuppeteer = () => {
  // find can use package manager
  const packages = detectInstaller(join(__dirname, '../'));
  // get installed package manager
  const packageName = packages.find(detectInstaller.hasPackageCommand) || 'npm';

  // eslint-disable-next-line no-console
  console.log(`🤖 will use ${packageName} install puppeteer`);
  const command = `${packageName} ${packageName.includes('yarn') ? 'add' : 'i'} puppeteer`;
  execSync(command, {
    stdio: 'inherit',
  });
};

const initPuppeteer = async () => {
  try {
    // eslint-disable-next-line import/no-unresolved
    const findChromePath = await findChrome({});
    const { executablePath } = findChromePath;
    // eslint-disable-next-line
    console.log(`🧲 find you browser in ${executablePath}`);
    return;
  } catch (error) {
    // eslint-disable-next-line
    console.log('🧲 no find chrome');
  }

  try {
    require.resolve('puppeteer');
  } catch (error) {
    // need install puppeteer
    await installPuppeteer();
  }
};

initPuppeteer();
