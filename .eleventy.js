const { resolve } = require('path');
const CleanCSS = require('clean-css');

module.exports = function (eleventyConfig) {
    eleventyConfig.setUseGitIgnore(false);
    
    eleventyConfig.addFilter('minifyCss', (code) => 
        new CleanCSS({}).minify(code).styles);

    eleventyConfig.addLayoutAlias('html', '../layout/html.njk');
    eleventyConfig.addLayoutAlias('page', '../layout/page.njk');
    eleventyConfig.addLayoutAlias('post', '../layout/post.njk');
    eleventyConfig.addLayoutAlias('home', '../layout/home.njk');

    return {
        templateFormats: [
            'md',
            'svg',
            'jpg',
            'png',
        ],

        dir: {
            input: 'content',
            output: 'public',
            data: '../data',
            layouts: '../layout',
            includes: '../include',
        }
    }
}
