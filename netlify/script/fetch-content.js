require('isomorphic-fetch');

const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

if (!accessToken) {
    console.log('Error: could not find a Dropbox access token.');
    process.exit(1);
}

const { join } = require('path');
const { removeSync, ensureDirSync, outputFile } = require('fs-extra');
const Dropbox = require('dropbox').Dropbox;
const cwd = process.cwd();
const contentDir = join(cwd, './content');

async function fetchContent() {
    const dropbox = new Dropbox({ accessToken });

    removeSync(contentDir);
    ensureDirSync(contentDir);

    const response = await dropbox.filesListFolder({ path: '', recursive: true });
    const entries = response.result.entries || [];
    
    console.log('Fetching files from dropbox:');

    entries.forEach(async (entry) => {
        if (entry['.tag'] !== 'file') { 
            return;
        }

        const file = await dropbox.filesDownload({ path: entry.path_lower })
        const fileName = join(contentDir, `.${entry.path_lower}`);
        const fileContent = file.result.fileBinary;

        console.log('-', entry.path_lower);

        await outputFile(fileName, fileContent);
    });
}

fetchContent().catch((error) => {
    console.log('Error: fetch content aborted', error);
    process.exit(2);
});
