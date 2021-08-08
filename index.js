const fs = require('fs');
const http = require('https');
const HTMLParser = require('node-html-parser');
const html_to_pdf = require('html-pdf-node');

const USER_ID = 'BOBCATGIRL76';
/**
 * npm start { User Id } { Output Directory }
 * 
 * npm start TestUser C:\\output
 */
const commandLineArgs = process.argv;
if (commandLineArgs.length > 3)
{
    const userId = process.argv[2];
    const outputPath = process.argv[3];
    console.log(`User Id: ${userId}`);
    console.log(`Output Path: ${outputPath}`);
    console.log('Processing blog posts');
    OutputBlogPdf(userId, outputPath);

} else
{
    console.log('Please provide a user id and output path within the command line arguments');
}

function OutputBlogPdf(userId, outputPath)
{
    const uri = `https://www.sparkpeople.com/mypage_public_journal_summary.asp?id=${userId}`;
    GetSparkPeopleBlogIds(uri).then(blogIds =>
    {
        const promises = [];

        for (const blogId of blogIds)
        {
            const promise = GetSparkPeoplePostContent(blogId);
            promises.push(promise);
        }

        Promise.all(promises).then(contentArr =>
        {
            let pageContent = '';
            contentArr.forEach(c => pageContent += c);
            let options = {
                format: 'A4', margin: {
                    top: '10px',
                    bottom: '10px',
                    left: '10px',
                    right: '10px',
                }
            };
            const file = { content: pageContent };
            console.log('Generating PDF Document');

            html_to_pdf.generatePdf(file, options).then(pdfBuffer =>
            {
                console.log(`PDF File being written to ${outputPath}\\blog.pdf`)
                fs.writeFileSync(`${outputPath}\\blog.pdf`, pdfBuffer, 'binary');
                console.log(`PDF File outputed to ${outputPath}\\blog.pdf`)
            }).catch(e =>
            {
                console.error('Error creating PDF', e)
            });
        })
            .catch(e =>
            {
                console.log(e);
            });
    });
}

function GetSparkPeoplePostContent(postId)
{
    const uri = `https://www.sparkpeople.com/mypage_public_journal_individual.asp?blog_id=${postId}`;
    return GetHtmlFromUri(uri).then(root =>
    {
        const entryBody = root.querySelector("#entry_body");
        const popularButton = entryBody.querySelector('#popular_btn');
        if (popularButton)
        {
            popularButton.parentNode.removeChild(popularButton);
        }
        const entryButtons = entryBody.querySelector('#entry_btns');
        if (entryButtons)
        {
            entryButtons.parentNode.removeChild(entryButtons);
        }
        const categoryButtons = entryBody.querySelector('#blog_cat');
        if (categoryButtons)
        {
            categoryButtons.parentNode.removeChild(categoryButtons);
        }

        const style = ` <style>
            body { font-family: Arial, Helvetica, sans-serif !important; }
        </style>`;
        return ` <html>
            ${style}
            <body>
                ${entryBody.outerHTML.replace('Report Inappropriate Blog', '')}
            </body>
        </html>`;
    }).catch(e =>
    {
        console.error('Error reading blog', e.message)
        return undefined;
    });
}


function GetSparkPeopleBlogIds(uri)
{
    return GetSparkPeoplePageCount(uri).then(pageCount =>
    {
        const promiseArr = [];
        for (let i = 0; i < pageCount; i++)
        {
            const promise = GetSparkPeopleBlogIdsFromPage(uri, i + 1);
            promiseArr.push(promise);
        }
        return Promise.all(promiseArr);
    }).then(blogIdSets =>
    {
        let blogIds = [];
        for (const blogIdSet of blogIdSets)
        {
            blogIds = blogIds.concat(blogIdSet);
        }
        return blogIds.sort().filter((v, i) => blogIds.indexOf(v) === i);
    });
}

function GetSparkPeoplePageCount(uri)
{
    return GetHtmlFromUri(uri).then(root =>
    {
        const pageLinks = root.querySelectorAll(".paging_btn2");
        return pageLinks.length - 1;
    });
}

function GetSparkPeopleBlogIdsFromPage(uri, pageIndex)
{
    return GetHtmlFromUri(`${uri}&page=${pageIndex}`).then(data =>
    {
        const root = HTMLParser.parse(data);
        const blogPostLinks = root.querySelectorAll(".member_journal_title_link").map(l =>
        {
            const href = l.getAttribute('href');
            const blogIdStr = href.replace('mypage_public_journal_individual.asp?blog_id=', '');
            return parseInt(blogIdStr, 10);
        });
        return blogPostLinks;
    }).catch(_ =>
    {
        return [];
    });
}

function GetHtmlFromUri(uri)
{
    return new Promise((resolve, reject) =>
    {
        const request = http.request(uri, function (res)
        {
            var data = '';
            res.on('data', (chunk) =>
            {
                data += chunk;
            });
            res.on('end', () =>
            {
                resolve(HTMLParser.parse(data));
            });
        });
        request.on('error', (e) =>
        {
            reject(e.message);
        });
        request.end();
    });
}