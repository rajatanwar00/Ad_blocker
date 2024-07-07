const axios = require('axios');
const fs = require('fs');
const path = require('path');

const EASYLIST_URL = 'https://raw.githubusercontent.com/easylist/easylist/master/easylist/easylist_general_block.txt';

async function fetchEasyList() {
  try {
    const response = await axios.get(EASYLIST_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching EasyList:', error);
    return null;
  }
}

function parseEasyList(data) {
  const adServers = new Set();
  const lines = data.split('\n');

  lines.forEach(line => {
    // Ignore comments and empty lines
    if (line.startsWith('!') || line.trim() === '') return;

    
    const regMatch=`*://*${line}/*`;
    adServers.add(regMatch);

  });

  adServers.add("*://*.doubleclick.net/*");
  adServers.add("*://*.googleadservices.com/*");
  adServers.add("*://*.googlesyndication.com/*");
  adServers.add("*://*.moat.com/*");

  return Array.from(adServers);
}

function generateRules(adServers) {
  return adServers.map((server, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: `${server}`,
      resourceTypes: ['script', 'image']
    }
  }));
}

async function main() {
  const easyListData = await fetchEasyList();
  if (!easyListData) return;

  const adServers = parseEasyList(easyListData);
  const rules = generateRules(adServers);

  fs.writeFileSync(path.join(__dirname, 'rules.json'), JSON.stringify(rules, null, 2));
  console.log('rules.json has been generated with', adServers.length, 'rules.');
}

main();
