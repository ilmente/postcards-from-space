const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

if (!accessToken) {
    console.log('Error accessing Dropbox: access token missing');
    process.exit(1);
}

const { join } = require('path');
const { removeSync, ensureDirSync, outputFile } = require('fs-extra');
const Dropbox = require('dropbox').Dropbox;
const cwd = process.cwd();
const contentDir = join(cwd, './content');

async function fetchContent() {
    try {
        const dropbox = new Dropbox({ accessToken });

        removeSync(contentDir);
        ensureDirSync(contentDir);

        const response = await dropbox.filesListFolder({ path: '', recursive: true });
        const entries = response.result.entries || [];

        entries.forEach(async (entry) => {
            try {
                if (entry['.tag'] !== 'file') { 
                    return;
                }
            
                console.log('Downloading', entry.path_lower);

                const file = await dropbox.filesDownload({ path: entry.path_lower });
                const destination = join(contentDir, `.${entry.path_lower}`);
                const content = file.result.fileBinary;

                console.log('Saving', destination);
                await outputFile(destination, content);
            } catch (error) {
                console.log('Error saving', entry.path_lower, error);
            }
        });
    } catch (error) {
        throw new Error(error);
    }
}

fetchContent().catch((error) => {
    console.log('Content fetching failed', error);
    process.exit(2);
});
