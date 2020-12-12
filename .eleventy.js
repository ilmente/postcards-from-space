const { join, dirname } = require('path');
const { readFile, outputFile } = require('fs-extra');
const CleanCSS = require('clean-css');
const sharp = require('sharp');

const DEFAULT_FOLDERS = {
    input: 'content',
    output: 'public',
    data: '../data',
    layouts: '../layout',
    includes: '../include',
};

const DEFAULT_COLOR_BG = '#F3F3F3';
const DEFAULT_WIDTH = 1000;
const DEFAULT_QUALITY = 70;

module.exports = function (eleventyConfig) {
    eleventyConfig.setUseGitIgnore(false);

    eleventyConfig.addLayoutAlias('html', '../layout/html.liquid');
    eleventyConfig.addLayoutAlias('post', '../layout/post.liquid');
    eleventyConfig.addLayoutAlias('home', '../layout/home.liquid');
    
    eleventyConfig.addFilter('minifyCss', (code) => 
        new CleanCSS({}).minify(code).styles
    );

    eleventyConfig.addLiquidTag('import', (liquidEngine) => ({
        parse: function (tagToken) {
            this.path = tagToken.args;
        },

        render: async function (scope) {
            try {
                const path = await liquidEngine.evalValue(this.path, scope);
                const { input, includes } = DEFAULT_FOLDERS;
                const includeDir = join(input, includes);
                const file = join(includeDir, path);
                return  await readFile(file);
            } catch (error) {
                console.error('Error in import tag', error);
                return '<!---->'
            }
        }
    }));

    eleventyConfig.addLiquidTag('image', (liquidEngine) => ({
        parse: function (tagToken) {
            const [originalName, alt] = tagToken.args.split(',');
            this.originalName = originalName || '';
            this.alt = alt || '';
        },

        render: async function (scope) {
            try {
                const originalName = await liquidEngine.evalValue(this.originalName, scope);
                
                try {
                    const alt = await liquidEngine.evalValue(this.alt, scope);
                    const { inputPath, outputPath } = await liquidEngine.evalValue('page', scope);
                    const file = join(dirname(inputPath), originalName);
                    const name = `${originalName}-${DEFAULT_WIDTH}x${DEFAULT_QUALITY}.jpg`;
                    const destination = join(dirname(outputPath), name);
                    const image = await sharp(file);
                    const content = await image
                        .flatten({ background: DEFAULT_COLOR_BG })
                        .resize({ width: DEFAULT_WIDTH })
                        .jpeg({ quality: DEFAULT_QUALITY })
                        .toBuffer();

                    await outputFile(destination, content);

                    return `<picture><img src="./${name}" alt="${alt}" /></picture>`;
                } catch (error) {
                    console.error('Downsampling error in image tag', error);
                    console.warn('Falling back on', originalName);
                    return `<picture><img src="./${originalName}" alt="" /></picture>`;
                }
            } catch (error) {
                console.error('Rendering error in image tag', error);
                return '<!---->'
            }
        }
    }));

    return {
        dir: DEFAULT_FOLDERS,
        markdownTemplateEngine: 'liquid',
        htmlTemplateEngine: 'liquid',
        dataTemplateEngine: 'liquid',

        templateFormats: [
            'md',
            'svg',
            'jpg',
            'png',
        ],
    }
}
